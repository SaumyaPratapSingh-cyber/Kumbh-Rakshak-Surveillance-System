from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
import json
import shutil
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client
from supabase import create_client
# from deepface import DeepFace # MOVED TO INSIDE FUNCTION TO SAVE RAM
import time
import argparse
import gc
from pydantic import BaseModel
from pathlib import Path

# Load Config
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL:
    raise RuntimeError("Supabase secrets missing")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="Kumbh-Rakshak API", version="2.0")

# @app.on_event("startup")
# async def startup_event():
#     print("✅ STARTUP: Loading ArcFace Model...")
#     # Pre-warm model to catch errors early
#     try:
#         DeepFace.build_model("ArcFace")
#         print("✅ STARTUP: ArcFace Model Loaded Successfully.")
#     except Exception as e:
#         print(f"❌ STARTUP ERROR: Could not load ArcFace. {e}")

# CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific domain
    allow_credentials=True,
    allow_methods=["*"], # CRITICAL: Allow POST/PUT/DELETE
    allow_headers=["*"],
)

@app.api_route("/", methods=["GET", "HEAD"])
async def health_check():
    return {"status": "online", "model": "ArcFace (Lazy Loaded)", "time": datetime.now().isoformat()}

# Load Cameras
CAMERA_CONFIG = {}
try:
    # Robust path finding: Look in current dir OR one level up (if running from backend subdir)
    base_path = Path(__file__).resolve().parent
    config_path = base_path / "cameras.json"
    
    if not config_path.exists():
        # Try parent directory (root)
        config_path = base_path.parent / "cameras.json"

    if config_path.exists():
        print(f"✅ Loading Camera Config from: {config_path}")
        with open(config_path, "r") as f:
            CAMERA_CONFIG = json.load(f).get("cameras", {})
    else:
        print(f"⚠️ Warning: cameras.json not found at {config_path}")
except Exception as e:
    print(f"⚠️ Warning: Failed to load cameras.json. {e}")

class CameraNode(BaseModel):
    id: str
    name: str
    lat: float
    lon: float
    status: str

@app.get("/")
def health_check():
    return {"status": "online", "system": "Kumbh-Rakshak AI Core"}

@app.get("/config/cameras")
def get_cameras():
    """Return camera configuration from DB with Real-time Status"""
    try:
        # Fetch from DB
        response = supabase.table("camera_nodes").select("*").execute()
        nodes = response.data
        
        config = {}
        for node in nodes:
            # Check Status (Online if heartbeat within last 30s)
            last_beat = datetime.fromisoformat(node['last_heartbeat'])
            seconds_diff = (datetime.utcnow() - last_beat).total_seconds()
            status = "online" if seconds_diff < 30 else "offline"
            
            config[node['id']] = {
                "name": node['name'],
                "lat": node['lat'],
                "lon": node['lon'],
                "status": status,
                "last_active": node['last_heartbeat']
            }
        return config
    except Exception as e:
        print(f"DB Config Error: {e}")
        # Fallback
        return CAMERA_CONFIG

