import { createKpiDemoFixtures } from "@operately/turboui";
import type { KpiDemoFixtures } from "@operately/turboui";
import { projectManagementSamples } from "../../../../utils/library/project-management-samples.mjs";
import type { ProjectManagementKpiTemplate } from "./types";

export function createProjectManagementFixtures(templates: ProjectManagementKpiTemplate[]): KpiDemoFixtures {
  const fixtures = createKpiDemoFixtures({
    referenceDate: new Date("2026-10-05T12:00:00Z"),
    scenario: "empty",
    kpisLink: "/kpis",
  });
  const champion = fixtures.currentUser;
  const kpis = templates.map(({ key, definition }) => {
    const entries = projectManagementSamples.map((sample) => ({
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
      insertedAt: new Date("2026-08-24T12:00:00Z"),
      entries,
      latestEntry: entries.at(-1) ?? null,
      annotations: [
        {
          id: `${key}-dependency`,
          title: "Integration work waiting on another team",
          date: new Date("2026-09-07T12:00:00Z"),
          createdBy: champion,
        },
        {
          id: `${key}-unblocking`,
          title: "Teams agree on owners and dates for blocked work",
          date: new Date("2026-09-21T12:00:00Z"),
          createdBy: champion,
        },
      ],
    };
  });
  return {
    ...fixtures,
    space: { ...fixtures.space, name: "Project delivery" },
    kpis,
    comments: {},
    subscriptions: Object.fromEntries(kpis.map(({ id }) => [id, false])),
  };
}
