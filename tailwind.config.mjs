import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdoc,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [
    typography,
  ],
};