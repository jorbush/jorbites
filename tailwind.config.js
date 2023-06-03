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
        green: {
          450: '#C5F0A4',
        },
      },
      screens: {
        sm: "360px",
        // Resto de las configuraciones de tamaño de pantalla
      },
    }
  },
  plugins: [],
}
