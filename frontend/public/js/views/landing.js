/* BandaConnection — Landing page view. */
(function () {
  function renderLanding(app) {
    const theme = window.Store.state.theme;
    app.innerHTML = `
      <div class="landing" data-testid="landing-view">
        <header class="landing-nav">
          <div class="container">
            <a href="#/" class="brand" data-testid="brand-logo">
              <span class="brand-mark"><i class="ph-fill ph-music-notes"></i></span>
              BandaConnection
            </a>
            <nav class="landing-nav-links">
              <a href="#como-funciona" data-testid="nav-how">Como funciona</a>
              <a href="#depoimentos" data-testid="nav-testimonials">Depoimentos</a>
              <a href="#faq" data-testid="nav-faq">FAQ</a>
            </nav>
            <div class="landing-nav-actions">
              <button class="btn-icon" data-testid="theme-toggle-button" aria-label="Alternar tema">
                <i class="ph ${theme === "dark" ? "ph-sun" : "ph-moon"}"></i>
              </button>
              <a href="#/login" class="btn btn-ghost" data-testid="nav-login-btn">Entrar</a>
              <a href="#/register" class="btn btn-primary" data-testid="nav-signup-btn">Cadastrar</a>
            </div>
          </div>
        </header>

        <section class="hero">
          <div class="container hero-grid">
            <div>
              <span class="hero-eyebrow" data-testid="hero-eyebrow">
                <i class="ph-fill ph-sparkle"></i> A nova casa da música ao vivo
              </span>
              <h1 data-testid="hero-title">
                Sistema de conexão entre músicos, ouvintes e estabelecimentos.
              </h1>
              <p class="lead" data-testid="hero-lead">
                Descubra artistas, agende shows e viva noites inesquecíveis.
                O BandaConnection reúne músicos, estabelecimentos e o público
                em um só lugar — bonito, intuitivo e feito para o cenário musical brasileiro.
              </p>
              <div class="hero-cta">
                <a href="#/register" class="btn btn-primary btn-lg" data-testid="hero-cta-primary">
                  Começar agora <i class="ph ph-arrow-right"></i>
                </a>
                <a href="#como-funciona" class="btn btn-ghost btn-lg" data-testid="hero-cta-secondary">
                  Como funciona
                </a>
              </div>
              <div class="hero-stats" data-testid="hero-stats">
                <div class="hero-stat"><div class="num">12k+</div><div class="lbl">Músicos ativos</div></div>
                <div class="hero-stat"><div class="num">3.4k</div><div class="lbl">Casas parceiras</div></div>
                <div class="hero-stat"><div class="num">890</div><div class="lbl">Shows por semana</div></div>
              </div>
            </div>
            <div class="hero-visual">
              <img src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1400" alt="Público acompanhando um show ao vivo" />
              <div class="hero-floating fl-1">
                <div class="avatar"><i class="ph-fill ph-guitar"></i></div>
                <div class="txt"><strong>Luna Vieira</strong><span>Confirmada · Sex 22h</span></div>
              </div>
              <div class="hero-floating fl-2">
                <div class="avatar"><i class="ph-fill ph-storefront"></i></div>
                <div class="txt"><strong>Bar Aurora</strong><span>Nova proposta enviada</span></div>
              </div>
            </div>
          </div>
        </section>

        <section id="como-funciona" class="section">
          <div class="container">
            <div class="section-head">
              <span class="eyebrow">Como funciona</span>
              <h2>Um ecossistema pensado para todos os lados do palco.</h2>
              <p>Três perfis, uma missão: fazer a música ao vivo acontecer com menos atrito e mais impacto.</p>
            </div>
            <div class="how-grid">
              <article class="how-card">
                <div class="icon"><i class="ph-fill ph-guitar"></i></div>
                <h3>Sou Músico</h3>
                <p>Mostre seu trabalho, receba propostas e agende shows de forma profissional.</p>
                <ul>
                  <li><i class="ph-fill ph-check-circle"></i> Perfil artístico completo</li>
                  <li><i class="ph-fill ph-check-circle"></i> Receba propostas com valor</li>
                  <li><i class="ph-fill ph-check-circle"></i> Agenda inteligente de shows</li>
                </ul>
              </article>
              <article class="how-card">
                <div class="icon"><i class="ph-fill ph-storefront"></i></div>
                <h3>Sou Estabelecimento</h3>
                <p>Encontre artistas para sua casa, envie propostas e lote sua programação.</p>
                <ul>
                  <li><i class="ph-fill ph-check-circle"></i> Busca por estilo e cidade</li>
                  <li><i class="ph-fill ph-check-circle"></i> Contrate com um clique</li>
                  <li><i class="ph-fill ph-check-circle"></i> Divulgue sua programação</li>
                </ul>
              </article>
              <article class="how-card">
                <div class="icon"><i class="ph-fill ph-headphones"></i></div>
                <h3>Sou Ouvinte</h3>
                <p>Descubra novos artistas, siga bandas favoritas e nunca perca um show.</p>
                <ul>
                  <li><i class="ph-fill ph-check-circle"></i> Feed personalizado</li>
                  <li><i class="ph-fill ph-check-circle"></i> Agenda de shows perto</li>
                  <li><i class="ph-fill ph-check-circle"></i> Ingressos em breve</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section id="depoimentos" class="section" style="background: var(--bg-surface);">
          <div class="container">
            <div class="section-head">
              <span class="eyebrow">Depoimentos</span>
              <h2>Feito com quem faz a cena acontecer.</h2>
            </div>
            <div class="testi-grid">
              <div class="testi-card">
                <div class="testi-stars">
                  <i class="ph-fill ph-star"></i><i class="ph-fill ph-star"></i><i class="ph-fill ph-star"></i><i class="ph-fill ph-star"></i><i class="ph-fill ph-star"></i>
                </div>
                <p>"Em duas semanas fechei quatro shows novos. A plataforma me deu uma vitrine que eu não tinha."</p>
                <div class="testi-who">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200" alt="Luna" />
                  <div><strong>Luna Vieira</strong><span>Cantora · São Paulo</span></div>
                </div>
              </div>
              <div class="testi-card">
                <div class="testi-stars">
                  <i class="ph-fill ph-star"></i><i class="ph-fill ph-star"></i><i class="ph-fill ph-star"></i><i class="ph-fill ph-star"></i><i class="ph-fill ph-star"></i>
                </div>
                <p>"Nossa agenda de sexta a domingo virou completa. É simples achar bandas com o perfil da casa."</p>
                <div class="testi-who">
                  <img src="https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=200" alt="Bar Aurora" />
                  <div><strong>Bar Aurora</strong><span>Vila Madalena, SP</span></div>
                </div>
              </div>
              <div class="testi-card">
                <div class="testi-stars">
                  <i class="ph-fill ph-star"></i><i class="ph-fill ph-star"></i><i class="ph-fill ph-star"></i><i class="ph-fill ph-star"></i><i class="ph-fill ph-star"></i>
                </div>
                <p>"Descubro banda nova toda semana e sei exatamente onde encontrar. Virei fã de várias cenas locais."</p>
                <div class="testi-who">
                  <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200" alt="Marina" />
                  <div><strong>Marina Costa</strong><span>Ouvinte · SP</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" class="section">
          <div class="container">
            <div class="section-head">
              <span class="eyebrow">Perguntas frequentes</span>
              <h2>Tudo o que você precisa saber para começar.</h2>
            </div>
            <div class="faq-list">
              <details class="faq-item" data-testid="faq-item">
                <summary>O BandaConnection é gratuito?</summary>
                <p>Sim, o cadastro é gratuito para músicos, estabelecimentos e ouvintes. Planos premium com destaque e ferramentas avançadas estão em desenvolvimento.</p>
              </details>
              <details class="faq-item" data-testid="faq-item">
                <summary>Como funciona o envio de propostas?</summary>
                <p>Estabelecimentos preenchem data, horário, valor e detalhes do evento diretamente no perfil do artista. O músico recebe, negocia e aceita ou recusa.</p>
              </details>
              <details class="faq-item" data-testid="faq-item">
                <summary>Preciso ter site ou material profissional?</summary>
                <p>Não. O próprio perfil na plataforma já funciona como portfólio: fotos, vídeos, agenda de shows, avaliações e links para streaming.</p>
              </details>
              <details class="faq-item" data-testid="faq-item">
                <summary>Como faço para comprar ingressos?</summary>
                <p>A venda de ingressos está prevista para a próxima fase. Por enquanto, os eventos exibem local, horário e valor de referência.</p>
              </details>
            </div>
          </div>
        </section>

        <section class="section">
          <div class="container">
            <div class="cta-band" data-testid="cta-band">
              <div>
                <h3>Pronto para levar sua música mais longe?</h3>
                <p>Crie seu perfil em menos de dois minutos.</p>
              </div>
              <a href="#/register" class="btn btn-primary btn-lg" data-testid="cta-band-btn">
                Criar conta grátis <i class="ph ph-arrow-right"></i>
              </a>
            </div>
          </div>
        </section>

        <footer class="footer">
          <div class="container">
            <div class="footer-grid">
              <div>
                <div class="brand" style="margin-bottom:12px;">
                  <span class="brand-mark"><i class="ph-fill ph-music-notes"></i></span>
                  BandaConnection
                </div>
                <p class="text-muted" style="font-size:14px;max-width:320px;">
                  A plataforma brasileira que conecta músicos, casas de show e ouvintes em um só lugar.
                </p>
                <div class="footer-social" style="margin-top:16px;">
                  <a href="#" class="btn-icon" aria-label="Instagram"><i class="ph ph-instagram-logo"></i></a>
                  <a href="#" class="btn-icon" aria-label="Spotify"><i class="ph ph-spotify-logo"></i></a>
                  <a href="#" class="btn-icon" aria-label="YouTube"><i class="ph ph-youtube-logo"></i></a>
                </div>
              </div>
              <div>
                <h5>Produto</h5>
                <a href="#como-funciona">Como funciona</a>
                <a href="#faq">Perguntas frequentes</a>
                <a href="#">Novidades</a>
              </div>
              <div>
                <h5>Empresa</h5>
                <a href="#">Sobre nós</a>
                <a href="#">Contato</a>
                <a href="#">Carreiras</a>
              </div>
              <div>
                <h5>Legal</h5>
                <a href="#">Termos de uso</a>
                <a href="#">Política de privacidade</a>
                <a href="#">Cookies</a>
              </div>
            </div>
            <div class="footer-bottom">
              <span>© 2026 BandaConnection. Feito com amor pela cena musical brasileira.</span>
              <span>v0.1 · Protótipo</span>
            </div>
          </div>
        </footer>
      </div>
    `;

    // Wire theme toggle
    const themeBtn = app.querySelector('[data-testid="theme-toggle-button"]');
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        window.Store.toggleTheme();
        renderLanding(app); // re-render to update icon
      });
    }
  }

  window.Views = window.Views || {};
  window.Views.landing = renderLanding;
})();
