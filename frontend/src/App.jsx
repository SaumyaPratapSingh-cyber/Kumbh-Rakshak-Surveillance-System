import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Shield, Search, Map as MapIcon, Activity, Grid,
  Upload, Bell, User, Menu, X, CheckCircle, AlertTriangle, Users, Camera, Radio
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';

// --- CONFIG ---
const API_URL = 'http://localhost:8000';

// --- ASSETS (Dark Mode Optimized) ---
const blueMarker = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers/2x/blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = blueMarker;

const targetIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers/2x/red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// --- HELPER COMPONENT ---
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 16, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
};

// --- LAYOUT ---
const MainLayout = ({ children }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen font-sans text-slate-text bg-[#050505] selection:bg-neon-green selection:text-black">
      {/* Top Navigation Bar */}
      <header className="h-16 glass-panel fixed top-0 w-full z-50 flex items-center justify-between px-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Shield className="text-neon-blue" size={28} />
          <h1 className="text-xl font-bold text-white tracking-tight font-mono">
            KUMBH<span className="text-neon-blue">RAKSHAK</span> <span className="text-[10px] bg-white/10 px-1 py-0.5 rounded text-neon-green ml-1">V2.0</span>
          </h1>
        </div>

        <nav className="flex items-center gap-8 h-full">
          <NavLink to="/" icon={<Activity size={18} />} label="DASHBOARD" active={isActive('/')} />
          <NavLink to="/search" icon={<Search size={18} />} label="NEURAL SEARCH" active={isActive('/search')} />
          <NavLink to="/live" icon={<Grid size={18} />} label="SURVEILLANCE" active={isActive('/live')} />
        </nav>

        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer group">
            <Bell size={20} className="text-gray-400 group-hover:text-neon-blue transition-colors" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-alert-red rounded-full shadow-[0_0_10px_rgba(255,42,42,0.8)] animate-pulse"></span>
          </div>
          <div className="flex items-center gap-3 border-l border-white/10 pl-4">
            <div className="text-right">
              <div className="text-xs font-bold text-neon-green leading-none font-mono">OFFICER.SINGH</div>
              <div className="text-[10px] text-gray-500 font-mono tracking-widest">CMD_CENTER_01</div>
            </div>
            <div className="w-8 h-8 rounded bg-gray-900 border border-neon-blue/30 text-neon-blue flex items-center justify-center font-bold font-mono text-xs">
              OS
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-20 px-6 pb-6 max-w-[1920px] mx-auto">
        {children}
      </main>
    </div>
  );
};

const NavLink = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-2 h-full px-2 border-b-2 transition-all font-mono text-sm tracking-wide ${active
        ? 'border-neon-blue text-neon-blue drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]'
        : 'border-transparent text-gray-500 hover:text-white hover:border-gray-700'
      }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

// --- PAGES ---

