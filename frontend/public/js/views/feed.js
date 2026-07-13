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
            <button class="btn btn-outline" data-testid="follow-btn-${u.id}">Seguir</button>
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
      ? `<span class="comments-preview" data-testid="post-comments-preview-${p.id}">Ver ${p.comments.length} comentário${p.comments.length > 1 ? "s" : ""}</span>`
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
            <span>${esc(p.location || window.Shell.roleLabel(author.role))} · ${esc(timeAgo(p.time))}</span>
          </div>
          <button class="btn-icon more" aria-label="Mais" data-testid="post-more-${p.id}"><i class="ph ph-dots-three"></i></button>
        </header>
        <div class="post-media" data-testid="post-media-${p.id}">
          <img src="${esc(p.image)}" alt="Post de ${esc(author.name)}" loading="lazy" />
        </div>
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

    const main = `
      <div class="feed-col" data-testid="feed-col">
        <div class="composer">
          <img src="${esc(u.avatar)}" alt="Você" />
          <input placeholder="Compartilhe algo com a comunidade..." data-testid="composer-input" id="composer-input" />
          <div class="composer-actions">
            <button class="btn-icon" aria-label="Foto" data-testid="composer-photo-btn"><i class="ph ph-image"></i></button>
            <button class="btn-icon" aria-label="Evento" data-testid="composer-event-btn"><i class="ph ph-calendar-plus"></i></button>
            <button class="btn btn-primary btn-sm" data-testid="composer-publish-btn" data-action="publish">Publicar</button>
          </div>
        </div>
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
        const preview = root.querySelector(`[data-testid="post-comments-preview-${id}"]`);
        if (preview) preview.textContent = `Ver ${post.comments.length} comentário${post.comments.length > 1 ? "s" : ""}`;
      })
    );

    // Composer publish (opens quick modal)
    root.querySelectorAll('[data-action="publish"]').forEach((btn) =>
      btn.addEventListener("click", () => {
        const caption = (root.querySelector("#composer-input").value || "").trim();
        if (!caption) {
          window.UI.toast("Escreva algo antes de publicar.", { type: "error" });
          return;
        }
        const post = window.Store.createPost({
          caption,
          image:
            "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200",
          location: (window.Store.currentUser().city || "") + (window.Store.currentUser().state ? ", " + window.Store.currentUser().state : ""),
        });
        window.UI.toast("Sua publicação está no ar!", { type: "success", title: "Publicado" });
        // Prepend new post
        const list = root.querySelector("#feed-list");
        list.insertAdjacentHTML("afterbegin", renderPost(post));
        root.querySelector("#composer-input").value = "";
        wireFeed(root); // rewire new elements
      })
    );
  }

  window.Views = window.Views || {};
  window.Views.feed = renderFeed;
})();
