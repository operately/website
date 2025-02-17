import { z, defineCollection } from "astro:content";
import { docsSchema } from "@astrojs/starlight/schema";

const releasesCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    version: z.string(),
    description: z.string(),
    date: z.date(),
    published: z.boolean(),
    youtubeId: z.string().optional(),
  }),
});

export const collections = {
  releases: releasesCollection,
  docs: defineCollection({ schema: docsSchema() }),
};
