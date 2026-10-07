import { BrowserAnalytics, createAnalytics } from "./analyticsBrowser.mjs";

// Defaults apply only to production hosts; build-time overrides support local and staging testing.
export function buildPosthogSnippet(config = {}) {
  const serialized = JSON.stringify(config).replace(/</g, "\\u003c");
  return `(() => {
    if (window.operatelyWebsiteAnalytics) return;
    const config = ${serialized};
    const isProduction = ["operately.com", "www.operately.com"].includes(location.hostname);
    config.enabled ??= isProduction;
    config.token ??= isProduction ? "phc_xf04u2FOMctiPEL4Ra5gH50ercpdlkgbYwBVdLpBtWA" : "";
    config.host ??= "https://us.i.posthog.com";
    config.cookieDomain ??= isProduction ? ".operately.com" : "";
    if (!config.enabled || !config.token) return;

    const BrowserAnalytics = ${BrowserAnalytics.toString()};
    const tracker = (${createAnalytics.toString()})(config, { surface: "website" });
    window.operatelyWebsiteAnalytics = tracker;
    let restorationCount = 0;
    const visit = () => tracker.visit({
      path: location.pathname,
      key: restorationCount + ":" + location.pathname + location.search,
    }).catch(() => {});

    document.addEventListener("astro:page-load", visit);
    window.addEventListener("pageshow", (event) => {
      // A cached document keeps its tracker; each restore is a new navigation.
      if (event.persisted) restorationCount += 1;
      visit();
    });
    visit();
  })();`;
}

const enabledOverride = process.env.OPERATELY_ANALYTICS_ENABLED;

export default buildPosthogSnippet({
  enabled: enabledOverride === undefined ? undefined : enabledOverride === "true",
  token: process.env.OPERATELY_ANALYTICS_TOKEN,
  host: process.env.OPERATELY_ANALYTICS_HOST,
  cookieDomain: process.env.OPERATELY_ANALYTICS_COOKIE_DOMAIN,
});
