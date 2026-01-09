/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'cyber-blue': '#0056D2',
                'neon-blue': '#00F0FF',
                'neon-green': '#00FF94',
                'alert-red': '#FF2A2A',
                'deep-space': '#050505',
                'glass-dark': 'rgba(10, 10, 10, 0.6)',
                'slate-text': '#E0E0E0', // Keeping variable name for compatibility but mapping to light color
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
                'neon': '0 0 10px rgba(0, 240, 255, 0.3)',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'scan': 'scan 4s linear infinite',
            },
            keyframes: {
                scan: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100vh)' }
                }
            }
        },
    },
    plugins: [],
}
