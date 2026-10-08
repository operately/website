// Website pageviews and acquisition context; app tracking lives in its own repository.
// The class has no module dependencies: Astro/Starlight embed its source alongside the factory.
export function createAnalytics(config, options = {}) {
  if (!config?.enabled || !config.token || !config.host) {
    return { visit: async () => {}, context: () => ({}) };
  }

  const tracker = new BrowserAnalytics(config, options.environment);
  tracker.start();

  return {
    visit: (page) => tracker.visit(page),
    context: () => tracker.context(),
  };
}

export class BrowserAnalytics {
  constructor(config, environment = window) {
    this.config = config;
    this.environment = environment;
    this.document = this.environment.document;

    this.cookieName = "operately_analytics_v1";
    this.trackingContext = this.readContext() || { version: 1, preference: "unspecified" };
    this.sdk = undefined;
    this.lastVisitKey = undefined;

    this.ready = new Promise((resolve) => {
      this.resolveReady = resolve;
    });
  }

  start() {
    this.loadSdk();
    this.listenForPageExit();
  }

  loadSdk() {
    // Reuse the default PostHog instance and storage name, including existing visitor IDs.
    try {
      if (this.environment.posthog?.init) {
        this.initializeSdk();
      } else {
        const script = this.document.createElement("script");
        script.async = true;
        script.crossOrigin = "anonymous";
        script.src =
          this.config.host.replace(".i.posthog.com", "-assets.i.posthog.com").replace(/\/$/, "") + "/static/array.js";

        script.onload = () => {
          try {
            this.initializeSdk();
          } catch {
            this.resolveReady();
          }
        };
        script.onerror = () => this.resolveReady();

        this.document.head.appendChild(script);
      }
    } catch {
      this.resolveReady();
    }
  }

  initializeSdk() {
    this.environment.posthog.init(this.config.token, {
      api_host: this.config.host,
      person_profiles: "identified_only",
      save_campaign_params: false,
      save_referrer: false,
      persistence: "localStorage+cookie",
      cross_subdomain_cookie: Boolean(this.config.cookieDomain),
      cookie_expiration: 365,
      cookie_persisted_properties: ["$user_state"],
      cookieWinsOnConflict: true,
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      disable_session_recording: true,
      enable_heatmaps: false,
      rageclick: false,
      capture_performance: false,
      capture_exceptions: false,
      disable_surveys: true,
      advanced_disable_flags: true,
      advanced_disable_feature_flags: true,
      advanced_disable_feature_flags_on_first_load: true,
      respect_dnt: true,
      opt_out_capturing_by_default: this.isTrackingDenied(),
      before_send: (event) => this.sanitize(event),
      loaded: (instance) => this.onSdkLoaded(instance),
    });
  }

  onSdkLoaded(instance) {
    this.sdk = instance;
    this.saveContext();
    this.rememberVisitor();

    this.resolveReady();
  }

  listenForPageExit() {
    this.environment.addEventListener("pagehide", () => this.saveContext());
  }

  async visit(page) {
    // Preserve attribution even if the visitor leaves before the SDK finishes loading.
    this.saveContext();
    this.recordFirstTouch(page.path);
    if (this.isTrackingDenied()) return;

    await this.ready;
    if (!this.sdk || this.isTrackingDenied()) return;

    this.saveContext();
    this.rememberVisitor();
    if (this.lastVisitKey === page.key) return;
    this.lastVisitKey = page.key;

    // Marketing visits must not inherit a workspace group from the app.
    this.sdk.resetGroups();
    this.sdk.capture("$pageview", this.visitProperties(page));
  }

  recordFirstTouch(path) {
    if (this.trackingContext.attribution || this.isTrackingDenied()) return;

    const url = new URL(this.environment.location.href);
    let referrer = "";
    try {
      referrer = new URL(this.document.referrer).hostname;
    } catch {
      /* No observable referrer. */
    }

    const domain = (this.config.cookieDomain || this.environment.location.hostname).replace(/^\./, "");
    const internal = referrer === domain || referrer.endsWith("." + domain);
    // OAuth providers are authentication redirects, never acquisition sources.
    const authRedirect = referrer === "accounts.google.com";
    if (internal || authRedirect) referrer = "";

    const attribution = { landing_path: path, referrer_host: referrer, observed_at: new Date().toISOString() };
    for (const key of ["utm_source", "utm_medium", "utm_campaign"]) {
      const value = url.searchParams.get(key);
      if (value) attribution[key] = value.slice(0, 200);
    }

    attribution.source_kind = this.classifyAcquisitionSource(attribution, internal || authRedirect);
    this.saveContext({ attribution });
  }

  classifyAcquisitionSource(attribution, ignoredReferrer) {
    if (attribution.utm_source || attribution.utm_medium || attribution.utm_campaign) return "campaign";
    if (attribution.referrer_host) return "referral";
    if (ignoredReferrer) return "unknown";
    return "direct";
  }

