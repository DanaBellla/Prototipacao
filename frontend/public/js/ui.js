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

  const brazilianStates = [
    ["AC", "Acre"], ["AL", "Alagoas"], ["AP", "Amapá"], ["AM", "Amazonas"],
    ["BA", "Bahia"], ["CE", "Ceará"], ["DF", "Distrito Federal"], ["ES", "Espírito Santo"],
    ["GO", "Goiás"], ["MA", "Maranhão"], ["MT", "Mato Grosso"], ["MS", "Mato Grosso do Sul"],
    ["MG", "Minas Gerais"], ["PA", "Pará"], ["PB", "Paraíba"], ["PR", "Paraná"],
    ["PE", "Pernambuco"], ["PI", "Piauí"], ["RJ", "Rio de Janeiro"], ["RN", "Rio Grande do Norte"],
    ["RS", "Rio Grande do Sul"], ["RO", "Rondônia"], ["RR", "Roraima"], ["SC", "Santa Catarina"],
    ["SP", "São Paulo"], ["SE", "Sergipe"], ["TO", "Tocantins"],
  ];

  function stateOptions(selected = "") {
    const value = String(selected || "").toUpperCase();
    return `<option value="">Selecione um estado</option>${brazilianStates.map(([uf, name]) =>
      `<option value="${uf}" ${value === uf ? "selected" : ""}>${name} (${uf})</option>`
    ).join("")}`;
  }

  const musicGenres = [
    "Axé", "Blues", "Bossa Nova", "Clássica", "Country", "Eletrônica", "Forró", "Indie",
    "Funk", "Gospel", "Hip-hop", "Jazz", "MPB", "Pagode", "Pop", "Rap",
    "Reggae", "Rock", "Samba", "Sertanejo", "Outro",
  ];

  function genreSelectorHTML(selected = []) {
    const genres = Array.isArray(selected) ? selected.slice(0, 5) : [];
    const rows = genres.length ? genres : [""];
    return `
      <div class="genre-selector" data-genre-selector>
        <div class="genre-selector-rows">
          ${rows.map((genre) => genreRowHTML(genre)).join("")}
        </div>
        <button type="button" class="btn btn-ghost btn-sm" data-action="add-genre" ${rows.length >= 5 ? "hidden" : ""}>
          <i class="ph ph-plus"></i> Adicionar gênero
        </button>
        <small class="text-muted" data-genre-count>${rows.length}/5 gêneros</small>
      </div>
    `;
  }

  function genreRowHTML(value = "") {
    const custom = value && !musicGenres.includes(value) ? value : "";
    const selected = custom ? "Outro" : value;
    return `
      <div class="genre-selector-row">
        <select data-genre-value aria-label="Gênero musical">
          <option value="">Selecione um gênero</option>
          ${musicGenres.map((genre) => `<option value="${esc(genre)}" ${selected === genre ? "selected" : ""}>${esc(genre)}</option>`).join("")}
        </select>
        <input data-genre-custom type="text" maxlength="40" placeholder="Qual gênero?" aria-label="Outro gênero" value="${esc(custom)}" ${selected === "Outro" ? "" : "hidden"} />
        <button type="button" class="btn-icon" data-action="remove-genre" aria-label="Remover gênero" title="Remover gênero"><i class="ph ph-x"></i></button>
      </div>
    `;
  }

  function wireGenreSelector(container) {
    if (!container) return;
    const rows = container.querySelector(".genre-selector-rows");
    const addButton = container.querySelector('[data-action="add-genre"]');
    const update = () => {
      const count = rows.querySelectorAll(".genre-selector-row").length;
      addButton.hidden = count >= 5;
      container.querySelector("[data-genre-count]").textContent = `${count}/5 gêneros`;
    };

    container.addEventListener("change", (event) => {
      if (event.target.matches("[data-genre-value]")) {
        event.target.closest(".genre-selector-row").querySelector("[data-genre-custom]").hidden = event.target.value !== "Outro";
      }
    });
    container.addEventListener("click", (event) => {
      const remove = event.target.closest('[data-action="remove-genre"]');
      if (remove) {
        const row = remove.closest(".genre-selector-row");
        if (rows.querySelectorAll(".genre-selector-row").length > 1) row.remove();
        else {
          row.querySelector("[data-genre-value]").value = "";
          row.querySelector("[data-genre-custom]").value = "";
          row.querySelector("[data-genre-custom]").hidden = true;
        }
        update();
        return;
      }
      if (event.target.closest('[data-action="add-genre"]') && rows.querySelectorAll(".genre-selector-row").length < 5) {
        rows.insertAdjacentHTML("beforeend", genreRowHTML());
        update();
      }
    });
    update();
  }

  function readGenres(container) {
    return Array.from(container.querySelectorAll(".genre-selector-row"))
      .map((row) => {
        const value = row.querySelector("[data-genre-value]").value;
        return value === "Outro" ? row.querySelector("[data-genre-custom]").value.trim() : value;
      })
      .filter((genre, index, genres) => genre && genres.indexOf(genre) === index)
      .slice(0, 5);
  }

  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  function scheduleEditorHTML(schedule = [], legacyHours = "") {
    let days = Array.isArray(schedule) ? schedule : [];
    if (!days.length && legacyHours) {
      const match = String(legacyHours).match(/\b(Dom|Seg|Ter|Qua|Qui|Sex|Sáb)\s*[–-]\s*(Dom|Seg|Ter|Qua|Qui|Sex|Sáb)\s*[·,]\s*(\d{1,2})h\s*(?:às|-)\s*(\d{1,2})h/i);
      if (match) {
        const start = weekdays.findIndex((day) => day.toLowerCase() === match[1].toLowerCase());
        const end = weekdays.findIndex((day) => day.toLowerCase() === match[2].toLowerCase());
        const open = `${match[3].padStart(2, "0")}:00`;
        const close = `${match[4].padStart(2, "0")}:00`;
        const openDays = new Set();
        for (let day = start; ; day = (day + 1) % weekdays.length) {
          openDays.add(weekdays[day]);
          if (day === end) break;
        }
        days = weekdays.map((day) => ({ day, open: openDays.has(day) ? open : "", close: openDays.has(day) ? close : "", closed: !openDays.has(day) }));
      }
    }

    return `
      <div class="schedule-editor" data-schedule-editor>
        ${weekdays.map((day) => {
          const item = days.find((entry) => entry.day === day);
          const isOpen = item ? !item.closed : false;
          return `
            <div class="schedule-editor-row">
              <label class="schedule-editor-day"><input type="checkbox" data-schedule-open ${isOpen ? "checked" : ""} /> ${day}</label>
              <input type="time" aria-label="Abertura ${day}" data-schedule-time="open" value="${esc(item?.open || "")}" ${isOpen ? "required" : "disabled"} />
              <span>até</span>
              <input type="time" aria-label="Fechamento ${day}" data-schedule-time="close" value="${esc(item?.close || "")}" ${isOpen ? "required" : "disabled"} />
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function wireScheduleEditor(container) {
    if (!container) return;
    container.addEventListener("change", (event) => {
      if (!event.target.matches("[data-schedule-open]")) return;
      const row = event.target.closest(".schedule-editor-row");
      row.querySelectorAll("[data-schedule-time]").forEach((input) => {
        input.disabled = !event.target.checked;
        input.required = event.target.checked;
      });
    });
  }

  function readOpeningSchedule(container) {
    return Array.from(container.querySelectorAll(".schedule-editor-row")).map((row, index) => {
      const isOpen = row.querySelector("[data-schedule-open]").checked;
      return {
        day: weekdays[index],
        open: isOpen ? row.querySelector('[data-schedule-time="open"]').value : "",
        close: isOpen ? row.querySelector('[data-schedule-time="close"]').value : "",
        closed: !isOpen,
      };
    });
  }

  function openingHoursSummary(schedule) {
    return schedule.filter((entry) => !entry.closed && entry.open && entry.close)
      .map((entry) => `${entry.day} ${entry.open}–${entry.close}`)
      .join(" · ");
  }

  function readImageFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error(`Não foi possível ler ${file.name || "a imagem"}.`));
      reader.readAsDataURL(file);
    });
  }

  function imageCropContents(src, position = {}, label = "imagem", previewField = "") {
    const x = Number.isFinite(Number(position.x)) ? Number(position.x) : 50;
    const y = Number.isFinite(Number(position.y)) ? Number(position.y) : 50;
    return `
      <div class="image-crop-frame" data-image-crop tabindex="0" role="group" aria-label="Arraste para ajustar a posição da ${esc(label)}; use as setas do teclado para ajustes finos.">
        <img src="${esc(src || "")}" alt="Prévia de ${esc(label)}" ${previewField ? `data-image-preview="${esc(previewField)}"` : 'data-image-preview'} draggable="false" style="object-position:${x}% ${y}%;" />
      </div>
      <span class="image-crop-instruction">Arraste a imagem para ajustar</span>
      <div class="image-crop-actions">
        <button type="button" class="btn-ghost btn-sm" data-image-reset>Centralizar</button>
      </div>
      <input type="hidden" min="0" max="100" value="${x}" data-image-axis="x" aria-label="Posição horizontal de ${esc(label)}" />
      <input type="hidden" min="0" max="100" value="${y}" data-image-axis="y" aria-label="Posição vertical de ${esc(label)}" />
    `;
  }

  function imageCropHTML(src, position = {}, label = "imagem", className = "") {
    return `<div class="image-crop-widget ${esc(className)}" data-image-crop-widget>${imageCropContents(src, position, label)}</div>`;
  }

  function wireImageCrop(widget, onChange = () => {}) {
    const preview = widget.querySelector("[data-image-preview]");
    const frame = widget.querySelector("[data-image-crop]");
    const xControl = widget.querySelector('[data-image-axis="x"]');
    const yControl = widget.querySelector('[data-image-axis="y"]');
    if (!preview || !frame || !xControl || !yControl) return;
    const setPosition = (x, y) => {
      xControl.value = String(Math.max(0, Math.min(100, x)));
      yControl.value = String(Math.max(0, Math.min(100, y)));
      preview.style.objectPosition = `${xControl.value}% ${yControl.value}%`;
      frame.setAttribute("aria-valuetext", `Horizontal ${Math.round(Number(xControl.value))}%, vertical ${Math.round(Number(yControl.value))}%`);
      onChange({ x: Number(xControl.value), y: Number(yControl.value) });
    };
    frame.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      frame.setPointerCapture(event.pointerId);
      frame.dataset.dragX = String(event.clientX);
      frame.dataset.dragY = String(event.clientY);
      frame.classList.add("is-dragging");
    });
    frame.addEventListener("pointermove", (event) => {
      if (!frame.hasPointerCapture(event.pointerId)) return;
      const previousX = Number(frame.dataset.dragX);
      const previousY = Number(frame.dataset.dragY);
      const deltaX = event.clientX - previousX;
      const deltaY = event.clientY - previousY;
      const bounds = frame.getBoundingClientRect();
      if (!preview.naturalWidth || !preview.naturalHeight) return;
      const scale = Math.max(bounds.width / preview.naturalWidth, bounds.height / preview.naturalHeight);
      const overflowX = preview.naturalWidth * scale - bounds.width;
      const overflowY = preview.naturalHeight * scale - bounds.height;
      const x = Number(xControl.value) - (overflowX > 0 ? deltaX / overflowX * 100 : 0);
      const y = Number(yControl.value) - (overflowY > 0 ? deltaY / overflowY * 100 : 0);
      setPosition(x, y);
      frame.dataset.dragX = String(event.clientX);
      frame.dataset.dragY = String(event.clientY);
    });
    const endDrag = (event) => {
      if (frame.hasPointerCapture(event.pointerId)) frame.releasePointerCapture(event.pointerId);
      frame.classList.remove("is-dragging");
    };
    frame.addEventListener("pointerup", endDrag);
    frame.addEventListener("pointercancel", endDrag);
    frame.addEventListener("keydown", (event) => {
      const step = event.shiftKey ? 10 : 2;
      const offsets = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      }[event.key];
      if (!offsets) return;
      event.preventDefault();
      setPosition(Number(xControl.value) + offsets[0], Number(yControl.value) + offsets[1]);
    });
    widget.querySelector("[data-image-reset]").addEventListener("click", () => setPosition(50, 50));
    return { setPosition };
  }

  function imagePositionHTML(field, src, position = {}, label = field) {
    return `
      <div class="image-adjustment ${field.toLowerCase().includes("cover") ? "image-adjustment-cover" : ""}" data-image-adjustment="${field}" data-image-crop-widget>
        ${imageCropContents(src, position, label, field)}
      </div>
    `;
  }

  function wireImageAdjustment(root, field, maxBytes = 1024 * 1024) {
    const input = root.querySelector(`[name="${field}"]`);
    const adjustment = root.querySelector(`[data-image-adjustment="${field}"]`);
    if (!input || !adjustment) return;
    const preview = adjustment.querySelector("[data-image-preview]");
    const crop = wireImageCrop(adjustment);
    if (!crop) return;
    input.addEventListener("change", async () => {
      const file = input.files[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        input.value = "";
        toast("Selecione um arquivo de imagem.", { type: "error" });
        return;
      }
      if (file.size > maxBytes) {
        input.value = "";
        toast("Cada imagem deve ter até 1 MB.", { type: "error" });
        return;
      }
      try {
        preview.src = await readImageFile(file);
        crop.setPosition(50, 50);
      } catch (error) {
        toast(error.message, { type: "error" });
      }
    });
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

  window.UI = {
    el, esc, timeAgo, stateOptions, genreSelectorHTML, wireGenreSelector, readGenres,
    scheduleEditorHTML, wireScheduleEditor, readOpeningSchedule, openingHoursSummary,
    imagePositionHTML, imageCropHTML, wireImageCrop, wireImageAdjustment, readImageFile, toast, openModal, closeModal,
  };
})();
