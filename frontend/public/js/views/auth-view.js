/* BandaConnection — Login & Register views. */
(function () {
  const { esc, toast } = window.UI;

  function shell(right) {
    const quotes = [
      { text: "A música pode mudar o mundo porque pode mudar as pessoas.", author: "Bono, vocalista do U2" },
      { text: "A música é uma revelação superior a toda sabedoria e filosofia.", author: "Ludwig van Beethoven" },
      { text: "Sem música, a vida seria um erro.", author: "Friedrich Nietzsche" },
      { text: "A música é a abreviação da emoção", author: "Leo Tolstói" },
      { text: "O rock é a ideia da eterna juventude", author: "Cazuza" },
      { text: "A música pode mudar o mundo e muda com o mundo", author: "Gilberto Gil" },
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    return `
      <div class="auth-shell" data-testid="auth-view">
        <aside class="auth-side">
          <a href="#/" class="brand">
            <span class="brand-mark"><i class="ph-fill ph-music-notes"></i></span>
            BandaConnection
          </a>
          <div class="quote">
            “${esc(quote.text)}”
            <small>— ${esc(quote.author)}</small>
          </div>
          <div style="font-size:13px;opacity:0.85;">Protótipo · dados de demonstração</div>
        </aside>
        <div class="auth-form-wrap">
          <div class="auth-form-inner">
            ${right}
          </div>
        </div>
      </div>
    `;
  }

  function renderLogin(app) {
    app.innerHTML = shell(`
      <h1 data-testid="login-title">Bem-vindo de volta.</h1>
      <p class="lead">Entre para acompanhar shows, artistas e propostas.</p>
      <form id="login-form" data-testid="login-form" novalidate>
        <div class="form-group">
          <label>E-mail</label>
          <input type="email" name="email" required data-testid="login-email-input" placeholder="voce@email.com" />
        </div>
        <div class="form-group">
          <label>Senha</label>
          <input type="password" name="password" required data-testid="login-password-input" placeholder="••••••••" />
        </div>
        <div id="login-error" class="form-error" style="display:none" data-testid="login-error"></div>
        <button type="submit" class="btn btn-primary btn-block btn-lg" data-testid="login-submit-btn">Entrar</button>
      </form>
      <div class="form-foot">
        <p>Não tem conta? <a href="#/register" data-testid="goto-register-link">Criar conta</a></p>
        <p style="margin-top:8px;font-size:12px;">
          Contas demo: <code>luna@sonora.app</code>, <code>aurora@sonora.app</code>, <code>mari@sonora.app</code> · senha <code>sonora123</code>
        </p>
      </div>
    `);

    const form = app.querySelector("#login-form");
    const err = app.querySelector("#login-error");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const email = (fd.get("email") || "").toString().trim();
      const password = (fd.get("password") || "").toString();
      if (!email || !password) {
        err.textContent = "Preencha e-mail e senha.";
        err.style.display = "block";
        return;
      }
      const user = window.Store.login(email, password);
      if (!user) {
        err.textContent = "E-mail ou senha inválidos.";
        err.style.display = "block";
        return;
      }
      toast(`Olá, ${user.name}!`, { type: "success", title: "Login efetuado" });
      location.hash = "#/feed";
    });
  }

  function renderRegister(app, params = {}) {
    const role = params.role || "";
    if (!role) {
      // Step 1 — pick role
      app.innerHTML = shell(`
        <h1 data-testid="register-title">Crie sua conta.</h1>
        <p class="lead">Como você quer usar o BandaConnection?</p>
        <div class="profile-chooser" data-testid="profile-chooser">
          <a href="#/register/musician" class="profile-choice" data-testid="choice-musician">
            <div class="p-icon"><i class="ph-fill ph-guitar"></i></div>
            <h4>Sou Músico</h4>
            <p>Divulgue seu trabalho e receba propostas de shows.</p>
          </a>
          <a href="#/register/venue" class="profile-choice" data-testid="choice-venue">
            <div class="p-icon"><i class="ph-fill ph-storefront"></i></div>
            <h4>Sou Estabelecimento</h4>
            <p>Encontre artistas e movimente sua programação.</p>
          </a>
          <a href="#/register/listener" class="profile-choice" data-testid="choice-listener">
            <div class="p-icon"><i class="ph-fill ph-headphones"></i></div>
            <h4>Sou Ouvinte</h4>
            <p>Descubra novos artistas e nunca perca um show.</p>
          </a>
        </div>
        <div class="form-foot">
          <p>Já tem conta? <a href="#/login" data-testid="goto-login-link">Entrar</a></p>
        </div>
      `);
      return;
    }

    // Step 2 — form by role
    const labels = {
      musician: {
        title: "Cadastro de Músico",
        lead: "Preencha as informações do seu perfil artístico.",
      },
      venue: {
        title: "Cadastro de Estabelecimento",
        lead: "Conte para os artistas quem é o seu espaço.",
      },
      listener: {
        title: "Cadastro de Ouvinte",
        lead: "Basta um perfil rápido para você começar a explorar.",
      },
    }[role] || { title: "Cadastro", lead: "" };

    const extraFields =
      role === "musician"
        ? `
        <div class="form-row">
          <div class="form-group">
            <label>Nome artístico *</label>
            <input name="artistName" required data-testid="reg-artistname-input" placeholder="Ex.: Luna Vieira" />
          </div>
          <div class="form-group">
            <label>Nome da banda</label>
            <input name="bandName" data-testid="reg-bandname-input" placeholder="Ex.: Trio Luar" />
          </div>
        </div>
        <div class="form-group">
          <label>Gêneros musicais (até 5)</label>
          ${window.UI.genreSelectorHTML()}
        </div>
        <div class="form-row">
          <div class="form-group"><label>Cachê médio</label><input name="cache" placeholder="Ex.: R$ 1.200" /></div>
          <div class="form-group"><label>Duração média</label><input name="duration" placeholder="Ex.: 60 min" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Instagram</label><input name="instagram" placeholder="@seuperfil" /></div>
          <div class="form-group"><label>Spotify</label><input name="spotify" placeholder="Artista ou link do perfil" /></div>
        </div>
        `
        : role === "venue"
        ? `
        <div class="form-group">
          <label>Nome do estabelecimento *</label>
          <input name="venueName" required data-testid="reg-venuename-input" placeholder="Ex.: Bar Aurora" />
        </div>
        <div class="form-group">
          <label>Categoria</label>
          <select name="category" data-testid="reg-category-input">
            <option>Bar</option>
            <option>Pub</option>
            <option>Restaurante</option>
            <option>Casa de shows</option>
            <option>Evento</option>
            <option>Outro</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Endereço</label><input name="address" placeholder="Rua, número e bairro" /></div>
          <div class="form-group"><label>Capacidade</label><input type="number" name="capacity" min="1" placeholder="Pessoas" /></div>
        </div>
        <div class="form-group">
          <label>Instagram</label><input name="instagram" placeholder="@seuestabelecimento" />
        </div>
        `
        : `
        <div class="form-group">
          <label>Nome completo *</label>
          <input name="name" required data-testid="reg-name-input" placeholder="Seu nome" />
        </div>
        `;

    app.innerHTML = shell(`
      <a href="#/register" style="color:var(--text-muted);font-size:13px;display:inline-flex;align-items:center;gap:6px;margin-bottom:16px;" data-testid="back-to-role-btn">
        <i class="ph ph-arrow-left"></i> Trocar perfil
      </a>
      <h1 data-testid="register-title">${esc(labels.title)}</h1>
      <p class="lead">${esc(labels.lead)}</p>
      <form id="register-form" data-testid="register-form" novalidate>
        <input type="hidden" name="role" value="${esc(role)}" />
        ${extraFields}
        <div class="form-row">
          <div class="form-group">
            <label>Cidade</label>
            <input name="city" data-testid="reg-city-input" placeholder="Ex.: São Paulo" />
          </div>
          <div class="form-group">
            <label>Estado</label>
            <select name="state" data-testid="reg-state-input">${window.UI.stateOptions()}</select>
          </div>
        </div>
        <section class="register-profile-section" data-testid="register-profile-section">
          <h2>Personalize seu perfil</h2>
          <p class="text-muted">Adicione uma apresentação e imagens. Você poderá alterar tudo depois.</p>
          <div class="form-group">
            <label>Biografia</label>
            <textarea name="bio" rows="3" maxlength="500" placeholder="Conte um pouco sobre você, sua banda ou seu espaço."></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Foto do perfil</label>
              <input type="file" name="avatarFile" accept="image/*" data-testid="reg-avatar-input" />
              ${window.UI.imagePositionHTML("avatarFile", "./images/default-avatar.svg", {}, "foto do perfil")}
            </div>
            <div class="form-group">
              <label>Foto de capa</label>
              <input type="file" name="coverFile" accept="image/*" data-testid="reg-cover-input" />
              ${window.UI.imagePositionHTML("coverFile", role === "musician"
                ? "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=1600"
                : role === "venue"
                  ? "https://images.unsplash.com/photo-1651511806003-30e8a55b5fce?w=1600"
                  : "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1600", {}, "foto de capa")}
            </div>
          </div>
          ${(role === "musician" || role === "venue") ? `
            <div class="form-group">
              <label>Imagens ${role === "venue" ? "do estabelecimento" : "da banda"} (até 6)</label>
              <input type="file" name="galleryFiles" accept="image/*" multiple data-testid="reg-gallery-input" />
              <div class="profile-gallery-editor" data-gallery-editor data-testid="reg-gallery-preview"></div>
            </div>
          ` : ""}
          ${role === "venue" ? `
            <div class="form-group">
              <label>Horários de funcionamento</label>
              ${window.UI.scheduleEditorHTML()}
            </div>
          ` : ""}
        </section>
        <div class="form-group">
          <label>E-mail *</label>
          <input type="email" name="email" required data-testid="reg-email-input" placeholder="voce@email.com" />
        </div>
        <div class="form-group">
          <label>Senha *</label>
          <input type="password" name="password" required minlength="6" data-testid="reg-password-input" placeholder="Mínimo 6 caracteres" />
        </div>
        <div id="reg-error" class="form-error" style="display:none" data-testid="register-error"></div>
        <button type="submit" class="btn btn-primary btn-block btn-lg" data-testid="register-submit-btn">
          Criar conta <i class="ph ph-arrow-right"></i>
        </button>
      </form>
      <div class="form-foot">
        <p>Já tem conta? <a href="#/login">Entrar</a></p>
      </div>
    `);

    const form = app.querySelector("#register-form");
    const err = app.querySelector("#reg-error");
    const genreSelector = form.querySelector("[data-genre-selector]");
    if (genreSelector) window.UI.wireGenreSelector(genreSelector);
    ["avatarFile", "coverFile"].forEach((field) => window.UI.wireImageAdjustment(form, field));
    const scheduleEditor = form.querySelector("[data-schedule-editor]");
    if (scheduleEditor) window.UI.wireScheduleEditor(scheduleEditor);
    const galleryEditor = form.querySelector("[data-gallery-editor]");
    const galleryInput = form.querySelector('[name="galleryFiles"]');
    const galleryFiles = [];
    if (galleryInput && galleryEditor) {
      galleryInput.addEventListener("change", async () => {
        const incoming = Array.from(galleryInput.files || []);
        if (galleryFiles.length + incoming.length > 6) {
          window.UI.toast("Você pode adicionar até 6 imagens.", { type: "error" });
          galleryInput.value = "";
          return;
        }
        try {
          const newFiles = await Promise.all(incoming.map(async (file) => {
            if (!file.type.startsWith("image/") || file.size > 1024 * 1024) throw new Error("Cada imagem deve ser válida e ter até 1 MB.");
            return { name: file.name, data: await window.UI.readImageFile(file), position: { x: 50, y: 50 } };
          }));
          const currentBytes = galleryFiles.reduce((total, item) => total + item.size, 0);
          const incomingBytes = incoming.reduce((total, file) => total + file.size, 0);
          if (currentBytes + incomingBytes > 3 * 1024 * 1024) throw new Error("As imagens da galeria podem ter até 3 MB no total.");
          newFiles.forEach((item, index) => { item.size = incoming[index].size; });
          galleryFiles.push(...newFiles);
          renderGalleryPreview(galleryEditor, galleryFiles);
        } catch (error) {
          window.UI.toast(error.message, { type: "error" });
        }
        galleryInput.value = "";
      });
      galleryEditor.addEventListener("click", (event) => {
        const remove = event.target.closest("[data-remove-gallery]");
        if (!remove) return;
        galleryFiles.splice(Number(remove.dataset.removeGallery), 1);
        renderGalleryPreview(galleryEditor, galleryFiles);
      });
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const fd = new FormData(form);
      const data = Object.fromEntries(fd.entries());
      if (!data.email || !data.password) {
        err.textContent = "Preencha e-mail e senha.";
        err.style.display = "block";
        return;
      }
      if (data.password.length < 6) {
        err.textContent = "A senha deve ter pelo menos 6 caracteres.";
        err.style.display = "block";
        return;
      }
      data.genres = genreSelector ? window.UI.readGenres(genreSelector) : [];
      try {
        const readUpload = async (field) => {
          const file = form.elements[field].files[0];
          return file ? window.UI.readImageFile(file) : "";
        };
        data.avatar = await readUpload("avatarFile");
        data.cover = await readUpload("coverFile");
        delete data.avatarFile;
        delete data.coverFile;
        delete data.galleryFiles;
      } catch (error) {
        err.textContent = error.message;
        err.style.display = "block";
        return;
      }
      data.avatarPosition = readImagePosition(form, "avatarFile");
      data.coverPosition = readImagePosition(form, "coverFile");
      data.gallery = galleryFiles.map((item) => item.data);
      data.galleryPositions = galleryFiles.map((item) => item.position);
      if (scheduleEditor) {
        data.openingSchedule = window.UI.readOpeningSchedule(scheduleEditor);
        data.hours = window.UI.openingHoursSummary(data.openingSchedule);
      }
      const res = window.Store.register(data);
      if (res.error) {
        err.textContent = res.error;
        err.style.display = "block";
        return;
      }
      toast(`Bem-vindo(a), ${res.user.name || "artista"}!`, { type: "success", title: "Conta criada" });
      location.hash = "#/feed";
    });
  }

  function readImagePosition(root, field) {
    const adjustment = root.querySelector(`[data-image-adjustment="${field}"]`);
    return {
      x: Number(adjustment.querySelector('[data-image-axis="x"]').value),
      y: Number(adjustment.querySelector('[data-image-axis="y"]').value),
    };
  }

  function renderGalleryPreview(container, files) {
    container.innerHTML = files.map((item, index) => `
      <div class="gallery-editor-item">
        ${window.UI.imageCropHTML(item.data, item.position, item.name, "gallery-image-crop")}
        <button type="button" class="btn-icon" data-remove-gallery="${index}" aria-label="Remover ${esc(item.name)}"><i class="ph ph-x"></i></button>
      </div>
    `).join("");
    container.querySelectorAll("[data-image-crop-widget]").forEach((widget, index) => {
      window.UI.wireImageCrop(widget, (position) => { files[index].position = position; });
    });
  }

  window.Views = window.Views || {};
  window.Views.login = renderLogin;
  window.Views.register = renderRegister;
})();
