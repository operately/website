// Fictional monthly observations, shared by the article table and interactive demo.
export const websiteSamples = [
  { period: "2026-04-30", month: "April", visitors: 8000, signups: 200 },
  { period: "2026-05-31", month: "May", visitors: 9000, signups: 243 },
  { period: "2026-06-30", month: "June", visitors: 10000, signups: 300 },
  { period: "2026-07-31", month: "July", visitors: 12000, signups: 300 },
  { period: "2026-08-31", month: "August", visitors: 11500, signups: 345 },
  { period: "2026-09-30", month: "September", visitors: 13000, signups: 416 },
].map((sample) => ({
  ...sample,
  conversion: Number(((sample.signups / sample.visitors) * 100).toFixed(2)),
}));
