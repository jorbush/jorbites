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
        light: 'white', // Colores para el tema claro
        dark: '#0F0F0F', // Colores para el tema oscuro
      },
      screens: {
        sm: "360px",
        // Resto de las configuraciones de tamaño de pantalla
      },
    }
  },
  variants: {
    extend: {
      backgroundColor: ['dark'],
      textColor: ['dark'],
    },
  },
  darkMode: 'class',
  plugins: [],
}
