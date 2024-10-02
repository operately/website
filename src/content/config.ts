import { z, defineCollection } from 'astro:content';

const releasesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    version: z.string(),
    description: z.string(),
    date: z.date(),
    published: z.boolean(),
  }),
});

export const collections = {
  'releases': releasesCollection,
};