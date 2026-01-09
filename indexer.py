import cv2
import time
import os
import argparse
import json
import threading
from flask import Flask, Response
from datetime import datetime
from dotenv import load_dotenv
from deepface import DeepFace
from supabase import create_client
from waitress import serve

# --- SETUP ---
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Secrets not found. Check your .env file.")
    exit()

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- STREAMING SETUP ---
latest_frame = None
lock = threading.Lock()
app = Flask(__name__)

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

def generate_frames():
    global latest_frame
    while True:
        with lock:
            if latest_frame is None:
                continue
            (flag, encodedImage) = cv2.imencode(".jpg", latest_frame)
            if not flag:
                continue
        yield(b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + bytearray(encodedImage) + b'\r\n')

def start_flask():
    print("🎥 Starting Production Stream Server (Waitress) on Port 5000...")
    serve(app, host='0.0.0.0', port=5000, threads=6)

# --- ARGS ---
parser = argparse.ArgumentParser()
parser.add_argument("--cam_id", type=str, required=True, help="Unique ID for this camera (e.g., Gate_1)")
parser.add_argument("--source", type=str, default="0", help="Camera Index (0) or RTSP URL")
args = parser.parse_args()

# Handle Source Input (Int or Str)
source_input = args.source
if source_input.isdigit():
    source_input = int(source_input)

# Load Config for Name/Lat/Lon defaults
CAMERA_CONFIG = {}
try:
    with open("cameras.json", "r") as f:
        data = json.load(f)
        CAMERA_CONFIG = data.get("cameras", {})
except:
    pass

cam_meta = CAMERA_CONFIG.get(args.cam_id, {"name": args.cam_id, "lat": 0.0, "lon": 0.0})

# --- OPTIMIZATION VARS ---
FRAME_SKIP = 5  # Process every 5th frame
RESIZE_WIDTH = 640
HEARTBEAT_INTERVAL = 10 # Seconds

def send_heartbeat():
    """Update the camera_nodes table to say 'I am alive' without overwriting Map Coords"""
    try:
        # Check if node exists
        res = supabase.table("camera_nodes").select("*").eq("id", args.cam_id).execute()
        
        if len(res.data) > 0:
            # Node exists, just update heartbeat & status (Preserve Map Location!)
            supabase.table("camera_nodes").update({
                "last_heartbeat": datetime.utcnow().isoformat(),
                "status": "online"
            }).eq("id", args.cam_id).execute()
        else:
            # New Node, Insert with defaults
            data = {
                "id": args.cam_id,
                "name": cam_meta.get("name", args.cam_id),
                "lat": cam_meta.get("lat"),
                "lon": cam_meta.get("lon"),
                "last_heartbeat": datetime.utcnow().isoformat(),
                "status": "online"
            }
            supabase.table("camera_nodes").insert(data).execute()
            
        # print(f"❤️ Heartbeat sent for {args.cam_id}")
    except Exception as e:
        print(f"⚠️ Heartbeat failed: {e}")

def process_cctv(cam_id, source):
    global latest_frame
    print(f"🎥 Connecting to {cam_id} via {source}...")
    
    # Start Stream Server in Thread
    t = threading.Thread(target=start_flask, daemon=True)
    t.start()
    
    while True:
        cap = cv2.VideoCapture(source)
        
        if not cap.isOpened():
            print(f"⚠️ Connection failed. Retrying in 5s...")
            time.sleep(5)
            continue
            
        print(f"✅ Camera {cam_id} Online. ML Engine Started.")
        
        frame_count = 0
        last_heartbeat_time = 0
        
        while True:
            ret, frame = cap.read()
            if not ret:
                print("❌ Stream ended/interrupted.")
                break
            
            frame_count += 1
            
            # --- HEARTBEAT ---
            current_time = time.time()
            if current_time - last_heartbeat_time > HEARTBEAT_INTERVAL:
                send_heartbeat()
                last_heartbeat_time = current_time

            # --- OPTIMIZATION ---
            # 1. Skip Frames (ML Only)
            # But we want smooth video, so we might need to process separate from resize
            # For now, let's just resize every frame for display speed
            
            height, width = frame.shape[:2]
            scale = RESIZE_WIDTH / width
            small_frame = cv2.resize(frame, (RESIZE_WIDTH, int(height * scale)))
            
            # Run ML only on skippable frames
            if frame_count % FRAME_SKIP == 0:
                try:
                    # Detect & Embed
                    embedding_objs = DeepFace.represent(
                        img_path=small_frame,
                        model_name="ArcFace",
                        detector_backend="opencv",
                        enforce_detection=True
                    )
                    
                    for obj in embedding_objs:
                        embedding = obj["embedding"]
                        area = obj["facial_area"]
                        
                        # Filter small faces (noise)
                        if area['w'] < 40 or area['h'] < 40:
                            continue

                        # Draw Box on Stream
                        x = int(area['x'])
                        y = int(area['y'])
                        w = int(area['w'])
                        h = int(area['h'])
                        cv2.rectangle(small_frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                        cv2.putText(small_frame, "TARGET", (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)

                        # Log to DB
                        payload = {
                            "cam_id": cam_id,
                            "seen_at": datetime.utcnow().isoformat(),
                            "face_vector": embedding
                        }
                        supabase.table("sightings").insert(payload).execute()
                        print(f"✅ Face Logged | {datetime.now().strftime('%H:%M:%S')}")
                        
                except ValueError:
                    pass # No face found
                except Exception as e:
                    print(f"⚠️ Indexing Error: {e}")
            
            # Update Global Stream Frame
            with lock:
                latest_frame = small_frame.copy()

            # Optional Local Show
            # cv2.imshow('CCTV', small_frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
                
        cap.release()
        print("🔄 Reconnecting stream...")
        time.sleep(2)

if __name__ == "__main__":
    # Register Node on Startup
    send_heartbeat()
    process_cctv(args.cam_id, source_input)