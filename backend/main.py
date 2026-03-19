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
from supabase import create_client, Client
from dotenv import load_dotenv
import httpx

load_dotenv()

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

# Supabase Config
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# DodoPayments Config
DODO_SECRET_KEY = os.environ.get("DODO_SECRET_KEY")
DODO_PRODUCT_ID_MONTHLY = os.environ.get("DODO_PRODUCT_ID_MONTHLY", "pdt_0NalSjZWHhamGs4oYJvTe")
DODO_PRODUCT_ID_YEARLY = os.environ.get("DODO_PRODUCT_ID_YEARLY", "pdt_0NalSUMsJzvscQl8QNvVM")

PLAN_CREDITS = {
    "free": 15,
    "monthly": 50,
    "yearly": 50,
}
PLAN_AMOUNT_PAISE = {
    "monthly": 19900,   # ₹199
    "yearly": 149900,   # ₹1499
}

def get_guest_record(ip: str) -> dict:
    today = datetime.now().strftime("%Y-%m-%d")
    try:
        res = supabase.table("guests").select("*").eq("ip", ip).execute()
        if not res.data or res.data[0].get("date") != today:
            data = {"ip": ip, "date": today, "count": 0}
            supabase.table("guests").upsert(data).execute()
            return data
        return res.data[0]
    except Exception as e:
        print(f"Supabase Guest Error: {e}")
        return {"date": today, "count": 0}

def increment_guest(ip: str):
    today = datetime.now().strftime("%Y-%m-%d")
    rec = get_guest_record(ip)
    new_count = rec["count"] + 1
    supabase.table("guests").update({"count": new_count}).eq("ip", ip).execute()

def _maybe_reset_credits(user: dict) -> dict:
    """Auto-reset credits if 30 days have passed since last reset date."""
    last_reset_str = user.get("last_reset_date")
    if not last_reset_str:
        return user
    
    try:
        last_reset = datetime.fromisoformat(last_reset_str.replace("Z", "+00:00"))
    except:
        return user

    if (datetime.now(last_reset.tzinfo) - last_reset).days >= 30:
        plan = user.get("plan", "free")
        new_credits = PLAN_CREDITS.get(plan, 15)
        user["credits_remaining"] = new_credits
        user["last_reset_date"] = datetime.now().isoformat()
        supabase.table("users").update({
            "credits_remaining": new_credits,
            "last_reset_date": user["last_reset_date"]
        }).eq("clerk_user_id", user["clerk_user_id"]).execute()
    return user

def get_user_by_email(email: str) -> Optional[dict]:
    res = supabase.table("users").select("*").eq("email", email).execute()
    if not res.data:
        return None
    return res.data[0]

def get_user_by_id(user_id: str) -> Optional[dict]:
    res = supabase.table("users").select("*").eq("clerk_user_id", user_id).execute()
    if not res.data:
        return None
    user = res.data[0]
    return _maybe_reset_credits(user)
    return _maybe_reset_credits(profile)


def update_user_by_id(user_id: str, updates: dict) -> Optional[dict]:
    try:
        res = supabase.table("profiles").update(updates).eq("id", user_id).execute()
        if res.data:
            return res.data[0]
    except Exception as e:
        print(f"Update User Error: {e}")
    return None

# ──────────────────────────────────────────────
# Supabase DB Helpers
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
@app.post("/auth/clerk-sync")
def clerk_sync(body: ClerkSyncDict):
    """Sync Clerk User to Supabase Users table."""
    user = get_user_by_id(body.user_id)
    if user:
        token = create_token(body.user_id)
        return {
            "access_token": token, 
            "user_id": body.user_id, 
            "plan": user["plan"], 
            "credits": user["credits_remaining"]
        }
            
    # Case 2: New user
    now = datetime.now().isoformat()
    new_user = {
        "clerk_user_id": body.user_id,
        "email": body.email,
        "plan": "none",
        "credits_remaining": 0,
        "credits_total": 15,
        "last_reset_date": now,
        "created_at": now,
    }
    try:
        supabase.table("users").upsert(new_user).execute()
        print(f"✅ Supabase User Sync: {body.email} ({body.user_id})")
        token = create_token(body.user_id)
        return {"access_token": token, "user_id": body.user_id, "plan": "none", "credits": 0}
    except Exception as e:
        print(f"Sync Save Error: {e}")
        raise HTTPException(status_code=500, detail="Could not sync user to Database")


@app.get("/auth/me")
def get_me(authorization: str = Header(None)):
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {
        "user_id": user["clerk_user_id"],
        "email": user["email"],
        "plan": user["plan"],
        "credits": user["credits_remaining"],
    }


