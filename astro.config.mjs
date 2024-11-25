import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import starlight from '@astrojs/starlight';

import mdx from "@astrojs/mdx";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

// https://astro.build/config
export default defineConfig({
  site: "https://operately.com",
  integrations: [
    tailwind(),
    react(),
    starlight({
      title: 'Operately Help Center',
      sidebar: [
        { label: 'Home', link: '/help' },
        {
          label: 'Guides',
          items: [
            { label: 'Getting Started', link: '/help/getting-started' },
            // Add more sidebar items as needed
          ],
        },
      ],
    }),
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
          }],
          test: (node) => node.tagName !== 'h1'
        }]
      ],
      shikiConfig: {
        // available themes: https://shiki.matsu.io/themes
        theme: 'one-dark-pro',
      }
    }),
  ]
});