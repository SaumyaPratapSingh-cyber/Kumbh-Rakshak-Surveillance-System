/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'cyber-black': '#05000a', // Deepest Purple-Black from palette
                'glass-dark': 'rgba(10, 0, 20, 0.6)',
                'neon-cyan': '#e9b3fb', // Remapped to LAVENDER (Accent) for easy refactor
                'neon-purple': '#6f00ff', // PRIMARY VIVID PURPLE
                'deep-purple': '#3b0270', // SECONDARY DEEP
                'tech-white': '#fff1f1', // PALE WHITE
                'critical-red': '#ff003c',
                'muted-tech': '#94a3b8',
            },
            fontFamily: {
                sans: ['Space Grotesk', 'sans-serif'],
                orbitron: ['Rajdhani', 'sans-serif'], // Keeping purely for compatibility, but switching visual preference
                hero: ['Syncopate', 'sans-serif'],
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
