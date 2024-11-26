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
      title: {
        en: 'Operately Help Center',
      },
      defaultLocale: 'root',
      locales: {
        root: {
          label: 'English',
          lang: 'en',
        },
      },
      logo: {
        light: './src/layouts/square-logo-dense.png',
        dark: './src/layouts/square-logo-dense-white.png',
      },
      sidebar: [
        {
          label: 'Start here',
          items: [
            { label: 'Introduction', link: '/help' },
            { label: 'What is Operately?', link: '/help/what-is-operately' },
            { label: 'Features overview', link: '/help/features-overview' },
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