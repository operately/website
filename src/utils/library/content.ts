import { getCollection, type CollectionEntry } from "astro:content";
import { visibleArticles } from "./articles.ts";
import { websiteKpiReferences } from "./website-kpis";
import { projectManagementKpiReferences } from "./project-management-kpis";
import { salesKpiReferences } from "./sales-kpis";

export const previewLibrary =
  import.meta.env.DEV || import.meta.env.LIBRARY_PREVIEW === "true";

export async function getLibraryArticles(): Promise<CollectionEntry<"library">[]> {
  return visibleArticles(await getCollection("library"), {
    includeDrafts: previewLibrary,
  });
}

export async function getTemplateGuides(slug: string) {
  const scenarios: Record<CollectionEntry<"library">["data"]["scenario"], readonly string[]> = {
    "website-kpis": websiteKpiReferences.map((reference) => reference.slug),
    "project-management-kpis": projectManagementKpiReferences.map((reference) => reference.slug),
    "sales-kpis": salesKpiReferences.map((reference) => reference.slug),
  };
  return (await getLibraryArticles()).filter((article) => scenarios[article.data.scenario].includes(slug));
}
