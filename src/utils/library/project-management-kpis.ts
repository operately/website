import { loadKpiTemplate } from "../operately/client.mjs";
import type { ProjectManagementKpiTemplate } from "../../components/library-preview/kpis/project-management/types";

const language = "en";
export const projectManagementKpiReferences = [
  {
    key: "onTime",
    slug: "weekly-on-time-milestone-rate",
    unit: "%",
  },
  {
    key: "overdue",
    slug: "weekly-overdue-milestones",
    unit: "milestones",
  },
  {
    key: "blocked",
    slug: "weekly-blocked-project-tasks",
    unit: "tasks",
  },
] as const;

export async function loadProjectManagementKpis(): Promise<ProjectManagementKpiTemplate[] | null> {
  try {
    return await Promise.all(
      projectManagementKpiReferences.map(async ({ key, slug, unit }) => {
        const template = await loadKpiTemplate({ slug, language });
        if (
          template.definition.cadence !== "weekly" ||
          template.definition.unit !== unit
        ) {
          throw new Error(
            `The ${key} example needs weekly cadence and unit ${unit}; review the published template`,
          );
        }
        return { ...template, key };
      }),
    );
  } catch (error) {
    console.warn(
      "Omitting the project management KPI example because its templates could not be loaded:",
      error,
    );
    return null;
  }
}
