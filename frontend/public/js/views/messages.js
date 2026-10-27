/* BandaConnection — Private messages (Messenger-like). */
(function () {
  const { esc, timeAgo } = window.UI;

  function renderRight() {
    return `
      <h4>Sobre as mensagens</h4>
      <div class="trend">
        <div class="cat">Dica</div>
        <div class="title">Combine shows em minutos</div>
        <div class="meta">Envie propostas, alinhe cachê e feche datas direto no chat.</div>
      </div>
      <h4 style="margin-top:24px;">Ações rápidas</h4>
      <div class="trends">
        <a class="trend" href="#/explore" data-testid="right-explore-link">
          <div class="cat">Explorar</div>
          <div class="title">Encontrar artistas</div>
          <div class="meta">Descubra novos perfis para conectar.</div>
        </a>
      </div>
    `;
  }

  function renderMessages(app, params = {}) {
    if (!window.Auth.require()) return;
    const me = window.Store.currentUser();
    const convs = window.Store.conversationsFor(me.id);
    let activeId = params.userId ? findOrCreateWith(me, params.userId) : convs[0]?.id;
    if (params.userId && !convs.find((c) => c.id === activeId)) {
      // Just created, refresh list
    }

    const main = `
      <div data-testid="messages-view" style="display:grid;grid-template-columns:320px 1fr;gap:16px;height:calc(100vh - var(--header-h) - 48px);">
        <aside style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:16px;padding:12px;overflow-y:auto;">
          <div style="padding:8px 8px 14px;">
            <h2 style="font-size:22px;margin-bottom:4px;">Mensagens</h2>
            <p class="text-muted" style="margin:0;font-size:13px;">${convs.length} conversa${convs.length === 1 ? "" : "s"}</p>
          </div>
          <div id="conv-list" data-testid="conv-list">
            ${convs.length === 0
              ? `<div class="text-muted" style="padding:20px;text-align:center;font-size:13px;">Nenhuma conversa ainda.<br/>Vá até um perfil e clique em <strong>Mensagem</strong>.</div>`
              : convs.map((c) => convItemHTML(c, me, activeId)).join("")}
          </div>
        </aside>
        <section id="chat-panel" style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:16px;display:flex;flex-direction:column;overflow:hidden;">
          ${activeId ? chatPanelHTML(activeId, me) : emptyChatHTML()}
        </section>
      </div>
    `;

    app.innerHTML = window.Shell.renderShell("messages", main, renderRight());
    window.Shell.wireShell(app);
    wire(app, me);
  }

  function findOrCreateWith(me, otherId) {
    if (!window.Store.state.users.find((u) => u.id === otherId)) return null;
    const c = window.Store.getOrCreateConversation(otherId);
    return c ? c.id : null;
  }

  function convItemHTML(c, me, activeId) {
    const otherId = c.participants.find((p) => p !== me.id);
    const other = window.Store.state.users.find((u) => u.id === otherId) || { name: "Usuário", avatar: "" };
    const last = c.messages[c.messages.length - 1];
    const isActive = c.id === activeId;
    return `
      <button class="conv-item" data-conv-id="${c.id}" data-testid="conv-item-${c.id}"
        style="width:100%;text-align:left;display:flex;align-items:center;gap:12px;padding:10px;border-radius:12px;background:${isActive ? "var(--color-primary-soft)" : "transparent"};border:none;color:var(--text-main);cursor:pointer;margin-bottom:4px;transition:background-color 0.2s ease;">
        <img src="${esc(other.avatar)}" alt="${esc(other.name)}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;object-position:${Number.isFinite(Number(other.avatarPosition?.x)) ? Number(other.avatarPosition.x) : 50}% ${Number.isFinite(Number(other.avatarPosition?.y)) ? Number(other.avatarPosition.y) : 50}%;" />
        <div style="flex:1;min-width:0;">
          <div style="display:flex;justify-content:space-between;gap:6px;">
            <strong style="font-family:var(--font-heading);font-size:14px;">${esc(other.name)}</strong>
            ${last ? `<span class="text-dim" style="font-size:11px;">${esc(timeAgo(last.time))}</span>` : ""}
          </div>
          <div class="text-muted" style="font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
            ${last ? esc(last.text || (last.attachments?.length ? "Arquivo enviado" : "Iniciar conversa")) : "Iniciar conversa"}
          </div>
        </div>
      </button>
    `;
  }

  function chatPanelHTML(convId, me) {
    const c = window.Store.state.conversations.find((x) => x.id === convId);
    if (!c) return emptyChatHTML();
    const otherId = c.participants.find((p) => p !== me.id);
    const other = window.Store.state.users.find((u) => u.id === otherId) || { name: "Usuário", avatar: "" };

    return `
      <header style="padding:16px 20px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:12px;">
        <img src="${esc(other.avatar)}" alt="${esc(other.name)}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;object-position:${Number.isFinite(Number(other.avatarPosition?.x)) ? Number(other.avatarPosition.x) : 50}% ${Number.isFinite(Number(other.avatarPosition?.y)) ? Number(other.avatarPosition.y) : 50}%;" />
        <div style="flex:1;">
          <a href="#/profile/${other.id}" style="font-family:var(--font-heading);font-size:16px;font-weight:600;color:var(--text-main);" data-testid="chat-header-name">${esc(other.name)}</a>
          <div class="text-muted" style="font-size:12px;">${esc(window.Shell.roleLabel(other.role))} · ${esc(other.city || "")}</div>
        </div>
        <button class="btn-icon" aria-label="Detalhes" data-testid="chat-info-btn"><i class="ph ph-info"></i></button>
      </header>
      <div id="messages-scroll" style="flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:8px;" data-testid="messages-scroll">
        ${c.messages.map((m) => bubbleHTML(m, me)).join("")}
      </div>
      <footer style="padding:14px 16px;border-top:1px solid var(--border-subtle);display:flex;flex-direction:column;gap:8px;">
        <div id="chat-file-list" class="chat-file-list" data-testid="chat-file-list" hidden></div>
        <div style="display:flex;align-items:center;gap:10px;">
          <input type="file" id="chat-file-input" multiple hidden data-testid="chat-file-input" />
          <button class="btn-icon" aria-label="Anexar" data-testid="chat-attach-btn"><i class="ph ph-paperclip"></i></button>
          <input id="msg-input" placeholder="Escreva uma mensagem..." data-testid="msg-input"
            style="flex:1;padding:12px 16px;background:var(--bg-elevated);border:1px solid transparent;border-radius:9999px;color:var(--text-main);font-size:14px;outline:none;" />
          <button class="btn btn-primary" data-action="send" data-conv-id="${convId}" data-testid="msg-send-btn">
            <i class="ph-fill ph-paper-plane-tilt"></i> Enviar
          </button>
        </div>
      </footer>
    `;
  }

  function bubbleHTML(m, me) {
    if (m.type === "proposal") return proposalBubbleHTML(m, me);
    const mine = m.from === me.id;
    const attachments = (m.attachments || []).map((file) => `
      <a class="chat-attachment" href="${esc(file.data)}" download="${esc(file.name)}" data-testid="chat-attachment">
        ${file.type?.startsWith("image/") ? `<img src="${esc(file.data)}" alt="${esc(file.name)}" />` : `<i class="ph ph-file-arrow-down"></i>`}
        <span>${esc(file.name)}</span>
      </a>
    `).join("");
    return `
      <div style="display:flex;justify-content:${mine ? "flex-end" : "flex-start"};">
        <div style="max-width:70%;padding:10px 14px;border-radius:${mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px"};background:${mine ? "var(--color-primary)" : "var(--bg-elevated)"};color:${mine ? "white" : "var(--text-main)"};font-size:14px;line-height:1.4;">
          ${esc(m.text)}
          ${attachments}
          <div style="font-size:10px;opacity:0.75;margin-top:4px;">${esc(timeAgo(m.time))}</div>
        </div>
      </div>
    `;
  }

  function proposalBubbleHTML(message, me) {
    const proposal = window.Store.state.proposals.find((entry) => entry.id === message.proposalId);
    if (!proposal) return bubbleHTML({ ...message, type: "message" }, me);
    const mine = message.from === me.id;
    const date = proposal.date
      ? new Date(`${proposal.date}T00:00:00`).toLocaleDateString("pt-BR")
      : "";
    const value = Number(proposal.value);
    return `
      <div style="display:flex;justify-content:${mine ? "flex-end" : "flex-start"};">
        <article class="proposal-message" data-testid="proposal-message">
          <strong><i class="ph ph-paper-plane-tilt"></i> Proposta de show</strong>
          <span><i class="ph ph-calendar-blank"></i> ${esc(date)} · ${esc(proposal.time || "")}</span>
          ${proposal.duration ? `<span><i class="ph ph-clock"></i> ${esc(proposal.duration)} min</span>` : ""}
          ${Number.isFinite(value) && value > 0 ? `<span><i class="ph ph-currency-circle-dollar"></i> ${esc(new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value))}</span>` : ""}
          ${proposal.place ? `<span><i class="ph ph-map-pin"></i> ${esc(proposal.place)}</span>` : ""}
          ${proposal.notes ? `<p>${esc(proposal.notes)}</p>` : ""}
          <small>${esc(timeAgo(message.time))}</small>
        </article>
      </div>
    `;
  }

  function emptyChatHTML() {
    return `
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;text-align:center;">
        <div style="width:80px;height:80px;border-radius:50%;background:var(--color-primary-soft);color:var(--color-primary);display:flex;align-items:center;justify-content:center;margin-bottom:20px;">
          <i class="ph ph-chat-circle-dots" style="font-size:38px;"></i>
        </div>
        <h3 style="font-size:20px;margin-bottom:8px;">Suas conversas aparecem aqui</h3>
        <p class="text-muted" style="max-width:360px;margin:0;">Envie uma mensagem para um músico ou estabelecimento e comece uma conversa direta.</p>
      </div>
    `;
  }

  function wire(root, me) {
    let active = null;
    root.querySelectorAll("[data-conv-id]").forEach((btn) =>
      btn.addEventListener("click", () => {
        active = btn.dataset.convId;
        root.querySelectorAll("[data-conv-id]").forEach((b) => {
          b.style.background = b.dataset.convId === active ? "var(--color-primary-soft)" : "transparent";
        });
        document.getElementById("chat-panel").innerHTML = chatPanelHTML(active, me);
        wireChat(root, me);
        scrollChatToBottom();
      })
    );
    wireChat(root, me);
    scrollChatToBottom();
  }

  function scrollChatToBottom() {
    const s = document.getElementById("messages-scroll");
    if (s) s.scrollTop = s.scrollHeight;
  }

  function wireChat(root, me) {
    const btn = document.querySelector('[data-action="send"]');
    const input = document.getElementById("msg-input");
    const fileInput = document.getElementById("chat-file-input");
    const attachButton = root.querySelector('[data-testid="chat-attach-btn"]');
    const fileList = document.getElementById("chat-file-list");
    if (!btn || !input || !fileInput || !attachButton || !fileList) return;
    const selectedFiles = [];
    const maxAttachmentBytes = 2 * 1024 * 1024;
    const renderFiles = () => {
      fileList.hidden = selectedFiles.length === 0;
      fileList.innerHTML = selectedFiles.map((file, index) => `
        <span class="chat-file-chip"><i class="ph ph-file"></i>${esc(file.name)}
          <button type="button" class="btn-icon" aria-label="Remover ${esc(file.name)}" data-remove-chat-file="${index}"><i class="ph ph-x"></i></button>
        </span>
      `).join("");
    };
    const readFile = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, type: file.type || "application/octet-stream", data: reader.result, size: file.size });
      reader.onerror = () => reject(new Error(`Não foi possível ler ${file.name}.`));
      reader.readAsDataURL(file);
    });
    attachButton.onclick = () => fileInput.click();
    fileInput.onchange = () => {
      const incoming = Array.from(fileInput.files || []);
      const totalSize = [...selectedFiles, ...incoming].reduce((total, file) => total + file.size, 0);
      if (totalSize > maxAttachmentBytes) {
        window.UI.toast("Os anexos da mensagem podem ter até 2 MB no total.", { type: "error" });
        fileInput.value = "";
        return;
      }
      selectedFiles.push(...incoming);
      renderFiles();
      fileInput.value = "";
    };
    fileList.onclick = (event) => {
      const remove = event.target.closest("[data-remove-chat-file]");
      if (!remove) return;
      selectedFiles.splice(Number(remove.dataset.removeChatFile), 1);
      renderFiles();
    };
    const send = async () => {
      const text = input.value.trim();
      if (!text && !selectedFiles.length) return;
      const convId = btn.dataset.convId;
      let attachments;
      try {
        attachments = await Promise.all(selectedFiles.map(readFile));
      } catch (error) {
        window.UI.toast(error.message, { type: "error" });
        return;
      }
      window.Store.sendMessage(convId, text, attachments);
      input.value = "";
      selectedFiles.length = 0;
      renderFiles();
      const c = window.Store.state.conversations.find((x) => x.id === convId);
      document.getElementById("messages-scroll").innerHTML = c.messages.map((m) => window.Views._msgBubble ? window.Views._msgBubble(m, me) : bubbleHTML(m, me)).join("");
      scrollChatToBottom();
    };
    btn.onclick = send;
    input.onkeydown = (e) => { if (e.key === "Enter") send(); };

    // Listen for simulated replies
    window.addEventListener("sonora:message", refresh);
    function refresh(e) {
      if (!e || e.detail.convId !== btn.dataset.convId) return;
      const c = window.Store.state.conversations.find((x) => x.id === btn.dataset.convId);
      const scroll = document.getElementById("messages-scroll");
      if (scroll) scroll.innerHTML = c.messages.map((m) => bubbleHTML(m, me)).join("");
      scrollChatToBottom();
    }
  }

  window.Views = window.Views || {};
  window.Views.messages = renderMessages;
  window.Views._msgBubble = bubbleHTML;
})();
