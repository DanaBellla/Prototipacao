/* BandaConnection — Ticket purchase flow (checkout + tickets page). */
(function () {
  const { esc } = window.UI;

  function renderCheckout(app, params) {
    if (!window.Auth.require()) return;
    const event = window.Store.state.events.find((e) => e.id === params.eventId);
    if (!event) {
      location.hash = "#/explore";
      return;
    }
    let qty = 1;
    let paymentMethod = "credit";

    const main = `
      <div data-testid="checkout-view" style="max-width:960px;margin:0 auto;">
        <a href="#/explore" style="color:var(--text-muted);font-size:14px;display:inline-flex;align-items:center;gap:6px;margin-bottom:20px;" data-testid="checkout-back">
          <i class="ph ph-arrow-left"></i> Voltar para eventos
        </a>
        <h1 style="font-size:32px;margin-bottom:6px;">Finalizar compra</h1>
        <p class="text-muted" style="margin-bottom:24px;">Você está adquirindo ingresso para o evento abaixo.</p>

        <div style="display:grid;grid-template-columns:1fr 380px;gap:24px;align-items:start;">
          <!-- Left column: event summary + form -->
          <div>
            <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:16px;overflow:hidden;margin-bottom:20px;">
              <div style="aspect-ratio:16/9;background:var(--bg-elevated);">
                <img src="${esc(event.image)}" alt="${esc(event.title)}" style="width:100%;height:100%;object-fit:cover;" />
              </div>
              <div style="padding:20px;">
                <div style="color:var(--color-primary);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">${esc(event.date)} · ${esc(event.genre)}</div>
                <h2 style="font-size:24px;margin-bottom:6px;">${esc(event.title)}</h2>
                <p class="text-muted" style="margin:0 0 12px;font-size:14px;"><i class="ph ph-map-pin"></i> ${esc(event.venue)} · ${esc(event.city)}</p>
                <p class="text-muted" style="margin:0;font-size:14px;"><i class="ph ph-clock"></i> ${esc(event.dateFull)}</p>
              </div>
            </div>

            <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:16px;padding:24px;margin-bottom:20px;">
              <h3 style="font-size:18px;margin-bottom:16px;">Escolha os ingressos</h3>
              <div style="display:flex;align-items:center;justify-content:space-between;padding:16px;background:var(--bg-elevated);border-radius:12px;">
                <div>
                  <div style="font-family:var(--font-heading);font-weight:600;">Pista · Inteira</div>
                  <div class="text-muted" style="font-size:13px;">Acesso à área comum · R$ ${event.price},00</div>
                </div>
                <div style="display:flex;align-items:center;gap:12px;">
                  <button class="btn-icon" data-testid="qty-minus" data-qty="-1"><i class="ph ph-minus"></i></button>
                  <span id="qty-value" data-testid="qty-value" style="font-family:var(--font-heading);font-weight:700;font-size:18px;min-width:24px;text-align:center;">1</span>
                  <button class="btn-icon" data-testid="qty-plus" data-qty="+1"><i class="ph ph-plus"></i></button>
                </div>
              </div>
            </div>

            <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:16px;padding:24px;margin-bottom:20px;">
              <h3 style="font-size:18px;margin-bottom:16px;">Dados do comprador</h3>
              <form id="buyer-form" novalidate>
                <div class="form-group">
                  <label>Nome completo</label>
                  <input name="name" required data-testid="buyer-name" placeholder="Como aparece no seu documento" />
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>E-mail</label>
                    <input type="email" name="email" required data-testid="buyer-email" placeholder="voce@email.com" />
                  </div>
                  <div class="form-group">
                    <label>CPF</label>
                    <input name="cpf" data-testid="buyer-cpf" placeholder="000.000.000-00" />
                  </div>
                </div>
              </form>
            </div>

            <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:16px;padding:24px;">
              <h3 style="font-size:18px;margin-bottom:16px;">Forma de pagamento</h3>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;" id="pay-methods">
                <button class="pay-choice active" data-pay="credit" data-testid="pay-credit">
                  <i class="ph ph-credit-card"></i><span>Cartão de crédito</span>
                </button>
                <button class="pay-choice" data-pay="pix" data-testid="pay-pix">
                  <i class="ph ph-qr-code"></i><span>Pix</span>
                </button>
                <button class="pay-choice" data-pay="boleto" data-testid="pay-boleto">
                  <i class="ph ph-barcode"></i><span>Boleto</span>
                </button>
              </div>
              <p class="text-dim" style="font-size:12px;margin-top:12px;"><i class="ph ph-shield-check"></i> Ambiente de demonstração · nenhuma cobrança real será feita.</p>
            </div>
          </div>

          <!-- Right column: summary -->
          <aside style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:16px;padding:24px;position:sticky;top:calc(var(--header-h) + 20px);">
            <h3 style="font-size:18px;margin-bottom:16px;">Resumo do pedido</h3>
            <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;color:var(--text-muted);">
              <span>Pista Inteira × <span id="sum-qty">1</span></span>
              <span id="sum-subtotal">R$ ${event.price},00</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;color:var(--text-muted);">
              <span>Taxa de serviço</span>
              <span id="sum-fee">R$ ${(event.price * 0.1).toFixed(2).replace('.', ',')}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:16px 0 8px;border-top:1px solid var(--border-subtle);margin-top:12px;font-family:var(--font-heading);font-weight:700;font-size:20px;">
              <span>Total</span>
              <span id="sum-total" data-testid="sum-total">R$ ${(event.price * 1.1).toFixed(2).replace('.', ',')}</span>
            </div>
            <button class="btn btn-primary btn-lg btn-block" style="margin-top:20px;" data-action="confirm-purchase" data-testid="confirm-purchase-btn">
              <i class="ph ph-lock"></i> Confirmar compra
            </button>
            <p class="text-dim" style="font-size:11px;margin-top:12px;text-align:center;">Ao confirmar você aceita os termos do BandaConnection.</p>
          </aside>
        </div>
      </div>

      <style>
        .pay-choice {
          display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 8px;
          background:var(--bg-elevated);border:2px solid var(--border-subtle);border-radius:12px;
          color:var(--text-main);cursor:pointer;font-size:13px;font-weight:500;
          transition:border-color 0.2s ease, background-color 0.2s ease;
        }
        .pay-choice i { font-size:22px; color:var(--text-muted); }
        .pay-choice:hover { border-color: var(--color-primary); }
        .pay-choice.active { border-color: var(--color-primary); background: var(--color-primary-soft); }
        .pay-choice.active i { color: var(--color-primary); }
      </style>
    `;

    app.innerHTML = window.Shell.renderShell("events", main, `
      <h4>Precisa de ajuda?</h4>
      <div class="trend">
        <div class="cat">FAQ</div>
        <div class="title">Como funciona a compra?</div>
        <div class="meta">Você recebe QR Code por e-mail e no app.</div>
      </div>
    `);
    window.Shell.wireShell(app);
    wireCheckout(app, event, () => qty, (n) => { qty = n; }, () => paymentMethod, (v) => { paymentMethod = v; });
  }

  function wireCheckout(root, event, getQty, setQty, getPay, setPay) {
    const updateSummary = () => {
      const q = getQty();
      const sub = event.price * q;
      const fee = sub * 0.1;
      const total = sub + fee;
      root.querySelector("#sum-qty").textContent = q;
      root.querySelector("#qty-value").textContent = q;
      root.querySelector("#sum-subtotal").textContent = "R$ " + sub.toFixed(2).replace(".", ",");
      root.querySelector("#sum-fee").textContent = "R$ " + fee.toFixed(2).replace(".", ",");
      root.querySelector("#sum-total").textContent = "R$ " + total.toFixed(2).replace(".", ",");
    };
    root.querySelectorAll("[data-qty]").forEach((b) =>
      b.addEventListener("click", () => {
        const delta = parseInt(b.dataset.qty, 10);
        const next = Math.max(1, Math.min(10, getQty() + delta));
        setQty(next);
        updateSummary();
      })
    );
    root.querySelectorAll("[data-pay]").forEach((b) =>
      b.addEventListener("click", () => {
        root.querySelectorAll("[data-pay]").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        setPay(b.dataset.pay);
      })
    );
    root.querySelectorAll('[data-action="confirm-purchase"]').forEach((btn) =>
      btn.addEventListener("click", () => {
        const form = document.getElementById("buyer-form");
        const fd = new FormData(form);
        const buyer = Object.fromEntries(fd.entries());
        if (!buyer.name || !buyer.email) {
          window.UI.toast("Preencha nome e e-mail para continuar.", { type: "error" });
          return;
        }
        const ticket = window.Store.buyTicket(event.id, getQty(), buyer);
        openConfirmationModal(ticket, event);
      })
    );
  }

  function openConfirmationModal(ticket, event) {
    const qrData = encodeURIComponent(`BC-TICKET:${ticket.code}|EV:${event.id}|USR:${ticket.userId}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${qrData}&size=220x220&bgcolor=131316&color=ffffff&margin=8&format=svg`;
    window.UI.openModal({
      title: "Compra confirmada! 🎟️",
      subtitle: `Seu ingresso para ${event.title} está pronto.`,
      testId: "purchase-confirmation-modal",
      body: `
        <div style="background:var(--bg-elevated);border:1px dashed var(--border-strong);border-radius:16px;padding:24px;text-align:center;">
          <img src="${qrUrl}" alt="QR Code do ingresso" style="width:220px;height:220px;background:#131316;border-radius:12px;padding:8px;margin:0 auto 16px;display:block;" data-testid="ticket-qr" />
          <div style="font-family:var(--font-heading);font-weight:700;font-size:18px;letter-spacing:0.15em;" data-testid="ticket-code">${window.UI.esc(ticket.code)}</div>
          <div class="text-muted" style="font-size:13px;margin-top:6px;">Código do ingresso — apresente na entrada</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px;">
          <div style="background:var(--bg-elevated);padding:12px;border-radius:12px;">
            <div class="text-muted" style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;">Evento</div>
            <div style="font-family:var(--font-heading);font-weight:600;font-size:14px;">${window.UI.esc(event.title)}</div>
          </div>
          <div style="background:var(--bg-elevated);padding:12px;border-radius:12px;">
            <div class="text-muted" style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;">Data</div>
            <div style="font-family:var(--font-heading);font-weight:600;font-size:14px;">${window.UI.esc(event.date)}</div>
          </div>
          <div style="background:var(--bg-elevated);padding:12px;border-radius:12px;">
            <div class="text-muted" style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;">Local</div>
            <div style="font-family:var(--font-heading);font-weight:600;font-size:14px;">${window.UI.esc(event.venue)}</div>
          </div>
          <div style="background:var(--bg-elevated);padding:12px;border-radius:12px;">
            <div class="text-muted" style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;">Quantidade</div>
            <div style="font-family:var(--font-heading);font-weight:600;font-size:14px;">${ticket.quantity} ingresso${ticket.quantity > 1 ? "s" : ""}</div>
          </div>
        </div>
      `,
      actions: [
        {
          label: "Ver meus ingressos",
          variant: "btn-primary",
          testId: "goto-my-tickets-btn",
          onClick: (close) => { close(); location.hash = "#/tickets"; },
        },
      ],
    });
  }

  function renderTickets(app) {
    if (!window.Auth.require()) return;
    const me = window.Store.currentUser();
    const tickets = window.Store.ticketsFor(me.id);

    const main = `
      <div data-testid="tickets-view">
        <div style="margin-bottom:24px;">
          <h1 style="font-size:32px;margin-bottom:6px;">Meus ingressos</h1>
          <p class="text-muted" style="margin:0;">Todos os shows confirmados em um só lugar.</p>
        </div>

        ${tickets.length === 0
          ? `<div style="background:var(--bg-surface);border:1px dashed var(--border-strong);border-radius:16px;padding:60px 20px;text-align:center;">
              <div style="width:80px;height:80px;border-radius:50%;background:var(--color-primary-soft);color:var(--color-primary);display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;">
                <i class="ph ph-ticket" style="font-size:38px;"></i>
              </div>
              <h3 style="font-size:22px;margin-bottom:8px;">Você ainda não tem ingressos</h3>
              <p class="text-muted" style="max-width:420px;margin:0 auto 20px;">Explore os eventos disponíveis e garanta seu lugar nos próximos shows.</p>
              <a href="#/explore" class="btn btn-primary" data-testid="tickets-empty-cta"><i class="ph ph-compass"></i> Explorar eventos</a>
            </div>`
          : `<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(380px, 1fr));gap:20px;">
              ${tickets.map((t) => {
                const ev = window.Store.state.events.find((e) => e.id === t.eventId);
                if (!ev) return "";
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent("BC-TICKET:" + t.code)}&size=120x120&bgcolor=131316&color=ffffff&margin=4&format=svg`;
                return `
                  <div class="ticket-card" data-testid="ticket-card-${t.id}" style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:18px;overflow:hidden;">
                    <div style="aspect-ratio:16/8;background:var(--bg-elevated);position:relative;">
                      <img src="${esc(ev.image)}" alt="${esc(ev.title)}" style="width:100%;height:100%;object-fit:cover;" />
                      <div style="position:absolute;inset:0;background:linear-gradient(180deg, transparent 40%, rgba(9,9,11,0.85) 100%);"></div>
                      <div style="position:absolute;left:16px;bottom:16px;color:white;">
                        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#c4b5fd;font-weight:700;">${esc(ev.date)}</div>
                        <div style="font-family:var(--font-heading);font-size:20px;font-weight:700;">${esc(ev.title)}</div>
                      </div>
                    </div>
                    <div style="padding:16px;display:flex;gap:16px;align-items:center;">
                      <img src="${qrUrl}" alt="QR" style="width:96px;height:96px;background:#131316;border-radius:10px;padding:6px;" />
                      <div style="flex:1;">
                        <div class="text-muted" style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;">Código</div>
                        <div style="font-family:var(--font-heading);font-weight:700;font-size:16px;letter-spacing:0.1em;">${esc(t.code)}</div>
                        <div class="text-muted" style="font-size:13px;margin-top:6px;">${t.quantity} ingresso${t.quantity > 1 ? "s" : ""} · <strong style="color:var(--text-main);">R$ ${t.total.toFixed(2).replace(".", ",")}</strong></div>
                        <span class="badge" style="margin-top:8px;">Confirmado</span>
                      </div>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>`}
      </div>
    `;

    app.innerHTML = window.Shell.renderShell("tickets", main, `
      <h4>Próximos eventos</h4>
      <div class="trends">
        ${window.Store.state.events.slice(0, 3).map((e) => `
          <a class="trend" href="#/checkout/${e.id}">
            <div class="cat">${esc(e.date)}</div>
            <div class="title">${esc(e.title)}</div>
            <div class="meta">${esc(e.venue)} · R$ ${e.price},00</div>
          </a>
        `).join("")}
      </div>
    `);
    window.Shell.wireShell(app);
  }

  window.Views = window.Views || {};
  window.Views.checkout = renderCheckout;
  window.Views.tickets = renderTickets;
})();
