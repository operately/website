import type { APIRoute } from "astro";
import { getPublishedReleases } from "../../../utils/releases";
import {
  generateReleaseOgImage,
  type ReleaseOgImageInput,
} from "../../../utils/releaseOgImage";

export async function getStaticPaths() {
  const releases = await getPublishedReleases();

  return releases.map((entry) => ({
    params: { slug: entry.slug },
    props: {
      title: entry.data.title,
      version: entry.data.version,
      date: entry.data.date,
    } satisfies ReleaseOgImageInput,
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const png = await generateReleaseOgImage(props as ReleaseOgImageInput);

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
