/* BandaConnection — Explore view (bento artistas + grid de eventos). */
(function () {
  const { esc } = window.UI;

  function bentoClass(i) {
    // Asymmetric bento pattern
    if (i === 0) return "tall";
    if (i === 3) return "wide";
    if (i === 5) return "tall";
    return "";
  }

  function renderRight() {
    const events = window.Store.state.events.slice(0, 3);
    return `
      <h4>Próximos shows</h4>
      <div class="trends">
        ${events.map((e) => `
          <div class="trend" data-testid="right-event-${e.id}" data-nav-event="${e.id}">
            <div class="cat">${esc(e.date)} · ${esc(e.genre)}</div>
            <div class="title">${esc(e.title)}</div>
            <div class="meta">${esc(e.venue)} · ${esc(e.city)}</div>
          </div>
        `).join("")}
      </div>
      <h4 style="margin-top:24px;">Cidades ativas</h4>
      <div class="trends">
        <div class="trend"><div class="title">São Paulo</div><div class="meta">2.140 shows este mês</div></div>
        <div class="trend"><div class="title">Rio de Janeiro</div><div class="meta">1.320 shows este mês</div></div>
        <div class="trend"><div class="title">Belo Horizonte</div><div class="meta">610 shows este mês</div></div>
      </div>
    `;
  }

  function renderExplore(app) {
    if (!window.Auth.require()) return;
    const s = window.Store.state;
    const artists = s.users.filter((u) => u.role === "musician");
    const venues = s.users.filter((u) => u.role === "venue");
    const events = s.events;

    const main = `
      <div data-testid="explore-view">
        <div style="margin-bottom:24px;">
          <h1 style="font-size:32px;margin-bottom:6px;">Explorar</h1>
          <p class="text-muted" style="margin:0;">Descubra artistas, casas e a próxima noite inesquecível.</p>
        </div>

        <div class="explore-tabs" data-testid="explore-tabs">
          <button class="chip active" data-tab="artists" data-testid="tab-artists">Artistas</button>
          <button class="chip" data-tab="venues" data-testid="tab-venues">Estabelecimentos</button>
          <button class="chip" data-tab="events" data-testid="tab-events">Eventos</button>
        </div>

        <div id="tab-artists-content" data-testid="tab-artists-content">
          <div class="bento" data-testid="artists-bento">
            ${artists.map((a, i) => `
              <div class="bento-card ${bentoClass(i)}" data-nav="#/profile/${a.id}" data-testid="bento-artist-${a.id}">
                <img src="${esc(a.cover || a.avatar)}" alt="${esc(a.name)}" />
                <div class="caption">
                  <div class="cat">${esc((a.genres && a.genres[0]) || "Artista")}</div>
                  <h4>${esc(a.artistName || a.name)}</h4>
                  <div class="meta">${esc(a.city)}, ${esc(a.state)} · ${a.followers} seguidores</div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <div id="tab-venues-content" style="display:none;" data-testid="tab-venues-content">
          <div class="bento">
            ${venues.map((v, i) => `
              <div class="bento-card ${bentoClass(i)}" data-nav="#/profile/${v.id}" data-testid="bento-venue-${v.id}">
                <img src="${esc(v.cover || v.avatar)}" alt="${esc(v.name)}" />
                <div class="caption">
                  <div class="cat">${esc(v.category || "Estabelecimento")}</div>
                  <h4>${esc(v.name)}</h4>
                  <div class="meta">${esc(v.city)}, ${esc(v.state)} · Cap. ${v.capacity || "—"}</div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <div id="tab-events-content" style="display:none;" data-testid="tab-events-content">
          <div class="event-row">
            ${events.map((e) => `
              <article class="event-card" data-event-id="${e.id}" data-testid="event-card-${e.id}">
                <div class="img"><img src="${esc(e.image)}" alt="${esc(e.title)}" /></div>
                <div class="body">
                  <div class="date">${esc(e.date)} · ${esc(e.genre)}</div>
                  <h4>${esc(e.title)}</h4>
                  <div class="meta"><i class="ph ph-map-pin"></i> ${esc(e.venue)}, ${esc(e.city)}</div>
                  <div class="foot">
                    <span class="price">R$ ${e.price},00</span>
                    <button class="btn btn-primary btn-sm" data-buy-event="${e.id}" data-testid="event-buy-${e.id}">Comprar ingresso</button>
                  </div>
                </div>
              </article>
            `).join("")}
          </div>
        </div>
      </div>
    `;

    app.innerHTML = window.Shell.renderShell("explore", main, renderRight());
    window.Shell.wireShell(app);
    wireExplore(app);
  }

  function wireExplore(root) {
    // Nav
    root.querySelectorAll("[data-nav]").forEach((n) =>
      n.addEventListener("click", () => (location.hash = n.dataset.nav))
    );

    // Tabs
    root.querySelectorAll("[data-tab]").forEach((btn) =>
      btn.addEventListener("click", () => {
        root.querySelectorAll("[data-tab]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        ["artists", "venues", "events"].forEach((k) => {
          const el = root.querySelector(`#tab-${k}-content`);
          if (el) el.style.display = k === btn.dataset.tab ? "" : "none";
        });
      })
    );

    // Event card click -> modal (avoid inner buttons)
    root.querySelectorAll("[data-event-id]").forEach((card) =>
      card.addEventListener("click", (e) => {
        if (e.target.closest("[data-buy-event]")) return;
        openEventModal(card.dataset.eventId);
      })
    );
    // Direct buy buttons
    root.querySelectorAll("[data-buy-event]").forEach((b) =>
      b.addEventListener("click", (ev) => {
        ev.stopPropagation();
        location.hash = `#/checkout/${b.dataset.buyEvent}`;
      })
    );
    root.querySelectorAll("[data-nav-event]").forEach((n) =>
      n.addEventListener("click", () => openEventModal(n.dataset.navEvent))
    );
  }

  function openEventModal(id) {
    const e = window.Store.state.events.find((x) => x.id === id);
    if (!e) return;
    window.UI.openModal({
      title: e.title,
      subtitle: `${e.dateFull} · ${e.venue}, ${e.city}`,
      body: `
        <div style="border-radius:16px;overflow:hidden;margin-bottom:16px;aspect-ratio:16/9;">
          <img src="${esc(e.image)}" alt="" style="width:100%;height:100%;object-fit:cover;" />
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
          <span class="badge">${esc(e.genre)}</span>
          <span class="badge badge-muted"><i class="ph ph-map-pin"></i> ${esc(e.city)}</span>
          <span class="badge badge-muted"><i class="ph ph-clock"></i> ${esc(e.dateFull)}</span>
        </div>
        <p class="text-muted" style="margin:0 0 8px;">
          Um encontro imperdível da cena musical. Chegue cedo — a casa costuma lotar.
        </p>
        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:16px;border-top:1px solid var(--border-subtle);margin-top:16px;">
          <div>
            <div class="text-muted" style="font-size:12px;">Ingresso a partir de</div>
            <div style="font-family:var(--font-heading);font-size:26px;font-weight:700;">R$ ${e.price},00</div>
          </div>
        </div>
      `,
      actions: [
        { label: "Fechar", variant: "btn-ghost", testId: "event-modal-close-btn" },
        {
          label: "Comprar ingresso",
          variant: "btn-primary",
          testId: "event-modal-buy-btn",
          onClick: (close) => {
            close();
            location.hash = `#/checkout/${e.id}`;
          },
        },
      ],
    });
  }
  // Expose for calendar view
  window.openEventModal = openEventModal;

  window.Views = window.Views || {};
  window.Views.explore = renderExplore;
})();
