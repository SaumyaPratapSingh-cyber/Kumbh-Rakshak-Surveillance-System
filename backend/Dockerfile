FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for OpenCV and Face Recognition
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from root or backend? 
# The user structure has requirements.txt in root (e:/kumbh_rakshak/requirements.txt)
# But we are deploying backend mainly. 
# We'll assume the context includes the root or we copy specifically.
# Let's assume standard structure: 
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend Source
COPY backend ./backend
COPY cameras.json . 
# Note: cameras.json might be in root, main.py expects ../cameras.json which is weird config. 
# We should fix main.py path or assume flattened structure in Docker.
# Let's adjust main.py to look in current dir too or copy it to appropriate place.
# For now, let's copy everything relevant.

COPY . .

# Expose Port (Hugging Face Default)
EXPOSE 7860

# Run Command (Default to 7860 for HF, Render overrides this via settings anyway)
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
