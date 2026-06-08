/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy:   { DEFAULT: '#1A3A5C', dark: '#0F1F2E', light: '#1E4570', lighter: '#254d7a' },
        amber:  { DEFAULT: '#E8A020', light: '#F5B93A', dark: '#C07D10' },
        glass:  'rgba(255,255,255,0.04)',
        border: 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card:  '0 4px 24px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.06) inset',
        glow:  '0 0 30px rgba(232,160,32,0.15)',
        modal: '0 25px 80px rgba(0,0,0,0.7)',
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3Cpath d='M40 0H0v40' stroke='rgba(255,255,255,0.03)' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
