import { test } from "node:test";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { createAnalytics } from "./analyticsBrowser.mjs";

function browser({
  cookie = "",
  sharedCookies,
  denied = false,
  accountId = null,
  sdkAccountId = accountId,
  optedOut = false,
  syncContext,
  url = "https://app.test/sign_up?utm_source=launch&token=secret",
  surface = "app",
} = {}) {
  const events = [];
  let identified = Boolean(sdkAccountId);
  let distinctId = sdkAccountId || "11111111-1111-4111-8111-111111111111";
  let config;
  let resetCount = 0;
  const listeners = new Map();
  const localStorage = new Map();
  const jar =
    sharedCookies ||
    new Map(
      cookie
        .split("; ")
        .filter(Boolean)
        .map((c) => c.split("=")),
    );
  const doc = {
    referrer: "https://google.com/search?q=private",
    get cookie() {
      return [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
    },
    set cookie(value) {
      const [pair] = value.split(";");
      const [k, v] = pair.split("=");
      jar.set(k, v);
    },
    createElement: () => ({}),
    head: { appendChild() {} },
  };
  const sdk = {
    init(_token, options) {
      config = options;
      options.loaded(sdk);
    },
    get_distinct_id: () => distinctId,
    get_property: (key) => key === "$user_state" && (identified ? "identified" : "anonymous"),
    has_opted_out_capturing: () => denied,
    identify(id) {
      identified = true;
      distinctId = id;
    },
    reset() {
      identified = false;
      resetCount++;
      distinctId = "22222222-2222-4222-8222-222222222222";
    },
    resetGroups() {},
    capture(event, properties) {
      const payload = config.before_send({
        event,
        $set_once: { $initial_current_url: "https://private?token=secret" },
        properties: {
          distinct_id: distinctId,
          $current_url: "https://app.test/secret?token=x",
          $set: { email: "private" },
          ...properties,
        },
      });
      if (payload) events.push(payload);
    },
  };
  const env = {
    document: doc,
    navigator: {},
    location: new URL(url),
    localStorage: { getItem: (key) => localStorage.get(key), setItem: (key, value) => localStorage.set(key, value) },
    posthog: sdk,
    crypto: { randomUUID },
    addEventListener: (name, listener) => listeners.set(name, listener),
  };
  const tracker = createAnalytics(
    { enabled: true, token: "test", host: "https://us.i.posthog.com", cookieDomain: ".operately.test", optedOut },
    { environment: env, surface, accountId, syncContext },
  );
  return {
    tracker,
    events,
    doc,
    env,
    emit: (name) => listeners.get(name)?.(),
    get config() {
      return config;
    },
    get resetCount() {
      return resetCount;
    },
  };
}

test("first touch persists, signup attempt is reused, payload is sanitized", async () => {
  const b = browser();
  await b.tracker.visit({ path: "/sign_up", key: "/sign_up" });
  await b.tracker.visit({ path: "/sign_up/email", key: "/sign_up/email" });
  assert.equal(b.events.filter((e) => e.event === "signup_started").length, 1);
  assert.equal(b.events.filter((e) => e.event === "$pageview").length, 2);
  assert.equal(b.tracker.context().attribution.utm_source, "launch");
  assert.equal(b.tracker.context().attribution.landing_path, "/sign_up");
  assert.ok(!JSON.stringify(b.events).includes("secret"));
  assert.ok(!JSON.stringify(b.events).includes("private"));
  b.env.location = new URL("https://app.test/?utm_source=later");
  await b.tracker.visit({ path: "/", key: "/" });
  assert.equal(b.tracker.context().attribution.utm_source, "launch");
  assert.equal(b.config.capture_pageview, false);
  assert.equal(b.config.autocapture, false);
  assert.equal(b.config.save_campaign_params, false);
  assert.equal(b.config.save_referrer, false);
  assert.equal(b.config.disable_session_recording, true);
});

test("opt-outs suppress events and synchronize denial", async () => {
  const synchronizedPreferences = [];
  const b = browser({
    denied: true,
    syncContext: async (context) => {
      synchronizedPreferences.push(context.preference);
      return { optedOut: true };
    },
  });
  await b.tracker.visit({ path: "/", key: "/" });
  assert.deepEqual(b.events, []);
  assert.equal(b.tracker.context().preference, "denied");
  assert.deepEqual(synchronizedPreferences, ["denied"]);
});

test("account opt-out stays denied despite an old granted cookie", async () => {
  const synchronizedPreferences = [];
  const b = browser({
    cookie: "operately_analytics_v1=" + encodeURIComponent(JSON.stringify({ version: 1, preference: "granted" })),
    optedOut: true,
    syncContext: async (context) => {
      synchronizedPreferences.push(context.preference);
      return { optedOut: true };
    },
  });
  await b.tracker.visit({ path: "/", key: "/" });
  await b.tracker.visit({ path: "/new", key: "/new" });
  assert.deepEqual(b.events, []);
  assert.deepEqual(synchronizedPreferences, ["denied", "denied"]);
});

function sharedTabs() {
  // Subdomains share cookies, but each tab has its own tracker and origin's localStorage.
  const sharedCookies = new Map();
  const website = browser({ sharedCookies, url: "https://operately.test/", surface: "website" });
  const app = browser({ sharedCookies, url: "https://app.operately.test/" });
  const optOutInApp = () => {
    app.env.localStorage.setItem("__ph_opt_in_out_test", "0");
    app.emit("pagehide");
  };
  return { website, app, optOutInApp };
}

function storedPreference(tab) {
  const cookie = tab.doc.cookie.split("; ").find((value) => value.startsWith("operately_analytics_v1="));
  return JSON.parse(decodeURIComponent(cookie.split("=")[1])).preference;
}

test("an open website tab respects an app denial before sending events", async () => {
  const { website, optOutInApp } = sharedTabs();
  await website.tracker.visit({ path: "/", key: "/" });
  assert.equal(website.events.length, 1);
  optOutInApp();

  // Even a queued SDK event must recheck the shared cookie before sending.
  assert.equal(website.config.before_send({ event: "$pageview", properties: {} }), null);
  assert.equal(website.tracker.context().preference, "denied");
  await website.tracker.visit({ path: "/help", key: "/help" });
  assert.equal(website.events.length, 1);
  assert.equal(storedPreference(website), "denied");
});

test("page exit and logout cannot overwrite a shared denial with stale context", () => {
  for (const action of [(tab) => tab.emit("pagehide"), (tab) => tab.tracker.logout()]) {
    const { website, optOutInApp } = sharedTabs();
    optOutInApp();
    action(website);
    assert.equal(storedPreference(website), "denied");
  }
});

test("a server account denial reaches the shared cookie and other open tabs", async () => {
  const sharedCookies = new Map();
  const website = browser({ sharedCookies, url: "https://operately.test/", surface: "website" });
  const app = browser({
    sharedCookies,
    url: "https://app.operately.test/",
    syncContext: async () => ({ optedOut: true }),
  });
  await app.tracker.visit({ path: "/", key: "/" });
  assert.equal(storedPreference(app), "denied");
  await website.tracker.visit({ path: "/", key: "/" });
  assert.deepEqual(website.events, []);
});

test("DNT/GPC and blocked storage do not break product use", async () => {
  const b = browser();
  b.env.navigator.globalPrivacyControl = true;
  await b.tracker.visit({ path: "/", key: "/" });
  assert.deepEqual(b.events, []);
  assert.equal(b.tracker.context().preference, "denied");
});

test("company context clears outside company routes; successful logout resets identity", async () => {
  const b = browser({ accountId: "account" });
  await b.tracker.visit({ path: "/:companyId", key: "/one", companyId: "one" });
  await b.tracker.visit({ path: "/", key: "/" });
  assert.deepEqual(b.events[0].properties.$groups, { company: "one" });
  assert.deepEqual(b.events[1].properties.$groups, {});
  b.tracker.logout();
  assert.equal(b.resetCount, 1);
});

test("same navigation, rerenders, and fragment-only changes do not duplicate visits", async () => {
  const b = browser();
  await b.tracker.visit({ path: "/:companyId/projects/:id", key: "/company/projects/one" });
  b.env.location.hash = "#private";
  await b.tracker.visit({ path: "/:companyId/projects/:id", key: "/company/projects/one" });
  await b.tracker.visit({ path: "/:companyId/projects/:id", key: "/company/projects/two" });
  assert.equal(b.events.length, 2);
});

test("cookie metadata is allowlisted before any event is sent", async () => {
  const cookie =
    "operately_analytics_v1=" +
    encodeURIComponent(
      JSON.stringify({
        version: 1,
        attribution: { utm_source: "saved", email: "secret@example.com", landing_path: "/?token=secret" },
        credential: "secret",
      }),
    );
  const b = browser({ cookie });
  await b.tracker.visit({ path: "/", key: "/" });
  assert.ok(!JSON.stringify(b.events).includes("secret"));
  assert.equal(b.tracker.context().attribution.utm_source, "saved");
});

function signupEvents(tab) {
  return tab.events.filter((event) => event.event === "signup_started");
}

function storedContext(tab) {
  const cookie = tab.doc.cookie.split("; ").find((value) => value.startsWith("operately_analytics_v1="));
  return JSON.parse(decodeURIComponent(cookie.split("=")[1]));
}

test("closing an older marketing tab preserves the signup attempt across reload", async () => {
  const sharedCookies = new Map();
  const website = browser({ sharedCookies, url: "https://operately.test/?utm_source=launch", surface: "website" });
  await website.tracker.visit({ path: "/", key: "/" });
  const signup = browser({ sharedCookies });
  await signup.tracker.visit({ path: "/sign_up", key: "/sign_up" });
  const attemptId = signup.tracker.context().attempt_id;
  assert.ok(attemptId);
  assert.equal(signupEvents(signup).length, 1);

  website.emit("pagehide");
  assert.equal(storedContext(website).attempt_id, attemptId);
  assert.equal(storedContext(website).attempt_pending, false);

  const reloaded = browser({ sharedCookies });
  await reloaded.tracker.visit({ path: "/sign_up", key: "/sign_up" });
  assert.equal(reloaded.tracker.context().attempt_id, attemptId);
  assert.equal(reloaded.tracker.context().attribution.utm_source, "launch");
  assert.equal(signupEvents(reloaded).length, 0);
});

test("website writes preserve a pending signup without emitting or consuming it", async () => {
  const sharedCookies = new Map();
  let completeSync;
  const signup = browser({
    sharedCookies,
    syncContext: () =>
      new Promise((resolve) => {
        completeSync = resolve;
      }),
  });
  const visit = signup.tracker.visit({ path: "/sign_up", key: "/sign_up" });
  await new Promise((resolve) => setImmediate(resolve));
  const attemptId = signup.tracker.context().attempt_id;

  const website = browser({ sharedCookies, surface: "website", url: "https://operately.test/" });
  await website.tracker.visit({ path: "/", key: "/" });
  website.emit("pagehide");
  assert.equal(storedContext(website).attempt_id, attemptId);
  assert.equal(storedContext(website).attempt_pending, true);
  assert.equal(signupEvents(website).length, 0);

  completeSync({ optedOut: false });
  await visit;
  assert.equal(signupEvents(signup).length, 1);
  // This website tab cached pending=true before the signup event was captured.
  website.emit("pagehide");
  assert.equal(storedContext(website).attempt_pending, false);
});

for (const reset of ["authentication", "account switch", "logout"]) {
  test(`${reset} clears signup state without stale tabs resurrecting it`, async () => {
    const sharedCookies = new Map();
    const signup = browser({ sharedCookies });
    await signup.tracker.visit({ path: "/sign_up", key: "/sign_up" });
    const oldAttemptId = signup.tracker.context().attempt_id;
    const staleTab = browser({ sharedCookies, surface: "website", url: "https://operately.test/" });

    if (reset === "authentication") browser({ sharedCookies, accountId: "account", sdkAccountId: null });
    else if (reset === "account switch")
      browser({ sharedCookies, accountId: "new-account", sdkAccountId: "old-account" });
    else signup.tracker.logout();

    staleTab.emit("pagehide");
    const context = storedContext(staleTab);
    assert.equal(context.attempt_id, undefined);
    assert.equal(context.attempt_started_at, undefined);
    assert.equal(context.attempt_pending, undefined);

    const newSignup = browser({ sharedCookies });
    await newSignup.tracker.visit({ path: "/sign_up", key: "/sign_up" });
    assert.notEqual(newSignup.tracker.context().attempt_id, oldAttemptId);
    assert.equal(signupEvents(newSignup).length, 1);
  });
}

test("an older app tab reuses the shared attempt instead of starting another", async () => {
  const sharedCookies = new Map();
  const older = browser({ sharedCookies });
  const newer = browser({ sharedCookies });
  await newer.tracker.visit({ path: "/sign_up", key: "/sign_up" });
  await older.tracker.visit({ path: "/sign_up", key: "/sign_up" });
  assert.equal(older.tracker.context().attempt_id, newer.tracker.context().attempt_id);
  assert.equal(signupEvents(older).length, 0);
});

test("an expired shared attempt is not restored from an older tab's cache", async () => {
  const sharedCookies = new Map();
  const signup = browser({ sharedCookies });
  await signup.tracker.visit({ path: "/sign_up", key: "/sign_up" });
  const original = storedContext(signup);
  sharedCookies.set(
    "operately_analytics_v1",
    encodeURIComponent(
      JSON.stringify({
        ...original,
        attempt_started_at: Date.now() - 25 * 60 * 60 * 1000,
      }),
    ),
  );
  signup.emit("pagehide");
  assert.equal(storedContext(signup).attempt_id, undefined);

  const reloaded = browser({ sharedCookies });
  await reloaded.tracker.visit({ path: "/sign_up", key: "/sign_up" });
  assert.notEqual(reloaded.tracker.context().attempt_id, original.attempt_id);
  assert.equal(signupEvents(reloaded).length, 1);
});
