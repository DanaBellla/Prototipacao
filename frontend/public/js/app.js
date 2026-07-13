/* BandaConnection — App entry: register routes and boot.
 * Order matters: more specific patterns first. */
(function () {
  const R = window.Router;
  const V = window.Views;

  // Public routes
  R.on("/", (app) => V.landing(app));
  R.on("/login", (app) => V.login(app));
  R.on("/register", (app) => V.register(app, {}));
  R.on("/register/:role", (app, params) => V.register(app, params));

  // App routes (require auth)
  R.on("/feed", (app) => V.feed(app));
  R.on("/explore", (app) => V.explore(app));
  R.on("/events", (app) => V.explore(app, { tab: "events" }));
  R.on("/calendar", (app) => V.calendar && V.calendar(app));
  R.on("/messages", (app) => V.messages && V.messages(app));
  R.on("/messages/:userId", (app, params) => V.messages && V.messages(app, params));
  R.on("/notifications", (app) => V.notifications && V.notifications(app));
  R.on("/tickets", (app) => V.tickets && V.tickets(app));
  R.on("/checkout/:eventId", (app, params) => V.checkout && V.checkout(app, params));
  R.on("/profile/:id", (app, params) => V.profile(app, params));

  // Ensure default hash
  if (!location.hash) {
    if (window.Store.currentUser()) location.hash = "#/feed";
    else location.hash = "#/";
  }
  R.resolve();
})();
