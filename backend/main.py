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
MAX_UPLOAD_BYTES = 20 * 1024 * 1024  # 20MB - Safer for free-tier environments
ALLOWED_SUFFIXES = {".mp4", ".mov", ".webm", ".gif"}
PLAN_LIMITS = {"none": 0, "free": 10, "pro": 50, "lifetime": 99999}

for directory in (UPLOADS_DIR, OUTPUTS_DIR):
    directory.mkdir(parents=True, exist_ok=True)

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
                has_onboarded INTEGER NOT NULL DEFAULT 0,
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
        # Migration for existing DBs
        try:
            connection.execute("ALTER TABLE users ADD COLUMN has_onboarded INTEGER NOT NULL DEFAULT 0")
        except sqlite3.OperationalError:
            pass # already exists


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
                INSERT INTO users (clerk_user_id, email, plan, credits_remaining, has_onboarded, last_reset_date, created_at, updated_at)
                VALUES (?, ?, 'none', 0, 0, ?, ?, ?)
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
    if plan not in {"free", "pro", "lifetime"}:
        raise HTTPException(status_code=400, detail="Invalid plan.")
    
    now = now_iso()
    user = get_user(clerk_user_id)
    
    # Ensure paid plans are NOT granted via this endpoint (only Free onboarding)
    final_plan = "free" if plan == "free" else (user["plan"] if user else "none")
    credits_to_set = 0
    if final_plan == "free" and (not user or user["plan"] == "none"):
        credits_to_set = PLAN_LIMITS["free"]
    elif user:
        credits_to_set = user["credits_remaining"]

    with db() as connection:
        connection.execute(
            """
            INSERT INTO users (clerk_user_id, email, plan, credits_remaining, has_onboarded, last_reset_date, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(clerk_user_id) DO UPDATE SET
                email = excluded.email,
                plan = excluded.plan,
                credits_remaining = excluded.credits_remaining,
                has_onboarded = excluded.has_onboarded,
                updated_at = excluded.updated_at
            """,
            (clerk_user_id, email, final_plan, credits_to_set, 1, now, now, now),
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
            "-crf", "40", 
            "-deadline", "realtime", 
            "-preset", "ultrafast",
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
                        raise RuntimeError("Failed to read any frames from the video.")
                    break
                
                try:
                    if process.poll() is not None:
                         raise RuntimeError("FFmpeg process exited prematurely.")

                    # Matrix Optimization: Ensure even dimensions
                    if frame.shape[1] != meta.width or frame.shape[0] != meta.height:
                        frame = cv2.resize(frame, (meta.width, meta.height))

                    # ⚡ Speed Multiplier: Neural Matting at Downscaled Resolution
                    # Neural models (U2Net) internally resize to ~320x320 anyway.
                    # By doing it here, we save massive CPU cycles and memory copying.
                    proc_h, proc_w = 480, int(480 * (meta.width / meta.height))
                    proc_frame = cv2.resize(frame, (proc_w, proc_h))
                    
                    # Convert BGR to RGB for Neural Engine
                    proc_rgb = cv2.cvtColor(proc_frame, cv2.COLOR_BGR2RGB)
                    
                    global rembg_session
                    if rembg_session is None:
                        with session_lock:
                            if rembg_session is None:
                                print("⚡ Turbo Neural Engine Activating (u2netp)...")
                                try:
                                    # u2netp is the 'Pocket' version, optimized for speed
                                    rembg_session = new_session("u2netp")
                                except:
                                    rembg_session = new_session("u2net")

                    # Neural Mask Generation (post_process_mask=False for 3x speedup)
                    mask = remove(proc_rgb, session=rembg_session, only_mask=True, post_process_mask=False)
                    
                    # upscale mask back to original resolution
                    full_mask = cv2.resize(mask, (meta.width, meta.height), interpolation=cv2.INTER_LANCZOS4)
                    
                    # Apply Mask to original high-res frame via NumPy vectorization
                    # frame is BGR, we need RGBA
                    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    
                    # Create alpha channel from mask
                    alpha = full_mask.astype(float) / 255.0
                    
                    # Stack RGB and Alpha (Vectorized NumPy is much faster than PIL loops)
                    import numpy as np
                    rgba_frame = np.dstack((frame_rgb, full_mask))
                    
                    # Write bytes direct to FFmpeg pipe
                    if process.stdin:
                        process.stdin.write(rgba_frame.tobytes())
                        process.stdin.flush()
                        
                    # Preview Update (once every few seconds)
                    if frame_idx % 150 == 0:
                        import io, base64
                        thumb_io = io.BytesIO()
                        # Use proc_frame with proc_mask for lightning fast thumbnail
                        proc_rgba = np.dstack((proc_rgb, mask))
                        thumb_img = Image.fromarray(proc_rgba).convert("RGBA")
                        thumb_img.save(thumb_io, "WEBP", quality=50)
                        thumb_b64 = base64.b64encode(thumb_io.getvalue()).decode()
                        jobs[job_id]["preview_frame"] = f"data:image/webp;base64,{thumb_b64}"

                except Exception as e:
                    print(f"Frame {frame_idx} error: {e}")
                    if "Broken pipe" in str(e): raise e
                
                frame_idx += 1
                progress = 30.0 + (frame_idx / (max(total_frames, frame_idx) or 1)) * 65.0
                jobs[job_id].update({
                    "progress": round(min(progress, 95.0), 2),
                    "step": f"Turbo Cleaning: {frame_idx}/{total_frames or '?'}"
                })
                if frame_idx % 200 == 0: persist_job(job_id)
            
            cap.release()
            if process.stdin: process.stdin.close()
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


@app.post("/users/onboard")
def mark_onboarded(data: dict[str, Any]):
    clerk_user_id = data.get("clerk_user_id")
    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="Missing user id.")
    
    with db() as connection:
        connection.execute(
            "UPDATE users SET has_onboarded = 1 WHERE clerk_user_id = ?",
            (clerk_user_id,)
        )
    return {"status": "success"}


