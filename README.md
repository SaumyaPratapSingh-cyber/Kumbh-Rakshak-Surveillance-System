# 🛡️ Kumbh-Rakshak: AI Surveillance & Crowd Management System

![Status](https://img.shields.io/badge/Status-Operational-00FF94)
![Tech](https://img.shields.io/badge/AI-DeepFace_ArcFace-blue)
![Stack](https://img.shields.io/badge/Stack-React_FastAPI_Supabase-purple)

## 🚨 Problem Statement
The **Kumbh Mela** is the world's largest gathering of humanity. In such massive crowds:
*   **Missing Persons:** Children and elderly get separated, and finding them manually takes hours/days.
*   **Security Threats:** Identifying blacklisted individuals or tracking suspects in real-time is impossible with standard manual CCTV monitoring.
*   **Crowd Density:** Unmonitored density spikes can lead to stampedes.

**How do you find a needle in a haystack when the haystack is moving?**

## 💡 The Solution
**Kumbh-Rakshak** transforms standard CCTV infrastructure into an **Intelligent Biometric Grid**. It moves beyond simple recording to real-time understanding.

*   **Instant Retrieval:** Locate missing persons by uploading a single photo.
*   **Geospatial Tracking:** Visualizing the movement trajectory of a subject across the city on a 3D map.
*   **Live Surveillance:** Real-time face indexing and matching at the edge.

---

## 🏗️ Architecture & Modules

### 1. 🧠 The Brain: Neural Search Engine (Backend)
*   **Tech:** FastAPI (Python), DeepFace (ArcFace Model)
*   **Function:**
    *   Receives image frames.
    *   Generates 128-D vector embeddings.
    *   Performs Vector Similarity Search in Supabase.
    *   Lazily loads the AI model to optimize cloud resources.

### 2. 👁️ The Interface: Command Center (Frontend)
*   **Tech:** React (Vite), TailwindCSS, Leaflet.js
*   **Function:**
    *   **Dashboard:** Real-time stats and alerts.
    *   **Neural Search:** Upload a photo to see a list of sightings and a plotted path on the map.
    *   **Live Feed:** Connects browser camera (or IP cam) as an active node in the grid.

### 3. 💾 The Memory: Vector Database (Supabase)
*   **Tech:** PostgreSQL + `pgvector`
*   **Function:** Stores sightings log, camera nodes status, and face embeddings for sub-second retrieval.

### 4. 📹 Edge Node (Indexer)
*   **Tech:** OpenCV, Python
*   **Function:** Runs on local hardware (Raspberry Pi / Laptop) to process physical CCTV streams and push metadata to the cloud.

---

## 🚀 How It Works

1.  **Ingestion:** Cameras (Web or CCTV) capture frames.
2.  **Processing:** The backend detects faces and converts them into mathematical vectors (embeddings).
3.  **Indexing:** These vectors are stored in the database with timestamp and location.
4.  **Action:** When a search is performed, the system compares the query vector against millions of stored vectors to find matches and reconstruct the path.

---

## 🛠️ Usage & Deployment

### Cloud Deployment (Current Setup)
*   **Frontend:** Deployed on **Vercel**.
*   **Backend:** Deployed on **Render** (Auto-deploys from `backend/main.py`).
*   **Database:** Hosted on **Supabase**.

### Local Installation

1. **Clone the Repo**
   ```bash
   git clone https://github.com/SaumyaPratapSingh-cyber/Kumbh-Rakshak-Surveillance-System.git
   cd Kumbh-Rakshak-Surveillance-System
   ```

2. **Backend Setup**
   ```bash
   pip install -r requirements.txt
   uvicorn backend.main:app --reload
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Environment Variables**
   Create a `.env` file in root:
   ```env
   SUPABASE_URL=your_url
   SUPABASE_KEY=your_key
   ```
   Create a `.env` in `frontend/`:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

---

## 🛡️ Security & Privacy
*   **No Raw Video Storage:** We process video in real-time and discard frames, storing only mathematical vectors and metadata.
*   **Role-Based Access:** Designed for use by authorized security personnel only.

---

**© 2026 Kumbh-Rakshak Protocol**
