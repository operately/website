export interface ProjectManagementKpiTemplate {
  key: "onTime" | "overdue" | "blocked";
  id: string;
  useUrl: string;
  definition: {
    name: string;
    description: Record<string, unknown> | null;
    unit: string;
    cadence: "weekly";
  };
}
