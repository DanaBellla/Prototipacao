/* BandaConnection — App shell (sidebar + main + right panel). */
(function () {
  const { esc } = window.UI;

  function roleLabel(role) {
    return {
      musician: "Músico",
      venue: "Estabelecimento",
      listener: "Ouvinte",
    }[role] || "Membro";
  }

  function renderShell(activeKey, mainContent, rightContent) {
    const u = window.Store.currentUser();
    if (!u) { location.hash = "#/login"; return ""; }
    const theme = window.Store.state.theme;

    const nav = [
      { key: "feed", href: "#/feed", icon: "ph-house", label: "Início" },
      { key: "explore", href: "#/explore", icon: "ph-compass", label: "Explorar" },
      { key: "calendar", href: "#/calendar", icon: "ph-calendar-star", label: "Cronograma" },
      { key: "tickets", href: "#/tickets", icon: "ph-ticket", label: "Meus Ingressos" },
      { key: "messages", href: "#/messages", icon: "ph-chat-circle-dots", label: "Mensagens" },
      { key: "notifications", href: "#/notifications", icon: "ph-bell", label: "Notificações" },
      { key: "profile", href: `#/profile/${u.id}`, icon: "ph-user-circle", label: "Perfil" },
    ];

    const bottom = [
      { key: "feed", href: "#/feed", icon: "ph-house", label: "Início" },
      { key: "explore", href: "#/explore", icon: "ph-compass", label: "Explorar" },
      { key: "calendar", href: "#/calendar", icon: "ph-calendar-star", label: "Agenda" },
      { key: "messages", href: "#/messages", icon: "ph-chat-circle-dots", label: "Mensagens" },
      { key: "profile", href: `#/profile/${u.id}`, icon: "ph-user-circle", label: "Perfil" },
    ];

    return `
      <div class="app-shell" data-testid="app-shell">
        <aside class="sidebar" data-testid="sidebar">
          <a href="#/" class="brand"><span class="brand-mark"><i class="ph-fill ph-music-notes"></i></span> BandaConnection</a>
          <nav>
            <ul class="side-nav">
              ${nav.map((n) => `
                <li>
                  <a href="${n.href}" class="${activeKey === n.key ? "active" : ""}" data-testid="side-nav-${n.key}">
                    <i class="ph ${n.icon}"></i> ${n.label}
                  </a>
                </li>
              `).join("")}
            </ul>
          </nav>
          <div class="side-foot">
            <div class="side-user" data-testid="side-user-card">
              <img src="${esc(u.avatar)}" alt="${esc(u.name)}" />
              <div class="info">
                <strong>${esc(u.name)}</strong>
                <span>${esc(roleLabel(u.role))}</span>
              </div>
              <button class="btn-icon" data-testid="theme-toggle-button" aria-label="Alternar tema" data-action="toggle-theme">
                <i class="ph ${theme === "dark" ? "ph-sun" : "ph-moon"}"></i>
              </button>
            </div>
            <button class="btn btn-ghost btn-sm btn-block" style="margin-top:10px;" data-testid="logout-btn" data-action="logout">
              <i class="ph ph-sign-out"></i> Sair
            </button>
          </div>
        </aside>

        <section class="main-col">
          <header class="main-header" data-testid="main-header">
            <div class="searchbar">
              <i class="ph ph-magnifying-glass"></i>
              <input placeholder="Buscar músicos, casas, eventos, cidades..." data-testid="global-search-input" />
            </div>
            <div class="header-actions">
              <button class="btn-icon" aria-label="Notificações" data-testid="header-notifications-btn" onclick="location.hash='#/notifications'"><i class="ph ph-bell"></i></button>
              <button class="btn-icon" aria-label="Mensagens" data-testid="header-messages-btn" onclick="location.hash='#/messages'"><i class="ph ph-chat-circle-dots"></i></button>
            </div>
          </header>
          <div class="main-body">${mainContent}</div>
        </section>

        <aside class="right-panel" data-testid="right-panel">${rightContent}</aside>

        <nav class="bottom-nav" data-testid="bottom-nav">
          ${bottom.map((b) => `
            <a href="${b.href}" class="${activeKey === b.key ? "active" : ""}" data-testid="bottom-${b.key}">
              <i class="ph ${b.icon}"></i>
              <span>${b.label}</span>
            </a>
          `).join("")}
        </nav>
      </div>
    `;
  }

  function wireShell(app) {
    app.querySelectorAll('[data-action="logout"]').forEach((b) =>
      b.addEventListener("click", () => {
        window.Store.logout();
        window.UI.toast("Você saiu da conta.", { type: "info", title: "Até logo" });
        location.hash = "#/";
      })
    );
    app.querySelectorAll('[data-action="toggle-theme"]').forEach((b) =>
      b.addEventListener("click", () => {
        window.Store.toggleTheme();
        window.Router.resolve();
      })
    );
  }

  window.Shell = { renderShell, wireShell, roleLabel };
})();
