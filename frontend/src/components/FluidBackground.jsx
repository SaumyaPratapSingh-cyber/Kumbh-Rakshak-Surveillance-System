import React from 'react';

const FluidBackground = () => {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#05000a]">
            {/* Aurora Blobs - Purple Palette */}
            <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-[#6f00ff]/20 rounded-full blur-[120px] animate-aurora mix-blend-screen" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#3b0270]/40 rounded-full blur-[120px] animate-aurora mix-blend-screen animation-delay-2000" />
            <div className="absolute top-[30%] left-[40%] w-[40vw] h-[40vw] bg-[#e9b3fb]/10 rounded-full blur-[100px] animate-pulse" />

            {/* Noise Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />
        </div>
    );
};

export default FluidBackground;
