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

  // Parse "22 FEV" style date to a real Date (using current year)
  const MONTHS = { JAN: 0, FEV: 1, MAR: 2, ABR: 3, MAI: 4, JUN: 5, JUL: 6, AGO: 7, SET: 8, OUT: 9, NOV: 10, DEZ: 11 };
  function eventDate(e) {
    const [d, m] = e.date.split(" ");
    const monthIdx = MONTHS[m.toUpperCase().slice(0, 3)] ?? 0;
    const day = parseInt(d, 10) || 1;
    const year = new Date().getFullYear();
    return new Date(year, monthIdx, day);
  }

  const state = { view: "month", cursor: null };

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
    if (!state.cursor) state.cursor = new Date();

    const main = `
      <div data-testid="calendar-view">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:20px;">
          <div>
            <h1 style="font-size:32px;margin-bottom:4px;">Cronograma</h1>
            <p class="text-muted" style="margin:0;">Sua agenda musical em um só lugar.</p>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
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

    const events = window.Store.state.events;
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
    const events = window.Store.state.events;

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
    const events = [...window.Store.state.events].sort((a, b) => eventDate(a) - eventDate(b));
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

  window.Views = window.Views || {};
  window.Views.calendar = renderCalendar;
})();
