/* BandaConnection — Hash-based router with pattern matching. */
(function () {
  const routes = []; // ordered list of { pattern, keys, render }

  function compile(pattern) {
    const keys = [];
    // Escape and convert :name -> ([^/]+)
    const regex =
      "^" +
      pattern
        .replace(/[.+*?^${}()|[\]\\]/g, "\\$&")
        .replace(/\/:([A-Za-z_][A-Za-z0-9_]*)/g, (_, k) => {
          keys.push(k);
          return "/([^/]+)";
        }) +
      "$";
    return { regex: new RegExp(regex), keys };
  }

  function on(pattern, render) {
    const { regex, keys } = compile(pattern);
    routes.push({ pattern, regex, keys, render });
  }

  function navigate(hash) {
    if (location.hash === hash) resolve();
    else location.hash = hash;
  }

  function resolve() {
    const raw = location.hash.replace(/^#/, "") || "/";
    const app = document.getElementById("app");
    if (!app) return;
    window.scrollTo({ top: 0 });

    for (const r of routes) {
      const m = raw.match(r.regex);
      if (m) {
        const params = {};
        r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
        r.render(app, params);
        return;
      }
    }
    // Fallback to first ("/") route
    if (routes[0]) routes[0].render(app, {});
  }

  window.Router = { on, navigate, resolve };
  window.addEventListener("hashchange", resolve);
})();
