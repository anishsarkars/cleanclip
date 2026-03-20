from __future__ import annotations

import asyncio
import concurrent.futures
import shutil
import sqlite3
import subprocess
import uuid
import os
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import cv2
from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, File, HTTPException, Request, UploadFile, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from PIL import Image
from pydantic import BaseModel
from rembg import new_session, remove
import hashlib
import hmac
import imageio_ffmpeg
import json

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
UPLOADS_DIR = BASE_DIR / "uploads"
OUTPUTS_DIR = BASE_DIR / "outputs"
DB_PATH = BASE_DIR / "cleanclip.db"
MAX_UPLOAD_BYTES = 100 * 1024 * 1024  # 100MB - Chunks will bypass the 413 limit
CHUNK_DIR = BASE_DIR / "chunks"
ALLOWED_SUFFIXES = {".mp4", ".mov", ".webm", ".gif"}
PLAN_LIMITS = {"none": 0, "free": 3, "monthly": 50, "yearly": 50}

for directory in (UPLOADS_DIR, OUTPUTS_DIR):
    UPLOADS_DIR.mkdir(exist_ok=True)
    OUTPUTS_DIR.mkdir(exist_ok=True)
    CHUNK_DIR.mkdir(exist_ok=True)

app = FastAPI(title="CleanClip API", version="4.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

jobs: dict[str, dict[str, Any]] = {}
executor = concurrent.futures.ThreadPoolExecutor(max_workers=2)
rembg_session = None
rembg_lock = asyncio.Lock() # For async-safety if used in async def
rembg_mutex = concurrent.futures.ThreadPoolExecutor(max_workers=1) # Or just a threading.Lock
import threading
session_lock = threading.Lock()

FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()


class SyncUserRequest(BaseModel):
    clerk_user_id: str
    email: str


class SelectPlanRequest(BaseModel):
    clerk_user_id: str
    email: str
    plan: str


@dataclass
class VideoMeta:
    fps: float
    frame_count: int
    width: int
    height: int


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def month_key(timestamp: str | None = None) -> str:
    dt = datetime.now(timezone.utc) if timestamp is None else datetime.fromisoformat(timestamp)
    return f"{dt.year}-{dt.month:02d}"


def db() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH, check_same_thread=False)
    # Use WAL mode for better concurrency (readers don't block writers and vice-versa)
    connection.execute("PRAGMA journal_mode=WAL")
    connection.execute("PRAGMA synchronous=NORMAL")
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with db() as connection:
      connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                clerk_user_id TEXT PRIMARY KEY,
                email TEXT NOT NULL,
                plan TEXT NOT NULL DEFAULT 'none',
                credits_remaining INTEGER NOT NULL DEFAULT 0,
                last_reset_date TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS guests (
                guest_key TEXT PRIMARY KEY,
                day_key TEXT NOT NULL,
                used INTEGER NOT NULL DEFAULT 0,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS jobs (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                filename TEXT NOT NULL,
                status TEXT NOT NULL,
                progress INTEGER NOT NULL,
                step TEXT NOT NULL,
                output_path TEXT,
                error TEXT,
                created_at TEXT NOT NULL
            );
            """
        )


def _safe_name(name: str | None, fallback: str) -> str:
    if not name:
        return fallback
    return "".join(ch for ch in name if ch.isalnum() or ch in {"-", "_", "."}) or fallback


def _get_video_meta(path: Path) -> VideoMeta:
    capture = cv2.VideoCapture(str(path))
    if not capture.isOpened():
        raise RuntimeError("Could not open uploaded file.")
    fps = capture.get(cv2.CAP_PROP_FPS) or 24.0
    frame_count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    
    # Accurate frame count fallback using FFmpeg
    if frame_count <= 0:
        try:
            probe_cmd = [
                "ffprobe", "-v", "error", "-select_streams", "v:0",
                "-count_packets", "-show_entries", "stream=nb_read_packets",
                "-of", "csv=p=0", str(path)
            ]
            result = subprocess.run(probe_cmd, capture_output=True, text=True)
            if result.returncode == 0 and result.stdout.strip():
                frame_count = int(result.stdout.strip())
                print(f"FFmpeg reported {frame_count} frames for {path.name}")
        except:
            pass

    # Ensure width and height are even for FFmpeg yuva420p compatibility
    width = int(capture.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
    height = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)
    if width % 2 != 0: width -= 1
    if height % 2 != 0: height -= 1

    # Fallback for frame count if metadata is missing (common in some formats)
    if frame_count <= 0:
        print(f"Metadata reported 0 frames for {path.name}, attempting estimation...")
        # We try to get duration and multiply by FPS as a last resort
        pass

    capture.release()
    return VideoMeta(fps=max(fps, 1.0), frame_count=max(frame_count, 0), width=max(width, 2), height=max(height, 2))


def _run_ffmpeg(command: list[str]) -> None:
    completed = subprocess.run(command, capture_output=True, text=True)
    if completed.returncode != 0:
        error_msg = completed.stderr.strip() or "FFmpeg command failed."
        print(f"FFmpeg error: {error_msg}")
        raise RuntimeError(error_msg)


def get_user(clerk_user_id: str) -> dict[str, Any] | None:
    with db() as connection:
        row = connection.execute(
            "SELECT * FROM users WHERE clerk_user_id = ?",
            (clerk_user_id,),
        ).fetchone()
    return dict(row) if row else None


def ensure_user(clerk_user_id: str, email: str) -> dict[str, Any]:
    user = get_user(clerk_user_id)
    now = now_iso()
    if not user:
        with db() as connection:
            connection.execute(
                """
                INSERT INTO users (clerk_user_id, email, plan, credits_remaining, last_reset_date, created_at, updated_at)
                VALUES (?, ?, 'none', 0, ?, ?, ?)
                """,
                (clerk_user_id, email, now, now, now),
            )
        user = get_user(clerk_user_id)
    elif user["email"] != email:
        with db() as connection:
            connection.execute(
                "UPDATE users SET email = ?, updated_at = ? WHERE clerk_user_id = ?",
                (email, now, clerk_user_id),
            )
        user = get_user(clerk_user_id)

    if user is None:
        raise RuntimeError("Failed to create or load user.")
    return maybe_reset_credits(user)


def maybe_reset_credits(user: dict[str, Any]) -> dict[str, Any]:
    plan = user["plan"]
    if plan == "none":
        return user
    current_month = month_key()
    if month_key(user["last_reset_date"]) == current_month:
        return user
    credits = PLAN_LIMITS[plan]
    now = now_iso()
    with db() as connection:
        connection.execute(
            """
            UPDATE users
            SET credits_remaining = ?, last_reset_date = ?, updated_at = ?
            WHERE clerk_user_id = ?
            """,
            (credits, now, now, user["clerk_user_id"]),
        )
    return get_user(user["clerk_user_id"]) or user


def set_user_plan(clerk_user_id: str, email: str, plan: str) -> dict[str, Any]:
    if plan not in {"free", "monthly", "yearly"}:
        raise HTTPException(status_code=400, detail="Invalid plan.")
    now = now_iso()
    credits = PLAN_LIMITS[plan]
    with db() as connection:
        connection.execute(
            """
            INSERT INTO users (clerk_user_id, email, plan, credits_remaining, last_reset_date, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(clerk_user_id) DO UPDATE SET
                email = excluded.email,
                plan = excluded.plan,
                credits_remaining = excluded.credits_remaining,
                last_reset_date = excluded.last_reset_date,
                updated_at = excluded.updated_at
            """,
            (clerk_user_id, email, plan, credits, now, now, now),
        )
    updated = get_user(clerk_user_id)
    if not updated:
        raise RuntimeError("Failed to store selected plan.")
    return updated


def deduct_user_credit(clerk_user_id: str) -> None:
    user = get_user(clerk_user_id)
    if not user:
        return
    next_credits = max(0, int(user["credits_remaining"]) - 1)
    with db() as connection:
        connection.execute(
            "UPDATE users SET credits_remaining = ?, updated_at = ? WHERE clerk_user_id = ?",
            (next_credits, now_iso(), clerk_user_id),
        )


def guest_key(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def guest_usage(key: str) -> int:
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    with db() as connection:
        row = connection.execute(
            "SELECT * FROM guests WHERE guest_key = ?",
            (key,),
        ).fetchone()
        if row is None:
            connection.execute(
                "INSERT INTO guests (guest_key, day_key, used, updated_at) VALUES (?, ?, 0, ?)",
                (key, today, now_iso()),
            )
            return 0

        row = dict(row)
        if row["day_key"] != today:
            connection.execute(
                "UPDATE guests SET day_key = ?, used = 0, updated_at = ? WHERE guest_key = ?",
                (today, now_iso(), key),
            )
            return 0
        return int(row["used"])


def increment_guest_usage(key: str) -> None:
    used = guest_usage(key)
    with db() as connection:
        connection.execute(
            "UPDATE guests SET used = ?, updated_at = ? WHERE guest_key = ?",
            (used + 1, now_iso(), key),
        )



async def _save_upload(file: UploadFile, destination: Path) -> int:
    size = 0
    with destination.open("wb") as output:
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            size += len(chunk)
            if size > MAX_UPLOAD_BYTES:
                output.close()
                destination.unlink(missing_ok=True)
                raise HTTPException(status_code=413, detail="File exceeds 100MB limit.")
            output.write(chunk)
    await file.close()
    return size


def persist_job(job_id: str) -> None:
    job = jobs.get(job_id)
    if not job:
        # Fallback to DB fetch if not in memory (for recovery or other workers)
        with db() as connection:
            row = connection.execute("SELECT * FROM jobs WHERE id = ?", (job_id,)).fetchone()
            if not row: return
            job = dict(row)
            
    with db() as connection:
        connection.execute(
            """
            INSERT OR REPLACE INTO jobs (id, user_id, filename, status, progress, step, output_path, error, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                job["id"],
                job.get("user_id"),
                job["filename"],
                job["status"],
                job["progress"],
                job["step"],
                job.get("output_path"),
                job.get("error"),
                job["created_at"],
            ),
        )


async def _process_job(job_id: str, input_path: Path, owner_user_id: str | None, guest_id: str | None) -> None:
    output_path = OUTPUTS_DIR / f"{job_id}.webm"
    temp_output = OUTPUTS_DIR / f"{job_id}_tmp.webm"
    
    try:
        jobs[job_id].update({"status": "processing", "progress": 32, "step": "Inspecting video"})
        persist_job(job_id)
        meta = _get_video_meta(input_path)
        
        # Start FFmpeg as a subprocess for streaming output
        ffmpeg_cmd = [
            FFMPEG_EXE,
            "-y",
            "-f", "rawvideo",
            "-vcodec", "rawvideo",
            "-s", f"{meta.width}x{meta.height}",
            "-pix_fmt", "rgba",
            "-r", f"{meta.fps}",
            "-i", "-",  # Read from stdin
            "-c:v", "libvpx-vp9",
            "-pix_fmt", "yuva420p",
            "-auto-alt-ref", "0",
            "-crf", "35", # Faster/lighter CRF (was 25)
            "-deadline", "realtime", # Very important for speed
            "-b:v", "0",
            "-metadata:s:v:0", "alpha_mode=1",
            str(temp_output),
        ]
        
        # We redirect stderr to a temporary file instead of a pipe to avoid blocking
        log_path = OUTPUTS_DIR / f"{job_id}_ffmpeg.log"
        with open(log_path, "wb") as log_file:
            process = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE, stderr=log_file)
            
            cap = cv2.VideoCapture(str(input_path))
            total_frames = meta.frame_count
            frame_idx = 0
            
            if not cap.isOpened():
                raise RuntimeError("OpenCV failed to open the video file.")

            jobs[job_id].update({"progress": 35, "step": "Processing frames (streaming)"})
            persist_job(job_id)

            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    if frame_idx == 0:
                        raise RuntimeError("Failed to read any frames from the video. Check if the codec is supported.")
                    break
                
                # Convert OpenCV (BGR) to PIL (RGBA)
                try:
                    # Periodically check if FFmpeg is still running
                    if process.poll() is not None:
                         # Read log for error
                        err_msg = "Unknown FFmpeg error"
                        if log_path.exists():
                            with open(log_path, "r", errors="ignore") as f:
                                err_msg = f.read()[-500:] # Last 500 chars
                        raise RuntimeError(f"FFmpeg process exited prematurely. Error: {err_msg}")

                    # Resize to even dimensions if needed (just in case)
                    if frame.shape[1] != meta.width or frame.shape[0] != meta.height:
                        frame = cv2.resize(frame, (meta.width, meta.height))

                    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    pil_img = Image.fromarray(frame_rgb).convert("RGBA")
                    
                    # Remove background
                    # Ensure rembg_session is available (lazy load if needed)
                    global rembg_session
                    if rembg_session is None:
                        with session_lock:
                            if rembg_session is None:
                                print("Initializing High-Precision AI models...")
                                jobs[job_id]["step"] = "Loading Neural Engine (first use)..."
                                try:
                                    # isnet-general-use is THE pro choice for background removal
                                    rembg_session = new_session("isnet-general-use")
                                except Exception as e:
                                    print(f"Failed to load ISNet, trying u2net: {e}")
                                    rembg_session = new_session("u2net")
                                print("Neural Engine Ready.")

                    # Pro settings: alpha-matting is THE key to smooth professional edges
                    processed_pil = remove(
                        pil_img, 
                        session=rembg_session, 
                        post_process_mask=True,
                        alpha_matting=True,
                        alpha_matting_foreground_threshold=240,
                        alpha_matting_background_threshold=10,
                        alpha_matting_erode_size=10
                    ).convert("RGBA")
                    
                    # Debug log for first frame to verify removal
                    if frame_idx == 0:
                        # Check alpha values to ensure background was actually removed
                        alpha_data = processed_pil.getchannel("A").getdata()
                        avg_alpha = sum(alpha_data) / len(alpha_data)
                        print(f"Frame 0 Analysis: Avg Alpha={avg_alpha:.2f} (0=fully transparent, 255=fully opaque)")
                        if avg_alpha > 250:
                            print("WARNING: Alpha is very high. Background removal might have failed for this frame.")

                    # Write to FFmpeg stdin
                    if process.stdin:
                        process.stdin.write(processed_pil.tobytes())
                        process.stdin.flush()
                        
                    # Capture first frame or every 150th frame for preview
                    if frame_idx == 0 or frame_idx % 150 == 0:
                        import io, base64
                        thumb_io = io.BytesIO()
                        # Small thumbnail of processed frame
                        thumb_img = processed_pil.resize((320, int(320 * meta.height / meta.width)))
                        thumb_img.save(thumb_io, "WEBP", quality=70) # WebP for better compression
                        thumb_b64 = base64.b64encode(thumb_io.getvalue()).decode()
                        jobs[job_id]["preview_frame"] = f"data:image/webp;base64,{thumb_b64}"

                except Exception as e:
                    print(f"Frame {frame_idx} processing error: {e}")
                    # If it's a critical error (like pipe broken), stop immediately
                    if "Broken pipe" in str(e) or "FFmpeg" in str(e):
                        raise e
                
                frame_idx += 1
                
                # Update progress in memory EVERY frame for smooth "frame ticking" on UI
                # Map 0-100% frame processing to 30%-95% range (as float for precision)
                progress = 30.0 + (frame_idx / (max(total_frames, frame_idx) or 1)) * 65.0
                remaining = max(0, total_frames - frame_idx) if total_frames > 0 else "?"
                jobs[job_id].update({
                    "progress": round(min(progress, 95.0), 2),
                    "step": f"Removing background {frame_idx}/{total_frames or '?'} ({remaining} remaining)"
                })
                
                # Persist to DB less frequently to save IO and avoid locks
                if frame_idx % 100 == 0:
                    persist_job(job_id)
            
            cap.release()
            if process.stdin:
                try:
                    process.stdin.close()
                except:
                    pass
            
            process.wait()

        # Check if output exists and is non-empty
        if not temp_output.exists() or temp_output.stat().st_size < 100:
             # Read log for error
             err_msg = "Unknown FFmpeg error"
             if log_path.exists():
                 with open(log_path, "r", errors="ignore") as f:
                     err_msg = f.read()[-500:] # Last 500 chars
             raise RuntimeError(f"FFmpeg failed to produce output. Error: {err_msg}")
        
        # Cleanup log
        log_path.unlink(missing_ok=True)

        # Final step: Merge audio from the original video if it exists
        jobs[job_id].update({"progress": 98, "step": "Finalizing with audio"})
        persist_job(job_id)
        
        try:
             _run_ffmpeg([
                FFMPEG_EXE, "-y",
                "-i", str(temp_output),
                "-i", str(input_path),
                "-map", "0:v",
                "-map", "1:a?",  # Map audio if it exists, don't fail if not
                "-c:v", "copy",
                "-c:a", "libopus", # Opus is good for WebM
                "-shortest",
                str(output_path)
            ])
        except Exception:
            # If merging audio fails, just copy the temp output to the final output
            shutil.copy(temp_output, output_path)
            
        if owner_user_id:
            deduct_user_credit(owner_user_id)
        elif guest_id:
            increment_guest_usage(guest_id)

        jobs[job_id].update({
            "status": "done",
            "progress": 100,
            "step": "Ready",
            "output_path": str(output_path),
            "result_url": f"/result/{job_id}",
            "error": None,
        })
        persist_job(job_id)
        
    except Exception as exc:
        error_detail = f"{type(exc).__name__}: {str(exc)}"
        print(f"Job {job_id} CRITICAL FAILURE: {error_detail}")
        
        # Try to extract more info if it's an FFmpeg log issue
        log_path = OUTPUTS_DIR / f"{job_id}_ffmpeg.log"
        if log_path.exists():
             with open(log_path, "r", errors="ignore") as f:
                 last_log = f.read()[-300:]
                 error_detail += f" | Engine Log: {last_log}"

        jobs[job_id].update({
            "status": "error",
            "progress": 0,
            "step": "Processing Error",
            "error": error_detail,
        })
        persist_job(job_id)
    finally:
        input_path.unlink(missing_ok=True)
        temp_output.unlink(missing_ok=True)


