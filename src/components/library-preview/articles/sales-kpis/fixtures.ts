import { createKpiDemoFixtures } from "@operately/turboui";
import type { KpiDemoFixtures } from "@operately/turboui";
import { salesSamples } from "../../../../utils/library/sales-samples.mjs";
import type { SalesKpiTemplate } from "./types";

export function createSalesFixtures(
  templates: SalesKpiTemplate[],
): KpiDemoFixtures {
  const fixtures = createKpiDemoFixtures({
    referenceDate: new Date("2026-10-01T12:00:00Z"),
    scenario: "empty",
    kpisLink: "/kpis",
  });
  const champion = fixtures.currentUser;
  const kpis = templates.map(({ key, definition }) => {
    const entries = salesSamples.map((sample) => ({
      id: `${key}-${sample.period}`,
      value: sample[key],
      recordedAt: new Date(`${sample.period}T12:00:00Z`),
      recordedBy: champion,
      commentsCount: 0,
      edits: [],
    }));
    return {
      ...definition,
      id: key,
      link: `/kpis/${key}`,
      champion,
      insertedAt: new Date("2026-04-01T12:00:00Z"),
      entries,
      latestEntry: entries.at(-1) ?? null,
      annotations: [
        {
          id: `${key}-smaller-projects`,
          title: "More small projects signed",
          date: new Date("2026-07-01T12:00:00Z"),
          createdBy: champion,
        },
      ],
    };
  });
  return {
    ...fixtures,
    space: { ...fixtures.space, name: "Sales performance" },
    kpis,
    comments: {},
    subscriptions: Object.fromEntries(kpis.map(({ id }) => [id, false])),
  };
}
