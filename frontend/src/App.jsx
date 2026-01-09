import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import {
  Shield, Search, Activity, Map as MapIcon, Camera, AlertTriangle,
  Menu, X, LayoutGrid, Cpu, Layers, Radio, Crosshair, User, Zap
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, NeonButton, HoloBadge, TechInput, SectionHeader } from './components/CyberComponents';
import FluidBackground from './components/FluidBackground';
import HeroLanding from './components/HeroLanding';

// --- CONFIGURATION ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Safe Supabase Initialization
let supabase = null;
let supabaseError = null;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn("⚠️ Supabase Credentials Missing! App running in limited mode.");
  supabaseError = "VITE_SUPABASE_URL and VITE_SUPABASE_KEY must be set in Environment Variables.";
} else {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (e) {
    console.error("Supabase Init Error:", e);
    supabaseError = e.message;
  }
}

// Fix Leaflet Icons
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// Error Fallback Component
const CrashScreen = ({ error }) => (
  <div className="h-screen w-screen bg-black text-red-500 font-mono flex flex-col items-center justify-center p-8 text-center">
    <AlertTriangle size={64} className="mb-4 animate-pulse" />
    <h1 className="text-3xl font-bold mb-4">SYSTEM CRITICAL FAILURE</h1>
    <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-lg max-w-2xl">
      <p className="text-xl mb-4">The interface could not load.</p>
      <code className="block bg-black p-4 rounded text-sm text-left overflow-auto">
        ERROR: {error}
      </code>
    </div>
    <p className="mt-8 text-gray-500">Please check Vercel Environment Variables.</p>
  </div>
);

// --- SUB-COMPONENTS ---