@app.on_event("startup")
async def startup_event():
    init_db()
    # Resume any jobs that were interrupted by a server restart
    with db() as connection:
        interrupted = connection.execute(
            "SELECT * FROM jobs WHERE status IN ('queued', 'processing')"
        ).fetchall()
        for row in interrupted:
            job = dict(row)
            job_id = job["id"]
            input_path = UPLOADS_DIR / f"{job_id}{Path(job['filename']).suffix}"
            if input_path.exists():
                print(f"Recovering interrupted job: {job_id}")
                jobs[job_id] = job
                asyncio.create_task(_process_job(job_id, input_path, job.get("user_id"), None))
            else:
                # Mark as error if file is gone
                connection.execute(
                    "UPDATE jobs SET status = 'error', error = 'Server restart, file lost' WHERE id = ?",
                    (job_id,)
                )
    print("Database initialized.")
    # We load the session lazily on the first request to avoid blocking server start

@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "ffmpeg": FFMPEG_EXE,
        "matting_backend": "rembg",
        "ready": rembg_session is not None,
    }


@app.post("/users/sync")
def sync_user(payload: SyncUserRequest) -> dict[str, Any]:
    user = ensure_user(payload.clerk_user_id, payload.email)
    return {
        "clerk_user_id": user["clerk_user_id"],
        "email": user["email"],
        "plan": user["plan"],
        "credits_remaining": user["credits_remaining"],
        "last_reset_date": user["last_reset_date"],
    }


