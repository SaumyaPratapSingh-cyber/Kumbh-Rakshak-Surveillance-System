import streamlit as st
import pandas as pd
import numpy as np
import pydeck as pdk
from deepface import DeepFace
from supabase import create_client
import os
from dotenv import load_dotenv
import time
import json
from datetime import datetime
import cv2

# --- CONFIGURATION & SETUP ---
st.set_page_config(
    page_title="Kumbh-Rakshak: Command Center",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for "Hitech" Look
st.markdown("""
    <style>
    .stApp {
        background-color: #0E1117;
    }
    .metric-card {
        background-color: #262730;
        border: 1px solid #3d3d3d;
        border-radius: 8px;
        padding: 15px;
        color: white;
    }
    .stButton>button {
        width: 100%;
        border-radius: 4px;
        font-weight: bold;
    }
    h1, h2, h3 {
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        font-weight: 600;
    }
    .status-ok { color: #00FF94; font-weight: bold; }
    .status-alert { color: #FF4B4B; font-weight: bold; }
    </style>
    """, unsafe_allow_html=True)

# Load Secrets
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL:
    st.error("❌ CRITICAL ERROR: Database secrets not found.")
    st.stop()

# Initialize Client
try:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    st.error(f"❌ Connection Failed: {e}")
    st.stop()

# Load Camera Config
CAMERA_LOCATIONS = {}
try:
    with open("cameras.json", "r") as f:
        data = json.load(f)
        CAMERA_LOCATIONS = data.get("cameras", {})
except FileNotFoundError:
    st.warning("⚠️ Configuration file 'cameras.json' missing. Map features may be limited.")

# --- HELPER FUNCTIONS ---

def get_system_stats():
    """Fetch real-time stats from Supabase"""
    try:
        # We can't do exact count easily on huge tables in free tier sometimes, but let's try
        count_query = supabase.table("sightings").select("id", count="exact").execute()
        total_faces = count_query.count
        
        # Get distinct cameras active in last hour (requires more complex query or handling)
        # For MVP, we presume cameras in config are 'Monitored'
        active_cams = len(CAMERA_LOCATIONS)
        
        return total_faces, active_cams
    except:
        return 0, 0

def get_recent_sightings(limit=10):
    """Fetch latest log entries"""
    try:
        response = supabase.table("sightings").select("*").order("seen_at", desc=True).limit(limit).execute()
        return response.data
    except Exception as e:
        return []

def search_target(file_path):
    """Generate embedding and search DB"""
    try:
        # Detect & Embed
        embedding_objs = DeepFace.represent(
            img_path=file_path,
            model_name="Facenet",
            detector_backend="opencv",
            enforce_detection=True
        )
        embedding = embedding_objs[0]["embedding"]
        
        # RPC Call
        response = supabase.rpc("match_faces", {
            "query_embedding": embedding,
            "match_threshold": 0.25, # Slightly stricter for production
            "match_count": 20
        }).execute()
        
        return response.data
    except Exception as e:
        st.error(f"Search Engine Error: {e}")
        return []

# --- MAIN LAYOUT ---

# Sidebar
with st.sidebar:
    st.title("🛡️ KUMBH-RAKSHAK")
    st.caption("v2.0 | AI SURVEILLANCE SUITE")
    st.divider()
    
    # Real-time Stats
    total_faces, active_cams = get_system_stats()
    
    c1, c2 = st.columns(2)
    with c1:
        st.metric("Indexed Faces", total_faces, delta_color="normal")
    with c2:
        st.metric("Active Nodes", active_cams)
        
    st.divider()
    
    st.markdown("### 📡 Node Status")
    for cam_id, info in CAMERA_LOCATIONS.items():
        status = "🟢 Online" if info.get("active", True) else "🔴 Offline"
        st.code(f"{info.get('name', cam_id)[:18]}.. : {status}")

    st.divider()
    if st.button("🔄 Refresh System"):
        st.rerun()

# Tabs
tab_search, tab_live, tab_map = st.tabs(["🔍 TARGET SEARCH", "⚡ LIVE INTELLIGENCE", "🗺️ GEOSPATIAL VIEW"])

# --- TAB 1: TARGET SEARCH ---
with tab_search:
    st.markdown("### 🎯 Missing Person Identification")
    
    col_upload, col_result = st.columns([1, 2])
    
    with col_upload:
        st.info("Upload clear facial image for biometric analysis.")
        uploaded_file = st.file_uploader("Required: JPG/PNG", type=["jpg", "png", "jpeg"])
        
        if uploaded_file:
            st.image(uploaded_file, caption="Target Subject", use_container_width=True)
            with open("temp_query.jpg", "wb") as f:
                f.write(uploaded_file.getbuffer())

    with col_result:
        if uploaded_file and st.button("RUN BIOMETRIC SEARCH", type="primary"):
            with st.spinner("Running Neural Search on Vector DB..."):
                matches = search_target("temp_query.jpg")
                
                if matches:
                    st.success(f"✅ POSITIVE MATCH: {len(matches)} sightings confirmed.")
                    
                    # Process Data for Map path
                    path_data = []
                    sightings_df = []
                    
                    # Sort by time ascending for the path
                    matches_sorted = sorted(matches, key=lambda x: x['seen_at'])
                    
                    prev_point = None
                    
                    for m in matches_sorted:
                        cam = m['cam_id']
                        if cam in CAMERA_LOCATIONS:
                            loc = CAMERA_LOCATIONS[cam]
                            curr_point = [loc['lon'], loc['lat']]
                            
                            # Add Sighting
                            sightings_df.append({
                                "Camera": loc['name'],
                                "Time": m['seen_at'],
                                "Similarity": f"{round(m['similarity']*100, 1)}%",
                                "lat": loc['lat'],
                                "lon": loc['lon']
                            })
                            
                            # Add Path (Arc)
                            if prev_point:
                                path_data.append({
                                    "source": prev_point,
                                    "target": curr_point,
                                    "color": [0, 255, 148, 180] # Neon Green
                                })
                            prev_point = curr_point
                    
                    # 1. Visualization: Map
                    if sightings_df:
                        st.subheader("📍 Movement Trajectory")
                        
                        # PyDeck Layer
                        view_state = pdk.ViewState(
                            latitude=25.4358,
                            longitude=81.8463,
                            zoom=14,
                            pitch=45,
                        )
                        
                        layers = [
                            pdk.Layer(
                                "ScatterplotLayer",
                                data=pd.DataFrame(sightings_df),
                                get_position='[lon, lat]',
                                get_color='[255, 0, 0, 200]',
                                get_radius=30,
                            ),
                            pdk.Layer(
                                "ArcLayer",
                                data=path_data,
                                get_source_position="source",
                                get_target_position="target",
                                get_source_color="color",
                                get_target_color="color",
                                get_width=5,
                            ) if path_data else None
                        ]
                        
                        r = pdk.Deck(
                            layers=[l for l in layers if l is not None],
                            initial_view_state=view_state,
                            map_style="mapbox://styles/mapbox/dark-v10", # Default dark style
                        )
                        st.pydeck_chart(r)
                        
                        # 2. Visualization: Timeline Table
                        st.subheader("🕒 Sighting Logs")
                        st.dataframe(pd.DataFrame(sightings_df).drop(columns=['lat', 'lon']))

                else:
                    st.warning("⚠️ No matches found. Subject not detected in network.")

# --- TAB 2: LIVE FEED ---
with tab_live:
    st.markdown("### ⚡ Real-Time Network Activity")
    st.caption("Auto-refreshing latest 20 detections across all nodes.")
    
    if st.button("Refresh Feed"):
        st.rerun()
        
    recent = get_recent_sightings(20)
    if recent:
        # Enriched Data
        display_data = []
        for r in recent:
            cam = r['cam_id']
            loc_name = CAMERA_LOCATIONS.get(cam, {}).get('name', cam)
            display_data.append({
                "ID": r['id'],
                "Location": loc_name,
                "Time": r['seen_at'],
                "Camera ID": cam
            })
            
        st.dataframe(pd.DataFrame(display_data), use_container_width=True)
    else:
        st.info("No activity logs received yet.")

# --- TAB 3: ANALYTICS ---
with tab_map:
    st.markdown("### 🗺️ Network Density Map")
    # Show all active cameras
    if CAMERA_LOCATIONS:
        cam_df = []
        for cid, dat in CAMERA_LOCATIONS.items():
            cam_df.append({"name": dat['name'], "lat": dat['lat'], "lon": dat['lon']})
        
        df_c = pd.DataFrame(cam_df)
        
        st.pydeck_chart(pdk.Deck(
            map_style=None,
            initial_view_state=pdk.ViewState(
                latitude=25.4358,
                longitude=81.8463,
                zoom=13,
                pitch=30,
            ),
            layers=[
                pdk.Layer(
                   'ColumnLayer',
                   data=df_c,
                   get_position='[lon, lat]',
                   get_elevation=100,
                   elevation_scale=5,
                   radius=50,
                   get_fill_color=[0, 255, 148, 140],
                   pickable=True,
                   auto_highlight=True,
                )
            ],
            tooltip={"html": "<b>{name}</b>"}
        ))
    else:
        st.error("Configure cameras.json to view map.")