@app.post("/payments/create-checkout")
async def create_checkout(body: PlanSelection, authorization: str = Header(...)):
    """Create a DodoPayments Checkout with User Metadata."""
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if body.plan == "free":
        # Handle free onboarding
        credits = PLAN_CREDITS["free"]
        update_user_by_id(user["clerk_user_id"], {
            "plan": "free",
            "credits_remaining": credits,
            "credits_total": credits,
            "last_reset_date": datetime.now().isoformat(),
        })
        return {"status": "success", "plan": "free", "credits": credits}

    # Payment link generation via Dodo API
    product_id = DODO_PRODUCT_ID_MONTHLY if body.plan == "monthly" else DODO_PRODUCT_ID_YEARLY
    
    # Metadata includes User ID for webhook sync
    payload = {
        "product_id": product_id,
        "quantity": 1,
        "metadata": {
            "user_id": user["clerk_user_id"],
            "plan": body.plan
        },
        "return_url": "https://cleanclip.vercel.app/result/success"
    }

    async with httpx.AsyncClient() as client:
        try:
            # Dodo URL: https://api.dodopayments.com/v1/checkouts
            resp = await client.post(
                "https://api.dodopayments.com/v1/checkouts",
                json=payload,
                headers={"Authorization": f"Bearer {DODO_SECRET_KEY}"}
            )
            if resp.status_code != 200:
                print(f"❌ Dodo API Error: {resp.text}")
                raise HTTPException(status_code=500, detail="Could not create payment session")
            
            data = resp.json()
            return {"checkout_url": data.get("url")}
        except Exception as e:
            print(f"❌ Payment Error: {e}")
            raise HTTPException(status_code=500, detail="Internal Payment Error")

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
            "credits_remaining": credits,
            "credits_total": credits,
            "last_reset_date": datetime.now().isoformat(),
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

        # Razorpay: payment.captured or subscription.charged
        elif event in ("payment.captured", "subscription.charged"):
            # Get payment entity
            payment = data.get("payload", {}).get("payment", {}).get("entity", {})
            notes = payment.get("notes", {})
            user_id = notes.get("user_id")
            email = payment.get("email")
            plan = notes.get("plan", "monthly")
            
            # Auto-detect plan if not in notes (common for static rzp.io links)
            amount = payment.get("amount", 0)
            if amount >= 140000: plan = "yearly"
            elif amount >= 19000: plan = "monthly"

            if user_id:
                print(f"✅ Razorpay Success (ID): Upgrading user {user_id} to {plan}")
                update_user_by_id(user_id, {
                    "plan": plan,
                    "credits_remaining": PLAN_CREDITS.get(plan, 50),
                    "credits_total": PLAN_CREDITS.get(plan, 50),
                    "last_reset_date": datetime.now().isoformat(),
                })
            elif email:
                print(f"✅ Razorpay Success (Email): Matching {email} for plan {plan}")
                user = get_user_by_email(email)
                if user:
                    update_user_by_id(user["clerk_user_id"], {
                        "plan": plan,
                        "credits_remaining": PLAN_CREDITS.get(plan, 50),
                        "credits_total": PLAN_CREDITS.get(plan, 50),
                        "last_reset_date": datetime.now().isoformat(),
                    })
                    print(f"💰 Credits applied to {email}")
                else:
                    print(f"❌ User not found for email: {email}")
    except Exception as e:
        print(f"❌ Webhook error: {e}")
    return {"status": "received"}

# ──────────────────────────────────────────────
# AI Processing
# ──────────────────────────────────────────────
jobs: Dict[str, dict] = {}
rembg_session = None
# Optimized for 512MB RAM: Max 2 workers to avoid OOM
executor = concurrent.futures.ThreadPoolExecutor(max_workers=min(os.cpu_count() or 2, 2))

TEMP_DIR = Path("temp")
OUTPUT_DIR = Path("output")
TEMP_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

@app.on_event("startup")
async def startup():
    global rembg_session
    print("🔄 Loading u2net model for 512MB RAM efficiency…")
    loop = asyncio.get_event_loop()
    # u2net is the standard stable model for limited RAM environments
    rembg_session = await loop.run_in_executor(None, lambda: new_session("u2net"))
    print("✅ Memory-optimized AI model ready.")


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
    if (user.get("credits_remaining") or 0) <= 0:
        raise HTTPException(status_code=403, detail="CREDITS_EXHAUSTED")
    
    job["deducted"] = True
    new_credits = user["credits_remaining"] - 1
    updated = update_user_by_id(user["clerk_user_id"], {"credits_remaining": new_credits})
    
    if updated:
        print(f"💰 Credit Deducted: {user.get('email')} (-1) -> {new_credits}")
        return {"status": "ok", "remaining_credits": new_credits}
    else:
        # Fallback if update_user_by_id failed to find the user by ID
        print(f"❌ Failed to update credits in DB for user {user['id']}")
        return {"status": "ok", "remaining_credits": user["credits"]}

# ──────────────────────────────────────────────
# Frame Processing
# ──────────────────────────────────────────────
def _process_frame(frame_rgb: np.ndarray, plan: str) -> np.ndarray:
    img = Image.fromarray(frame_rgb)

    # Resolution caps — 1080p for Pro, 480p/720p for others
    if plan in ("guest", "free") and img.height > 540:
        r = 540 / img.height
        img = img.resize((int(img.width * r), 540), Image.Resampling.LANCZOS)
    elif plan in ("monthly", "yearly") and img.height > 1080:
        r = 1080 / img.height
        img = img.resize((int(img.width * r), 1080), Image.Resampling.LANCZOS)

    # HIGH CLASS: Use alpha matting for perfect edges
    result = remove(
        img, 
        session=rembg_session,
        alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=10
    ).convert("RGBA")

    # Watermark for guest/free
    if plan in ("guest", "free"):
        draw = ImageDraw.Draw(result)
        w, h = result.size
        # Scaled watermark
        font_size = max(12, int(h * 0.03))
        draw.text((w - 100, h - 30), "Cleanclip", fill=(255, 255, 255, 150))

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

    # Memory-safe chunks for 512MB environments
    chunk = 2 if plan == "guest" else (4 if plan == "free" else 8)
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
        output_params=["-pix_fmt", "yuva420p", "-crf", "22", "-b:v", "0"],
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
