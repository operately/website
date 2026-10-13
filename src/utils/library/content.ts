import { getCollection, type CollectionEntry } from "astro:content";
import { visibleArticles } from "./articles.ts";

export const previewLibrary =
  import.meta.env.DEV || import.meta.env.LIBRARY_PREVIEW === "true";

export async function getLibraryArticles(): Promise<CollectionEntry<"library">[]> {
  return visibleArticles(await getCollection("library"), {
    includeDrafts: previewLibrary,
  });
}
