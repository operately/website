import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";

import mdx from "@astrojs/mdx";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import helpCenterSidebar from "./src/config/helpCenter";

// https://astro.build/config
export default defineConfig({
  site: "https://operately.com",
  integrations: [
    react(),
    starlight(helpCenterSidebar()),
    mdx({
      remarkPlugins: [],
      rehypePlugins: [
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
      ],
      shikiConfig: {
        // available themes: https://shiki.matsu.io/themes
        theme: "one-dark-pro",
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": "/src",
        "@components": "/src/components",
      },
    },
  },
});
