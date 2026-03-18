"""
Cleanclip — Backend v2.0
Full Auth + Guest limits + Razorpay + Credit system
"""

import asyncio
import os
import shutil
import uuid
import json
import time
import concurrent.futures
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, Optional

import cv2
import imageio
import numpy as np
from fastapi import BackgroundTasks, FastAPI, File, HTTPException, UploadFile, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from PIL import Image, ImageSequence, ImageDraw, ImageFont
from rembg import new_session, remove
import bcrypt
import jwt
import razorpay

# ──────────────────────────────────────────────
# Config
# ──────────────────────────────────────────────
app = FastAPI(title="Cleanclip API", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = Path("temp")
OUTPUT_DIR = Path("output")
DB_FILE = Path("users.json")
GUEST_DB_FILE = Path("guests.json")
TEMP_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

SECRET_KEY = "cleanclip_jwt_secret_2026"
ALGORITHM = "HS256"

# Razorpay config — replace with real keys from Razorpay Dashboard
RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID", "rzp_test_YourKeyHere")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "YourSecretHere")
rzp_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

PLAN_CREDITS = {
    "free": 15,
    "monthly": 50,
    "yearly": 50,
}
PLAN_AMOUNT_PAISE = {
    "monthly": 19900,   # ₹199
    "yearly": 149900,   # ₹1499
}

# ──────────────────────────────────────────────
# DB Helpers
# ──────────────────────────────────────────────
def load_json(path: Path) -> dict:
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except:
        return {}

def save_json(path: Path, data: dict):
    path.write_text(json.dumps(data, indent=2), encoding="utf-8")


def get_guest_record(ip: str) -> dict:
    guests = load_json(GUEST_DB_FILE)
    today = datetime.now().strftime("%Y-%m-%d")
    if ip not in guests or guests[ip].get("date") != today:
        guests[ip] = {"date": today, "count": 0}
        save_json(GUEST_DB_FILE, guests)
    return guests[ip]


def increment_guest(ip: str):
    guests = load_json(GUEST_DB_FILE)
    today = datetime.now().strftime("%Y-%m-%d")
    if ip not in guests or guests[ip].get("date") != today:
        guests[ip] = {"date": today, "count": 1}
    else:
        guests[ip]["count"] += 1
    save_json(GUEST_DB_FILE, guests)


def _maybe_reset_credits(user: dict) -> dict:
    """Auto-reset credits if 30 days have passed since last reset."""
    last_reset = datetime.fromisoformat(user.get("last_reset", datetime.now().isoformat()))
    if (datetime.now() - last_reset).days >= 30:
        plan = user.get("plan", "free")
        user["credits"] = PLAN_CREDITS.get(plan, 15)
        user["last_reset"] = datetime.now().isoformat()
    return user


def get_user_by_email(email: str) -> Optional[dict]:
    users = load_json(DB_FILE)
    return users.get(email)


def get_user_by_id(user_id: str) -> Optional[dict]:
    users = load_json(DB_FILE)
    for email, user in users.items():
        if user.get("id") == user_id:
            user = _maybe_reset_credits(user)
            users[email] = user
            save_json(DB_FILE, users)
            return user
    return None


def update_user_by_id(user_id: str, updates: dict) -> Optional[dict]:
    users = load_json(DB_FILE)
    for email, user in users.items():
        if user.get("id") == user_id:
            user.update(updates)
            users[email] = user
            save_json(DB_FILE, users)
            return user
    return None

# ──────────────────────────────────────────────
# JWT Helpers
# ──────────────────────────────────────────────
def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(days=30)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except:
        return None


def get_current_user(authorization: str = Header(None)) -> Optional[dict]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    user_id = decode_token(authorization.split(" ")[1])
    if not user_id:
        return None
    return get_user_by_id(user_id)

# ──────────────────────────────────────────────
# Pydantic Models
# ──────────────────────────────────────────────
class UserCreate(BaseModel):
    email: str
    password: str

class LoginData(BaseModel):
    email: str
    password: str

class ClerkSyncDict(BaseModel):
    user_id: str
    email: str

class PlanSelection(BaseModel):
    plan: str

class PaymentVerification(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str

class DeductRequest(BaseModel):
    job_id: str

# ──────────────────────────────────────────────
# Auth Routes
# ──────────────────────────────────────────────
@app.post("/auth/signup")
def signup(body: UserCreate):
    users = load_json(DB_FILE)
    if body.email in users:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode()
    user_id = f"usr_{uuid.uuid4().hex[:10]}"
    now = datetime.now().isoformat()

    users[body.email] = {
        "id": user_id,
        "email": body.email,
        "password_hash": hashed,
        "plan": "none",        # onboarding not done yet
        "credits": 0,
        "last_reset": now,
        "created_at": now,
    }
    save_json(DB_FILE, users)
    token = create_token(user_id)
    return {"access_token": token, "user_id": user_id, "plan": "none", "credits": 0}


@app.post("/auth/login")
def login(body: LoginData):
    user = get_user_by_email(body.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not bcrypt.checkpw(body.password.encode(), user["password_hash"].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(user["id"])
    return {
        "access_token": token,
        "user_id": user["id"],
        "plan": user["plan"],
        "credits": user["credits"],
    }

@app.post("/auth/clerk-sync")
def clerk_sync(body: ClerkSyncDict):
    users = load_json(DB_FILE)
    for email, u in users.items():
        if u.get("id") == body.user_id:
            user = _maybe_reset_credits(u)
            users[email] = user
            save_json(DB_FILE, users)
            token = create_token(body.user_id)
            return {"access_token": token, "user_id": body.user_id, "plan": user["plan"], "credits": user["credits"]}
            
    if body.email in users:
        user = users[body.email]
        user["id"] = body.user_id
        save_json(DB_FILE, users)
        token = create_token(body.user_id)
        return {"access_token": token, "user_id": body.user_id, "plan": user["plan"], "credits": user["credits"]}
        
    now = datetime.now().isoformat()
    users[body.email] = {
        "id": body.user_id,
        "email": body.email,
        "password_hash": "",
        "plan": "none",
        "credits": 0,
        "last_reset": now,
        "created_at": now,
    }
    save_json(DB_FILE, users)
    token = create_token(body.user_id)
    return {"access_token": token, "user_id": body.user_id, "plan": "none", "credits": 0}


@app.get("/auth/me")
def get_me(authorization: str = Header(None)):
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {
        "user_id": user["id"],
        "email": user["email"],
        "plan": user["plan"],
        "credits": user["credits"],
    }


@app.post("/auth/select-plan")
def select_plan(body: PlanSelection, authorization: str = Header(...)):
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if body.plan == "free":
        credits = PLAN_CREDITS["free"]
        updated = update_user_by_id(user["id"], {
            "plan": "free",
            "credits": credits,
            "last_reset": datetime.now().isoformat(),
        })
        return {"status": "success", "plan": "free", "credits": credits}

    elif body.plan in ("monthly", "yearly"):
        amount = PLAN_AMOUNT_PAISE[body.plan]
        try:
            order = rzp_client.order.create({
                "amount": amount,
                "currency": "INR",
                "receipt": f"rcpt_{user['id']}_{int(time.time())}",
                "notes": {"user_id": user["id"], "plan": body.plan},
            })
            return {
                "order_id": order["id"],
                "amount": amount,
                "currency": "INR",
                "rzp_key": RAZORPAY_KEY_ID,
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Razorpay error: {e}")
    else:
        raise HTTPException(status_code=400, detail="Invalid plan")

# ──────────────────────────────────────────────
# Razorpay Payment Verification
# ──────────────────────────────────────────────
@app.post("/payments/verify")
def verify_payment(body: PaymentVerification):
    try:
        rzp_client.utility.verify_payment_signature({
            "razorpay_order_id": body.razorpay_order_id,
            "razorpay_payment_id": body.razorpay_payment_id,
            "razorpay_signature": body.razorpay_signature,
        })
        order = rzp_client.order.fetch(body.razorpay_order_id)
        user_id = order["notes"]["user_id"]
        plan = order["notes"]["plan"]
        credits = PLAN_CREDITS.get(plan, 50)
        update_user_by_id(user_id, {
            "plan": plan,
            "credits": credits,
            "last_reset": datetime.now().isoformat(),
        })
        return {"status": "success", "plan": plan, "credits": credits}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Payment verification failed: {e}")

# ──────────────────────────────────────────────
# Razorpay Webhook (optional — for subscription renewal)
# ──────────────────────────────────────────────
@app.post("/payments/webhook")
async def webhook(request: Request):
    try:
        data = await request.json()
        event = data.get("type") or data.get("event") or ""
        
        # DodoPayments: checkout.paid
        if event == "checkout.paid":
            payload = data.get("data", {})
            metadata = payload.get("metadata", {})
            user_id = metadata.get("user_id")
            plan = metadata.get("plan", "monthly")
            
            if user_id:
                print(f"✅ DodoPayments Success: Upgrading user {user_id} to {plan}")
                update_user_by_id(user_id, {
                    "plan": plan,
                    "credits": PLAN_CREDITS.get(plan, 50),
                    "last_reset": datetime.now().isoformat(),
                })

        # Razorpay: payment.captured (legacy support)
        elif event in ("payment.captured", "subscription.charged"):
            payload = data.get("payload", {}).get("payment", {}).get("entity", {})
            notes = payload.get("notes", {})
            user_id = notes.get("user_id")
            plan = notes.get("plan", "monthly")
            if user_id:
                print(f"✅ Razorpay Success: Upgrading user {user_id} to {plan}")
                update_user_by_id(user_id, {
                    "plan": plan,
                    "credits": PLAN_CREDITS.get(plan, 50),
                    "last_reset": datetime.now().isoformat(),
                })
    except Exception as e:
        print(f"❌ Webhook error: {e}")
    return {"status": "received"}

# ──────────────────────────────────────────────
# AI Processing
# ──────────────────────────────────────────────
jobs: Dict[str, dict] = {}
rembg_session = None
executor = concurrent.futures.ThreadPoolExecutor(max_workers=os.cpu_count() or 4)


@app.on_event("startup")
async def startup():
    global rembg_session
    print("🔄 Loading u2net model for better precision…")
    loop = asyncio.get_event_loop()
    rembg_session = await loop.run_in_executor(None, lambda: new_session("u2net"))
    print("✅ AI model ready.")


@app.get("/health")
def health():
    return {"status": "ok", "ready": rembg_session is not None}


@app.post("/remove-bg")
async def remove_bg(
    background_tasks: BackgroundTasks,
    request: Request,
    file: UploadFile = File(...),
    authorization: str = Header(None),
):
    ip = request.client.host or "127.0.0.1"
    user = get_current_user(authorization) if authorization else None

    # ── Access Control ──
    if user is None:
        # Guest path
        rec = get_guest_record(ip)
        if rec["count"] >= 3:
            raise HTTPException(status_code=403, detail="GUEST_LIMIT_REACHED")
        increment_guest(ip)
        job_plan = "guest"
        remaining = 3 - rec["count"] - 1
    else:
        if user["plan"] == "none":
            raise HTTPException(status_code=403, detail="ONBOARDING_REQUIRED")
        if user["credits"] <= 0:
            raise HTTPException(status_code=403, detail="CREDITS_EXHAUSTED")
        # Do not deduct on upload. 
        job_plan = user["plan"]
        remaining = user["credits"]

    # ── Queue Job ──
    job_id = str(uuid.uuid4())
    job_dir = TEMP_DIR / job_id
    job_dir.mkdir(parents=True)

    suffix = Path(file.filename or "upload.mp4").suffix.lower()
    if suffix not in {".mp4", ".webm", ".mov", ".gif"}:
        suffix = ".mp4"
    input_path = job_dir / f"input{suffix}"
    input_path.write_bytes(await file.read())

    jobs[job_id] = {
        "status": "queued",
        "progress": 0,
        "step": "Queued…",
        "output_path": None,
        "plan": job_plan,
    }

    background_tasks.add_task(process_job, job_id, input_path, suffix, job_plan)
    return {"job_id": job_id, "remaining_credits": remaining, "plan": job_plan}


@app.get("/status/{job_id}")
def get_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]


@app.get("/result/{job_id}")
def get_result(job_id: str):
    job = jobs.get(job_id)
    if not job or job["status"] != "done":
        raise HTTPException(status_code=404, detail="Result not ready")
    path = Path(job["output_path"])
    return FileResponse(path, filename=path.name)

@app.post("/deduct-credit")
def deduct_credit(body: DeductRequest, authorization: str = Header(...)):
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    job = jobs.get(body.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.get("deducted"):
        return {"status": "ok", "remaining_credits": user["credits"]}
    if user["credits"] <= 0:
        raise HTTPException(status_code=403, detail="CREDITS_EXHAUSTED")
    job["deducted"] = True
    new_credits = user["credits"] - 1
    update_user_by_id(user["id"], {"credits": new_credits})
    return {"status": "ok", "remaining_credits": new_credits}

# ──────────────────────────────────────────────
# Frame Processing
# ──────────────────────────────────────────────
def _process_frame(frame_rgb: np.ndarray, plan: str) -> np.ndarray:
    img = Image.fromarray(frame_rgb)

    # Resolution caps
    if plan in ("guest", "free") and img.height > 480:
        r = 480 / img.height
        img = img.resize((int(img.width * r), 480), Image.Resampling.LANCZOS)
    elif plan in ("monthly", "yearly") and img.height > 720:
        r = 720 / img.height
        img = img.resize((int(img.width * r), 720), Image.Resampling.LANCZOS)

    result = remove(img, session=rembg_session).convert("RGBA")

    # Watermark for guest/free
    if plan in ("guest", "free"):
        draw = ImageDraw.Draw(result)
        w, h = result.size
        draw.text((w - 80, h - 20), "Cleanclip", fill=(255, 255, 255, 150))

    return np.array(result)


async def process_job(job_id: str, input_path: Path, suffix: str, plan: str):
    job = jobs[job_id]
    try:
        job.update({"status": "processing", "progress": 5, "step": "Preparing…"})

        if suffix == ".gif":
            output_path = OUTPUT_DIR / f"{job_id}.gif"
            await _process_gif(job, input_path, output_path, plan)
        else:
            output_path = OUTPUT_DIR / f"{job_id}.webm"
            await _process_video(job, input_path, output_path, plan)

        job.update({"status": "done", "progress": 100, "step": "Done ✅", "output_path": str(output_path)})
    except Exception as e:
        job.update({"status": "error", "step": f"Error: {e}"})
    finally:
        shutil.rmtree(input_path.parent, ignore_errors=True)


async def _process_video(job: dict, input_path: Path, output_path: Path, plan: str):
    cap = cv2.VideoCapture(str(input_path))
    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    max_secs = 30 if plan in ("guest", "free") else 120
    total = min(total, int(fps * max_secs))

    frames = []
    while len(frames) < total:
        ok, bgr = cap.read()
        if not ok:
            break
        frames.append(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB))
    cap.release()

    chunk = 2 if plan == "guest" else (4 if plan == "free" else 12)
    results = []
    loop = asyncio.get_event_loop()
    for i in range(0, len(frames), chunk):
        futs = [loop.run_in_executor(executor, _process_frame, f, plan) for f in frames[i:i+chunk]]
        results.extend(await asyncio.gather(*futs))
        if plan == "guest":
            await asyncio.sleep(0.1)
        job["progress"] = 10 + int(len(results) / len(frames) * 80)
        job["step"] = f"Processing frames: {len(results)}/{len(frames)}"

    job["step"] = "Encoding output…"
    writer = imageio.get_writer(
        str(output_path), format="ffmpeg", fps=fps, codec="libvpx-vp9",
        output_params=["-pix_fmt", "yuva420p", "-crf", "30", "-b:v", "0"],
    )
    for f in results:
        writer.append_data(f)
    writer.close()


async def _process_gif(job: dict, input_path: Path, output_path: Path, plan: str):
    gif = Image.open(input_path)
    frames = [f.convert("RGB") for f in ImageSequence.Iterator(gif)]
    n = min(len(frames), 150 if plan in ("guest", "free") else len(frames))

    chunk = 2 if plan == "guest" else 4
    results = []
    loop = asyncio.get_event_loop()
    for i in range(0, n, chunk):
        arr_chunk = [np.array(f) for f in frames[i:i+chunk]]
        futs = [loop.run_in_executor(executor, _process_frame, f, plan) for f in arr_chunk]
        results.extend([Image.fromarray(r) for r in await asyncio.gather(*futs)])
        if plan == "guest":
            await asyncio.sleep(0.1)
        job["progress"] = 10 + int(len(results) / n * 80)
        job["step"] = f"Processing GIF: {len(results)}/{n}"

    results[0].save(
        str(output_path), save_all=True, append_images=results[1:],
        duration=gif.info.get("duration", 80), loop=0, disposal=2,
    )
