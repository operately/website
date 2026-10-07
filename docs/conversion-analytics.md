# Conversion analytics

Production (`operately.com` and `www.operately.com`) uses the existing PostHog
project automatically. Local and preview tracking is off by default.

To test locally with a staging project:

```sh
OPERATELY_ANALYTICS_ENABLED=true \
OPERATELY_ANALYTICS_TOKEN=phc_your_staging_project_token \
npm run dev
```

Optional overrides: `OPERATELY_ANALYTICS_HOST` and `OPERATELY_ANALYTICS_COOKIE_DOMAIN`.
Set `OPERATELY_ANALYTICS_ENABLED=false` to disable tracking. Restart/rebuild after
changes. The app requires separate configuration with the same project and cookie scope.

Tracking sends sanitized pageviews and respects opt-outs, DNT, and GPC; replay and
autocapture are disabled. Shared denials are preserved across tabs and subdomains.

Keep `src/utils/analyticsBrowser.mjs` identical to the app's
`app/assets/js/analytics/browser.mjs`. Run `npm test` and verify visitor identity
and campaign continuity across marketing → `/help` → app.
