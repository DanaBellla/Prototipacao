/* BandaConnection — Feed view (Instagram-like). */
(function () {
  const { esc, timeAgo } = window.UI;

  function renderRight() {
    const s = window.Store.state;
    const suggestions = s.users.filter((u) => u.id !== s.currentUserId && u.role !== "listener").slice(0, 4);
    const trends = s.trends || [];
    return `
      <h4>Sugestões para você</h4>
      <div>
        ${suggestions.map((u) => `
          <div class="suggestion" data-testid="suggestion-${u.id}">
            <img src="${esc(u.avatar)}" alt="${esc(u.name)}" />
            <div class="info" data-nav="#/profile/${u.id}" style="cursor:pointer">
              <strong>${esc(u.name)}</strong>
              <span>${esc(u.city || "")} · ${esc(window.Shell.roleLabel(u.role))}</span>
            </div>
            <button class="btn ${window.Store.isFollowing(u.id) ? "btn-ghost" : "btn-outline"}" data-follow-user="${u.id}" data-testid="follow-btn-${u.id}">${window.Store.isFollowing(u.id) ? "Seguindo" : "Seguir"}</button>
          </div>
        `).join("")}
      </div>
      <h4 style="margin-top:24px;">Em alta</h4>
      <div class="trends">
        ${trends.map((t) => `
          <div class="trend" data-testid="trend-item">
            <div class="cat">${esc(t.cat)}</div>
            <div class="title">${esc(t.title)}</div>
            <div class="meta">${esc(t.meta)}</div>
          </div>
        `).join("")}
      </div>
      <p class="text-dim" style="font-size:11px;margin-top:24px;">© 2026 BandaConnection · Protótipo</p>
    `;
  }

  function renderPost(p) {
    const s = window.Store.state;
    const author = s.users.find((u) => u.id === p.userId);
    if (!author) return "";
    const liked = window.Store.isLiked(p.id);
    const totalLikes = p.likes + (s.likes[p.id] || []).length;
    const capParts = (p.caption || "").split(/(#\w+)/g);
    const captionHtml = capParts
      .map((part) =>
        part.startsWith("#")
          ? `<span class="hashtags">${esc(part)}</span>`
          : esc(part)
      )
      .join("");

    const commentsPreview = p.comments && p.comments.length
      ? `<button class="comments-preview" data-action="view-comments" data-postid="${p.id}" data-testid="post-comments-preview-${p.id}">Ver ${p.comments.length} comentário${p.comments.length > 1 ? "s" : ""}</button>`
      : "";
    const images = p.images || (p.image ? [p.image] : []);
    const attachments = p.attachments || [];
    const media = images.length || attachments.length
      ? `<div class="post-media" data-testid="post-media-${p.id}">
           ${images.map((src) => `<img src="${esc(src)}" alt="Imagem do post de ${esc(author.name)}" loading="lazy" />`).join("")}
           ${attachments.map((file) => `<a class="post-file" href="${esc(file.data)}" download="${esc(file.name)}"><i class="ph ph-file-arrow-down"></i><span>${esc(file.name)}</span></a>`).join("")}
         </div>`
      : "";

    return `
      <article class="post" data-testid="post-${p.id}">
        <header class="post-head">
          <img src="${esc(author.avatar)}" alt="${esc(author.name)}" data-nav="#/profile/${author.id}" style="cursor:pointer" />
          <div class="info">
            <strong data-nav="#/profile/${author.id}">
              ${esc(author.name)}
              ${author.verified ? '<i class="ph-fill ph-seal-check verified" title="Verificado"></i>' : ""}
            </strong>
            <div class="post-meta-row">
              <span class="post-role-badge post-role-${esc(author.role)}">${esc(window.Shell.roleLabel(author.role))}</span>
              ${p.location ? `<span class="post-location">${esc(p.location)}</span>` : ""}
              <span class="post-time">${esc(timeAgo(p.time))}</span>
            </div>
          </div>
          <button class="btn-icon more" aria-label="Mais" data-testid="post-more-${p.id}"><i class="ph ph-dots-three"></i></button>
        </header>
        ${media}
        <div class="post-actions">
          <button class="action ${liked ? "liked" : ""}" data-action="like" data-postid="${p.id}" data-testid="like-btn-${p.id}">
            <i class="ph ph-heart"></i><i class="ph-fill ph-heart"></i>
          </button>
          <button class="action" data-action="focus-comment" data-postid="${p.id}" data-testid="comment-btn-${p.id}">
            <i class="ph ph-chat-circle"></i>
          </button>
          <button class="action" data-testid="share-btn-${p.id}"><i class="ph ph-paper-plane-tilt"></i></button>
          <span class="spacer"></span>
          <button class="action" data-action="save" data-testid="save-btn-${p.id}"><i class="ph ph-bookmark-simple"></i></button>
        </div>
        <div class="post-body">
          <div class="likes" data-testid="likes-count-${p.id}">${totalLikes} curtidas</div>
          <div class="caption"><strong>${esc(author.name)}</strong>${captionHtml}</div>
          ${commentsPreview}
          <span class="time">${esc(new Date(p.time).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" }))}</span>
          <div class="comment-row">
            <input placeholder="Adicione um comentário..." data-comment-input="${p.id}" data-testid="comment-input-${p.id}" />
            <button data-action="post-comment" data-postid="${p.id}" data-testid="post-comment-btn-${p.id}">Publicar</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderFeed(app) {
    if (!window.Auth.require()) return;
    const u = window.Store.currentUser();
    const posts = window.Store.state.posts;
    const composer = window.Store.canCreatePost() ? `
      <div class="composer">
        <img src="${esc(u.avatar)}" alt="Você" />
        <input placeholder="Compartilhe algo com a comunidade..." data-testid="composer-input" id="composer-input" />
        <div class="composer-actions">
          <input type="file" accept="image/*" multiple hidden data-testid="composer-image-input" />
          <input type="file" multiple hidden data-testid="composer-file-input" />
          <button class="btn-icon" aria-label="Adicionar imagens" title="Adicionar imagens" data-testid="composer-photo-btn"><i class="ph ph-image"></i></button>
          <button class="btn-icon" aria-label="Anexar arquivos" title="Anexar arquivos" data-testid="composer-file-btn"><i class="ph ph-paperclip"></i></button>
          <button class="btn btn-primary btn-sm" data-testid="composer-publish-btn" data-action="publish">Publicar</button>
        </div>
      </div>
      <div class="composer-attachments" data-testid="composer-attachments" hidden></div>
    ` : "";

    const main = `
      <div class="feed-col" data-testid="feed-col">
        ${composer}
        <div id="feed-list" data-testid="feed-list">
          ${posts.map(renderPost).join("")}
        </div>
      </div>
    `;

    app.innerHTML = window.Shell.renderShell("feed", main, renderRight());
    window.Shell.wireShell(app);
    wireFeed(app);
  }

  function wireFeed(root) {
    const selectedImages = [];
    const selectedFiles = [];
    const preview = root.querySelector('[data-testid="composer-attachments"]');

    if (preview) {
      const maxAttachmentBytes = 2 * 1024 * 1024;
      const renderAttachmentPreview = () => {
        const items = [
          ...selectedImages.map((item, index) => ({ ...item, kind: "image", index })),
          ...selectedFiles.map((item, index) => ({ ...item, kind: "file", index })),
        ];
        preview.hidden = items.length === 0;
        preview.innerHTML = items.map((item) => item.kind === "image"
          ? `<div class="composer-attachment"><img src="${item.data}" alt="${esc(item.name)}" /><button type="button" class="btn-icon" aria-label="Remover ${esc(item.name)}" data-remove-kind="image" data-remove-index="${item.index}"><i class="ph ph-x"></i></button></div>`
          : `<div class="composer-attachment-file"><i class="ph ph-file"></i><span>${esc(item.name)}</span><button type="button" class="btn-icon" aria-label="Remover ${esc(item.name)}" data-remove-kind="file" data-remove-index="${item.index}"><i class="ph ph-x"></i></button></div>`
        ).join("");
      };

      const readFile = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ name: file.name, type: file.type, data: reader.result, size: file.size });
        reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
        reader.readAsDataURL(file);
      });

    root.querySelector('[data-testid="composer-photo-btn"]').addEventListener("click", () => root.querySelector('[data-testid="composer-image-input"]').click());
    root.querySelector('[data-testid="composer-file-btn"]').addEventListener("click", () => root.querySelector('[data-testid="composer-file-input"]').click());
    [
      [root.querySelector('[data-testid="composer-image-input"]'), selectedImages],
      [root.querySelector('[data-testid="composer-file-input"]'), selectedFiles],
    ].forEach(([input, collection]) => input.addEventListener("change", async () => {
      const files = Array.from(input.files || []);
      const currentSize = [...selectedImages, ...selectedFiles].reduce((total, item) => total + item.size, 0);
      const incomingSize = files.reduce((total, file) => total + file.size, 0);
      if (currentSize + incomingSize > maxAttachmentBytes) {
        window.UI.toast("Os anexos deste post podem ter até 2 MB no total.", { type: "error" });
        input.value = "";
        return;
      }
      try {
        collection.push(...await Promise.all(files.map(readFile)));
        renderAttachmentPreview();
      } catch (error) {
        window.UI.toast(error.message, { type: "error" });
      }
      input.value = "";
    }));
      preview.addEventListener("click", (event) => {
        const button = event.target.closest("[data-remove-kind]");
        if (!button) return;
        const collection = button.dataset.removeKind === "image" ? selectedImages : selectedFiles;
        collection.splice(Number(button.dataset.removeIndex), 1);
        renderAttachmentPreview();
      });
    }

    root.querySelectorAll("[data-follow-user]").forEach((button) =>
      button.addEventListener("click", () => {
        const target = window.Store.userById(button.dataset.followUser);
        if (!target) return;
        const isFollowing = window.Store.toggleFollow(target.id);
        window.UI.toast(isFollowing ? `Você está seguindo ${target.name}.` : `Você deixou de seguir ${target.name}.`, { type: "success" });
        renderFeed(root);
      })
    );

    // Nav delegation
    root.querySelectorAll("[data-nav]").forEach((n) =>
      n.addEventListener("click", () => (location.hash = n.dataset.nav))
    );

    // Like
    root.querySelectorAll('[data-action="like"]').forEach((btn) =>
      btn.addEventListener("click", () => {
        const id = btn.dataset.postid;
        window.Store.toggleLike(id);
        btn.classList.toggle("liked");
        const post = window.Store.state.posts.find((p) => p.id === id);
        const totalLikes = post.likes + (window.Store.state.likes[id] || []).length;
        const counter = root.querySelector(`[data-testid="likes-count-${id}"]`);
        if (counter) counter.textContent = `${totalLikes} curtidas`;
      })
    );

    // Focus comment
    root.querySelectorAll('[data-action="focus-comment"]').forEach((btn) =>
      btn.addEventListener("click", () => {
        const id = btn.dataset.postid;
        const input = root.querySelector(`[data-comment-input="${id}"]`);
        if (input) input.focus();
      })
    );

    // Save (toast only)
    root.querySelectorAll('[data-action="save"]').forEach((btn) =>
      btn.addEventListener("click", () => {
        btn.classList.toggle("liked"); // reuse visual
        window.UI.toast("Post salvo em sua coleção.", { type: "success", title: "Salvo" });
      })
    );

    // Post comment
    root.querySelectorAll('[data-action="post-comment"]').forEach((btn) =>
      btn.addEventListener("click", () => {
        const id = btn.dataset.postid;
        const input = root.querySelector(`[data-comment-input="${id}"]`);
        const text = (input.value || "").trim();
        if (!text) return;
        window.Store.addComment(id, text);
        input.value = "";
        window.UI.toast("Comentário publicado.", { type: "success" });
        // Update preview line
        const post = window.Store.state.posts.find((p) => p.id === id);
        if (post) renderFeed(root);
      })
    );

    root.querySelectorAll('[data-action="view-comments"]').forEach((button) =>
      button.addEventListener("click", () => openCommentsModal(button.dataset.postid))
    );

    // Composer publish (opens quick modal)
    root.querySelectorAll('[data-action="publish"]').forEach((btn) =>
      btn.addEventListener("click", () => {
        const caption = (root.querySelector("#composer-input").value || "").trim();
        if (!caption && !selectedImages.length && !selectedFiles.length) {
          window.UI.toast("Escreva algo ou adicione uma mídia antes de publicar.", { type: "error" });
          return;
        }
        const post = window.Store.createPost({
          caption,
          images: selectedImages.map((item) => item.data),
          attachments: selectedFiles.map(({ name, type, data }) => ({ name, type, data })),
          location: (window.Store.currentUser().city || "") + (window.Store.currentUser().state ? ", " + window.Store.currentUser().state : ""),
        });
        window.UI.toast("Sua publicação está no ar!", { type: "success", title: "Publicado" });
        renderFeed(root);
      })
    );
  }

  function openCommentsModal(postId) {
    const post = window.Store.state.posts.find((entry) => entry.id === postId);
    if (!post) return;
    const comments = post.comments || [];
    const body = comments.length
      ? `<div class="comments-list">${comments.map((comment) => {
          const author = window.Store.userById(comment.user);
          return `<article class="comment-item">
            <img src="${esc(author?.avatar || "")}" alt="" />
            <div><div class="comment-author">${esc(author?.name || "Usuário")}<span class="post-role-badge post-role-${esc(author?.role || "listener")}">${esc(window.Shell.roleLabel(author?.role))}</span></div><p>${esc(comment.text)}</p></div>
          </article>`;
        }).join("")}</div>`
      : `<p class="text-muted">Ainda não há comentários nesta publicação.</p>`;
    window.UI.openModal({
      title: "Comentários",
      subtitle: `${comments.length} comentário${comments.length === 1 ? "" : "s"}`,
      body,
      testId: "comments-modal",
      actions: [{ label: "Fechar", variant: "btn-ghost", testId: "comments-close-btn" }],
    });
  }

  window.Views = window.Views || {};
  window.Views.feed = renderFeed;
})();