@app.post("/config/register_node")
def register_node(node: CameraNode):
    """Register a new camera node location"""
    try:
        data = {
            "id": node.id,
            "name": node.name,
            "lat": node.lat,
            "lon": node.lon,
            "status": node.status,
            "last_heartbeat": datetime.utcnow().isoformat()
        }
        supabase.table("camera_nodes").upsert(data).execute()
        return {"status": "success", "message": f"Node {node.id} Registered"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats/heatmap")
def get_heatmap():
    """Aggregate sightings to build heat map data"""
    try:
        # Get all sightings (In prod, limit relative to time window, e.g. last 24h)
        # For demo, taking all, aggregating in python (ideal in SQL)
        sightings_res = supabase.table("sightings").select("cam_id").execute()
        counts = {}
        for s in sightings_res.data:
            cid = s['cam_id']
            counts[cid] = counts.get(cid, 0) + 1
            
        # Get Node Locations
        nodes_res = supabase.table("camera_nodes").select("*").execute()
        heatmap_data = [] # [lat, lon, intensity]
        
        for node in nodes_res.data:
            cid = node['id']
            if cid in counts:
                # Intensity scaling: 1 detection = 0.5 intensity, max 1.0 needed?
                # Leaflet heat likes raw numbers, but let's send count.
                heatmap_data.append([node['lat'], node['lon'], counts[cid] * 10]) # Multiply for visibility
                
        return heatmap_data
    except Exception as e:
        print(f"Heatmap Error: {e}")
        return []

@app.get("/stats")
def get_stats():
    """Real-time system stats"""
    try:
        # Note: 'exact' count can be slow on free tier, using estimated if needed
        # but for now exact is fine
        count = supabase.table("sightings").select("id", count="exact").execute().count
        return {
            "indexed_faces": count,
            "active_nodes": len(CAMERA_CONFIG),
            "system_status": "Operational"
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/feed/live")
def get_live_feed(limit: int = 50):
    """Get recent sightings"""
    try:
        res = supabase.table("sightings").select("*").order("seen_at", desc=True).limit(limit).execute()
        
        # Enrich with camera names
        data = res.data
        for item in data:
            cam_id = item.get("cam_id")
            if cam_id in CAMERA_CONFIG:
                item["cam_name"] = CAMERA_CONFIG[cam_id]["name"]
                item["location"] = {"lat": CAMERA_CONFIG[cam_id]["lat"], "lon": CAMERA_CONFIG[cam_id]["lon"]}
            else:
                item["cam_name"] = cam_id
                
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search/biometric")
async def search_face(file: UploadFile = File(...)):
    """The Core AI Search Function"""
    try:
        # Save temp file
        file_location = f"temp_{file.filename}"
        with open(file_location, "wb+") as file_object:
            file_object.write(file.file.read())

        # 1. Detect & Embed
        try:
             print("🧠 Waking up AI Brain...")
             from deepface import DeepFace # LAZY IMPORT
             
             embedding_objs = DeepFace.represent(
                img_path=file_location,
                model_name="ArcFace",
                detector_backend="opencv",
                enforce_detection=True,
                normalization="base"
            )
             # Free up memory immediately after inference
             gc.collect()
        except ValueError:
             # Try without strict detection if failed
             from deepface import DeepFace
             embedding_objs = DeepFace.represent(
                img_path=file_location,
                model_name="ArcFace",
                enforce_detection=False,
                normalization="base"
            )
             gc.collect()

        # Ensure embedding is a standard list of floats (Crucial for JSON serialization)
        embedding = [float(x) for x in embedding_objs[0]["embedding"]]

        # 2. Vector Search (RPC) -- With Retry Logic for Stability
        # ArcFace Cosine Similarity Threshold: > 0.40 is VERY strict.
        response = None
        for attempt in range(3):
            try:
                response = supabase.rpc("match_faces", {
                    "query_embedding": embedding,
                    "match_threshold": 0.50, # Adjusted for better real-world recall
                    "match_count": 50
                }).execute()
                break # Success
            except Exception as rpc_error:
                print(f"⚠️ RPC Attempt {attempt+1} failed: {rpc_error}")
                if attempt == 2:
                    raise rpc_error
                time.sleep(0.5)
        
        matches = response.data
        
        # 3. Enrich Data for Frontend (Using DB for Real Locations)
        # Fetch all active nodes to get their latest Lat/Lon
        try:
            node_res = supabase.table("camera_nodes").select("*").execute()
            node_map = {n['id']: n for n in node_res.data}
        except:
            node_map = {}

        enriched_matches = []
        for m in matches:
            cam_id = m['cam_id']
            
            # Use DB Node first, fall back to Config, then default
            db_node = node_map.get(cam_id, {})
            static_node = CAMERA_CONFIG.get(cam_id, {})
            
            final_name = db_node.get("name") or static_node.get("name") or cam_id
            final_lat = db_node.get("lat") or static_node.get("lat") or 0.0
            final_lon = db_node.get("lon") or static_node.get("lon") or 0.0
            
            enriched_matches.append({
                **m,
                "cam_name": final_name,
                "lat": final_lat,
                "lon": final_lon,
                "similarity_score": round(m['similarity'] * 100, 1)
            })

        # Cleanup
        os.remove(file_location)
        
        return {"count": len(enriched_matches), "matches": enriched_matches}

    except Exception as e:
        if os.path.exists(f"temp_{file.filename}"):
            os.remove(f"temp_{file.filename}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.post("/analyze_frame")
async def analyze_frame(
    file: UploadFile = File(...), 
    cam_id: str = "BROWSER_CAM",
    lat: float = 0.0,
    lon: float = 0.0
):
    """
    Accepts a frame from a browser client, runs DeepFace, 
    and logs sightings if a known face is found.
    Acts as a server-side version of indexer.py.
    """
    temp_filename = f"frame_{int(time.time())}_{cam_id}.jpg"
    try:
        # 1. Save Frame
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 2. Register/Update Node Status (Heartbeat)
        try:
             supabase.table("camera_nodes").upsert({
                 "id": cam_id,
                 "name": f"Mobile Node: {cam_id}",
                 "lat": lat,
                 "lon": lon,
                 "status": "online",
                 "last_heartbeat": datetime.utcnow().isoformat()
             }).execute()
        except Exception as db_err:
             print(f"Node Update Error: {db_err}")

        # 3. Detect & Embed (ArcFace)
        try:
            print(f"📷 Indexing Frame from {cam_id}")
            from deepface import DeepFace # LAZY IMPORT
            embedding_objs = DeepFace.represent(
                img_path=temp_filename,
                model_name="ArcFace",
                detector_backend="opencv",
                enforce_detection=True
            )
            gc.collect()
        except ValueError:
            if os.path.exists(temp_filename): os.remove(temp_filename)
            return {"status": "no_face"}
        except Exception:
            # Fallback for lazy import failure or other issues
            if os.path.exists(temp_filename): os.remove(temp_filename)
            return {"status": "error"}

        # 4. STORE EVERY FACE (The "Indexing" Step)
        saved_count = 0
        for obj in embedding_objs:
            embedding = obj["embedding"]
            
            # Insert into DB so it can be searched LATER
            # This turns the camera into a "Data Collector"
            data = {
                "cam_id": cam_id,
                "face_vector": embedding, 
                "cam_name": f"Mobile Node: {cam_id}",
                "seen_at": datetime.utcnow().isoformat()
            }
            try:
                supabase.table("sightings").insert(data).execute()
                saved_count += 1
            except Exception as e:
                print(f"⚠️ Indexing Error: {e}")

        print(f"✅ Indexed {saved_count} faces from {cam_id}")

        # Cleanup
        os.remove(temp_filename)
        
        return {
            "status": "processed", 
            "faces_detected": len(embedding_objs),
            "matches": matches_found
        }

    except Exception as e:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
        # Don't error out the client loop, just report failure
        print(f"Analyze Error: {e}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
