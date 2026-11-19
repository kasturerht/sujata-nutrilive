import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdoc,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      // Tokens used across components that Tailwind 3 does not ship (v4-style names).
      // Without these, the classes silently generated no CSS.
      boxShadow: {
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        '2xs': '0 1px rgb(0 0 0 / 0.05)',
      },
      spacing: { '4.5': '1.125rem' },
      scale: { '135': '1.35' },
    },
  },
  plugins: [
    typography,
  ],
};