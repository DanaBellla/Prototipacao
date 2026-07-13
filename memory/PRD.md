# BandaConnection — PRD

## Problem Statement
Plataforma web (protótipo em HTML5 + CSS3 + Vanilla JS puro) que conecta **Músicos**, **Estabelecimentos** e **Ouvintes** em um só ambiente, inspirada em Instagram + LinkedIn + Sympla + Spotify, focada em apresentações musicais ao vivo. Design moderno, sofisticado, com paleta roxo/branco/cinza/preto, glassmorphism, dark/light mode e responsividade completa.

## Stack (por decisão do usuário)
- **Vanilla HTML5 / CSS3 / JavaScript puro** (sem frameworks)
- Persistência local via **LocalStorage** (auth simulada estilo JWT)
- Servido através da estrutura estática em `/app/frontend/public/`
- React foi neutralizado (`src/index.js` vazio) — apenas para não conflitar com o supervisor

## User Personas
1. **Músico / Banda** — quer vitrine, propostas de show, agenda profissional.
2. **Estabelecimento** — quer descobrir artistas, enviar propostas, lotar programação.
3. **Ouvinte** — quer descobrir artistas, acompanhar shows, ver eventos.

## Design Guidelines (aplicadas)
- Tipografia: **Outfit** (headings) + **Plus Jakarta Sans** (corpo)
- Paleta dark: `#09090B` base, `#131316` surface, `#8B5CF6` primary (roxo), `#EC4899` accent
- Paleta light: `#FAFAFA` base, `#FFFFFF` surface, `#6D28D9` primary
- Glassmorphism em headers, bottom nav, modais (blur 24px)
- Botões pill-shaped com micro-interações (translateY -2px on hover)
- Bento grid asymmetric em Explorar
- Animação `fadeIn` staggered em posts do feed

## Architecture
```
/app/frontend/public/
├── index.html               # Shell da SPA (roteia por hash)
├── css/style.css            # Tokens, temas, componentes, responsivo
└── js/
    ├── data.js              # Seed (6 users, 4 posts, 6 events, trends)
    ├── store.js             # Estado + LocalStorage + auth simulada
    ├── ui.js                # toast, modal, timeago, esc
    ├── auth.js              # guard (require login)
    ├── router.js            # hash router (/, /login, /register/:role, /feed, /explore, /profile/:id)
    ├── app.js               # bootstrap
    └── views/
        ├── landing.js       # Landing page (hero, how it works, testimonials, FAQ, footer)
        ├── auth-view.js     # Login + escolha de perfil + cadastro por role
        ├── app-shell.js     # Sidebar + main + right panel + bottom nav (mobile)
        ├── feed.js          # Feed Instagram-like (like, comment, publish, save)
        ├── explore.js       # Bento de artistas / venues + grid de eventos + modal de evento
        └── profile.js       # Perfil público (Músico / Estabelecimento / Ouvinte) + modal de proposta
```

## Phase 1 — Implemented (13/Fev/2026) ✅
1. **Landing Page** completa: nav sticky glassmórfica, hero com cards flutuantes, "Como funciona" (3 personas), depoimentos, FAQ, CTA band, footer institucional; toggle dark/light.
2. **Auth**: login com credenciais demo (`luna@sonora.app` / `sonora123`), cadastro em 2 passos (escolha de perfil → formulário específico por role). Sessão persiste em LocalStorage.
3. **Feed Instagram-like**: composer para publicar, posts com autor verificado, media, curtir/comentar/salvar/compartilhar, hashtags coloridas, sugestões e trends no painel direito.
4. **Explorar**: chips de tab (Artistas / Estabelecimentos / Eventos), bento asymmetric de artistas e venues, grid de eventos com modal de detalhes.
5. **Perfis públicos**: hero com cover + avatar sobreposto, stats (seguidores/shows/rating), tags de gênero, bio, galeria, agenda de shows, CTAs **"Enviar Proposta"** (para músicos) e **"Contratar Banda"** (para venues) — ambos abrem modal com formulário funcional (data, horário, duração, valor, local, observações) e toast de confirmação.

## Test Credentials (demo)
- `luna@sonora.app` / `sonora123` — Músico (Luna Vieira, SP)
- `kaio@sonora.app` / `sonora123` — Músico (Kaio Blues Trio, BH)
- `aurora@sonora.app` / `sonora123` — Estabelecimento (Bar Aurora, SP)
- `natura@sonora.app` / `sonora123` — Estabelecimento (Casa Natura, SP)
- `ravena@sonora.app` / `sonora123` — Música (Ravena, RJ)
- `mari@sonora.app` / `sonora123` — Ouvinte (Marina Costa, SP)

## Deferred to Phase 2 (Prioritized Backlog)
### P0
- Sistema de propostas com status (Enviada / Em Análise / Aceita / Recusada / Cancelada / Finalizada) + inbox
- Cronograma / Calendário estilo Google Calendar (dia/semana/mês/agenda)
- Compra de ingressos com QR Code + comprovante visual

### P1
- Mensagens privadas estilo Messenger (com envio de imagem, proposta, localização)
- Notificações em tempo real (curtidas, comentários, seguidores, propostas)
- Upload real de foto de perfil e capa
- Filtros avançados em Eventos (cidade, data, gênero, faixa de preço)
- Configurações completas (edição de perfil, senha, notificações, privacidade, idioma)

### P2
- Backend real (Node.js + PostgreSQL/MySQL) substituindo LocalStorage
- Integração com Spotify / YouTube para embed de música
- Sistema de avaliações e reviews
- Conteúdo patrocinado / destaque pago
- App mobile nativo (PWA)
