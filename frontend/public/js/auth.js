/* Sonora — Auth guards. */
(function () {
  window.Auth = {
    isAuthed() {
      return !!(window.Store && window.Store.currentUser());
    },
    require(redirect = "#/login") {
      if (!this.isAuthed()) {
        location.hash = redirect;
        return false;
      }
      return true;
    },
  };
})();