// 1. DASHBOARD COMPONENT (Bento Grid)
const Dashboard = ({ setActiveTab }) => {
  const [stats, setStats] = useState({ total_sightings: 0, active_nodes: 0, alerts_24h: 0 });
  const [recentSightings, setRecentSightings] = useState([]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    // If Supabase is missing, use mock data
    if (!supabase) {
      setStats({
        total_sightings: 124,
        active_nodes: 8,
        alerts_24h: 3
      });
      return;
    }

    try {
      const { count } = await supabase.from('sightings').select('*', { count: 'exact', head: true });
      const { count: nodeCount } = await supabase.from('camera_nodes').select('*', { count: 'exact', head: true });

      setStats({
        total_sightings: count || 0,
        active_nodes: nodeCount || 0,
        alerts_24h: Math.floor(Math.random() * 5) // Mock alert count
      });

      const { data } = await supabase.from('sightings').select('*').order('created_at', { ascending: false }).limit(5);
      if (data) setRecentSightings(data);
    } catch (err) {
      console.error("Stats Fetch Error:", err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      <SectionHeader title="Mission Control" subtitle="System Overview" />

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="flex items-center justify-between">
          <div>
            <p className="text-muted-tech font-mono text-xs uppercase tracking-widest">Total Sightings</p>
            <h3 className="text-4xl font-orbitron font-bold text-neon-cyan mt-2">{stats.total_sightings}</h3>
          </div>
          <Activity className="text-neon-cyan/50 w-12 h-12" />
        </GlassCard>

        <GlassCard className="flex items-center justify-between">
          <div>
            <p className="text-muted-tech font-mono text-xs uppercase tracking-widest">Active Nodes</p>
            <h3 className="text-4xl font-orbitron font-bold text-neon-green mt-2">{stats.active_nodes}</h3>
          </div>
          <Zap className="text-neon-green/50 w-12 h-12" />
        </GlassCard>

        <GlassCard className="flex items-center justify-between border-critical-red/30">
          <div>
            <p className="text-muted-tech font-mono text-xs uppercase tracking-widest">Threats Det.</p>
            <h3 className="text-4xl font-orbitron font-bold text-critical-red mt-2">{stats.alerts_24h}</h3>
          </div>
          <AlertTriangle className="text-critical-red/50 w-12 h-12 animate-pulse" />
        </GlassCard>
      </div>

      {/* Main Content Grid (Masonry-ish) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
        {/* Large Map Preview */}
        <GlassCard className="lg:col-span-2 relative p-0 overflow-hidden group">
          <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur px-3 py-1 border border-white/10 rounded-full flex items-center gap-2">
            <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
            <span className="text-xs font-mono text-white">LIVE GEOSPATIAL GRID</span>
          </div>
          {/* Map Placeholder or Real Map */}
          <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/81.8463,25.4358,12,0/800x600?access_token=YOUR_TOKEN')] bg-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-700" />
          <div className="absolute inset-0 flex items-center justify-center">
            <NeonButton onClick={() => setActiveTab('search')} icon={MapIcon}>Open Tactical Map</NeonButton>
          </div>
        </GlassCard>

        {/* Live Feed Feed */}
        <GlassCard className="overflow-hidden flex flex-col">
          <h3 className="font-orbitron text-lg mb-4 flex items-center gap-2"><Radio size={16} /> Recent Intercepts</h3>
          <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
            {recentSightings.map((sighting, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/5 hover:border-neon-cyan/50 transition-colors">
                <div className="w-10 h-10 bg-black rounded overflow-hidden">
                  {/* Fallback avatar if no image */}
                  <User className="w-full h-full p-2 text-gray-500" />
                </div>
                <div>
                  <p className="font-mono text-xs text-neon-cyan">CAM-{sighting.cam_id?.substring(0, 4)}</p>
                  <p className="text-[10px] text-gray-400">{new Date(sighting.created_at).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            {recentSightings.length === 0 && <p className="text-center text-gray-500 text-xs mt-10">No recent activity logged.</p>}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

// 2. NEURAL SEARCH COMPONENT
const NeuralSearch = () => {
  const [queryImage, setQueryImage] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([25.4358, 81.8463]); // Prayagraj

  // Component to fly map to new center
  const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => { map.flyTo(center, 14); }, [center, map]);
    return null;
  };

  const handleSearch = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setQueryImage(URL.createObjectURL(file));
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_URL}/search/biometric`, formData);
      setResults(res.data.matches);
      if (res.data.matches.length > 0) {
        setMapCenter([res.data.matches[0].lat, res.data.matches[0].lon]);
      }
    } catch (err) {
      alert("Search Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in slide-in-from-right duration-500">

      {/* LEFT PANEL: UPLOAD & RESULTS */}
      <div className="lg:col-span-4 space-y-6 flex flex-col h-full">
        <GlassCard className="p-6 shrink-0">
          <SectionHeader title="Target Acquisition" />
          <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-neon-cyan transition-colors relative group">
            <input type="file" onChange={handleSearch} className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-neon-cyan/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Search className="w-8 h-8 text-neon-cyan" />
              </div>
              <p className="font-mono text-sm text-muted-tech">DROP TARGET VISUAL HERE</p>
            </div>
            {/* Scanning Effect Overlay */}
            {loading && <div className="absolute inset-0 bg-neon-cyan/10 animate-pulse rounded-xl" />}
          </div>
        </GlassCard>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
          {loading && <div className="text-center font-mono text-neon-cyan animate-pulse">INITIATING DEEPFACE SCAN...</div>}

          {results.map((match, i) => (
            <GlassCard key={i} className="flex items-center gap-4 p-4 border-l-4 border-neon-cyan hover:bg-white/5 cursor-pointer" onClick={() => setMapCenter([match.lat, match.lon])}>
              <div className="w-12 h-12 bg-black rounded border border-white/10 flex items-center justify-center text-lg font-bold text-white/50">
                {(match.similarity_score)}%
              </div>
              <div>
                <h4 className="font-orbitron text-white">{match.cam_name}</h4>
                <p className="font-mono text-xs text-muted-tech flex items-center gap-2">
                  <MapIcon size={12} /> {match.lat.toFixed(4)}, {match.lon.toFixed(4)}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">{new Date(match.created_at).toLocaleString()}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL: MAP */}
      <GlassCard className="lg:col-span-8 p-0 overflow-hidden relative border-neon-cyan/30">
        <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%', background: '#020202' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <MapUpdater center={mapCenter} />
          {results.map((match, i) => (
            <Marker key={i} position={[match.lat, match.lon]}>
              <Popup className="font-mono text-xs">
                <strong>{match.cam_name}</strong><br />
                Confidence: {match.similarity_score}%
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* HUD Elements */}
        <div className="absolute top-4 right-4 z-[400] bg-black/80 backdrop-blur p-4 rounded border border-neon-cyan/30">
          <p className="font-mono text-xs text-neon-cyan mb-2">GRID COORDINATES</p>
          <div className="text-2xl font-bold font-orbitron">{mapCenter[0].toFixed(4)} N</div>
          <div className="text-2xl font-bold font-orbitron">{mapCenter[1].toFixed(4)} E</div>
        </div>
      </GlassCard>
    </div>
  );
};

// 3. LIVE SURVEILLANCE COMPONENT
const LiveSurveillance = () => {
  const videoRef = useRef(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const intervalRef = useRef(null);
  const [nodeId] = useState(`NODE-${Math.floor(Math.random() * 9999)}`);
  const [stream, setStream] = useState(null);

  const startBroadcast = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(s);
      setIsBroadcasting(true);
      intervalRef.current = setInterval(analyzeFrame, 2000);
    } catch (err) {
      alert("ACCESS DENIED: " + err.message);
    }
  };

  const stopBroadcast = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsBroadcasting(false);
  };

  useEffect(() => {
    if (isBroadcasting && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isBroadcasting, stream]);

  useEffect(() => () => stopBroadcast(), []);

  const analyzeFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');
      formData.append('cam_id', nodeId);
      try {
        const res = await axios.post(`${API_URL}/analyze_frame`, formData);
        setLastScan({ ts: new Date().toLocaleTimeString(), data: res.data });
      } catch (e) {
        console.error("Link Error", e);
      }
    }, 'image/jpeg', 0.8);
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-700">
      <SectionHeader title={`Node: ${nodeId}`} subtitle={isBroadcasting ? "STATUS: ONLINE - STREAMING TO GRID" : "STATUS: OFFLINE - STANDBY"} />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-3 relative bg-black rounded-xl overflow-hidden border-2 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] group">
          {isBroadcasting ? (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
              {/* HUD Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full border-[20px] border-neon-cyan/20 border-t-0 border-b-0 opacity-50 scanline" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-neon-cyan/30 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-neon-red rounded-full animate-ping" />
                </div>
                {/* Data overlay */}
                <div className="absolute bottom-4 left-4 bg-black/60 p-4 font-mono text-xs text-neon-green border-l-2 border-neon-green">
                  <p>LINK_QUALITY: 100%</p>
                  <p>LATENCY: 12ms</p>
                  {lastScan && <p className="mt-2 text-white">LAST_PACKET: {lastScan.ts} | MATCHES: {lastScan.data?.matches?.length || 0}</p>}
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black">
              <AlertTriangle size={64} className="text-white/20 mb-4" />
              <p className="font-mono text-white/40">SIGNAL LOST. INITIATE PROTOCOL.</p>
              <NeonButton onClick={startBroadcast} className="mt-6" icon={Camera}>ESTABLISH DATALINK</NeonButton>
            </div>
          )}
        </div>

        {/* Side Panel Controls */}
        <div className="space-y-4">
          <GlassCard className="text-center">
            <HoloBadge label="SYSTEM MODE" variant="active" />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="bg-neon-cyan/20 p-2 rounded text-xs font-mono text-neon-cyan border border-neon-cyan">FACE_REC</div>
              <div className="bg-white/5 p-2 rounded text-xs font-mono text-gray-500 border border-white/10">GAIT_ANALYSIS</div>
            </div>
          </GlassCard>

          <GlassCard>
            <h4 className="font-orbitron text-sm mb-2 text-white/70">Feed Settings</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-gray-400"><span>Overlay</span> <span className="text-neon-cyan">ON</span></div>
              <div className="flex justify-between text-xs font-mono text-gray-400"><span>Bandwidth</span> <span className="text-neon-cyan">HIGH</span></div>
            </div>
          </GlassCard>

          {isBroadcasting && (
            <NeonButton variant="danger" onClick={stopBroadcast} className="w-full justify-center">TERMINATE LINK</NeonButton>
          )}
        </div>
      </div>
    </div>
  );
};

// --- APP SHELL (Layout) ---
function App() {
  if (supabaseError) {
    return <CrashScreen error={supabaseError} />;
  }

  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', icon: LayoutGrid, label: "Overview" },
    { id: 'search', icon: Search, label: "Neural Search" },
    { id: 'live', icon: Camera, label: "Live Grid" },
    { id: 'nodes', icon: Cpu, label: "Nodes (Offline)" },
  ];

  return (
    <div className="bg-cyber-black text-white font-sans overflow-hidden h-screen w-screen selection:bg-[#e9b3fb] selection:text-black relative">

      {/* 1. CINEMATIC BACKGROUND (Always Visible) */}
      <FluidBackground />

      {/* 2. HERO LANDING OVERLAY */}
      <AnimatePresence>
        {showLanding && (
          <motion.div
            key="landing"
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-cyber-black"
          >
            <HeroLanding onEnter={() => setShowLanding(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. MAIN APP (Mounts immediately but hidden behind Landing) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showLanding ? 0 : 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="relative h-full w-full flex flex-col z-10"
      >
        {/* TOP BAR */}
        <header className="relative z-20 flex justify-between items-center p-6 lg:p-10 pointer-events-none transition-opacity duration-1000">
          <div className="flex items-center gap-4 pointer-events-auto">
            <Shield className="w-10 h-10 text-[#6f00ff] animate-pulse-fast drop-shadow-[0_0_15px_rgba(111,0,255,0.5)]" />
            <div>
              <h1 className="font-hero text-2xl lg:text-3xl tracking-tighter leading-none text-white">KUMBH<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6f00ff] to-[#e9b3fb]">RAKSHAK</span></h1>
              <p className="font-mono text-[10px] text-[#e9b3fb] tracking-[0.3em]">SURVEILLANCE GRID ACTIVE</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6 font-mono text-xs text-white/50 bg-white/5 px-6 py-2 rounded-full backdrop-blur-md border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#00ff9d] rounded-full animate-pulse" />
              <span>SYSTEM ONLINE</span>
            </div>
            <span>|</span>
            <span>LAT: 25.4358° N</span>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 relative z-10 overflow-hidden px-4 lg:px-12 pb-24 lg:pb-10 pt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.5, ease: "circOut" }}
              className="h-full overflow-y-auto custom-scrollbar pr-2"
            >
              {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
              {activeTab === 'search' && <NeuralSearch />}
              {activeTab === 'live' && <LiveSurveillance />}
              {activeTab === 'nodes' && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center font-mono opacity-50 space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-[#6f00ff]/20 blur-3xl rounded-full" />
                      <Cpu size={64} className="mx-auto text-white relative z-10" />
                    </div>
                    <h2 className="font-hero text-2xl">RESTRICTED AREA</h2>
                    <p className="text-xs tracking-widest text-[#e9b3fb]">CLEARANCE LEVEL 5 REQUIRED</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* FLOATING BOTTOM DOCK */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-lg px-4">
          <nav className="glass-panel-organic flex items-center justify-between p-2 lg:p-3 overflow-hidden bg-[#0a0510]/80 border-[#3b0270]/50 backdrop-blur-2xl">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative group flex flex-col items-center justify-center w-16 h-16 lg:w-20 lg:h-20 rounded-[1.5rem] transition-all duration-500
                      ${isActive ? 'bg-[#6f00ff] text-white shadow-[0_0_30px_rgba(111,0,255,0.4)]' : 'text-white/50 hover:text-white hover:bg-white/10'}
                    `}
                >
                  <item.icon size={24} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {isActive && <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full" />}

                  {/* Tooltip */}
                  <span className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] font-mono px-2 py-1 rounded backdrop-blur border border-white/10">
                    {item.label}
                  </span>
                </button>
              )
            })}
          </nav>
        </div>
      </motion.div>
    </div>
  );
}

export default App;
