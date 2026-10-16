import { listPublicTemplates, loadPublicTemplate } from "../operately/client.mjs";
import type { PublicTemplate } from "./types";

const language = "en";
let buildCatalog: Promise<PublicTemplate[]> | undefined;

export function getTemplateCatalog(): Promise<PublicTemplate[]> {
  // One snapshot per static build; development requests should see catalog edits.
  if (import.meta.env.DEV) return loadCatalog();
  return (buildCatalog ??= loadCatalog());
}

async function loadCatalog(): Promise<PublicTemplate[]> {
  const entries = await listPublicTemplates({ language });
  const templates: PublicTemplate[] = [];
  // Bound concurrency so a large catalog doesn't overwhelm the app during builds.
  for (let offset = 0; offset < entries.length; offset += 8) {
    const batch = entries.slice(offset, offset + 8);
    const loaded = await Promise.all(batch.map(({ slug }) => loadPublicTemplate({ slug, language })));
    templates.push(...loaded.filter((template) => template !== null));
  }
  return templates;
}
