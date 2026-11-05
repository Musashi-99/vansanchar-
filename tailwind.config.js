/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Outfit', 'system-ui', 'sans-serif'] },
      colors: {
        bg: 'var(--bg)', fg: 'var(--fg)', card: 'var(--card)', primary: 'var(--primary)',
        'primary-fg': 'var(--primary-fg)', secondary: 'var(--secondary)', muted: 'var(--muted)',
        accent: 'var(--accent)', danger: 'var(--danger)', line: 'var(--border)', input: 'var(--input)', ring: 'var(--ring)',
      },
      borderRadius: { xl2: '12px' },
      keyframes: {
        sosring: { '0%': { transform: 'scale(1)', opacity: '.55' }, '100%': { transform: 'scale(1.7)', opacity: '0' } },
        fadeup: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
      },
      animation: { sosring: 'sosring 1.8s ease-out infinite', fadeup: '.3s ease-out both' },
    },
  },
  plugins: [],
};
