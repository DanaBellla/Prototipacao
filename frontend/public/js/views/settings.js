/* BandaConnection — Account preferences. */
(function () {
  const { esc } = window.UI;

  function renderSettings(app) {
    if (!window.Auth.require()) return;
    const user = window.Store.currentUser();
    const main = `
      <div class="settings-view" data-testid="settings-view">
        <header class="settings-heading">
          <h1>Configurações</h1>
          <p class="text-muted">Preferências da sua conta e localização.</p>
        </header>
        <form id="settings-form" data-testid="settings-form">
          <section class="settings-section">
            <h2>Localização</h2>
            <p class="text-muted">Usada para aproximar os shows do seu cronograma.</p>
            <div class="form-row">
              <div class="form-group"><label for="settings-city">Cidade</label><input id="settings-city" name="city" value="${esc(user.city || "")}" placeholder="Ex.: São Paulo" /></div>
              <div class="form-group"><label for="settings-state">Estado</label><input id="settings-state" name="state" value="${esc(user.state || "")}" maxlength="2" placeholder="Ex.: SP" /></div>
            </div>
          </section>
          <section class="settings-section">
            <h2>Aparência</h2>
            <p class="text-muted">Escolha o tema da plataforma.</p>
            <div class="form-group"><label for="settings-theme">Tema</label><select id="settings-theme" name="theme"><option value="dark" ${window.Store.state.theme === "dark" ? "selected" : ""}>Escuro</option><option value="light" ${window.Store.state.theme === "light" ? "selected" : ""}>Claro</option></select></div>
          </section>
          ${user.role === "musician" || user.role === "venue" ? `
            <section class="settings-section">
              <h2>Links públicos</h2>
              <p class="text-muted">Adicione seus canais para que as pessoas encontrem seu trabalho.</p>
              ${user.role === "musician" ? `<div class="form-row">
                <div class="form-group"><label for="settings-instagram">Instagram</label><input id="settings-instagram" name="instagram" value="${esc(user.instagram || "")}" placeholder="@seuperfil" /></div>
                <div class="form-group"><label for="settings-spotify">Spotify</label><input id="settings-spotify" name="spotify" value="${esc(user.spotify || "")}" placeholder="Artista ou link do perfil" /></div>
              </div>` : `<div class="form-group"><label for="settings-instagram">Instagram</label><input id="settings-instagram" name="instagram" value="${esc(user.instagram || "")}" placeholder="@seuestabelecimento" /></div>`}
            </section>
          ` : ""}
          <button class="btn btn-primary" type="submit" data-testid="save-settings-btn"><i class="ph ph-floppy-disk"></i> Salvar configurações</button>
        </form>
        <section class="settings-section settings-account">
          <h2>Conta</h2>
          <div><span>Nome</span><strong>${esc(user.name)}</strong></div>
          <div><span>E-mail</span><strong>${esc(user.email)}</strong></div>
          <a class="btn btn-ghost" href="#/profile/${user.id}" data-testid="settings-profile-link"><i class="ph ph-user-circle"></i> Abrir meu perfil</a>
        </section>
      </div>
    `;
    app.innerHTML = window.Shell.renderShell("settings", main, `
      <h4>Personalização</h4>
      <div class="trend"><div class="title">Sua localização</div><div class="meta">Os filtros do cronograma usam cidade e estado para encontrar shows próximos.</div></div>
    `);
    window.Shell.wireShell(app);
    app.querySelector("#settings-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      const updates = {
        city: String(values.city || "").trim(),
        state: String(values.state || "").trim().toUpperCase(),
      };
      if (user.role === "musician" || user.role === "venue") updates.instagram = String(values.instagram || "").trim();
      if (user.role === "musician") updates.spotify = String(values.spotify || "").trim();
      window.Store.updateUser(user.id, updates);
      window.Store.setTheme(values.theme);
      window.UI.toast("Configurações salvas.", { type: "success" });
      window.Router.resolve();
    });
  }

  window.Views = window.Views || {};
  window.Views.settings = renderSettings;
})();