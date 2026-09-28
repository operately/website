import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

const releasesCollection = defineCollection({
  loader: glob({
    pattern: "*.{md,mdx}",
    base: "./src/content/releases",
    generateId: ({ entry }) =>
      entry.replace(/\.[^/.]+$/, "").replace(/\./g, ""),
  }),
  schema: z.object({
    title: z.string(),
    version: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    published: z.boolean(),
    youtubeId: z.string().optional(),
  }),
});

export const collections = {
  releases: releasesCollection,
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
};
