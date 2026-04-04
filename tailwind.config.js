/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: '#397754', // Emerald Green (Growth)
                    secondary: '#EB6B40', // Vibrant Orange (Community)
                    bg: '#F5F5DC', // Soft Cream (Background)
                    surface: '#FFFFFF', // Pure White for cards
                    text: '#1E293B', // High contrast text
                    muted: '#64748B', // Muted text
                    border: '#E2E8F0', // Light borders
                },
                success: { 500: '#10b981' },
                danger: { 500: '#ef4444' },
                warning: { 500: '#f59e0b' },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            boxShadow: {
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
                'search': '0 12px 24px -4px rgba(0, 0, 0, 0.1)',
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-out',
                'slide-in': 'slideIn 0.4s ease-out',
                'scale-in': 'scaleIn 0.4s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(12px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideIn: {
                    '0%': { transform: 'translateX(-100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                }
            },
        },
    },
    plugins: [],
}
