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
          {
            label: "View space members",
            link: "/help/view-space-members",
          },
          {
            label: "Change space company access",
            link: "/help/change-space-company-access",
          },
          {
            label: "Make a space private",
            link: "/help/make-space-private",
          },
          {
            label: "Add a space member",
            link: "/help/add-space-member",
          },
          {
            label: "Remove a space member",
            link: "/help/remove-space-member",
          },
          {
            label: "Promote to space manager",
            link: "/help/promote-to-space-manager",
          },
          {
            label: "Reassign space manager to member",
            link: "/help/reassign-space-manager-to-member",
          },
        ],
      },
      {
        label: "Documents & Files",
        items: [
          {
            label: "Create a document",
            link: "/help/create-document",
          },
          {
            label: "Format text and embed images",
            link: "/help/format-document-text",
          },
          { label: "Upload a file", link: "/help/upload-file" },
          { label: "Add an external link", link: "/help/add-external-link" },
          { label: "Create a folder", link: "/help/create-folder" },
          { label: "Copy a document", link: "/help/copy-document" },
          { label: "Move a document", link: "/help/move-document" },
          { label: "Edit a document", link: "/help/edit-document" },
          {
            label: "Edit a file title and description",
            link: "/help/edit-file-details",
          },
          { label: "Download a file", link: "/help/download-file" },
          { label: "Delete a document", link: "/help/delete-document" },
          { label: "Discuss a document", link: "/help/discuss-document" },
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
