import { getCollection } from 'astro:content';

export async function getLatestRelease() {
  const allReleases = await getCollection('releases', ({ data }) => {
    return data.published === true;
  });

  const latestRelease = allReleases.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())[0];

  if (!latestRelease) return null;

  return {
    version: latestRelease.data.version,
    slug: latestRelease.slug,
    date: latestRelease.data.date.toISOString()
  };
}