  visitProperties(page) {
    return {
      schema_version: 1,
      surface: "website",
      channel: "web",
      page: page.path,
      $groups: {},
      acquisition: this.trackingContext.attribution || { source_kind: "unknown" },
      occurred_at: new Date().toISOString(),
      $insert_id: this.environment.crypto.randomUUID(),
    };
  }

  sanitize(event) {
    if (!event || this.isTrackingDenied() || event.event !== "$pageview") {
      return null;
    }

    const allowed = new Set([
      "distinct_id",
      "token",
      "$device_id",
      "$session_id",
      "$window_id",
      "$is_identified",
      "$process_person_profile",
      "$lib",
      "$lib_version",
      "$browser",
      "$browser_version",
      "$os",
      "$os_version",
      "$device_type",
      "$screen_height",
      "$screen_width",
      "$viewport_height",
      "$viewport_width",
      "$insert_id",
      "schema_version",
      "surface",
      "channel",
      "$groups",
      "page",
      "acquisition",
      "occurred_at",
    ]);

    event.properties = Object.fromEntries(Object.entries(event.properties || {}).filter(([key]) => allowed.has(key)));

    // No raw URLs, titles, referrers, initial person properties, or SDK super-properties leave the browser.
    if (event.properties.page) {
      event.properties.$pathname = event.properties.page;
      event.properties.$current_url = this.environment.location.origin + event.properties.page;
    }

    return { uuid: event.uuid, event: event.event, properties: event.properties, timestamp: event.timestamp };
  }

  rememberVisitor() {
    if (this.isTrackingDenied()) return;
    if (this.sdk.get_property("$user_state") === "identified") return;

    this.saveContext({ anonymous_id: this.sdk.get_distinct_id() });
  }

  isTrackingDenied() {
    return (
      this.browserRequestsOptOut() ||
      this.hasStoredOptOut() ||
      this.trackingContext.preference === "denied" ||
      this.readContext()?.preference === "denied" ||
      Boolean(this.sdk?.has_opted_out_capturing())
    );
  }

  browserRequestsOptOut() {
    return this.environment.navigator.doNotTrack === "1" || this.environment.navigator.globalPrivacyControl === true;
  }

  hasStoredOptOut() {
    const key = "__ph_opt_in_out_" + this.config.token;

    try {
      return (
        this.environment.localStorage?.getItem(key) === "0" ||
        this.document.cookie.split("; ").some((value) => value === key + "=0")
      );
    } catch {
      return false;
    }
  }

  context() {
    return {
      ...(this.readContext() || this.trackingContext),
      preference: this.isTrackingDenied() ? "denied" : "unspecified",
    };
  }

  readContext() {
    try {
      const cookie = this.document.cookie.split("; ").find((value) => value.startsWith(this.cookieName + "="));
      const stored = cookie && JSON.parse(decodeURIComponent(cookie.slice(this.cookieName.length + 1)));
      if (stored?.version === 1) return this.restoreContext(stored);
    } catch {
      /* Analytics storage is optional. */
    }

    return null;
  }

  restoreContext(stored) {
    const context = {
      version: 1,
      preference: stored.preference === "denied" ? "denied" : "unspecified",
    };

    for (const key of ["anonymous_id", "attempt_id"]) {
      if (typeof stored[key] === "string" && /^[a-f0-9-]{36}$/i.test(stored[key])) context[key] = stored[key];
    }

    // The app owns signup attempts. Carry its fields through without starting, expiring, or completing them.
    if (context.attempt_id) {
      if (Number.isFinite(stored.attempt_started_at)) context.attempt_started_at = stored.attempt_started_at;
      if (typeof stored.attempt_pending === "boolean") context.attempt_pending = stored.attempt_pending;
    }

    if (stored.attribution && typeof stored.attribution === "object") {
      context.attribution = this.sanitizeStoredAttribution(stored.attribution);
    }

    return context;
  }

  sanitizeStoredAttribution(stored) {
    const attribution = {};
    for (const key of [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "landing_path",
      "referrer_host",
      "observed_at",
      "source_kind",
    ]) {
      const value = stored[key];
      if (typeof value === "string" && value.length <= 512) attribution[key] = value;
    }

    if (attribution.landing_path) attribution.landing_path = attribution.landing_path.split(/[?#]/)[0];

    return attribution;
  }

  saveContext(changes = {}) {
    // Ordinary writes apply only their own changes to the current shared state.
    // In particular, a stale tab must not erase, replay, or resurrect a signup attempt.
    const preference = this.isTrackingDenied() ? "denied" : "unspecified";
    const sharedContext = this.readContext() || this.trackingContext;
    this.trackingContext = { ...sharedContext, ...changes, preference };

    this.writeContextCookie();
  }

  writeContextCookie() {
    try {
      const domain = this.config.cookieDomain ? "; Domain=" + this.config.cookieDomain : "";
      const secure = this.environment.location.protocol === "https:" ? "; Secure" : "";

      this.document.cookie =
        this.cookieName +
        "=" +
        encodeURIComponent(JSON.stringify(this.trackingContext)) +
        "; Path=/; Max-Age=31536000; SameSite=Lax" +
        domain +
        secure;
    } catch {
      /* Tracking must never block navigation or authentication. */
    }
  }
}
