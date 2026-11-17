(() => {
  const bridge = "https://kairos-crm-vendas.agenciakairosdigital.chatgpt.site/api/meta";
  const pixelId = "1911595020205312";
  const preferenceKey = "kairos-marketing-consent";
  const plans = new Set(["starter", "pro", "ultimate"]);
  const cookie = name => document.cookie.split("; ").find(part => part.startsWith(name + "="))?.slice(name.length + 1);
  const panel = document.querySelector("[data-marketing-consent]");
  const settings = document.querySelector("[data-marketing-settings]");
  let choice;
  let sentPageView = false;
  let lastClickId;

  try {
    choice = localStorage.getItem(preferenceKey);
  } catch {
    choice = null;
  }

  function enablePixel() {
    if (!window.fbq) {
      const fbq = function (...args) {
        if (fbq.callMethod) fbq.callMethod(...args);
        else fbq.queue.push(args);
      };
      fbq.queue = [];
      fbq.version = "2.0";
      fbq.loaded = true;
      fbq.push = fbq;
      window.fbq = fbq;
      window._fbq = fbq;
      fbq("consent", "grant");
      fbq("set", "autoConfig", false, pixelId);
      fbq("init", pixelId);
      const tag = document.createElement("script");
      tag.async = true;
      tag.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.append(tag);
    } else {
      window.fbq("consent", "grant");
    }
  }

  function attribution() {
    const fromCookie = cookie("_fbc");
    const currentClick = new URLSearchParams(location.search).get("fbclid");
    if (currentClick && /^[a-zA-Z0-9_.-]{1,500}$/.test(currentClick)) {
      if (fromCookie?.endsWith("." + currentClick)) return fromCookie;
      lastClickId ||= `fb.1.${Date.now()}.${currentClick}`;
      return lastClickId;
    }
    return fromCookie;
  }

  function send(name, plan) {
    if (choice !== "accepted") return;
    const id = crypto.randomUUID();
    const params = plan ? { plan } : {};
    window.fbq(name === "SelectPlan" || name === "RegistrationClick" ? "trackCustom" : "track", name, params, { eventID: id });
    const body = JSON.stringify({
      name, id, path: location.pathname, marketing: true, plan,
      fbp: cookie("_fbp"), fbc: attribution(),
    });
    fetch(bridge + "/events", {
      method: "POST",
      credentials: "omit",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body,
      keepalive: true,
    }).catch(() => {});
  }

  function applyChoice(value) {
    choice = value;
    try {
      localStorage.setItem(preferenceKey, value);
    } catch {
      // The choice still applies to the current page.
    }
    panel.hidden = true;
    if (value === "accepted") {
      enablePixel();
      if (!sentPageView) {
        sentPageView = true;
        send("PageView");
      }
    } else if (window.fbq) {
      window.fbq("consent", "revoke");
      for (const name of ["_fbp", "_fbc"]) {
        document.cookie = name + "=; Max-Age=0; Path=/; Secure; SameSite=Lax";
        if (location.hostname.endsWith(".kairoscrm.online")) {
          document.cookie = name + "=; Max-Age=0; Path=/; Domain=kairoscrm.online; Secure; SameSite=Lax";
        }
      }
      lastClickId = undefined;
    }
  }

  function recordClick(event) {
    const link = event.target.closest("a[href]");
    if (!link || !event.isTrusted || choice !== "accepted") return;
    const url = new URL(link.href, location.href);
    if (url.origin !== "https://kairoscrm.online") return;
    if (url.pathname === "/p/whatsapp-duvidas") {
      send("Contact");
    } else if (url.pathname === "/register") {
      const plan = url.searchParams.get("plan")?.replace(/^kairoscrm-plano-/, "");
      if (plans.has(plan)) send("SelectPlan", plan);
      else send("RegistrationClick");
    }
  }

  if (!panel || !settings) return;
  settings.hidden = false;
  settings.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) panel.querySelector("[data-choice]").focus();
  });
  for (const button of panel.querySelectorAll("[data-choice]")) {
    button.addEventListener("click", () => {
      applyChoice(button.dataset.choice);
      settings.focus({ preventScroll: true });
    });
  }
  document.addEventListener("click", recordClick);
  if (choice === "accepted") applyChoice(choice);
  else if (choice !== "rejected") panel.hidden = false;
})();
