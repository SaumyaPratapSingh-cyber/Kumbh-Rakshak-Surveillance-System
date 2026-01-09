import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for clean class merging
function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// --- 1. GLASS CARD (The Building Block) ---
export const GlassCard = ({ children, className = "", hoverEffect = true, variant = "cyber" }) => {
    const baseStyles = "backdrop-blur-md bg-[#0a0510]/60 border transition-all duration-300 relative overflow-hidden p-6";
    const variants = {
        cyber: "rounded-xl border-white/10 hover:border-[#6f00ff]/50 hover:shadow-[0_0_20px_rgba(111,0,255,0.15)]",
        organic: "rounded-[2rem] border-white/5 bg-white/[0.03] hover:bg-white/[0.05] hover:scale-[1.01]"
    };

    return (
        <motion.div
            whileHover={hoverEffect && variant === 'cyber' ? { scale: 1.01, boxShadow: "0 0 20px rgba(111, 0, 255, 0.15)" } : {}}
            className={clsx(baseStyles, variants[variant] || variants.cyber, className)}
        >
            {/* Noise Texture for Organic Variant */}
            {variant === 'organic' && (
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />
            )}

            {/* Cyber Hover Glow */}
            {hoverEffect && variant === 'cyber' && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#6f00ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            )}
            <div className="relative z-10 h-full w-full">{children}</div>
        </motion.div>
    );
};

// --- 2. NEON BUTTON (Primary & Secondary) ---
export const NeonButton = ({ children, onClick, variant = "primary", icon: Icon, className = "", type = "button", ...props }) => {
    const baseStyles = "relative px-6 py-3 font-orbitron font-bold tracking-wider transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden group rounded-full";

    const variants = {
        primary: "bg-[#6f00ff]/10 text-[#e9b3fb] border border-[#6f00ff]/50 hover:bg-[#6f00ff] hover:text-white hover:shadow-[0_0_20px_rgba(111,0,255,0.5)]",
        danger: "bg-critical-red/10 text-critical-red border border-critical-red/50 hover:bg-critical-red hover:text-white hover:shadow-[0_0_20px_rgba(255,0,60,0.5)]",
        ghost: "bg-transparent text-white/70 border border-white/10 hover:border-white/30 hover:bg-white/5",
        organic: "bg-white/10 text-white border-0 hover:bg-white/20 backdrop-blur-md"
    };

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={onClick}
            className={cn(
                "relative group px-6 py-3 rounded-lg font-orbitron font-bold tracking-wider uppercase transition-all duration-300 border backdrop-blur-sm flex items-center gap-2",
                variants[variant],
                className
            )}
            {...props}
        >
            {/* Glitch Overlay on Hover */}
            <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12 opacity-0 group-hover:opacity-100" />

            {Icon && <Icon className="w-5 h-5" />}
            {children}
        </motion.button>
    );
};

// --- 3. HOLO BADGE (Status Indicators) ---
export const HoloBadge = ({ label, variant = "neutral", pulse = false }) => {
    const colors = {
        success: "bg-neon-green/10 text-neon-green border-neon-green",
        warning: "bg-warning-amber/10 text-warning-amber border-warning-amber",
        danger: "bg-critical-red/10 text-critical-red border-critical-red",
        neutral: "bg-white/5 text-muted-tech border-white/10",
        active: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan"
    };

    return (
        <div className={cn(
            "px-3 py-1 rounded-full border text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2",
            colors[variant]
        )}>
            {pulse && <span className="w-2 h-2 rounded-full bg-current animate-pulse shadow-[0_0_8px_currentColor]" />}
            {label}
        </div>
    );
};

// --- 4. TECH INPUT (Fields) ---
export const TechInput = ({ label, ...props }) => {
    return (
        <div className="group space-y-2">
            {label && <label className="text-xs uppercase font-mono text-neon-cyan tracking-widest opacity-70 group-focus-within:opacity-100 transition-opacity">
                {label}
            </label>}
            <div className="relative">
                <input
                    {...props}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-tech-white font-mono focus:outline-none focus:border-neon-cyan/50 focus:shadow-[0_0_15px_rgba(0,243,255,0.1)] transition-all placeholder:text-white/20"
                />
                {/* Animated Bottom Line */}
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-neon-cyan group-focus-within:w-full transition-all duration-500" />
            </div>
        </div>
    );
};

// --- 5. SECTION HEADER (Titles) ---
export const SectionHeader = ({ title, subtitle }) => (
    <div className="mb-8 border-l-4 border-neon-cyan pl-4 py-1">
        <h2 className="text-4xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 uppercase tracking-tighter">
            {title}
        </h2>
        {subtitle && <p className="text-neon-cyan font-mono text-xs tracking-[0.2em] mt-1">{subtitle}</p>}
    </div>
);
