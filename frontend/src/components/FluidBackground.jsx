import React from 'react';

const FluidBackground = () => {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#020202]">
            {/* Aurora Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-neon-cyan/20 rounded-full blur-[120px] animate-aurora mix-blend-screen" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-neon-purple/20 rounded-full blur-[120px] animate-aurora mix-blend-screen animation-delay-2000" />
            <div className="absolute top-[40%] left-[40%] w-[30vw] h-[30vw] bg-neon-red/10 rounded-full blur-[100px] animate-pulse" />

            {/* Noise Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />
        </div>
    );
};

export default FluidBackground;
