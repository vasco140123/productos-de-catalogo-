import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FDFBF7", // Crema muy suave / Blanco roto
        foreground: "#1F2937", // Gris carbón para texto principal
        primary: {
          DEFAULT: "#E11D48", // Rosa Fucsia / Rojo Cereza para botones y acentos
          hover: "#BE123C", // Rojo más oscuro al pasar el ratón
        },
        secondary: {
          DEFAULT: "#F3F4F6", // Gris claro para fondos secundarios
          text: "#4B5563", // Gris medio para textos secundarios
        }
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
export default config;
