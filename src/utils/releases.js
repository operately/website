import { getCollection } from 'astro:content';

export async function getPublishedReleases() {
  const allReleases = await getCollection('releases');
  
  // If we're not in dev mode, we're gonna skip non-published releases
  const isProduction = !import.meta.env.DEV;

  return allReleases.filter(release => 
    isProduction ? release.data.published !== false : true
  ).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}