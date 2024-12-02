export default function helpCenterSidebar() {
  return {
    title: {
      en: "Operately Help Center",
    },
    defaultLocale: "root",
    locales: {
      root: {
        label: "English",
        lang: "en",
      },
    },
    logo: {
      light: "./src/layouts/square-logo-dense.png",
      dark: "./src/layouts/square-logo-dense-white.png",
    },
    sidebar: [
      {
        label: "Introduction",
        items: [
          { label: "Overview", link: "/help" },
          { label: "What is Operately?", link: "/help/what-is-operately" },
          { label: "Features overview", link: "/help/features-overview" },
        ],
      },
    ],
    customCss: ["./src/styles/starlight.css"],
  };
}
