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
    social: [
      {
        label: "Discord",
        icon: "discord",
        href: "https://discord.com/invite/2ngnragJYV",
      },
      {
        label: "GitHub",
        icon: "github",
        href: "https://github.com/operately/operately",
      },
      {
        label: "LinkedIn",
        icon: "linkedin",
        href: "https://www.linkedin.com/company/operately-com",
      },
      { label: "X", icon: "x.com", href: "https://x.com/operately" },
      {
        label: "YouTube",
        icon: "youtube",
        href: "https://youtube.com/@operately",
      },
    ],
    customCss: ["./src/styles/starlight.css", "./src/styles/anchor-links.css"],
    sidebar: [
      {
        label: "Meet Operately",
        items: [
          { label: "Introduction", link: "/help" },
          { label: "Features overview", link: "/help/features-overview" },
          { label: "Quick tour", link: "/help/quick-tour" },
        ],
      },
      {
        label: "Account management",
        items: [
          { label: "Create a new account", link: "/help/create-account" },
          { label: "Log in", link: "/help/log-in" },
          { label: "Join an organization", link: "/help/join-organization" },
          {
            label: "Fill in your personal info",
            link: "/help/fill-in-personal-info",
          },
          {
            label: "Set appearance to light or dark mode",
            link: "/help/set-light-dark-mode",
          },
          {
            label: "Switch to another organization account",
            link: "/help/switch-organization-account",
          },
          { label: "Reset password", link: "/help/reset-password" },
          { label: "Change your password", link: "/help/change-password" },
          { label: "Leave an organization", link: "/help/leave-organization" },
          { label: "Log out", link: "/help/log-out" },
          { label: "Delete your account", link: "/help/delete-account" },
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
