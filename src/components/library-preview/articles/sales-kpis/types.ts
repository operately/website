export interface SalesKpiTemplate {
  key: "pipeline" | "wins" | "revenue";
  id: string;
  useUrl: string;
  definition: {
    name: string;
    description: Record<string, unknown> | null;
    unit: string;
    cadence: "monthly";
  };
}
