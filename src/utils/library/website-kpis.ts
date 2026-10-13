import { loadKpiTemplate } from "./catalog.mjs";
import type { WebsiteKpiTemplate } from "../../components/library-preview/kpis/website/types";

const appOrigin = "http://localhost:4100";
const language = "en";
const references = [
  {
    key: "visitors",
    slug: "monthly-website-visitors",
    unit: "visitors",
  },
  {
    key: "signups",
    slug: "monthly-website-signups",
    unit: "signups",
  },
  {
    key: "conversion",
    slug: "website-visitor-to-signup-conversion-rate",
    unit: "%",
  },
] as const;

export async function loadWebsiteKpis(): Promise<WebsiteKpiTemplate[] | null> {
  try {
    return await Promise.all(
      references.map(async ({ key, slug, unit }) => {
        const template = await loadKpiTemplate({ appOrigin, slug, language });
        if (
          template.definition.cadence !== "monthly" ||
          template.definition.unit !== unit
        ) {
          throw new Error(
            `The ${key} example needs monthly cadence and unit ${unit}; review the published template`,
          );
        }
        return { ...template, key };
      }),
    );
  } catch (error) {
    console.warn(
      "Omitting the website KPI example because its templates could not be loaded:",
      error,
    );
    return null;
  }
}
