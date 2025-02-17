import rss from "@astrojs/rss";
import { getContainerRenderer as getMDXRenderer } from "@astrojs/mdx";
import { getPublishedReleases } from "../../utils/releases";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";
import { transform, walk } from "ultrahtml";
import sanitize from "ultrahtml/transformers/sanitize";

export async function GET(context) {
  if (!context.site) {
    throw new Error("site URL is not configured in your astro.config.mjs file");
  }

  // Get base URL without trailing slash
  let baseUrl = context.site.href;
  if (baseUrl.at(-1) === "/") baseUrl = baseUrl.slice(0, -1);

  // Create Astro container for rendering components
  const container = await AstroContainer.create({
    renderers: await loadRenderers([getMDXRenderer()]),
  });

  // Get releases
  const sortedReleases = await getPublishedReleases();

  // Process each release
  const feedItems = [];
  for (const post of sortedReleases) {
    try {
      // Get the content component
      const { Content } = await post.render();

      // Render content to string
      const rawContent = await container.renderToString(Content);

      const content = await transform(
        rawContent.replace(/^<!DOCTYPE html>/, ""),
        [
          // Make links and images absolute
          async (node) => {
            await walk(node, (node) => {
              if (node.name === "a" && node.attributes.href?.startsWith("/")) {
                node.attributes.href = baseUrl + node.attributes.href;
              }
              if (node.name === "img" && node.attributes.src?.startsWith("/")) {
                node.attributes.src = baseUrl + node.attributes.src;
              }
            });
            return node;
          },
          // Remove scripts and styles
          sanitize({ dropElements: ["script", "style"] }),
        ]
      );

      let feedLink = `/releases/${post.slug}/`;
      let feedTitle = post.data.title;

      feedItems.push({
        title: feedTitle,
        description: post.data.description || "",
        pubDate: post.data.date,
        link: feedLink,
        content,
      });
    } catch (error) {
      console.error(`Error processing post ${post.id}:`, error);
      // Fallback to description if content processing fails
      feedItems.push({
        title: post.data.title,
        description: post.data.description || "",
        pubDate: post.data.date,
        link: `/releases/${post.slug}/`,
        content: post.data.description || "",
      });
    }
  }

  return rss({
    title: "Operately Releases",
    description:
      "Stay updated with the latest product releases and updates from Operately",
    site: context.site,
    trailingSlash: false,
    items: feedItems,
    xmlns: {
      atom: "http://www.w3.org/2005/Atom",
      content: "http://purl.org/rss/1.0/modules/content/",
    },
    customData: `
      <language>en-us</language>
      <atom:link href="${baseUrl}/releases/rss.xml" rel="self" type="application/rss+xml" />
    `,
  });
}
