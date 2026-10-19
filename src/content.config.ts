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

const libraryCollection = defineCollection({
  loader: glob({ pattern: "*.mdx", base: "./src/content/library" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(["kpis"]),
    author: z.string(),
    published: z.boolean().default(false),
    publishedAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    order: z.number(),
    primaryKeyword: z.string(),
    relatedKeywords: z.array(z.string()),
    scenario: z.enum(["website-kpis", "project-management-kpis", "sales-kpis"]),
  }).refine((entry) => !entry.published || entry.publishedAt, { message: "Published articles need a publication date" }),
});

export const collections = {
  library: libraryCollection,
  releases: releasesCollection,
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
};
