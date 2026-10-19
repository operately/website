import React from "react";
import { PreviewShell } from "../../shell/PreviewShell";
import { KpiDemo } from "./KpiDemo";
import type { ProjectManagementKpiTemplate } from "./types";

export function ProjectManagementKpiPreview({ templates }: { templates: ProjectManagementKpiTemplate[] }) {
  return (
    <PreviewShell
      title="Project delivery"
      label="Interactive KPI preview"
      cacheKey="project-kpi-preview"
      failureMessage="The interactive example could not load. You can still use the templates below. Reload this page to try again."
    >
      <KpiDemo templates={templates} />
    </PreviewShell>
  );
}
