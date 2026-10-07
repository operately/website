import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createAnalytics } from "./analyticsBrowser.mjs";

const cookieName = "operately_analytics_v1";

function browser({
  sharedCookies = new Map(),
  referrer = "",
  identified = false,
  sdkDenied = false,
  enabled = true,
  loadSdk = true,
} = {}) {
  const events = [];
  const listeners = new Map();
  const localStorage = new Map();
  const scripts = [];
  let sdkOptions;
  let groupsCleared = 0;
  const visitorId = identified ? "existing-account" : "11111111-1111-4111-8111-111111111111";
  const document = {
    referrer,
    get cookie() {
      return [...sharedCookies].map(([key, value]) => `${key}=${value}`).join("; ");
    },
    set cookie(value) {
      const [key, stored] = value.split(";")[0].split("=");
      sharedCookies.set(key, stored);
    },
    createElement: () => ({}),
    head: { appendChild: (script) => scripts.push(script) },
  };
  // There are deliberately no account-identification or logout methods on this SDK fixture.
  const sdk = {
    init(_token, options) {
      sdkOptions = options;
      options.loaded(this);
    },
    get_distinct_id: () => visitorId,
    get_property: () => (identified ? "identified" : "anonymous"),
    has_opted_out_capturing: () => sdkDenied,
    resetGroups() {
      groupsCleared++;
    },
    capture(event, properties) {
      const payload = sdkOptions.before_send({
        event,
        $set_once: { $initial_current_url: "https://private?token=secret" },
        properties: {
          distinct_id: visitorId,
          $current_url: "https://private?token=secret",
          $set: { email: "secret" },
          ...properties,
        },
      });
      if (payload) events.push(payload);
    },
  };
  const environment = {
    document,
    navigator: {},
    location: new URL("https://operately.test/?utm_source=launch&token=secret"),
    localStorage: { getItem: (key) => localStorage.get(key), setItem: (key, value) => localStorage.set(key, value) },
    posthog: loadSdk ? sdk : undefined,
    crypto: { randomUUID },
    addEventListener: (name, callback) => listeners.set(name, callback),
  };
  const tracker = createAnalytics(
    {
      enabled,
      token: "test",
      host: "https://us.i.posthog.com",
      cookieDomain: ".operately.test",
    },
    { environment },
  );
  return {
    tracker,
    events,
    environment,
    document,
    scripts,
    emit: (name) => listeners.get(name)?.(),
    stored: () => JSON.parse(decodeURIComponent(sharedCookies.get(cookieName))),
    get sdkOptions() {
      return sdkOptions;
    },
    get groupsCleared() {
      return groupsCleared;
    },
  };
}

function writeAppContext(cookies, context) {
  cookies.set(cookieName, encodeURIComponent(JSON.stringify({ version: 1, preference: "unspecified", ...context })));
}

test("website pageviews preserve visitor identity and first-touch attribution and sanitize payloads", async () => {
  const b = browser();
  await b.tracker.visit({ path: "/", key: "/" });
  b.environment.location = new URL("https://operately.test/help?utm_source=later");
  await b.tracker.visit({ path: "/help", key: "/help" });
  assert.deepEqual(
    b.events.map((event) => event.event),
    ["$pageview", "$pageview"],
  );
  assert.equal(b.events[0].properties.distinct_id, b.events[1].properties.distinct_id);
  assert.equal(b.tracker.context().anonymous_id, b.events[0].properties.distinct_id);
  assert.equal(b.events[1].properties.acquisition.utm_source, "launch");
  assert.equal(b.events[1].properties.acquisition.landing_path, "/");
  assert.equal(b.events[1].properties.$current_url, "https://operately.test/help");
  assert.equal(b.events[1].properties.surface, "website");
  assert.ok(!JSON.stringify(b.events).includes("secret"));
  assert.equal(b.sdkOptions.autocapture, false);
  assert.equal(b.sdkOptions.capture_pageview, false);
  assert.equal(b.sdkOptions.disable_session_recording, true);
});

test("duplicate lifecycle events and fragment changes do not add pageviews", async () => {
  const b = browser();
  await b.tracker.visit({ path: "/", key: "/" });
  b.environment.location.hash = "#section";
  await b.tracker.visit({ path: "/", key: "/" });
  assert.equal(b.events.length, 1);
});

test("direct, external, and internal referrals are classified without campaign parameters", async () => {
  for (const [referrer, kind, host] of [
    ["", "direct", ""],
    ["https://google.com/search?q=private", "referral", "google.com"],
    ["https://app.operately.test/", "unknown", ""],
  ]) {
    const b = browser({ referrer });
    b.environment.location.search = "";
    await b.tracker.visit({ path: "/", key: "/" });
    assert.equal(b.tracker.context().attribution.source_kind, kind);
    assert.equal(b.tracker.context().attribution.referrer_host, host);
  }
});

