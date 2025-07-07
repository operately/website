/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      /* FIXME: this for some reason is not working after upgrading to Tailwind 4 */
      /* we have colors defined in global.css */
      colors: {
        "operately-blue": "#3185FF",
        "operately-dark-blue": "#024FAC",
        "operately-blue-tint-1": "#E3F2FF",
        "operately-blue-tint-2": "#98C9FF",
        "edgy-blue": "#0055FF",
      },
      fontFamily: {
        sans: ["Inter var", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["PT Serif", "ui-serif", "Georgia", "serif"],
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
};
