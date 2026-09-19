/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // PV Mart real brand palette, pulled from pvmart.co.in
        cream: '#fdf6e3',
        'cream-card': '#fbf1d8',
        navy: '#1c2340',
        'navy-soft': '#4a5170',
        orange: '#f5841f',
        'orange-light': '#ff9a4d',
        blue: '#2f6fe4',
        'blue-light': '#eaf1fc',
        white: '#ffffff',
        border: '#ece2c6',
        good: '#3f9a5c',
        bad: '#d64545',
      },
      fontFamily: {
        display: ['Poppins', '-apple-system', 'sans-serif'],
        body: ['Inter', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"SF Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
