import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for clean class merging
function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// --- 1. GLASS CARD (The Building Block) ---
export const GlassCard = ({ children, className, hoverEffect = true }) => {
    return (
        <motion.div
            whileHover={hoverEffect ? { scale: 1.01, boxShadow: "0 0 20px rgba(0, 243, 255, 0.15)" } : {}}
            className={cn(
                "glass-panel rounded-xl p-6 relative overflow-hidden transition-all duration-300",
                "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity",
                className
            )}
        >
            {/* Decorative Corner Markers */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-neon-cyan/30 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-neon-cyan/30 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-neon-cyan/30 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-neon-cyan/30 rounded-br-xl" />

            {children}
        </motion.div>
    );
};

// --- 2. NEON BUTTON (Primary & Secondary) ---
export const NeonButton = ({ children, variant = "primary", onClick, icon: Icon, className, ...props }) => {
    const variants = {
        primary: "bg-neon-cyan/10 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:shadow-[0_0_25px_rgba(0,243,255,0.6)]",
        danger: "bg-critical-red/10 border-critical-red text-critical-red hover:bg-critical-red hover:text-white shadow-[0_0_15px_rgba(255,0,60,0.3)] hover:shadow-[0_0_25px_rgba(255,0,60,0.6)]",
        ghost: "bg-transparent border-white/20 text-muted-tech hover:border-white/60 hover:text-white"
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
