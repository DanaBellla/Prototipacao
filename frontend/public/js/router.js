/* Sonora — Hash-based router. */
(function () {
  const routes = {};

  function on(path, render) {
    routes[path] = render;
  }

  function parse() {
    const raw = location.hash.replace(/^#/, "") || "/";
    // Support /profile/:id
    const parts = raw.split("/").filter(Boolean);
    return { raw, parts };
  }

  function navigate(hash) {
    if (location.hash === hash) resolve();
    else location.hash = hash;
  }

  function resolve() {
    const { raw, parts } = parse();
    const app = document.getElementById("app");
    if (!app) return;
    // Reset scroll
    window.scrollTo({ top: 0 });

    // Direct match
    if (routes[raw]) {
      routes[raw](app);
      return;
    }
    // Pattern match for /profile/:id
    if (parts[0] === "profile" && parts[1]) {
      routes["/profile/:id"] && routes["/profile/:id"](app, { id: parts[1] });
      return;
    }
    if (parts[0] === "register") {
      routes["/register"] && routes["/register"](app, { role: parts[1] });
      return;
    }
    // Fallback
    (routes["/"] || function () {})(app);
  }

  window.Router = { on, resolve, navigate };
  window.addEventListener("hashchange", resolve);
})();
