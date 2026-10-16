import { createKpiDemoFixtures } from "@operately/turboui";
import type { KpiDemoFixtures } from "@operately/turboui";
import { websiteSamples } from "../../../../utils/library/website-samples.mjs";
import type { WebsiteKpiTemplate } from "./types";

export function createWebsiteFixtures(
  templates: WebsiteKpiTemplate[],
): KpiDemoFixtures {
  const fixtures = createKpiDemoFixtures({
    referenceDate: new Date("2026-10-01T12:00:00Z"),
    scenario: "empty",
    kpisLink: "/kpis",
  });
  const champion = fixtures.currentUser;
  const kpis = templates.map(({ key, definition }) => {
    const entries = websiteSamples.map((sample) => ({
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
          id: `${key}-campaign`,
          title: "Broader campaign launched",
          date: new Date("2026-07-01T12:00:00Z"),
          createdBy: champion,
        },
      ],
    };
  });
  return {
    ...fixtures,
    space: { ...fixtures.space, name: "Website growth" },
    kpis,
    comments: {},
    subscriptions: Object.fromEntries(kpis.map(({ id }) => [id, false])),
  };
}