@app.post("/users/sync")
def sync_user(payload: SyncUserRequest) -> dict[str, Any]:
    user = ensure_user(payload.clerk_user_id, payload.email)
    return {
        "clerk_user_id": user["clerk_user_id"],
        "email": user["email"],
        "plan": user["plan"],
        "credits_remaining": user["credits_remaining"],
        "has_onboarded": user["has_onboarded"],
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
        "has_onboarded": user["has_onboarded"],
        "last_reset_date": user["last_reset_date"],
    }


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
@app.post("/payments/webhook")
async def dodo_webhook(request: Request) -> JSONResponse:
    body = await request.body()
    body_str = body.decode("utf-8")
    secret = os.getenv("DODO_SECRET_KEY", "")
    
    # Extract Svix / Dodo Headers
    svix_id = request.headers.get("svix-id") or request.headers.get("webhook-id")
    svix_timestamp = request.headers.get("svix-timestamp") or request.headers.get("webhook-timestamp")
    svix_signature = request.headers.get("svix-signature") or request.headers.get("x-dodo-signature")
    
    print(f"DEBUG: Webhook hit! ID: {svix_id}, TS: {svix_timestamp}")
    
    # Signature Validation (Svix-compliant)
    if secret and svix_signature:
        try:
            # v1,signature format
            to_sign = f"{svix_id}.{svix_timestamp}.{body_str}"
            expected_sig = hmac.new(secret.encode(), to_sign.encode(), hashlib.sha256).hexdigest()
            
            # Check if any part of the signature header matches
            actual_sigs = svix_signature.split(" ")
            found = False
            for sig in actual_sigs:
                if "," in sig:
                    _, sig_hash = sig.split(",", 1)
                    if hmac.compare_digest(expected_sig, sig_hash):
                        found = True
                        break
            
            if not found:
                print("🚨 WEBHOOK ERROR: Svix Signature Mismatch")
                return JSONResponse({"status": "error", "message": "Invalid signature"}, status_code=401)
        except Exception as e:
            print(f"🚨 WEBHOOK ERROR: Validation failed: {e}")
            return JSONResponse({"status": "error", "message": "Validation error"}, status_code=401)
            
    try:
        data = json.loads(body_str)
        print(f"DEBUG: Webhook Body: {json.dumps(data, indent=2)}")
        event_type = data.get("type")
        payload = data.get("data", {})
        
        # Check direct payload or nested metadata
        clerk_user_id = payload.get("client_reference_id") or payload.get("metadata", {}).get("client_reference_id")
        
        if event_type == "payment.succeeded" and clerk_user_id:
            product_id = payload.get("product_id")
            plan = "none"
            credits_to_add = 0
            
            # PRO Plan: pdt_0NalSjZWHhamGs4oYJvTe
            if product_id == "pdt_0NalSjZWHhamGs4oYJvTe":
                plan = "pro"
                credits_to_add = 50
            # LIFETIME Plan: pdt_0NavKn2G5oln4JN2cMrzM
            elif product_id == "pdt_0NavKn2G5oln4JN2cMrzM":
                plan = "lifetime"
                credits_to_add = 99999
                
            if plan != "none":
                email = payload.get("customer_email", "paid@user.com")
                now = now_iso()
                
                with db() as connection:
                    connection.execute(
                        """
                        INSERT INTO users (clerk_user_id, email, plan, credits_remaining, has_onboarded, last_reset_date, created_at, updated_at)
                        VALUES (?, ?, ?, ?, 1, ?, ?, ?)
                        ON CONFLICT(clerk_user_id) DO UPDATE SET
                            plan = excluded.plan,
                            credits_remaining = credits_remaining + excluded.credits_remaining,
                            has_onboarded = 1,
                            updated_at = excluded.updated_at
                        """,
                        (clerk_user_id, email, plan, credits_to_add, now, now, now),
                    )
                print(f"💰 SECURE PAYMENT SUCCESS: Granted {credits_to_add} to {clerk_user_id} (Plan: {plan})")
                
        return JSONResponse({"status": "ok"})
    except Exception as e:
        print(f"🚨 WEBHOOK ERROR: {e}")
        return JSONResponse({"status": "error", "message": str(e)}, status_code=400)
