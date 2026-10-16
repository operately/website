import React, { useState } from "react";
import { KpiDemo as SharedKpiDemo } from "../KpiDemo";
import { createWebsiteFixtures } from "./fixtures";
import type { WebsiteKpiTemplate } from "./types";

export function KpiDemo({ templates }: { templates: WebsiteKpiTemplate[] }) {
  const [fixtures] = useState(() => createWebsiteFixtures(templates));

  return <SharedKpiDemo fixtures={fixtures} initialKpiId="conversion" />;
}
