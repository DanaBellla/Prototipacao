/* BandaConnection — Login & Register views. */
(function () {
  const { esc, toast } = window.UI;

  function shell(right) {
    return `
      <div class="auth-shell" data-testid="auth-view">
        <aside class="auth-side">
          <a href="#/" class="brand">
            <span class="brand-mark"><i class="ph-fill ph-music-notes"></i></span>
            BandaConnection
          </a>
          <div class="quote">
            "A música ao vivo é comunidade. O BandaConnection é o palco digital dessa comunidade."
            <small>— Cena Musical Brasileira · 2026</small>
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
          <label>Gêneros musicais (separe por vírgula)</label>
          <input name="genres" data-testid="reg-genres-input" placeholder="Ex.: MPB, Bossa, Indie" />
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
            <input name="state" maxlength="2" data-testid="reg-state-input" placeholder="Ex.: SP" />
          </div>
        </div>
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
    form.addEventListener("submit", (e) => {
      e.preventDefault();
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
      if (data.genres) data.genres = data.genres.split(",").map((s) => s.trim()).filter(Boolean);
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

  window.Views = window.Views || {};
  window.Views.login = renderLogin;
  window.Views.register = renderRegister;
})();
