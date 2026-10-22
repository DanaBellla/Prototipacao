/* BandaConnection — Calendar view (Google Calendar-like: month + agenda). */
(function () {
  const { esc } = window.UI;

  // Genre color mapping (used to color events on calendar cells)
  const GENRE_COLORS = {
    MPB: "#8b5cf6",
    "Bossa Nova": "#a78bfa",
    Blues: "#3b82f6",
    House: "#ec4899",
    "Afro House": "#f472b6",
    Festival: "#f59e0b",
    Rock: "#ef4444",
    Soul: "#10b981",
    Indie: "#22d3ee",
  };
  function colorFor(g) { return GENRE_COLORS[g] || "#8b5cf6"; }

  // Dates without a year are treated as the next calendar occurrence.
  const MONTHS = { JAN: 0, FEV: 1, MAR: 2, ABR: 3, MAI: 4, JUN: 5, JUL: 6, AGO: 7, SET: 8, OUT: 9, NOV: 10, DEZ: 11 };
  function eventDate(e) {
    if (e.dateISO) return new Date(`${e.dateISO}T00:00:00`);
    const [d, m] = e.date.split(" ");
    const monthIdx = MONTHS[m.toUpperCase().slice(0, 3)] ?? 0;
    const day = parseInt(d, 10) || 1;
    const now = new Date();
    const date = new Date(now.getFullYear(), monthIdx, day);
    if (date < new Date(now.getFullYear(), now.getMonth(), now.getDate())) date.setFullYear(date.getFullYear() + 1);
    return date;
  }

  const state = { view: "month", cursor: null, followingOnly: false, locationScope: null };

  function normalizeLocation(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  }

  function initialLocationScope() {
    const user = window.Store.currentUser();
    return user?.city ? "city" : user?.state ? "state" : "all";
  }

  function followedProfiles() {
    return window.Store.followingOf(window.Store.currentUser()?.id)
      .filter((user) => user.role === "musician" || user.role === "venue");
  }

  function visibleEvents() {
    const currentUser = window.Store.currentUser();
    let events = window.Store.state.events;
    if (state.followingOnly) {
      const followed = followedProfiles();
      events = events.filter((event) => followed.some((user) => {
        if (user.role === "venue") {
          return event.venueId === user.id || normalizeLocation(event.venue) === normalizeLocation(user.name);
        }
        const title = normalizeLocation(`${event.title || ""} ${event.artist || ""}`);
        return event.artistId === user.id || title.includes(normalizeLocation(user.artistName || user.name));
      }));
    }
    if (state.locationScope === "city" && currentUser?.city) {
      const city = normalizeLocation(currentUser.city);
      events = events.filter((event) => normalizeLocation(event.city).split(",")[0].trim() === city);
    } else if (state.locationScope === "state" && currentUser?.state) {
      const region = normalizeLocation(currentUser.state);
      events = events.filter((event) => normalizeLocation(event.city).split(/[\s,]+/).includes(region));
    }
    return events;
  }

  function initialCursor() {
    // Focus on the earliest month that has seed events (so first-time users see content)
    const events = window.Store.state.events;
    if (!events || !events.length) return new Date();
    const dates = events.map(eventDate).sort((a, b) => a - b);
    // Pick the earliest event that is in the current year or later; else the earliest overall
    const now = new Date();
    const future = dates.find((d) => d >= new Date(now.getFullYear(), now.getMonth(), 1));
    return future || dates[0];
  }

  function renderRight() {
    return `
      <h4>Legenda</h4>
      <div style="display:flex;flex-direction:column;gap:6px;font-size:13px;">
        ${Object.entries(GENRE_COLORS).map(([g, c]) => `
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="width:10px;height:10px;border-radius:50%;background:${c};"></span>
            <span class="text-muted">${esc(g)}</span>
          </div>
        `).join("")}
      </div>
      <h4 style="margin-top:24px;">Dica</h4>
      <div class="trend">
        <div class="cat">Cronograma</div>
        <div class="title">Clique em um evento</div>
        <div class="meta">Veja detalhes, local e compre ingressos.</div>
      </div>
    `;
  }

  function renderCalendar(app) {
    if (!window.Auth.require()) return;
    if (!state.cursor) state.cursor = initialCursor();
    if (!state.locationScope) state.locationScope = initialLocationScope();
    const currentUser = window.Store.currentUser();
    const locationUnavailable = state.locationScope === "city" ? !currentUser?.city : state.locationScope === "state" && !currentUser?.state;

    const main = `
      <div data-testid="calendar-view">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:20px;">
          <div>
            <h1 style="font-size:32px;margin-bottom:4px;">Cronograma</h1>
            <p class="text-muted" style="margin:0;">Sua agenda musical em um só lugar.</p>
          </div>
          <div class="calendar-controls" style="display:flex;align-items:center;justify-content:flex-end;gap:10px;flex-wrap:wrap;max-width:100%;">
            ${window.Store.canManageEvents() ? `<button class="btn btn-primary btn-sm" data-action="create-show" data-testid="create-show-btn"><i class="ph ph-plus"></i> Cadastrar show</button>` : ""}
            <div class="explore-tabs" style="margin-bottom:0;" data-testid="calendar-follow-filter">
              <button class="chip ${state.followingOnly ? "" : "active"}" data-follow-filter="all" data-testid="calendar-all-events">Todos</button>
              <button class="chip ${state.followingOnly ? "active" : ""}" data-follow-filter="following" data-testid="calendar-following-events">Seguindo (${followedProfiles().length})</button>
            </div>
            <div class="explore-tabs" style="margin-bottom:0;" data-testid="calendar-location-filter">
              <button class="chip ${state.locationScope === "all" ? "active" : ""}" data-location-filter="all" data-testid="calendar-all-locations">Todas localidades</button>
              <button class="chip ${state.locationScope === "city" ? "active" : ""}" data-location-filter="city" data-testid="calendar-city-filter">Minha cidade</button>
              <button class="chip ${state.locationScope === "state" ? "active" : ""}" data-location-filter="state" data-testid="calendar-state-filter">Meu estado</button>
            </div>
            <div class="explore-tabs" style="margin-bottom:0;">
              <button class="chip ${state.view === "month" ? "active" : ""}" data-view="month" data-testid="cal-view-month">Mês</button>
              <button class="chip ${state.view === "week" ? "active" : ""}" data-view="week" data-testid="cal-view-week">Semana</button>
              <button class="chip ${state.view === "agenda" ? "active" : ""}" data-view="agenda" data-testid="cal-view-agenda">Agenda</button>
            </div>
          </div>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:16px;padding:14px 18px;margin-bottom:16px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <button class="btn-icon" data-cal-nav="prev" data-testid="cal-prev-btn" aria-label="Anterior"><i class="ph ph-caret-left"></i></button>
            <button class="btn btn-ghost btn-sm" data-cal-nav="today" data-testid="cal-today-btn">Hoje</button>
            <button class="btn-icon" data-cal-nav="next" data-testid="cal-next-btn" aria-label="Próximo"><i class="ph ph-caret-right"></i></button>
          </div>
          <div style="font-family:var(--font-heading);font-size:20px;font-weight:700;text-transform:capitalize;" data-testid="cal-title">
            ${monthTitle(state.cursor)}
          </div>
          <div class="text-muted" style="font-size:13px;">${state.view === "month" ? "Visão mensal" : state.view === "week" ? "Visão semanal" : "Agenda"}</div>
        </div>

        <div id="calendar-body" data-testid="calendar-body">
          ${locationUnavailable ? `<p class="text-muted" data-testid="calendar-location-unavailable">Adicione cidade e estado em Configurações para filtrar shows próximos.</p>` : ""}
          ${visibleEvents().length === 0 && !locationUnavailable ? `<p class="text-muted" data-testid="calendar-empty">${state.followingOnly ? "Nenhum show dos perfis seguidos nesta localidade." : "Nenhum show encontrado nesta localidade."}</p>` : ""}
          ${state.view === "month" ? renderMonth() : state.view === "week" ? renderWeek() : renderAgenda()}
        </div>
      </div>
    `;

    app.innerHTML = window.Shell.renderShell("calendar", main, renderRight());
    window.Shell.wireShell(app);
    wire(app);
  }

  function monthTitle(d) {
    return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  }

  function renderMonth() {
    const cursor = state.cursor;
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];
    // Prev month tail
    for (let i = startWeekday - 1; i >= 0; i--) {
      cells.push({ day: daysPrevMonth - i, muted: true, date: new Date(year, month - 1, daysPrevMonth - i) });
    }
    // Current
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({ day: i, muted: false, date: new Date(year, month, i) });
    }
    // Next month head
    while (cells.length % 7 !== 0) {
      const idx = cells.length - (startWeekday + daysInMonth);
      cells.push({ day: idx + 1, muted: true, date: new Date(year, month + 1, idx + 1) });
    }
    // Ensure 6 rows for stability
    while (cells.length < 42) {
      const idx = cells.length - (startWeekday + daysInMonth);
      cells.push({ day: idx + 1, muted: true, date: new Date(year, month + 1, idx + 1) });
    }

    const events = visibleEvents();
    const dayName = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
    const today = new Date();
    const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

    return `
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px;background:var(--border-subtle);border:1px solid var(--border-subtle);border-radius:14px;overflow:hidden;">
        ${dayName.map((n) => `
          <div style="background:var(--bg-surface);padding:10px;text-align:center;font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;">${n}</div>
        `).join("")}
        ${cells.map((c) => {
          const dayEvents = events.filter((e) => sameDay(eventDate(e), c.date));
          const isToday = sameDay(c.date, today);
          return `
            <div class="cal-cell" style="background:var(--bg-surface);min-height:110px;padding:8px;display:flex;flex-direction:column;gap:4px;opacity:${c.muted ? 0.4 : 1};${isToday ? "outline:2px solid var(--color-primary);outline-offset:-2px;" : ""}">
              <div style="font-family:var(--font-heading);font-size:13px;font-weight:600;color:${isToday ? "var(--color-primary)" : "var(--text-main)"};">${c.day}</div>
              ${dayEvents.map((e) => `
                <button class="cal-event" data-event-id="${e.id}" data-testid="cal-event-${e.id}"
                  style="text-align:left;background:${colorFor(e.genre)}22;color:${colorFor(e.genre)};border:none;border-left:3px solid ${colorFor(e.genre)};padding:4px 6px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                  ${esc(e.title)}
                </button>
              `).join("")}
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderWeek() {
    const cursor = state.cursor;
    const startOfWeek = new Date(cursor);
    startOfWeek.setDate(cursor.getDate() - cursor.getDay());
    const events = visibleEvents();

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });

    return `
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px;">
        ${days.map((d) => {
          const dayEvents = events.filter((e) => {
            const ed = eventDate(e);
            return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth() && ed.getDate() === d.getDate();
          });
          return `
            <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:12px;padding:12px;min-height:200px;display:flex;flex-direction:column;gap:8px;">
              <div style="border-bottom:1px solid var(--border-subtle);padding-bottom:8px;">
                <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;">${d.toLocaleDateString("pt-BR", { weekday: "short" })}</div>
                <div style="font-family:var(--font-heading);font-size:22px;font-weight:700;">${d.getDate()}</div>
              </div>
              ${dayEvents.length === 0 ? `<div class="text-dim" style="font-size:12px;">—</div>` : ""}
              ${dayEvents.map((e) => `
                <button class="cal-event" data-event-id="${e.id}" data-testid="cal-event-${e.id}"
                  style="text-align:left;background:${colorFor(e.genre)}22;color:${colorFor(e.genre)};border-left:3px solid ${colorFor(e.genre)};padding:8px 10px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;">
                  <div style="font-size:11px;opacity:0.8;">${esc(e.date)}</div>
                  <div>${esc(e.title)}</div>
                  <div style="opacity:0.75;font-size:11px;font-weight:500;">${esc(e.venue)}</div>
                </button>
              `).join("")}
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderAgenda() {
    const events = [...visibleEvents()].sort((a, b) => eventDate(a) - eventDate(b));
    return `
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${events.map((e) => `
          <div class="cal-agenda-item" data-event-id="${e.id}" data-testid="agenda-item-${e.id}"
            style="display:flex;align-items:center;gap:16px;background:var(--bg-surface);border:1px solid var(--border-subtle);border-left:4px solid ${colorFor(e.genre)};border-radius:14px;padding:16px 18px;cursor:pointer;transition:transform 0.2s ease, border-color 0.2s ease;">
            <div style="min-width:64px;text-align:center;">
              <div style="font-family:var(--font-heading);font-size:22px;font-weight:700;">${esc(e.date.split(" ")[0])}</div>
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);">${esc(e.date.split(" ")[1] || "")}</div>
            </div>
            <div style="flex:1;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px;">
                <span class="badge" style="background:${colorFor(e.genre)}22;color:${colorFor(e.genre)};">${esc(e.genre)}</span>
                <span class="text-dim" style="font-size:12px;">${esc(e.dateFull)}</span>
              </div>
              <div style="font-family:var(--font-heading);font-size:17px;font-weight:600;">${esc(e.title)}</div>
              <div class="text-muted" style="font-size:13px;">${esc(e.venue)} · ${esc(e.city)}</div>
            </div>
            <div style="text-align:right;">
              <div class="text-dim" style="font-size:11px;">a partir de</div>
              <div style="font-family:var(--font-heading);font-weight:700;font-size:18px;">R$ ${e.price},00</div>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  function wire(root) {
    root.querySelectorAll("[data-location-filter]").forEach((button) =>
      button.addEventListener("click", () => {
        state.locationScope = button.dataset.locationFilter;
        renderCalendar(root);
      })
    );
    root.querySelectorAll("[data-follow-filter]").forEach((button) =>
      button.addEventListener("click", () => {
        state.followingOnly = button.dataset.followFilter === "following";
        renderCalendar(root);
      })
    );
    root.querySelectorAll('[data-action="create-show"]').forEach((button) =>
      button.addEventListener("click", () => openEventForm(root))
    );
    // View switch
    root.querySelectorAll("[data-view]").forEach((b) =>
      b.addEventListener("click", () => {
        state.view = b.dataset.view;
        renderCalendar(root);
      })
    );
    // Nav
    root.querySelectorAll("[data-cal-nav]").forEach((b) =>
      b.addEventListener("click", () => {
        const dir = b.dataset.calNav;
        if (dir === "today") state.cursor = new Date();
        else {
          const inc = state.view === "month" ? "month" : "week";
          const c = new Date(state.cursor);
          if (inc === "month") c.setMonth(c.getMonth() + (dir === "next" ? 1 : -1));
          else c.setDate(c.getDate() + (dir === "next" ? 7 : -7));
          state.cursor = c;
        }
        renderCalendar(root);
      })
    );
    // Event click -> modal (reuse explore's event modal via ExploreModal)
    root.querySelectorAll("[data-event-id]").forEach((el) =>
      el.addEventListener("click", () => window.openEventModal && window.openEventModal(el.dataset.eventId))
    );
  }

  function openEventForm(root, event = null) {
    const user = window.Store.currentUser();
    if (!user || !window.Store.canManageEvents()) return;
    const editing = !!event;
    if (editing && !window.Store.canManageEvent(event)) {
      window.UI.toast("Você não pode editar este show.", { type: "error" });
      return;
    }
    const now = new Date();
    const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const people = window.Store.state.users;
    const dateISO = event?.dateISO || (event ? eventDate(event).toISOString().slice(0, 10) : "");
    const counterpartSelect = user.role === "musician"
      ? `<label>Estabelecimento (opcional)</label><select name="venueId"><option value="">Outro local</option>${people.filter((entry) => entry.role === "venue").map((entry) => `<option value="${esc(entry.id)}" ${event?.venueId === entry.id ? "selected" : ""}>${esc(entry.name)}</option>`).join("")}</select>`
      : `<label>Artista (opcional)</label><select name="artistId"><option value="">A definir</option>${people.filter((entry) => entry.role === "musician").map((entry) => `<option value="${esc(entry.id)}" ${event?.artistId === entry.id ? "selected" : ""}>${esc(entry.artistName || entry.name)}</option>`).join("")}</select>`;
    const body = `
      <form id="event-form" data-testid="event-form">
        <div class="form-group"><label>Nome do show</label><input name="title" required maxlength="100" value="${esc(event?.title || "")}" /></div>
        <div class="form-row">
          <div class="form-group"><label>Data</label><input type="date" name="dateISO" required ${editing ? "" : `min="${today}"`} value="${esc(dateISO)}" /></div>
          <div class="form-group"><label>Horário</label><input type="time" name="time" required value="${esc(event?.time || "20:00")}" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Local</label><input name="venue" required value="${esc(event?.venue || (user.role === "venue" ? user.name : ""))}" /></div>
          <div class="form-group">${counterpartSelect}</div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Cidade</label><input name="city" required value="${esc(event?.city || [user.city, user.state].filter(Boolean).join(", "))}" /></div>
          <div class="form-group"><label>Gênero musical</label><input name="genre" required maxlength="40" value="${esc(event?.genre || (user.genres || [])[0] || "")}" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Ingresso (R$)</label><input type="number" name="price" min="0" step="1" required value="${esc(String(event?.price ?? 0))}" /></div>
          <div class="form-group"><label>Imagem (URL, opcional)</label><input type="url" name="image" value="${esc(event?.image || "")}" /></div>
        </div>
      </form>
    `;
    window.UI.openModal({
      title: editing ? "Editar show" : "Cadastrar show",
      subtitle: editing ? "Atualize as informações do evento." : "Inclua uma apresentação na agenda da comunidade.",
      body,
      testId: "event-form-modal",
      actions: [
        { label: "Cancelar", variant: "btn-ghost" },
        {
          label: editing ? "Salvar alterações" : "Cadastrar show",
          variant: "btn-primary",
          testId: "save-show-btn",
          onClick: (close) => {
            const form = document.querySelector("#event-form");
            if (!form.reportValidity()) return;
            const values = Object.fromEntries(new FormData(form).entries());
            const date = new Date(`${values.dateISO}T00:00:00`);
            const month = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"][date.getMonth()];
            const payload = {
              title: values.title.trim(),
              dateISO: values.dateISO,
              date: `${String(date.getDate()).padStart(2, "0")} ${month}`,
              dateFull: `${date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · ${values.time}`,
              time: values.time,
              venue: values.venue.trim(),
              city: values.city.trim(),
              genre: values.genre.trim(),
              price: Number(values.price),
              image: values.image.trim() || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200",
              artistId: values.artistId || "",
              venueId: values.venueId || "",
            };
            const saved = editing
              ? window.Store.updateEvent(event.id, payload)
              : window.Store.createEvent(payload);
            if (!saved) {
              window.UI.toast("Não foi possível salvar este show.", { type: "error" });
              return;
            }
            close();
            window.UI.toast(editing ? "Show atualizado." : "Show cadastrado.", { type: "success" });
            renderCalendar(root);
          },
        },
      ],
    });
  }

  window.openEventEditor = (eventId) => {
    const event = window.Store.state.events.find((entry) => entry.id === eventId);
    if (!event) return;
    openEventForm(document.getElementById("app"), event);
  };

  window.Views = window.Views || {};
  window.Views.calendar = renderCalendar;
})();
