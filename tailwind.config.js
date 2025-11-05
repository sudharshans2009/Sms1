/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'amrita-orange': '#FF6B35',
        'amrita-blue': '#4A6CF7',
        'amrita-purple': '#6C5CE7',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
