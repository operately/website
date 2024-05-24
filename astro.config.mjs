import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";

import mdx from "@astrojs/mdx";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

// https://astro.build/config
export default defineConfig({
  site: "https://operately.com",
  integrations: [
    tailwind(),
    react(),
    mdx({
      remarkPlugins: [],
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, {
          behavior: 'append',
          properties: {
            className: ['anchor-link']
          },
          content: [{
            type: 'element',
            tagName: 'span',
            properties: {className: ['hash-symbol']},
            children: [{type: 'text', value: '#'}]
          }]
        }]
      ]
    })
  ]
});