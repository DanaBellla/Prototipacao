# BandaConnection — PRD

## Problem Statement
Plataforma web (protótipo em HTML5 + CSS3 + Vanilla JS puro) que conecta **Músicos**, **Estabelecimentos** e **Ouvintes** em um só ambiente, inspirada em Instagram + LinkedIn + Sympla + Spotify, focada em apresentações musicais ao vivo.

## Stack (por decisão do usuário)
- **Vanilla HTML5 / CSS3 / JavaScript puro** (sem frameworks)
- Persistência local via **LocalStorage**
- Servido a partir de `/app/frontend/public/`

## User Personas
- Músico / Banda · Estabelecimento · Ouvinte

## Architecture
```
/app/frontend/public/
├── index.html                     # Shell da SPA (hash routing)
├── css/style.css                  # Tokens, temas, componentes, responsivo
└── js/
    ├── data.js                    # Seed (users, posts, events, trends, conversations, notifications)
    ├── store.js                   # Estado + LocalStorage + auth simulada + CRUD
    ├── ui.js                      # toast, modal, timeago, esc
    ├── auth.js                    # guard (require login)
    ├── router.js                  # hash router com regex pattern matching
    ├── app.js                     # bootstrap + rotas
    └── views/
        ├── landing.js             # Landing page
        ├── auth-view.js           # Login + escolha de perfil + cadastro por role
        ├── app-shell.js           # Sidebar + main + right panel + bottom nav (mobile)
        ├── feed.js                # Feed Instagram-like
        ├── explore.js             # Bento de artistas/venues + grid de eventos
        ├── profile.js             # Perfil público (Músico / Estabelecimento / Ouvinte)
        ├── calendar.js            # Cronograma (Mês / Semana / Agenda)
        ├── messages.js            # Chat estilo Messenger
        ├── tickets.js             # Checkout + Meus Ingressos com QR Code
        └── notifications.js       # Central de notificações
```

## Phase 1 — MVP (13/Fev/2026) ✅
1. Landing page completa (hero, como funciona, depoimentos, FAQ, CTA, footer, dark/light toggle)
2. Auth com escolha de perfil (Músico / Estabelecimento / Ouvinte) — cadastro em 2 passos + login
3. Feed Instagram-like (composer, curtir, comentar, salvar, hashtags)
4. Explorar (bento asymmetric + grid de eventos) e Perfis públicos com CTAs "Enviar Proposta" / "Contratar Banda"

## Phase 2 — Extended (13/Fev/2026) ✅
5. **Router refatorado** — pattern matching via regex; corrigido bug em que `#/register/:role` não navegava
6. **Cronograma** (Calendário) — Visão Mês / Semana / Agenda; eventos coloridos por gênero; auto-foca no mês com eventos seed
7. **Ingressos — Checkout completo** — Página de finalizar compra (evento, quantidade, dados do comprador, forma de pagamento) + Modal de confirmação com QR Code (via api.qrserver.com) + Página "Meus Ingressos"
8. **Mensagens** — Chat Messenger-like com lista de conversas, envio de mensagem + respostas automáticas simuladas; integrado ao botão "Mensagem" do perfil
9. **Notificações** — Central com badges de leitura, filtragem por usuário, botão "Marcar todas como lidas"

## Test Credentials
- `luna@sonora.app` / `sonora123` — Músico (Luna Vieira) — tem conversas seed com Bar Aurora e Casa Natura
- `kaio@sonora.app` / `sonora123` — Músico (Kaio Blues Trio)
- `ravena@sonora.app` / `sonora123` — Música (Ravena, RJ)
- `aurora@sonora.app` / `sonora123` — Estabelecimento (Bar Aurora)
- `natura@sonora.app` / `sonora123` — Estabelecimento (Casa Natura)
- `mari@sonora.app` / `sonora123` — Ouvinte (Marina Costa)

## Deferred to Phase 3 (Prioritized Backlog)

### P0
- Sistema de propostas com status persistidos (Enviada / Em Análise / Aceita / Recusada / Cancelada / Finalizada) + inbox
- Upload real de foto de perfil e capa (armazenamento)
- Configurações completas (edição de perfil, senha, notificações, privacidade, idioma)

### P1
- Filtros avançados em Eventos (cidade, data, gênero, faixa de preço)
- Anexos em mensagens (imagem, proposta, localização)
- Notificações em tempo real (WebSocket ou pooling)
- Avaliações e reviews em perfis
- Integração com Spotify / YouTube (embed no perfil)

### P2
- Backend real (Node.js + PostgreSQL/MySQL) substituindo LocalStorage
- Conteúdo patrocinado / destaque pago
- App mobile PWA
- Link público de perfil compartilhável (bandaconnection.app/luna)

## Testing
- Iteração 1: **100% pass** — bug do cadastro corrigido; todas as features Fase 2 validadas end-to-end
- Report: `/app/test_reports/iteration_1.json`
