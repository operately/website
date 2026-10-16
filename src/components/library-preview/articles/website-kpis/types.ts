export interface WebsiteKpiTemplate {
  key: "visitors" | "signups" | "conversion";
  id: string;
  useUrl: string;
  definition: {
    name: string;
    description: Record<string, unknown> | null;
    unit: string;
    cadence: "monthly";
  };
}
