FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for OpenCV and Face Recognition
RUN apt-get update && apt-get install -y \
    libgl1 \
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

# Copy Backend Source (Simplified for Flat Structure)
# If running from root, this copies everything.
# If running from backend dir, this copies everything.
COPY . .

# Expose Port (Hugging Face Default)
EXPOSE 7860

# Run Command (Default to 7860 for HF, Render overrides this via settings anyway)
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
