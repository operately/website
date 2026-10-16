// Fictional weekly observations for one project, shared by the table and demo.
// Overdue milestones and blocked tasks are end-of-week snapshots, not totals.
export const projectManagementSamples = [
  { period: "2026-08-28", milestonesDue: 5, completedOnTime: 4, overdue: 1, blocked: 1 },
  { period: "2026-09-04", milestonesDue: 5, completedOnTime: 4, overdue: 2, blocked: 2 },
  { period: "2026-09-11", milestonesDue: 5, completedOnTime: 3, overdue: 4, blocked: 4 },
  { period: "2026-09-18", milestonesDue: 5, completedOnTime: 2, overdue: 7, blocked: 6 },
  { period: "2026-09-25", milestonesDue: 5, completedOnTime: 4, overdue: 5, blocked: 3 },
  { period: "2026-10-02", milestonesDue: 5, completedOnTime: 5, overdue: 2, blocked: 1 },
].map((sample) => ({
  ...sample,
  onTime: Number(((sample.completedOnTime / sample.milestonesDue) * 100).toFixed(2)),
}));