@app.post("/users/select-plan")
def select_plan(payload: SelectPlanRequest) -> dict[str, Any]:
    user = set_user_plan(payload.clerk_user_id, payload.email, payload.plan)
    return {
        "clerk_user_id": user["clerk_user_id"],
        "email": user["email"],
        "plan": user["plan"],
        "credits_remaining": user["credits_remaining"],
        "last_reset_date": user["last_reset_date"],
    }


@app.post("/upload-chunk")
async def upload_chunk(
    job_id: str = Form(...),
    chunk_index: int = Form(...),
    file: UploadFile = File(...),
):
    chunk_path = CHUNK_DIR / f"{job_id}_{chunk_index}"
    with open(chunk_path, "wb") as f:
        f.write(await file.read())
    return {"status": "ok"}


@app.post("/finalize-upload")
async def finalize_upload(
    background_tasks: BackgroundTasks,
    job_id: str = Form(...),
    filename: str = Form(...),
    total_chunks: int = Form(...),
    clerk_user_id: str = Form(None),
    guest_id: str = Form(None),
):
    # Assemble chunks
    final_path = UPLOADS_DIR / f"{job_id}{Path(filename).suffix}"
    with open(final_path, "wb") as final_file:
        for i in range(total_chunks):
            chunk_path = CHUNK_DIR / f"{job_id}_{i}"
            if not chunk_path.exists():
                raise HTTPException(status_code=400, detail="Missing chunk data.")
            with open(chunk_path, "rb") as cf:
                final_file.write(cf.read())
            chunk_path.unlink() # Cleanup chunk

    # Validate size & credits before starting background task
    size = final_path.stat().st_size
    if size > MAX_UPLOAD_BYTES:
        final_path.unlink()
        raise HTTPException(status_code=413, detail="File too large.")

    # Same logic as original /process-video but using pre-saved file
    jobs[job_id] = {
        "id": job_id,
        "user_id": clerk_user_id,
        "filename": filename,
        "status": "queued",
        "progress": 30,
        "step": "Analyzing video...",
        "output_path": None,
        "error": None,
        "created_at": now_iso(),
    }
    persist_job(job_id)
    background_tasks.add_task(_process_job, job_id, final_path, clerk_user_id, guest_id)
    return {"status": "ok", "job_id": job_id}


