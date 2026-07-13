/* BandaConnection — Notifications view. */
(function () {
  const { esc, timeAgo } = window.UI;

  const ICONS = {
    like: { icon: "ph-heart", color: "#ec4899" },
    comment: { icon: "ph-chat-circle-dots", color: "#8b5cf6" },
    follow: { icon: "ph-user-plus", color: "#10b981" },
    proposal: { icon: "ph-paper-plane-tilt", color: "#f59e0b" },
    event: { icon: "ph-calendar-star", color: "#3b82f6" },
    ticket: { icon: "ph-ticket", color: "#a78bfa" },
  };

  function textFor(n) {
    const from = n.from ? window.Store.state.users.find((u) => u.id === n.from) : null;
    const fromName = from ? from.name : "BandaConnection";
    const map = {
      like: `${fromName} curtiu sua publicação.`,
      comment: `${fromName} comentou na sua publicação.`,
      follow: `${fromName} começou a seguir você.`,
      proposal: `${fromName} enviou uma nova proposta de show.`,
      event: `Um evento que você segue foi atualizado.`,
      ticket: `Seu ingresso foi confirmado com sucesso.`,
    };
    return map[n.type] || `Nova atividade em seu perfil.`;
  }

  function renderNotifications(app) {
    if (!window.Auth.require()) return;
    const me = window.Store.currentUser();
    const list = window.Store.notificationsFor(me.id);

    const main = `
      <div data-testid="notifications-view">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
          <div>
            <h1 style="font-size:32px;margin-bottom:6px;">Notificações</h1>
            <p class="text-muted" style="margin:0;">${list.filter((n) => !n.read).length} não lidas</p>
          </div>
          <button class="btn btn-ghost btn-sm" data-action="mark-read" data-testid="mark-all-read-btn">
            <i class="ph ph-check"></i> Marcar todas como lidas
          </button>
        </div>

        ${list.length === 0
          ? `<div style="background:var(--bg-surface);border:1px dashed var(--border-strong);border-radius:16px;padding:60px 20px;text-align:center;">
              <div style="width:72px;height:72px;border-radius:50%;background:var(--color-primary-soft);color:var(--color-primary);display:inline-flex;align-items:center;justify-content:center;margin-bottom:18px;">
                <i class="ph ph-bell" style="font-size:34px;"></i>
              </div>
              <h3 style="font-size:20px;margin-bottom:6px;">Tudo em dia por aqui!</h3>
              <p class="text-muted" style="margin:0;">Quando algo novo acontecer, você verá aqui primeiro.</p>
            </div>`
          : `<div style="display:flex;flex-direction:column;gap:8px;">
              ${list.map((n) => {
                const cfg = ICONS[n.type] || ICONS.like;
                return `
                  <div class="notif-item" data-testid="notif-${n.id}" style="display:flex;align-items:center;gap:14px;padding:16px;background:${n.read ? "var(--bg-surface)" : "var(--color-primary-soft)"};border:1px solid var(--border-subtle);border-radius:14px;">
                    <div style="width:44px;height:44px;border-radius:50%;background:${cfg.color}22;color:${cfg.color};display:flex;align-items:center;justify-content:center;">
                      <i class="ph-fill ${cfg.icon}" style="font-size:22px;"></i>
                    </div>
                    <div style="flex:1;">
                      <div style="font-size:14px;">${esc(textFor(n))}</div>
                      <div class="text-muted" style="font-size:12px;">${esc(timeAgo(n.time))}</div>
                    </div>
                    ${!n.read ? '<span style="width:10px;height:10px;border-radius:50%;background:var(--color-primary);"></span>' : ""}
                  </div>
                `;
              }).join("")}
            </div>`}
      </div>
    `;

    app.innerHTML = window.Shell.renderShell("notifications", main, `
      <h4>Sobre as notificações</h4>
      <div class="trend">
        <div class="cat">Configurações</div>
        <div class="title">Personalize seus alertas</div>
        <div class="meta">Chegando na próxima atualização.</div>
      </div>
    `);
    window.Shell.wireShell(app);

    app.querySelectorAll('[data-action="mark-read"]').forEach((b) =>
      b.addEventListener("click", () => {
        window.Store.markAllRead(me.id);
        renderNotifications(app);
        window.UI.toast("Todas as notificações foram marcadas como lidas.", { type: "success" });
      })
    );
  }

  window.Views = window.Views || {};
  window.Views.notifications = renderNotifications;
})();
