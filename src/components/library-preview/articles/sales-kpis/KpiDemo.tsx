import React, { useState } from "react";
import { KpiDemo as SharedKpiDemo } from "../../kpis/KpiDemo";
import { createSalesFixtures } from "./fixtures";
import type { SalesKpiTemplate } from "./types";

export function KpiDemo({ templates }: { templates: SalesKpiTemplate[] }) {
  const [fixtures] = useState(() => createSalesFixtures(templates));

  return <SharedKpiDemo fixtures={fixtures} initialKpiId="revenue" />;
}
