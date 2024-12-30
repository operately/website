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
    social: {
      discord: "https://discord.com/invite/2ngnragJYV",
      github: "https://github.com/operately/operately",
      linkedin: "https://www.linkedin.com/company/operately-com",
      "x.com": "https://x.com/operately",
      youtube: "https://youtube.com/@operately",
    },
    customCss: ["./src/styles/starlight.css", "./src/styles/anchor-links.css"],
    sidebar: [
      {
        label: "Introduction",
        items: [
          { label: "Overview", link: "/help" },
          { label: "What is Operately?", link: "/help/what-is-operately" },
          { label: "Features overview", link: "/help/features-overview" },
          { label: "Quick tour", link: "/help/quick-tour" },
        ],
      },
      {
        label: "Spaces",
        items: [
          { label: "Introduction to Spaces", link: "/help/intro-to-spaces" },
          { label: "Create a space", link: "/help/create-space" },
          { label: "Space access control", link: "/help/space-access-control" },
        ],
      },
    ],
    editLink: {
      baseUrl: "https://github.com/operately/website/edit/main/",
    },
    disable404Route: true,
    tableOfContents: false,
  };
}