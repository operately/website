import { previewStyles } from "./scripts/preview-lab/styles.mjs";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";

import mdx from "@astrojs/mdx";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import helpCenterSidebar from "./src/config/helpCenter";

const headingAnchorRehypePlugins = [
  rehypeSlug,
  [
    rehypeAutolinkHeadings,
    {
      behavior: "append",
      properties: {
        className: ["anchor-link"],
      },
      content: [
        {
          type: "element",
          tagName: "span",
          properties: { className: ["hash-symbol"] },
          children: [{ type: "text", value: "#" }],
        },
      ],
      test: (node) => node.tagName !== "h1",
    },
  ],
];

// https://astro.build/config
export default defineConfig({
  site: "https://operately.com",
  compressHTML: true,
  markdown: {
    processor: unified(),
    rehypePlugins: headingAnchorRehypePlugins,
    shikiConfig: {
      // available themes: https://shiki.matsu.io/themes
      theme: "one-dark-pro",
    },
  },
  integrations: [
    react(),
    sitemap(),
    starlight(helpCenterSidebar()),
    mdx(),
  ],
  vite: {
    plugins: [tailwindcss(), previewStyles()],
    resolve: {
      alias: {
        "@": "/src",
        "@components": "/src/components",
      },
    },
  },
});