@app.post("/process-video")
async def process_video(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
) -> dict[str, Any]:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_SUFFIXES:
        raise HTTPException(status_code=400, detail="Use MP4, MOV, WebM, or GIF.")

    form = await request.form()
    clerk_user_id = form.get("clerk_user_id")

    guest_id = None
    if clerk_user_id:
        user = get_user(str(clerk_user_id))
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")
        user = maybe_reset_credits(user)
        if user["plan"] == "none":
            raise HTTPException(status_code=403, detail="ONBOARDING_REQUIRED")
        if int(user["credits_remaining"]) <= 0:
            raise HTTPException(status_code=403, detail="CREDITS_EXHAUSTED")
    else:
        guest_id = guest_key(request)
        if guest_usage(guest_id) >= 3:
            raise HTTPException(status_code=403, detail="GUEST_LIMIT_REACHED")

    job_id = str(uuid.uuid4())
    filename = _safe_name(file.filename, f"upload{suffix}")
    input_path = UPLOADS_DIR / f"{job_id}{suffix}"
    await _save_upload(file, input_path)

    jobs[job_id] = {
        "id": job_id,
        "user_id": str(clerk_user_id) if clerk_user_id else None,
        "filename": filename,
        "status": "queued",
        "progress": 30, # Start at 30% to match upload completion
        "step": "Analyzing video...",
        "result_url": None,
        "error": None,
        "created_at": now_iso(),
    }
    # Persist IMMEDIATELY so other workers/status polls see it at 30%
    persist_job(job_id)
    
    background_tasks.add_task(_process_job, job_id, input_path, str(clerk_user_id) if clerk_user_id else None, guest_id)
    return {
        "job_id": job_id,
        "status_url": f"/status/{job_id}",
        "result_url": f"/result/{job_id}",
    }


