/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'cyber-black': '#020202',
                'void-gray': '#09090b',
                'tech-white': '#e2e8f0',
                'muted-tech': '#94a3b8',
                'neon-cyan': '#00f3ff',
                'hologram-blue': '#2d8cf0',
                'critical-red': '#ff003c',
                'warning-amber': '#fcee0a',
                'glass-dark': 'rgba(0, 0, 0, 0.6)',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                orbitron: ['Rajdhani', 'sans-serif'],
                mono: ['Space Mono', 'monospace'],
            },
            boxShadow: {
                'glass-sm': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'glass-md': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                'neon-glow': '0 0 10px rgba(0, 243, 255, 0.5), 0 0 20px rgba(0, 243, 255, 0.3)',
                'critical-glow': '0 0 10px rgba(255, 0, 60, 0.5), 0 0 20px rgba(255, 0, 60, 0.3)',
            },
            animation: {
                'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'spin-slow': 'spin 3s linear infinite',
                'glitch': 'glitch 1s linear infinite',
                'scanline': 'scanline 8s linear infinite',
            },
            keyframes: {
                glitch: {
                    '2%, 64%': { transform: 'translate(2px,0) skew(0deg)' },
                    '4%, 60%': { transform: 'translate(-2px,0) skew(0deg)' },
                    '62%': { transform: 'translate(0,0) skew(5deg)' },
                },
                scanline: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100vh)' }
                }
            }
        },
    },
    plugins: [],
}
