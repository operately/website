import { loadKpiTemplate } from "../operately/client.mjs";
import type { SalesKpiTemplate } from "../../components/library-preview/articles/sales-kpis/types";

const language = "en";
export const salesKpiReferences = [
  {
    key: "pipeline",
    slug: "monthly-qualified-pipeline-created",
    unit: "USD",
  },
  {
    key: "wins",
    slug: "monthly-deals-won",
    unit: "deals",
  },
  {
    key: "revenue",
    slug: "monthly-sales-revenue",
    unit: "USD",
  },
] as const;

export async function loadSalesKpis(): Promise<SalesKpiTemplate[] | null> {
  try {
    return await Promise.all(
      salesKpiReferences.map(async ({ key, slug, unit }) => {
        const template = await loadKpiTemplate({ slug, language });
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
      "Omitting the sales KPI example because its templates could not be loaded:",
      error,
    );
    return null;
  }
}