@app.get("/status/{job_id}")
def get_status(job_id: str) -> dict[str, Any]:
    # 1. Try memory (current active jobs)
    job = jobs.get(job_id)
    if job:
        return job
        
    # 2. Try Database (jobs from other processes or after restart)
    with db() as connection:
        row = connection.execute("SELECT * FROM jobs WHERE id = ?", (job_id,)).fetchone()
        if row:
            return dict(row)
            
    raise HTTPException(status_code=404, detail="Job not found.")


@app.get("/result/{job_id}")
def get_result(job_id: str) -> FileResponse:
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    if job["status"] != "done" or not job.get("output_path"):
        raise HTTPException(status_code=409, detail="Result is not ready.")
    path = Path(job["output_path"])
    if not path.exists():
        raise HTTPException(status_code=404, detail="Result file missing.")
    return FileResponse(path, media_type="video/webm", filename=path.name)


@app.post("/webhook/dodopayments")
async def dodo_webhook(request: Request, x_dodo_signature: str = Header(None)) -> JSONResponse:
    body = await request.body()
    secret = os.getenv("DODO_SECRET_KEY", "")
    
    # Basic signature validation if secret is provided
    if secret and x_dodo_signature:
        expected_sig = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected_sig, x_dodo_signature):
            return JSONResponse({"status": "error", "message": "Invalid signature"}, status_code=401)
            
    try:
        data = json.loads(body)
        event_type = data.get("type")
        payload = data.get("data", {})
        
        # In DodoPayments, customer_reference_id or client_reference_id is often used
        clerk_user_id = payload.get("client_reference_id") or payload.get("customer_reference_id")
        
        if event_type == "payment.succeeded" and clerk_user_id:
            # Detect plan from product id
            product_id = payload.get("product_id")
            plan = "none"
            if product_id == os.getenv("DODO_PRODUCT_ID_MONTHLY"):
                plan = "monthly"
            elif product_id == os.getenv("DODO_PRODUCT_ID_YEARLY"):
                plan = "yearly"
                
            if plan != "none":
                set_user_plan(clerk_user_id, payload.get("customer_email", ""), plan)
                print(f"Plan updated to {plan} for user {clerk_user_id} via webhook.")
                
        return JSONResponse({"status": "ok"})
    except Exception as e:
        print(f"Webhook error: {e}")
        return JSONResponse({"status": "error", "message": str(e)}, status_code=400)
