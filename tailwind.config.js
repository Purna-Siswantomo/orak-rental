/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './public/**/*.html',
  ],
  theme: {
    extend: {
      animation: {
        'blob-drift': 'blob-drift var(--drift-duration, 16s) ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
