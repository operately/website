export const templateTypes = {
  kpi: { name: "KPI", plural: "KPIs" },
  goal: { name: "Goal", plural: "Goals" },
  project: { name: "Project", plural: "Projects" },
};

export function templatePath(slug: string) {
  return `/library/templates/${encodeURIComponent(slug)}`;
}

export function templatePreviewPath(slug: string) {
  return `${templatePath(slug)}/preview`;
}

export function catalogPath(filters: { type?: string; q?: string } = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) query.set(key, value);
  }
  return `/library${query.size ? `?${query}` : ""}`;
}

export function templateCount(count: number) {
  return `${new Intl.NumberFormat("en").format(count)} ${count === 1 ? "template" : "templates"}`;
}

export function daysAfterStart(days: number | string | null | undefined) {
  if (days == null || days === "") return null;
  const count = Number(days);
  if (count === 0) return "Start day";
  return `${new Intl.NumberFormat("en").format(count)} ${count === 1 ? "day" : "days"} after start`;
}