// 1. DASHBOARD
const Dashboard = () => {
  const [stats, setStats] = useState({ indexed_faces: 0, active_nodes: 0 });

  useEffect(() => {
    axios.get(`${API_URL}/stats`).then(res => setStats(res.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2 relative overflow-hidden rounded-2xl p-8 border border-white/10 bg-gradient-to-r from-blue-900/20 to-transparent">
        <div className="absolute top-0 left-0 w-1 h-full bg-neon-blue shadow-[0_0_15px_#00F0FF]"></div>
        <h1 className="text-4xl font-bold text-white font-mono tracking-tighter">
          WELCOME TO <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-green">KUMBH RAKSHAK</span>
        </h1>
        <p className="text-gray-400 max-w-2xl font-mono text-sm leading-relaxed">
          AI-Powered Crowd Management & Surveillance System designed for the <strong>Mahakumbh 2025</strong>.
          Real-time monitoring, facial recognition, and crowd density analytics to ensure safety and security.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard icon={<Users className="text-neon-blue" size={24} />} title="Total Footfall" value="124,592" sub="Daily Estimate" />
        <StatCard icon={<AlertTriangle className="text-alert-red" size={24} />} title="Missing Reports" value="3" sub="Active Cases" trend />
        <StatCard icon={<CheckCircle className="text-neon-green" size={24} />} title="Reunited" value="89" sub="This Week" />
        <StatCard icon={<Camera className="text-gray-300" size={24} />} title="Active Cameras" value={stats.active_nodes || "12"} sub="Grid Status" />
      </div>

      <div className="grid grid-cols-3 gap-6 h-[500px]">
        {/* Map Section */}
        <div className="col-span-2 glass-panel rounded-xl overflow-hidden relative flex flex-col border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40 backdrop-blur-md">
            <h2 className="font-bold text-white font-mono text-sm tracking-wider flex items-center gap-2">
              <Activity size={16} className="text-neon-green" /> REAL-TIME DENSITY
            </h2>
            <div className="flex gap-2 text-[10px] font-mono">
              <span className="px-3 py-1 bg-neon-blue/10 text-neon-blue rounded border border-neon-blue/20 shadow-[0_0_10px_rgba(0,240,255,0.1)]">LIVE SATELLITE</span>
            </div>
          </div>
          <div className="flex-1 relative">
            <MapContainer center={[25.4358, 81.8463]} zoom={15} className="w-full h-full bg-[#050505]" zoomControl={false}>
              <TileLayer
                attribution='&copy; Esri'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
              <HeatmapLayer />
            </MapContainer>
          </div>
        </div>

        {/* Alerts List */}
        <div className="glass-panel rounded-xl border border-white/10 p-5 flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <h2 className="font-bold text-gray-200 mb-4 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
            <Bell size={16} className="text-alert-red" /> Recent Alerts
          </h2>
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            <AlertItem type="critical" message="Child spotted at Gate 4 (CCTV-04)" time="2 mins ago" />
            <AlertItem type="warning" message="High Crowd Density at Sangam Ghat" time="15 mins ago" />
            <AlertItem type="info" message="Shift Change: Sector 2" time="1 hour ago" />
            {[1, 2, 3].map(i => <AlertItem key={i} type="info" message="System Check: Node Synced" time="2 hours ago" />)}
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. NEURAL SEARCH
const NeuralSearch = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [mapTrajectory, setMapTrajectory] = useState([]);
  const [mapCenter, setMapCenter] = useState([25.4358, 81.8463]);
  const [activeMatch, setActiveMatch] = useState(null);

  const handleSearch = async () => {
    if (!selectedFile) return;
    setIsSearching(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await axios.post(`${API_URL}/search/biometric`, formData);
      const matches = res.data.matches;
      setSearchResults(matches);
      const sorted = [...matches].sort((a, b) => new Date(a.seen_at) - new Date(b.seen_at));
      setMapTrajectory(sorted.map(m => [m.lat, m.lon]));
      if (matches.length > 0) {
        setMapCenter([matches[0].lat, matches[0].lon]);
        setActiveMatch(matches[0]);
      }
    } catch (err) {
      alert("Search Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsSearching(false);
    }
  };

  const focusLocation = (match) => {
    setMapCenter([match.lat, match.lon]);
    setActiveMatch(match);
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-120px)] animate-in slide-in-from-bottom-4 duration-500">
      {/* Left Sidebar: Input & Results List */}
      <div className="col-span-4 flex flex-col gap-6 h-full">
        {/* Input Panel */}
        <div className="glass-panel rounded-xl p-6 flex flex-col items-center justify-center shrink-0 border border-white/5">
          <div className="w-full h-48 border-2 border-dashed border-gray-700 hover:border-neon-blue/50 rounded-xl flex flex-col items-center justify-center bg-black/40 transition-colors cursor-pointer relative mb-4 group">
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            {selectedFile ? (
              <img src={URL.createObjectURL(selectedFile)} className="w-full h-full object-contain p-2 opacity-80 group-hover:opacity-100" />
            ) : (
              <>
                <Upload className="text-gray-600 mb-2 group-hover:text-neon-blue transition-colors" size={32} />
                <p className="text-sm text-gray-500 font-mono">DROP SUBJECT IMAGE</p>
              </>
            )}
          </div>

          <button
            onClick={handleSearch}
            disabled={!selectedFile || isSearching}
            className="w-full py-3 bg-cyber-blue hover:bg-neon-blue hover:text-black text-white font-bold rounded-lg shadow-[0_0_15px_rgba(0,86,210,0.4)] transition-all flex items-center justify-center gap-2 font-mono uppercase tracking-widest disabled:opacity-50 disabled:shadow-none"
          >
            {isSearching ? <span className="animate-pulse">SCANNING VECTOR DB...</span> : 'INITIATE TRACKING'}
          </button>
        </div>

        {/* Results List */}
        <div className="glass-panel rounded-xl border border-white/5 flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/10 bg-black/20">
            <h3 className="font-bold text-gray-300 font-mono text-sm uppercase">Match Results ({searchResults.length})</h3>
          </div>

          <div className="overflow-y-auto p-4 space-y-3 flex-1 custom-scrollbar">
            {searchResults.length === 0 && !isSearching ? (
              <div className="text-center text-gray-600 mt-10 font-mono text-xs">
                AWAITING NEURAL INPUT...
              </div>
            ) : (
              searchResults.map((match, i) => (
                <div
                  key={i}
                  onClick={() => focusLocation(match)}
                  className={`p-3 rounded border cursor-pointer transition-all ${activeMatch === match
                      ? 'bg-neon-blue/10 border-neon-blue shadow-[0_0_10px_rgba(0,240,255,0.1)]'
                      : 'bg-black/40 border-white/5 hover:border-white/20'
                    }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-gray-200 text-sm font-mono">{match.cam_id}</span>
                    <span className="text-[10px] bg-green-900/50 text-green-400 px-1.5 py-0.5 rounded font-mono border border-green-500/20">
                      {(match.score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 flex items-center gap-2 font-mono">
                    <span>{new Date(match.seen_at).toLocaleTimeString()}</span>
                    <span className="flex items-center gap-0.5 text-neon-blue"><MapIcon size={10} /> LOC</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Panel: Map */}
      <div className="col-span-8 glass-panel rounded-xl border border-white/5 overflow-hidden relative shadow-2xl">
        <MapContainer center={[25.4358, 81.8463]} zoom={15} className="w-full h-full bg-[#050505]">
          <TileLayer
            attribution='&copy; Esri'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
          <MapController center={mapCenter} />

          {mapTrajectory.length > 1 && (
            <Polyline positions={mapTrajectory} color="#00F0FF" dashArray="5, 10" weight={2} />
          )}

          {searchResults.map((match, i) => (
            <Marker
              key={i}
              position={[match.lat, match.lon]}
              icon={targetIcon}
              eventHandlers={{ click: () => focusLocation(match) }}
            >
              <Popup className="bg-black text-white p-0">
                <div className="p-2 font-mono text-xs text-center bg-gray-900 border border-white/20 text-white">
                  <strong className="block text-neon-blue mb-1">{match.cam_id}</strong>
                  {new Date(match.seen_at).toLocaleTimeString()}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

// 3. LIVE SURVEILLANCE & EDGE COMPUTE
const LiveSurveillance = () => {
  const videoRef = useRef(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const intervalRef = useRef(null);
  const [nodeId] = useState(`WEB_NODE_${Math.floor(Math.random() * 9999)}`);

  const startBroadcast = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsBroadcasting(true);

      // Start Analysis Loop
      intervalRef.current = setInterval(() => {
        analyzeFrame();
      }, 2000); // Check every 2 seconds

    } catch (err) {
      alert("Camera Access Denied or Unavailable");
      console.error(err);
    }
  };

  const stopBroadcast = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsBroadcasting(false);
    setLastScan(null);
  };

  const analyzeFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');
      formData.append('cam_id', nodeId);

      // Allow geolocation if possible - for now static mock
      // formData.append('lat', ...);

      try {
        const res = await axios.post(`${API_URL}/analyze_frame`, formData);
        setLastScan({ ts: new Date().toLocaleTimeString(), data: res.data });
      } catch (e) {
        console.error("Frame Upload Error", e);
      }
    }, 'image/jpeg', 0.8);
  };

  useEffect(() => {
    return () => stopBroadcast();
  }, []);


  return (
    <div className="h-[calc(100vh-120px)] flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-neon-blue/10 text-neon-blue border border-neon-blue rounded-lg font-mono text-xs font-bold shadow-[0_0_10px_rgba(0,240,255,0.2)]">ALL GATES</button>
          <button className="px-4 py-2 bg-black/40 text-gray-400 border border-white/10 rounded-lg font-mono text-xs hover:border-white/30">GHATS ONLY</button>
        </div>

        <div className="flex items-center gap-4">
          {isBroadcasting ? (
            <button onClick={stopBroadcast} className="px-6 py-2 bg-alert-red hover:bg-red-700 text-white rounded-lg font-bold font-mono text-xs animate-pulse shadow-[0_0_15px_rgba(255,42,42,0.4)] flex items-center gap-2">
              <Radio size={16} /> STOP BROADCAST ({nodeId})
            </button>
          ) : (
            <button onClick={startBroadcast} className="px-6 py-2 bg-neon-green hover:bg-green-600 text-black rounded-lg font-bold font-mono text-xs shadow-[0_0_15px_rgba(0,255,148,0.4)] flex items-center gap-2">
              <Camera size={16} /> CONNECT CAMERA
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 flex-1 overflow-y-auto content-start custom-scrollbar">
        {/* WEB BROADCAST CARD */}
        {isBroadcasting && (
          <div className="aspect-video bg-black rounded-lg overflow-hidden relative group border-2 border-neon-green shadow-[0_0_20px_rgba(0,255,148,0.2)]">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
            {/* HUD Overlay */}
            <div className="absolute top-2 left-2 flex gap-2">
              <div className="bg-neon-green text-black px-2 py-0.5 rounded text-[10px] font-bold animate-pulse font-mono">
                BROADCASTING
              </div>
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 font-mono text-[10px] text-neon-green">
              SCANNING... {lastScan?.ts ? `Sync: ${lastScan.ts}` : 'Initializing'}
              {lastScan?.data?.matches?.length > 0 && (
                <div className="text-alert-red font-bold animate-pulse mt-1">
                  ⚠️ TARGET DETECTED: {lastScan.data.matches[0].cam_id}
                </div>
              )}
            </div>
            {/* Face Frame */}
            <div className="absolute inset-[20%] border border-neon-green/30 rounded border-dashed opacity-50 pointer-events-none"></div>
          </div>
        )}

        {/* Real Feed (Localhost MJPEG) */}
        {!isBroadcasting && <VideoCard src="http://localhost:5000/video_feed" label="CAM-01: GATE ENTRY" live status="active" />}

        {/* Simulated Offline/Static Feeds */}
        <VideoCard src="https://media.istockphoto.com/id/1154563854/photo/multiple-camera-footage-on-monitor.jpg?s=612x612&w=0&k=20&c=N2aXTRW-2D01u1C3nF2f2NWDXqT5qJ1zQkZ6tP7_y1I=" label="CAM-02: SECTOR 4" status="static" />
        <VideoCard label="CAM-03: SANGAM POINT" status="offline" />
        <VideoCard src="https://media.istockphoto.com/id/489370778/photo/cctv-security-camera-monitor-in-office-building.jpg?s=612x612&w=0&k=20&c=uKRPvH59d9PGEE6Jb6oK6-rQcI1A0eJ-3CQA_5lD_xY=" label="CAM-04: PARKING A" status="static" />

        {/* Grid Fillers */}
        {[5, 6, 7, 8, 9, 10, 11, 12].map(i => (
          <VideoCard key={i} label={`CAM-${i.toString().padStart(2, '0')}: REMOTE NODE`} status="offline" />
        ))}
      </div>
    </div>
  );
};


// --- HELPER COMPONENTS ---

const StatCard = ({ icon, title, value, sub, trend }) => (
  <div className="glass-panel p-6 rounded-xl border-t border-l border-white/10 border-b border-r border-black/50 shadow-glass flex items-start justify-between group hover:border-neon-blue/50 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-gray-900/90 to-black/90">
    {/* Hover Glow Effect */}
    <div className="absolute -right-10 -top-10 w-32 h-32 bg-neon-blue/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

    <div className="relative z-10">
      <div className="text-xs text-gray-400 mb-2 font-mono tracking-widest uppercase">{title}</div>
      <div className="text-3xl font-bold text-white mb-1 font-mono tracking-tight shadow-black drop-shadow-lg">{value}</div>
      <div className={`text-[10px] ${trend ? 'text-alert-red font-bold' : 'text-gray-500'} font-mono`}>{sub}</div>
    </div>
    <div className="p-4 bg-white/5 rounded-xl border border-white/5 group-hover:bg-neon-blue/10 group-hover:border-neon-blue/30 group-hover:text-white transition-all shadow-inner">
      {icon}
    </div>
  </div>
);

const AlertItem = ({ type, message, time }) => {
  // Critical = Red, Warning = Orange (defaulting to warm), Info = Blue
  const borderClass = type === 'critical' ? 'border-alert-red bg-alert-red/5' : type === 'warning' ? 'border-orange-500 bg-orange-500/5' : 'border-neon-blue/50 bg-neon-blue/5';
  const textClass = type === 'critical' ? 'text-alert-red' : type === 'warning' ? 'text-orange-400' : 'text-neon-blue';

  return (
    <div className={`p-3 rounded border-l-2 ${borderClass} flex justify-between items-center transition-colors hover:bg-white/5`}>
      <span className="text-xs font-medium text-gray-300 font-mono tracking-tight">{message}</span>
      <span className={`text-[10px] font-mono ${textClass}`}>{time}</span>
    </div>
  );
};

const VideoCard = ({ src, label, live, status }) => {
  const isOffline = status === 'offline';
  // Active = Neon Blue Border, Static = Gray Border, Offline = Dim
  const borderClass = live
    ? 'border-neon-blue shadow-[0_0_15px_rgba(0,240,255,0.2)]'
    : isOffline
      ? 'border-white/5 opacity-50'
      : 'border-white/20';

  return (
    <div className={`aspect-video bg-black rounded-lg overflow-hidden relative group border ${borderClass} transition-all`}>
      {isOffline ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 scanline">
          <AlertTriangle className="text-gray-700 mb-2" size={32} />
          <span className="text-gray-600 font-mono text-xs tracking-[0.2em] animate-pulse">NO SIGNAL</span>
        </div>
      ) : (
        <img src={src} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
      )}

      {/* Overlays */}
      <div className="absolute top-2 left-2 flex gap-2 z-10">
        {live ? (
          <div className="flex gap-1 items-center bg-alert-red text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm animate-pulse font-mono">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span> LIVE
          </div>
        ) : !isOffline && (
          <div className="bg-black/60 text-gray-300 px-2 py-0.5 rounded text-[10px] font-mono border border-white/10 backdrop-blur-sm">REC</div>
        )}
      </div>

      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-6">
        <div className="flex justify-between items-end">
          <span className="text-xs font-mono text-neon-blue font-bold tracking-wider drop-shadow-md">{label}</span>
          {!isOffline && <Activity size={12} className="text-neon-green" />}
        </div>
      </div>

      {/* Cyber Overlay / Targeting Reticle */}
      {!isOffline && (
        <div className="absolute inset-0 border border-transparent group-hover:border-neon-blue/30 transition-all duration-300 pointer-events-none">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-neon-blue opacity-50"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-neon-blue opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-neon-blue opacity-50"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-neon-blue opacity-50"></div>
        </div>
      )}
    </div>
  );
};

const HeatmapLayer = () => {
  const map = useMap();
  useEffect(() => {
    axios.get('http://localhost:8000/stats/heatmap').then(res => {
      if (res.data && res.data.length > 0) {
        L.heatLayer(res.data, { radius: 25, blur: 15, maxZoom: 17 }).addTo(map);
      }
    });
  }, [map]);
  return null;
};

// --- APP ROOT ---
const App = () => {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/search" element={<NeuralSearch />} />
          <Route path="/live" element={<LiveSurveillance />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default App;
