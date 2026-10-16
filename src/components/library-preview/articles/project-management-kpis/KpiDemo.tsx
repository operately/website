import React, { useState } from "react";
import { KpiDemo as SharedKpiDemo } from "../../kpis/KpiDemo";
import { createProjectManagementFixtures } from "./fixtures";
import type { ProjectManagementKpiTemplate } from "./types";

export function KpiDemo({ templates }: { templates: ProjectManagementKpiTemplate[] }) {
  const [fixtures] = useState(() => createProjectManagementFixtures(templates));

  return <SharedKpiDemo fixtures={fixtures} initialKpiId="onTime" />;
}
