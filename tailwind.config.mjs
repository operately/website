import defaultTheme from "tailwindcss/defaultTheme";
import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
        serif: ["PT Serif", ...defaultTheme.fontFamily.serif],
      },
      backgroundColor: {
        "operately-blue": "#3185FF",
        "operately-dark-blue": "#024FAC",
        "operately-blue-tint-1": "#E3F2FF",
        "operately-blue-tint-2": "#98C9FF",
        "edgy-blue": "#0055FF",
      },
      borderColor: {
        "operately-blue": "#3185FF",
        "operately-dark-blue": "#024FAC",
        "operately-blue-tint-1": "#E3F2FF",
        "operately-blue-tint-2": "#98C9FF",
        "edgy-blue": "#0055FF",
      },
      textColor: {
        "operately-blue": "#3185FF",
        "operately-dark-blue": "#024FAC",
        "operately-blue-tint-1": "#E3F2FF",
        "operately-blue-tint-2": "#98C9FF",
        "edgy-blue": "#0055FF",
      },
      typography: {
        DEFAULT: {
          css: {
            a: {
              color: "#3185FF",
              "&:hover": {
                color: "#024FAC",
              },
            },
          },
        },
      },
    },
  },
  plugins: [typography],
};
