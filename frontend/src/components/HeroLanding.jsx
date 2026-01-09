import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Fingerprint } from 'lucide-react';
import FluidBackground from './FluidBackground';

const HeroLanding = ({ onEnter }) => {
    return (
        <div className="relative w-screen h-screen flex flex-col items-center justify-center overflow-hidden">
            <FluidBackground />

            <div className="z-10 text-center space-y-8 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <p className="font-mono text-neon-cyan/80 tracking-[0.5em] text-sm mb-4">SURVEILLANCE GRID V2.0</p>
                    <h1 className="font-hero text-6xl md:text-8xl lg:text-9xl font-bold text-white tracking-tighter leading-[0.9] mix-blend-overlay">
                        KUMBH<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-white">RAKSHAK</span>
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="max-w-md mx-auto text-gray-400 font-sans text-lg leading-relaxed"
                >
                    AI-Powered Crowd Analytics & Threat Detection System.
                    <br />
                    <span className="text-xs font-mono opacity-50">ESTABLISHED SECURE DATALINK // NODE 844-ALPHA</span>
                </motion.div>

                <motion.button
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ delay: 1.5 }}
                    onClick={onEnter}
                    className="group relative px-12 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center gap-4 mx-auto overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/0 via-neon-cyan/10 to-neon-cyan/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <Fingerprint className="text-neon-cyan" />
                    <span className="font-hero font-bold tracking-widest text-white">ENTER SYSTEM</span>
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
            </div>

            {/* Cinematic Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="absolute bottom-8 w-full px-8 flex justify-between items-end z-10 font-mono text-xs text-white/30"
            >
                <div>
                    <p>LAT: 25.4358° N</p>
                    <p>LON: 81.8463° E</p>
                </div>
                <div className="flex gap-4">
                    <span>STATUS: OPTIMAL</span>
                    <span>ENCRYPTION: AES-256</span>
                </div>
            </motion.div>
        </div>
    );
};

export default HeroLanding;
