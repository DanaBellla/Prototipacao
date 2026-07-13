/* BandaConnection — Public profile views (Musician / Venue / Listener). */
(function () {
  const { esc } = window.UI;

  function renderRight(user) {
    return `
      <h4>Sobre</h4>
      <div class="trend">
        <div class="title">${esc(user.name)}</div>
        <div class="meta">${esc(user.city || "—")}, ${esc(user.state || "")}</div>
      </div>
      ${user.role === "musician" ? `
        <h4 style="margin-top:24px;">Links do artista</h4>
        <div class="trends">
          <div class="trend"><div class="cat">Instagram</div><div class="title">${esc(user.instagram || "@" + (user.artistName || user.name).toLowerCase().replaceAll(" ", ""))}</div></div>
          <div class="trend"><div class="cat">Spotify</div><div class="title">${esc(user.spotify || user.artistName || user.name)}</div></div>
        </div>
      ` : ""}
      ${user.role === "venue" ? `
        <h4 style="margin-top:24px;">Contato</h4>
        <div class="trends">
          <div class="trend"><div class="cat">Endereço</div><div class="title" style="font-size:14px;">${esc(user.address || "—")}</div></div>
          <div class="trend"><div class="cat">Funcionamento</div><div class="title" style="font-size:14px;">${esc(user.hours || "—")}</div></div>
        </div>
      ` : ""}
    `;
  }

  function renderProfile(app, params = {}) {
    if (!window.Auth.require()) return;
    const s = window.Store.state;
    const user = s.users.find((u) => u.id === params.id);
    if (!user) {
      app.innerHTML = window.Shell.renderShell(
        "profile",
        `<div style="text-align:center;padding:64px 16px;">
          <h2>Perfil não encontrado.</h2>
          <p class="text-muted">O usuário que você procura não existe ou foi removido.</p>
          <a href="#/explore" class="btn btn-primary" data-testid="profile-back-btn">Voltar para Explorar</a>
        </div>`,
        ""
      );
      window.Shell.wireShell(app);
      return;
    }

    const isMusician = user.role === "musician";
    const isVenue = user.role === "venue";
    const isOwn = s.currentUserId === user.id;

    const primaryCTA = isOwn
      ? `<button class="btn btn-ghost" data-testid="edit-profile-btn"><i class="ph ph-pencil-simple"></i> Editar perfil</button>`
      : isMusician
      ? `<button class="btn btn-primary" data-action="send-proposal" data-testid="send-proposal-btn"><i class="ph ph-paper-plane-tilt"></i> Enviar Proposta</button>`
      : isVenue
      ? `<button class="btn btn-primary" data-action="hire-band" data-testid="hire-band-btn"><i class="ph ph-handshake"></i> Contratar Banda</button>`
      : `<button class="btn btn-primary" data-testid="follow-primary-btn"><i class="ph ph-plus"></i> Seguir</button>`;

    const secondaryCTA = isOwn
      ? ""
      : `<button class="btn btn-ghost" data-testid="message-btn"><i class="ph ph-chat-circle"></i> Mensagem</button>
         <button class="btn-icon" aria-label="Compartilhar" data-testid="share-profile-btn"><i class="ph ph-share-network"></i></button>`;

    const stats = isMusician
      ? [
          { num: user.followers, lbl: "Seguidores" },
          { num: user.shows, lbl: "Shows realizados" },
          { num: user.rating, lbl: "Avaliação" },
        ]
      : isVenue
      ? [
          { num: user.followers, lbl: "Seguidores" },
          { num: user.capacity || "—", lbl: "Capacidade" },
          { num: user.rating, lbl: "Avaliação" },
        ]
      : [{ num: user.followers, lbl: "Seguidores" }];

    const tags = isMusician
      ? (user.genres || []).map((g) => `<span class="badge">${esc(g)}</span>`).join("")
      : isVenue
      ? [
          user.category ? `<span class="badge">${esc(user.category)}</span>` : "",
          user.city ? `<span class="badge badge-muted"><i class="ph ph-map-pin"></i> ${esc(user.city)}, ${esc(user.state)}</span>` : "",
        ].join("")
      : `<span class="badge">Ouvinte</span>`;

    const bio = user.bio
      ? `<p>${esc(user.bio)}</p>`
      : `<p class="text-muted">Este perfil ainda não escreveu uma bio.</p>`;

    const infoRows = isMusician
      ? `
        ${user.city ? `<div class="info-row"><i class="ph ph-map-pin"></i> ${esc(user.city)}, ${esc(user.state || "")}</div>` : ""}
        ${user.cache ? `<div class="info-row"><i class="ph ph-currency-circle-dollar"></i> Cachê médio: ${esc(user.cache)}</div>` : ""}
        ${user.duration ? `<div class="info-row"><i class="ph ph-clock"></i> Duração média: ${esc(user.duration)}</div>` : ""}
        ${user.bandName ? `<div class="info-row"><i class="ph ph-users-three"></i> Banda: ${esc(user.bandName)}</div>` : ""}
      `
      : isVenue
      ? `
        ${user.address ? `<div class="info-row"><i class="ph ph-map-pin"></i> ${esc(user.address)}</div>` : ""}
        ${user.hours ? `<div class="info-row"><i class="ph ph-clock"></i> ${esc(user.hours)}</div>` : ""}
        ${user.capacity ? `<div class="info-row"><i class="ph ph-users-three"></i> Capacidade: ${user.capacity} pessoas</div>` : ""}
      `
      : `
        ${user.city ? `<div class="info-row"><i class="ph ph-map-pin"></i> ${esc(user.city)}, ${esc(user.state || "")}</div>` : ""}
      `;

    const gallery = (user.gallery || []).length
      ? `<div class="gallery" data-testid="profile-gallery">
           ${user.gallery.map((src) => `<img src="${esc(src)}" alt="Galeria de ${esc(user.name)}" loading="lazy" />`).join("")}
         </div>`
      : "";

    const upcoming = (user.shows_upcoming || []).length
      ? `<div class="upcoming-shows" data-testid="upcoming-shows">
           <h3>Próximos shows</h3>
           ${user.shows_upcoming.map((s) => `
             <div class="show-item">
               <div class="show-date"><div class="d">${esc(s.date)}</div><div class="m">${esc(s.month)}</div></div>
               <div class="info"><strong>${esc(s.title)}</strong><span>${esc(s.city)} · ${esc(s.time)}</span></div>
               <button class="btn btn-outline btn-sm">Detalhes</button>
             </div>
           `).join("")}
         </div>`
      : `<div class="upcoming-shows"><h3>Próximos shows</h3><p class="text-muted" style="font-size:14px;margin:0;">Nenhum show confirmado no momento.</p></div>`;

    const main = `
      <div data-testid="profile-view">
        <div class="profile-hero">
          <div class="profile-cover" style="background-image:url('${esc(user.cover || user.avatar)}');"></div>
          <img class="profile-avatar" src="${esc(user.avatar)}" alt="${esc(user.name)}" />
          <div class="profile-info">
            <div class="name-block">
              <h1 data-testid="profile-name">${esc(user.artistName || user.name)}</h1>
              <div class="sub">
                ${isMusician ? "Músico" : isVenue ? "Estabelecimento" : "Ouvinte"} ·
                ${esc(user.city || "—")}${user.state ? ", " + esc(user.state) : ""}
                ${user.verified ? ' · <i class="ph-fill ph-seal-check" style="color:var(--color-primary)"></i> Verificado' : ""}
              </div>
            </div>
            <div class="actions">
              ${secondaryCTA}
              ${primaryCTA}
            </div>
          </div>
        </div>

        <div class="profile-tags">${tags}</div>

        <div class="profile-stats" data-testid="profile-stats">
          ${stats.map((s) => `
            <div class="profile-stat">
              <div class="num">${esc(s.num)}</div>
              <div class="lbl">${esc(s.lbl)}</div>
            </div>
          `).join("")}
        </div>

        <div class="profile-grid">
          <div>
            <div class="profile-bio">
              <h3>Sobre</h3>
              ${bio}
              ${infoRows}
            </div>
            ${gallery}
          </div>
          <div>
            ${upcoming}
          </div>
        </div>
      </div>
    `;

    app.innerHTML = window.Shell.renderShell("profile", main, renderRight(user));
    window.Shell.wireShell(app);
    wireProfile(app, user);
  }

  function wireProfile(root, user) {
    root.querySelectorAll('[data-action="send-proposal"]').forEach((b) =>
      b.addEventListener("click", () => openProposalModal(user, "musician"))
    );
    root.querySelectorAll('[data-action="hire-band"]').forEach((b) =>
      b.addEventListener("click", () => openProposalModal(user, "venue"))
    );
    root.querySelectorAll('[data-testid="follow-primary-btn"]').forEach((b) =>
      b.addEventListener("click", () => {
        b.innerHTML = '<i class="ph ph-check"></i> Seguindo';
        b.classList.remove("btn-primary");
        b.classList.add("btn-ghost");
        window.UI.toast(`Você está seguindo ${user.name}.`, { type: "success" });
      })
    );
    root.querySelectorAll('[data-testid="message-btn"]').forEach((b) =>
      b.addEventListener("click", () => {
        window.Store.getOrCreateConversation(user.id);
        location.hash = `#/messages/${user.id}`;
      })
    );
    root.querySelectorAll('[data-testid="share-profile-btn"]').forEach((b) =>
      b.addEventListener("click", () => {
        navigator.clipboard && navigator.clipboard.writeText(location.href);
        window.UI.toast("Link do perfil copiado.", { type: "success" });
      })
    );
    root.querySelectorAll('[data-testid="edit-profile-btn"]').forEach((b) =>
      b.addEventListener("click", () =>
        window.UI.toast("A edição completa de perfil chega na Fase 2.", { type: "info", title: "Em breve" })
      )
    );
  }

  function openProposalModal(target, kind) {
    const isMusicianTarget = target.role === "musician";
    const title = isMusicianTarget ? "Enviar Proposta" : "Contratar Banda";
    const subtitle = isMusicianTarget
      ? `Envie uma proposta de show para ${target.artistName || target.name}.`
      : `Solicite uma apresentação em ${target.name}.`;

    const body = `
      <form id="proposal-form" data-testid="proposal-form">
        <div class="form-row">
          <div class="form-group">
            <label>Data da apresentação</label>
            <input type="date" name="date" required data-testid="proposal-date" />
          </div>
          <div class="form-group">
            <label>Horário</label>
            <input type="time" name="time" required data-testid="proposal-time" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Duração (min)</label>
            <input type="number" name="duration" value="60" min="20" data-testid="proposal-duration" />
          </div>
          <div class="form-group">
            <label>Valor oferecido (R$)</label>
            <input type="number" name="value" placeholder="1500" data-testid="proposal-value" />
          </div>
        </div>
        <div class="form-group">
          <label>Endereço / local</label>
          <input name="place" placeholder="Ex.: Bar Aurora — Vila Madalena" data-testid="proposal-place" />
        </div>
        <div class="form-group">
          <label>Observações</label>
          <textarea name="notes" rows="3" placeholder="Estrutura disponível, condições, contatos..." data-testid="proposal-notes"></textarea>
        </div>
      </form>
    `;

    window.UI.openModal({
      title,
      subtitle,
      body,
      testId: "proposal-modal",
      actions: [
        { label: "Cancelar", variant: "btn-ghost", testId: "proposal-cancel-btn" },
        {
          label: "Enviar proposta",
          variant: "btn-primary",
          testId: "proposal-send-btn",
          onClick: (close) => {
            const form = document.querySelector("#proposal-form");
            const fd = new FormData(form);
            const date = fd.get("date");
            const time = fd.get("time");
            if (!date || !time) {
              window.UI.toast("Preencha data e horário.", { type: "error" });
              return;
            }
            close();
            window.UI.toast(
              `Proposta enviada para ${target.name}. Aguarde retorno.`,
              { type: "success", title: "Proposta enviada" }
            );
          },
        },
      ],
    });
  }

  window.Views = window.Views || {};
  window.Views.profile = renderProfile;
})();
