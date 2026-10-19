import React from "react";
import { PreviewShell } from "../../shell/PreviewShell";
import { KpiDemo } from "./KpiDemo";
import type { SalesKpiTemplate } from "./types";

export function SalesKpiPreview({ templates }: { templates: SalesKpiTemplate[] }) {
  return (
    <PreviewShell
      title="Sales performance"
      label="Interactive KPI preview"
      cacheKey="sales-kpi-preview"
      failureMessage="The interactive example could not load. You can still use the templates below. Reload this page to try again."
    >
      <KpiDemo templates={templates} />
    </PreviewShell>
  );
}
