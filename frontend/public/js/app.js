/* BandaConnection — App entry: register routes and boot. */
(function () {
  const R = window.Router;
  const V = window.Views;

  R.on("/", (app) => V.landing(app));
  R.on("/login", (app) => V.login(app));
  R.on("/register", (app) => V.register(app));
  R.on("/register/:role", (app, params) => V.register(app, params));
  R.on("/feed", (app) => V.feed(app));
  R.on("/explore", (app) => V.explore(app));
  R.on("/profile/:id", (app, params) => V.profile(app, params));

  // Ensure default hash
  if (!location.hash) {
    // If already logged in, go to feed; else stay on landing
    if (window.Store.currentUser()) location.hash = "#/feed";
    else location.hash = "#/";
  }
  R.resolve();
})();
