/* BandaConnection — Public profile views (Musician / Venue / Listener). */
(function () {
  const { esc } = window.UI;

  function socialProfileUrl(platform, value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    try {
      const url = new URL(raw);
      const host = url.hostname.toLowerCase();
      const allowed = platform === "instagram"
        ? ["instagram.com", "www.instagram.com"]
        : ["open.spotify.com", "spotify.com", "www.spotify.com"];
      if (allowed.includes(host) && (url.protocol === "https:" || url.protocol === "http:")) {
        return `https://${url.host}${url.pathname}${url.search}${url.hash}`;
      }
    } catch (_) {}
    if (platform === "instagram") {
      return `https://www.instagram.com/${encodeURIComponent(raw.replace(/^@/, ""))}/`;
    }
    return `https://open.spotify.com/search/${encodeURIComponent(raw)}`;
  }

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
          <a class="trend" href="${esc(socialProfileUrl("instagram", user.instagram || "@" + (user.artistName || user.name).toLowerCase().replaceAll(" ", "")))}" target="_blank" rel="noopener noreferrer"><div class="cat">Instagram</div><div class="title">${esc(user.instagram || "@" + (user.artistName || user.name).toLowerCase().replaceAll(" ", ""))}</div></a>
          <a class="trend" href="${esc(socialProfileUrl("spotify", user.spotify || user.artistName || user.name))}" target="_blank" rel="noopener noreferrer"><div class="cat">Spotify</div><div class="title">${esc(user.spotify || user.artistName || user.name)}</div></a>
        </div>
      ` : ""}
      ${user.role === "venue" ? `
        <h4 style="margin-top:24px;">Contato</h4>
        <div class="trends">
          <div class="trend"><div class="cat">Endereço</div><div class="title" style="font-size:14px;">${esc(user.address || "—")}</div></div>
          <div class="trend"><div class="cat">Funcionamento</div><div class="title" style="font-size:14px;">${esc(user.hours || "—")}</div></div>
          ${user.instagram ? `<a class="trend" href="${esc(socialProfileUrl("instagram", user.instagram))}" target="_blank" rel="noopener noreferrer"><div class="cat">Instagram</div><div class="title" style="font-size:14px;">${esc(user.instagram)}</div></a>` : ""}
        </div>
      ` : ""}
    `;
  }

  function eventSortDate(event) {
    if (event.dateISO) return new Date(`${event.dateISO}T00:00:00`);
    const months = { JAN: 0, FEV: 1, MAR: 2, ABR: 3, MAI: 4, JUN: 5, JUL: 6, AGO: 7, SET: 8, OUT: 9, NOV: 10, DEZ: 11 };
    const [day, month] = (event.date || "").split(" ");
    const now = new Date();
    const date = new Date(now.getFullYear(), months[(month || "").toUpperCase()] ?? 0, Number(day) || 1);
    if (date < new Date(now.getFullYear(), now.getMonth(), now.getDate())) date.setFullYear(date.getFullYear() + 1);
    return date;
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
    const currentUser = window.Store.currentUser();
    const followersCount = window.Store.followersOf(user.id).length;
    const followingCount = window.Store.followingOf(user.id).length;
    const isFollowing = window.Store.isFollowing(user.id);
    const followCTA = !isOwn
      ? `<button class="btn ${isFollowing ? "btn-ghost" : "btn-primary"}" data-testid="follow-profile-btn"><i class="ph ${isFollowing ? "ph-check" : "ph-plus"}"></i> ${isFollowing ? "Seguindo" : "Seguir"}</button>`
      : "";

    const primaryCTA = isOwn
      ? `<button class="btn btn-ghost" data-testid="edit-profile-btn"><i class="ph ph-pencil-simple"></i> Editar perfil</button>`
      : currentUser.role === "venue" && isMusician
      ? `<button class="btn btn-primary" data-action="send-proposal" data-testid="send-proposal-btn"><i class="ph ph-paper-plane-tilt"></i> Enviar Proposta</button>${followCTA}`
      : followCTA;

    const secondaryCTA = isOwn
      ? ""
      : `<button class="btn btn-ghost" data-testid="message-btn"><i class="ph ph-chat-circle"></i> Mensagem</button>
         <button class="btn-icon" aria-label="Compartilhar" data-testid="share-profile-btn"><i class="ph ph-share-network"></i></button>`;

    const stats = isMusician
      ? [
          { num: followersCount, lbl: "Seguidores", list: "followers" },
          { num: followingCount, lbl: "Seguindo", list: "following" },
          { num: user.shows, lbl: "Shows realizados" },
          { num: user.rating, lbl: "Avaliação" },
        ]
      : isVenue
      ? [
          { num: followersCount, lbl: "Seguidores", list: "followers" },
          { num: followingCount, lbl: "Seguindo", list: "following" },
          { num: user.capacity || "—", lbl: "Capacidade" },
          { num: user.rating, lbl: "Avaliação" },
        ]
      : [
          { num: followersCount, lbl: "Seguidores", list: "followers" },
          { num: followingCount, lbl: "Seguindo", list: "following" },
        ];

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

    const userPosts = s.posts.filter((post) => post.userId === user.id);
    const postsSection = userPosts.length
      ? `<section class="profile-posts" data-testid="profile-posts">
           <h3>Publicações</h3>
           <div class="profile-post-grid">
             ${userPosts.map((post) => {
               const images = post.images || (post.image ? [post.image] : []);
               const files = post.attachments || [];
               return `<article class="profile-post" data-testid="profile-post-${esc(post.id)}">
                 ${images.length ? `<img class="profile-post-image" src="${esc(images[0])}" alt="Imagem publicada por ${esc(user.name)}" loading="lazy" />` : `<div class="profile-post-file-cover"><i class="ph ph-file"></i>${files.length ? esc(files.length) + " arquivo(s)" : "Publicação"}</div>`}
                 <p>${esc(post.caption || "")}</p>
                 ${files.map((file) => `<a class="profile-post-file" href="${esc(file.data)}" download="${esc(file.name)}"><i class="ph ph-download-simple"></i>${esc(file.name)}</a>`).join("")}
               </article>`;
             }).join("")}
           </div>
         </section>`
      : "";

    const ownedEvents = s.events
      .filter((event) => isMusician ? event.artistId === user.id : isVenue && event.venueId === user.id)
      .sort((a, b) => eventSortDate(a) - eventSortDate(b));
    const upcoming = ownedEvents.length
      ? `<div class="upcoming-shows" data-testid="upcoming-shows">
           <h3>Próximos shows</h3>
           ${ownedEvents.map((event) => `
             <div class="show-item">
               <div class="show-date"><div class="d">${esc(event.date.split(" ")[0])}</div><div class="m">${esc(event.date.split(" ")[1] || "")}</div></div>
               <div class="info"><strong>${esc(event.title)}</strong><span>${esc(event.city)} · ${esc(event.time || "")}</span></div>
               <button class="btn btn-outline btn-sm" data-profile-event-id="${esc(event.id)}" data-testid="show-details-btn">Detalhes</button>
             </div>
           `).join("")}
         </div>`
      : (user.shows_upcoming || []).length
      ? `<div class="upcoming-shows" data-testid="upcoming-shows">
           <h3>Próximos shows</h3>
           ${user.shows_upcoming.map((s) => `
             <div class="show-item">
               <div class="show-date"><div class="d">${esc(s.date)}</div><div class="m">${esc(s.month)}</div></div>
               <div class="info"><strong>${esc(s.title)}</strong><span>${esc(s.city)} · ${esc(s.time)}</span></div>
               <button class="btn btn-outline btn-sm" data-show-details="${esc(String(user.shows_upcoming.indexOf(s)))}" data-testid="show-details-btn">Detalhes</button>
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
          ${stats.map((s) => s.list ? `
            <button type="button" class="profile-stat profile-stat-button" data-follow-list="${s.list}" data-testid="profile-${s.list}-btn">
              <div class="num">${esc(s.num)}</div>
              <div class="lbl">${esc(s.lbl)}</div>
            </button>
          ` : `
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
            ${postsSection}
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
      b.addEventListener("click", () => {
        if (!window.Store.canSendProposal(user.id)) {
          window.UI.toast("Somente estabelecimentos podem enviar propostas para músicos.", { type: "error" });
          return;
        }
        openProposalModal(user);
      })
    );
    root.querySelectorAll('[data-testid="follow-profile-btn"]').forEach((b) =>
      b.addEventListener("click", () => {
        const isFollowing = window.Store.toggleFollow(user.id);
        window.UI.toast(isFollowing ? `Você está seguindo ${user.name}.` : `Você deixou de seguir ${user.name}.`, { type: "success" });
        renderProfile(root, { id: user.id });
      })
    );
    root.querySelectorAll("[data-follow-list]").forEach((button) =>
      button.addEventListener("click", () => openFollowList(user, button.dataset.followList))
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
      b.addEventListener("click", () => openEditProfileModal(root, user))
    );
    root.querySelectorAll("[data-show-details]").forEach((button) =>
      button.addEventListener("click", () => openShowDetails(user.shows_upcoming[Number(button.dataset.showDetails)]))
    );
    root.querySelectorAll("[data-profile-event-id]").forEach((button) =>
      button.addEventListener("click", () => window.openEventModal(button.dataset.profileEventId))
    );
  }

  function openFollowList(profile, listType) {
    const users = listType === "followers"
      ? window.Store.followersOf(profile.id)
      : window.Store.followingOf(profile.id);
    const title = listType === "followers" ? "Seguidores" : "Seguindo";
    const body = users.length
      ? `<div class="follow-list">${users.map((entry) => `<button type="button" class="follow-list-item" data-profile-id="${esc(entry.id)}">
          <img src="${esc(entry.avatar)}" alt="" />
          <span><strong>${esc(entry.artistName || entry.name)}</strong><small>${esc(window.Shell.roleLabel(entry.role))}${entry.city ? ` · ${esc(entry.city)}` : ""}</small></span>
          <i class="ph ph-caret-right"></i>
        </button>`).join("")}</div>`
      : `<p class="text-muted follow-list-empty">${listType === "followers" ? "Ainda não há seguidores." : "Este perfil ainda não segue ninguém."}</p>`;
    window.UI.openModal({
      title,
      subtitle: `${users.length} perfil${users.length === 1 ? "" : "s"}`,
      body,
      testId: `follow-list-${listType}-modal`,
      actions: [{ label: "Fechar", variant: "btn-ghost", testId: "follow-list-close-btn" }],
    });
    document.querySelectorAll("[data-profile-id]").forEach((button) =>
      button.addEventListener("click", () => {
        window.UI.closeModal();
        location.hash = `#/profile/${button.dataset.profileId}`;
      })
    );
  }

  function openEditProfileModal(root, user) {
    const body = `
      <form id="edit-profile-form" data-testid="edit-profile-form">
        <div class="form-row">
          <div class="form-group"><label>Nome de exibição</label><input name="name" value="${esc(user.name || "")}" /></div>
          ${user.role === "musician" ? `<div class="form-group"><label>Nome artístico</label><input name="artistName" value="${esc(user.artistName || "")}" /></div>` : ""}
        </div>
        ${user.role === "musician" ? `<div class="form-row">
          <div class="form-group"><label>Banda</label><input name="bandName" value="${esc(user.bandName || "")}" /></div>
          <div class="form-group"><label>Gêneros musicais</label><input name="genres" value="${esc((user.genres || []).join(", "))}" placeholder="MPB, Rock, Jazz" /></div>
        </div>` : ""}
        <div class="form-group"><label>Biografia</label><textarea name="bio" rows="4" maxlength="500">${esc(user.bio || "")}</textarea></div>
        <div class="form-row">
          <div class="form-group"><label>Cidade</label><input name="city" value="${esc(user.city || "")}" /></div>
          <div class="form-group"><label>Estado</label><input name="state" value="${esc(user.state || "")}" maxlength="2" /></div>
        </div>
        ${user.role === "musician" ? `<div class="form-row">
          <div class="form-group"><label>Cachê médio</label><input name="cache" value="${esc(user.cache || "")}" /></div>
          <div class="form-group"><label>Duração média</label><input name="duration" value="${esc(user.duration || "")}" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Instagram</label><input name="instagram" value="${esc(user.instagram || "")}" /></div>
          <div class="form-group"><label>Spotify</label><input name="spotify" value="${esc(user.spotify || "")}" /></div>
        </div>` : ""}
        <div class="form-row">
          <div class="form-group"><label>Foto do perfil</label><input type="file" name="avatar" accept="image/*" data-testid="profile-avatar-input" /></div>
          <div class="form-group"><label>Imagem de capa</label><input type="file" name="cover" accept="image/*" data-testid="profile-cover-input" /></div>
        </div>
        <p class="text-muted" style="font-size:12px;margin:0;">Imagens de até 1 MB cada.</p>
      </form>
    `;
    window.UI.openModal({
      title: "Editar perfil",
      subtitle: "Atualize as informações que aparecem para a comunidade.",
      body,
      size: "large",
      testId: "edit-profile-modal",
      actions: [
        { label: "Cancelar", variant: "btn-ghost" },
        {
          label: "Salvar alterações",
          variant: "btn-primary",
          testId: "save-profile-btn",
          onClick: async (close) => {
            const form = document.querySelector("#edit-profile-form");
            if (!form.reportValidity()) return;
            const formData = new FormData(form);
            const updates = {
              name: String(formData.get("name") || "").trim(),
              bio: String(formData.get("bio") || "").trim(),
              city: String(formData.get("city") || "").trim(),
              state: String(formData.get("state") || "").trim().toUpperCase(),
            };
            if (user.role === "musician") {
              Object.assign(updates, {
                artistName: String(formData.get("artistName") || "").trim(),
                bandName: String(formData.get("bandName") || "").trim(),
                genres: String(formData.get("genres") || "").split(",").map((genre) => genre.trim()).filter(Boolean),
                cache: String(formData.get("cache") || "").trim(),
                duration: String(formData.get("duration") || "").trim(),
                instagram: String(formData.get("instagram") || "").trim(),
                spotify: String(formData.get("spotify") || "").trim(),
              });
            }
            try {
              for (const field of ["avatar", "cover"]) {
                const file = form.elements[field].files[0];
                if (file) {
                  if (file.size > 1024 * 1024) throw new Error("Cada imagem deve ter até 1 MB.");
                  updates[field] = await readImage(file);
                }
              }
            } catch (error) {
              window.UI.toast(error.message, { type: "error" });
              return;
            }
            window.Store.updateUser(user.id, updates);
            close();
            window.UI.toast("Perfil atualizado.", { type: "success" });
            renderProfile(root, { id: user.id });
          },
        },
      ],
    });
  }

  function readImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
      reader.readAsDataURL(file);
    });
  }

  function openShowDetails(show) {
    if (!show) return;
    window.UI.openModal({
      title: show.title,
      subtitle: `${show.date} ${show.month} · ${show.time}`,
      body: `<div class="show-detail-location"><i class="ph ph-map-pin"></i><span>${esc(show.city || "Local a confirmar")}</span></div>`,
      testId: "show-details-modal",
      actions: [{ label: "Fechar", variant: "btn-ghost", testId: "show-details-close-btn" }],
    });
  }

  function openProposalModal(target) {
    const title = "Enviar Proposta";
    const subtitle = `Envie uma proposta de show para ${target.artistName || target.name}.`;

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
            const proposal = window.Store.saveProposal({
              targetUserId: target.id,
              date,
              time,
              duration: fd.get("duration"),
              value: fd.get("value"),
              place: fd.get("place"),
              notes: fd.get("notes"),
            });
            if (!proposal) {
              window.UI.toast("Somente estabelecimentos podem enviar propostas para músicos.", { type: "error" });
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
