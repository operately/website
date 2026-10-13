import React, { lazy } from "react";
import { PreviewShell } from "../../shell/PreviewShell";
import type { WebsiteKpiTemplate } from "./types";

const KpiDemo = lazy(() => import("./KpiDemo").then(({ KpiDemo }) => ({ default: KpiDemo })));

export function WebsiteKpiPreview({ templates }: { templates: WebsiteKpiTemplate[] }) {
  return (
    <PreviewShell
      title="Website growth"
      label="Interactive KPI preview"
      cacheKey="kpi-preview"
      failureMessage="The interactive example could not load. You can still use the templates below. Reload this page to try again."
    >
      <KpiDemo templates={templates} />
    </PreviewShell>
  );
}
