/* Sonora — Reusable UI helpers (toast, modal, timeago, escaping). */
(function () {
  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function esc(str) {
    if (str == null) return "";
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function timeAgo(iso) {
    const then = new Date(iso).getTime();
    const diff = Date.now() - then;
    const m = Math.floor(diff / 60000);
    if (m < 1) return "agora";
    if (m < 60) return `há ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `há ${h}h`;
    const d = Math.floor(h / 24);
    if (d < 30) return `há ${d}d`;
    return new Date(iso).toLocaleDateString("pt-BR");
  }

  const ICONS = {
    success: "ph-check-circle",
    error: "ph-warning-circle",
    info: "ph-info",
  };

  function toast(message, opts = {}) {
    const host = document.getElementById("toast-host");
    if (!host) return;
    const type = opts.type || "info";
    const t = el(
      `<div class="toast ${type}" role="status" data-testid="toast">
        <i class="ph ${ICONS[type] || ICONS.info}"></i>
        <div>
          <strong>${esc(opts.title || (type === "success" ? "Sucesso" : type === "error" ? "Erro" : "Aviso"))}</strong>
          <span>${esc(message)}</span>
        </div>
      </div>`
    );
    host.appendChild(t);
    setTimeout(() => {
      t.style.opacity = "0";
      t.style.transform = "translateX(30px)";
      setTimeout(() => t.remove(), 250);
    }, opts.duration || 3200);
  }

  function openModal({ title, subtitle, body, actions, size, testId }) {
    const host = document.getElementById("modal-host");
    if (!host) return;
    host.innerHTML = "";
    const modal = el(
      `<div class="modal-backdrop" data-testid="${testId || "modal-backdrop"}">
        <div class="modal" role="dialog" aria-modal="true" data-testid="modal">
          <div class="modal-head">
            <div>
              <h3 data-testid="modal-title">${esc(title || "")}</h3>
              ${subtitle ? `<p>${esc(subtitle)}</p>` : ""}
            </div>
            <button class="modal-close" aria-label="Fechar" data-testid="modal-close-btn">
              <i class="ph ph-x"></i>
            </button>
          </div>
          <div class="modal-body"></div>
          <div class="modal-actions"></div>
        </div>
      </div>`
    );
    host.appendChild(modal);
    if (body) {
      const b = modal.querySelector(".modal-body");
      if (typeof body === "string") b.innerHTML = body;
      else b.appendChild(body);
    }
    const actWrap = modal.querySelector(".modal-actions");
    (actions || []).forEach((a) => {
      const btn = el(`<button class="btn ${a.variant || "btn-ghost"}" data-testid="${a.testId || "modal-action"}">${esc(a.label)}</button>`);
      btn.addEventListener("click", () => {
        if (a.onClick) a.onClick(closeModal);
        else closeModal();
      });
      actWrap.appendChild(btn);
    });
    if (!actions || !actions.length) actWrap.remove();
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
    modal.querySelector(".modal-close").addEventListener("click", closeModal);
  }

  function closeModal() {
    const host = document.getElementById("modal-host");
    if (host) host.innerHTML = "";
  }

  window.UI = { el, esc, timeAgo, toast, openModal, closeModal };
})();
