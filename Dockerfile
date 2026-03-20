FROM python:3.10-slim

# Set working directory to root of the app
WORKDIR /app

# Install system dependencies for OpenCV and FFmpeg
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements first for caching
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Create necessary directories at the root level (managed by main.py)
RUN mkdir -p uploads outputs

# Pre-download the u2net model to avoid first-use delay
RUN python -c "from rembg import new_session; new_session('u2net')"

# Copy the entire backend directory into the container
COPY backend /app

# Hugging Face Spaces always use port 7860
ENV PORT=7860
EXPOSE 7860

# Run uvicorn pointing to main.py inside /app
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
