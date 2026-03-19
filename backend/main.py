from __future__ import annotations

import asyncio
import concurrent.futures
import shutil
import sqlite3
import subprocess
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import cv2
from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from PIL import Image
from pydantic import BaseModel
from rembg import new_session, remove
import imageio_ffmpeg

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
UPLOADS_DIR = BASE_DIR / "uploads"
OUTPUTS_DIR = BASE_DIR / "outputs"
WORK_DIR = BASE_DIR / "work"
DB_PATH = BASE_DIR / "cleanclip.db"
MAX_UPLOAD_BYTES = 100 * 1024 * 1024
ALLOWED_SUFFIXES = {".mp4", ".mov", ".webm", ".gif"}
PLAN_LIMITS = {"none": 0, "free": 10, "monthly": 50, "yearly": 50}

for directory in (UPLOADS_DIR, OUTPUTS_DIR, WORK_DIR):
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
    width = int(capture.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
    height = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)
    capture.release()
    return VideoMeta(fps=max(fps, 1.0), frame_count=max(frame_count, 0), width=width, height=height)


def _run_ffmpeg(command: list[str]) -> None:
    completed = subprocess.run(command, capture_output=True, text=True)
    if completed.returncode != 0:
        raise RuntimeError(completed.stderr.strip() or "FFmpeg command failed.")


def _extract_frames(input_path: Path, frames_dir: Path) -> int:
    frames_dir.mkdir(parents=True, exist_ok=True)
    output_pattern = frames_dir / "frame_%06d.png"
    _run_ffmpeg(
        [
            FFMPEG_EXE,
            "-y",
            "-i",
            str(input_path),
            "-vsync",
            "0",
            "-pix_fmt",
            "rgba",
            str(output_pattern),
        ]
    )
    return len(list(frames_dir.glob("frame_*.png")))


def _encode_output(frames_dir: Path, fps: float, output_path: Path) -> None:
    input_pattern = frames_dir / "frame_%06d.png"
    _run_ffmpeg(
        [
            FFMPEG_EXE,
            "-y",
            "-framerate",
            f"{fps}",
            "-i",
            str(input_pattern),
            "-c:v",
            "libvpx-vp9",
            "-pix_fmt",
            "yuva420p",
            "-auto-alt-ref",
            "0",
            "-crf",
            "28",
            "-b:v",
            "0",
            str(output_path),
        ]
    )


def _process_frame(frame_path: Path) -> None:
    with Image.open(frame_path) as source:
        result = remove(source.convert("RGBA"), session=rembg_session).convert("RGBA")
        result.save(frame_path)


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
    job = jobs[job_id]
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
    work_dir = WORK_DIR / job_id
    frames_dir = work_dir / "frames"
    output_path = OUTPUTS_DIR / f"{job_id}.webm"
    work_dir.mkdir(parents=True, exist_ok=True)

    try:
        jobs[job_id].update({"status": "processing", "progress": 5, "step": "Inspecting video"})
        persist_job(job_id)
        meta = _get_video_meta(input_path)

        jobs[job_id].update({"progress": 12, "step": "Extracting frames"})
        persist_job(job_id)
        extracted_count = await asyncio.get_running_loop().run_in_executor(
            executor,
            _extract_frames,
            input_path,
            frames_dir,
        )

        if extracted_count == 0:
            raise RuntimeError("No frames were extracted from the uploaded file.")

        frame_paths = sorted(frames_dir.glob("frame_*.png"))
        total_frames = len(frame_paths)
        loop = asyncio.get_running_loop()

        for index, frame_path in enumerate(frame_paths, start=1):
            await loop.run_in_executor(executor, _process_frame, frame_path)
            jobs[job_id].update(
                {
                    "progress": 12 + int((index / total_frames) * 72),
                    "step": f"Removing background {index}/{total_frames}",
                }
            )
            persist_job(job_id)

        jobs[job_id].update({"progress": 90, "step": "Encoding result"})
        persist_job(job_id)
        await loop.run_in_executor(executor, _encode_output, frames_dir, meta.fps, output_path)

        if owner_user_id:
            deduct_user_credit(owner_user_id)
        elif guest_id:
            increment_guest_usage(guest_id)

        jobs[job_id].update(
            {
                "status": "done",
                "progress": 100,
                "step": "Ready",
                "output_path": str(output_path),
                "result_url": f"/result/{job_id}",
                "error": None,
            }
        )
        persist_job(job_id)
    except Exception as exc:
        jobs[job_id].update(
            {
                "status": "error",
                "progress": 100,
                "step": "Failed",
                "error": str(exc),
            }
        )
        persist_job(job_id)
    finally:
        input_path.unlink(missing_ok=True)
        shutil.rmtree(work_dir, ignore_errors=True)


@app.on_event("startup")
async def startup() -> None:
    global rembg_session
    init_db()
    loop = asyncio.get_running_loop()
    rembg_session = await loop.run_in_executor(executor, lambda: new_session("u2net"))


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
        "progress": 0,
        "step": "Queued",
        "result_url": None,
        "error": None,
        "created_at": now_iso(),
    }
    persist_job(job_id)

    background_tasks.add_task(_process_job, job_id, input_path, str(clerk_user_id) if clerk_user_id else None, guest_id)
    return {
        "job_id": job_id,
        "status_url": f"/status/{job_id}",
        "result_url": f"/result/{job_id}",
    }


@app.get("/status/{job_id}")
def get_status(job_id: str) -> dict[str, Any]:
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    return job


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