test("browser privacy signals and existing SDK opt-outs suppress website tracking", async () => {
  for (const signal of ["doNotTrack", "globalPrivacyControl", "posthog"]) {
    const b = browser({ sdkDenied: signal === "posthog" });
    if (signal === "doNotTrack") b.environment.navigator.doNotTrack = "1";
    if (signal === "globalPrivacyControl") b.environment.navigator.globalPrivacyControl = true;
    await b.tracker.visit({ path: "/", key: "/" });
    assert.deepEqual(b.events, []);
    assert.equal(b.stored().preference, "denied");
  }
});

test("an open website tab respects and preserves an app denial", async () => {
  const sharedCookies = new Map();
  const b = browser({ sharedCookies });
  await b.tracker.visit({ path: "/", key: "/" });
  writeAppContext(sharedCookies, { ...b.stored(), preference: "denied" });
  assert.equal(b.sdkOptions.before_send({ event: "$pageview", properties: {} }), null);
  b.emit("pagehide");
  await b.tracker.visit({ path: "/help", key: "/help" });
  assert.equal(b.events.length, 1);
  assert.equal(b.stored().preference, "denied");
});

test("an older website tab preserves an app signup attempt across page exit and reload", async () => {
  const sharedCookies = new Map();
  const older = browser({ sharedCookies });
  await older.tracker.visit({ path: "/", key: "/" });
  const appContext = {
    ...older.stored(),
    attempt_id: randomUUID(),
    attempt_started_at: Date.now(),
    attempt_pending: false,
  };
  writeAppContext(sharedCookies, appContext);
  older.emit("pagehide");
  const reloaded = browser({ sharedCookies });
  await reloaded.tracker.visit({ path: "/help", key: "/help" });
  assert.equal(reloaded.stored().attempt_id, appContext.attempt_id);
  assert.equal(reloaded.stored().attempt_pending, false);
  assert.equal(reloaded.stored().attribution.utm_source, "launch");
});

test("the website preserves app-owned pending and expired signup state without acting on it", async () => {
  const sharedCookies = new Map();
  const attempt = {
    attempt_id: randomUUID(),
    attempt_started_at: Date.now() - 25 * 60 * 60 * 1000,
    attempt_pending: true,
  };
  writeAppContext(sharedCookies, attempt);
  const b = browser({ sharedCookies });
  await b.tracker.visit({ path: "/sign_up", key: "/sign_up" });
  b.emit("pagehide");
  assert.equal(b.stored().attempt_id, attempt.attempt_id);
  assert.equal(b.stored().attempt_started_at, attempt.attempt_started_at);
  assert.equal(b.stored().attempt_pending, true);
  assert.deepEqual(
    b.events.map((event) => event.event),
    ["$pageview"],
  );
  assert.equal(b.events[0].properties.attempt_id, undefined);
});

test("website tabs do not restore signup state cleared or completed by the app", async () => {
  const sharedCookies = new Map();
  writeAppContext(sharedCookies, {
    attempt_id: randomUUID(),
    attempt_started_at: Date.now(),
    attempt_pending: true,
  });
  const b = browser({ sharedCookies });
  writeAppContext(sharedCookies, { ...b.stored(), attempt_pending: false });
  b.emit("pagehide");
  assert.equal(b.stored().attempt_pending, false);
  writeAppContext(sharedCookies, {});
  b.emit("pagehide");
  assert.equal(b.stored().attempt_id, undefined);
  await b.tracker.visit({ path: "/help", key: "/help" });
  assert.deepEqual(
    b.events.map((event) => event.event),
    ["$pageview"],
  );
});

test("an app-identified visitor keeps their SDK identity without company context", async () => {
  const b = browser({ identified: true });
  await b.tracker.visit({ path: "/", key: "/" });
  assert.equal(b.events[0].properties.distinct_id, "existing-account");
  assert.equal(b.tracker.context().anonymous_id, undefined);
  assert.deepEqual(b.events[0].properties.$groups, {});
  assert.equal(b.groupsCleared, 1);
});

test("untrusted cookie metadata cannot enter pageview properties", async () => {
  const sharedCookies = new Map();
  writeAppContext(sharedCookies, {
    attribution: {
      utm_source: "saved",
      landing_path: "/?token=secret",
      email: "secret",
    },
  });
  const b = browser({ sharedCookies });
  await b.tracker.visit({ path: "/", key: "/" });
  assert.equal(b.events[0].properties.acquisition.utm_source, "saved");
  assert.ok(!JSON.stringify(b.events).includes("secret"));
});

test("SDK load failure preserves attribution and never blocks navigation", async () => {
  const b = browser({ loadSdk: false });
  const visit = b.tracker.visit({ path: "/", key: "/" });
  assert.equal(b.stored().attribution.utm_source, "launch");
  b.scripts[0].onerror();
  await visit;
  assert.deepEqual(b.events, []);
});

test("disabled website tracking does not load the SDK or write cookies", async () => {
  const b = browser({ enabled: false });
  await b.tracker.visit({ path: "/", key: "/" });
  assert.equal(b.document.cookie, "");
  assert.equal(b.sdkOptions, undefined);
});
