# 🗺️ Roadmap & Arquitetura — Pampo Board

Este documento registra as decisões estratégicas e os próximos módulos da arquitetura do Pampo Board.

- **Repositório Oficial:** [WesleyFreitass/PampoBoard](https://github.com/WesleyFreitass/PampoBoard)

---

## ☁️ Arquitetura Web & Nuvem (Cloud-Native SaaS)

A aplicação é um **aplicativo web (website)** acessível por qualquer navegador, com arquitetura multi-usuário onde cada pessoa possui sua própria conta e todos os dados, quadros, mídias e conexões ficam armazenados com segurança na nuvem.

---

### 1. Sistema de Autenticação & Gestão de Contas
- [ ] **Fluxo de Autenticação:**
  - Login e Cadastro (E-mail + Senha, Magic Link e OAuth Social via Google/GitHub).
  - Sessão persistente com JWT / tokens seguros.
  - Gestão de perfil (avatar, nome, preferências visuais de tema).

---

### 2. Banco de Dados Definido: MongoDB (NoSQL)
A persistência do Pampo Board será baseada em **MongoDB** devido à natureza polimórfica dos cards (tabelas, 3D, waveforms, notas, pilhas e cards vivos com dados dinâmicos), permitindo flexibilidade sem migrations e correspondência 1:1 com os tipos TypeScript do frontend.

#### Estrutura das Coleções (`Collections`):
1. **`users`**:
   - `_id`: ObjectId
   - `name`: string
   - `email`: string (unique)
   - `passwordHash`: string
   - `createdAt`: Date

2. **`boards`**:
   - `_id`: ObjectId
   - `userId`: ObjectId (referência a `users`)
   - `title`: string
   - `description`: string
   - `viewport`: `{ x: number, y: number, zoom: number }`
   - `theme`: `'dark' | 'light'`
   - `createdAt`: Date
   - `updatedAt`: Date

3. **`cards`** (Polimórfico):
   - `_id`: ObjectId
   - `boardId`: ObjectId (referência a `boards`)
   - `parentBoardId`: string (`'root'` ou ID de Sub-Quadro aninhado)
   - `type`: `'note' | 'live' | 'media' | 'link' | 'table' | 'column' | 'board'`
   - `title`: string
   - `x`, `y`, `width`, `height`: number
   - `color`: string
   - `zIndex`: number
   - `status`: `'backlog' | 'in_progress' | 'done'`
   - `noteData`, `liveData`, `mediaData`, `tableData`, `columnData`, `boardData`: Object (específico por tipo)
   - `updatedAt`: Date

4. **`connections`**:
   - `_id`: ObjectId
   - `boardId`: ObjectId
   - `parentBoardId`: string (`'root'` ou ID de Sub-Quadro)
   - `fromCardId`: string
   - `fromPort`: `'top' | 'right' | 'bottom' | 'left'`
   - `toCardId`: string
   - `toPort`: `'top' | 'right' | 'bottom' | 'left'`
   - `label`: string
   - `style`: `'solid' | 'dashed' | 'pulse'`
   - `color`: string

5. **`zones`**:
   - `_id`: ObjectId
   - `boardId`: ObjectId
   - `parentBoardId`: string
   - `title`: string
   - `description`: string
   - `x`, `y`, `width`, `height`: number
   - `color`: string

#### Armazenamento de Arquivos e Prints (`Ctrl+V`):
- Arquivos de imagem e prints do clipboard são enviados para Object Storage (ex: S3 / Cloudflare R2 / MinIO).
- O MongoDB armazena apenas a URL final gerada (`mediaData.imageUrl`), garantindo leveza e velocidade nas consultas do canvas.

---

## 🚢 Especificação de Infraestrutura & Deploy em Produção (VPS Linux)

> [!NOTE]
> **Status:** Anotado e pronto para implantação. Nenhuma alteração/execução realizada ainda, aguardando comando do usuário.

### 📋 Dados Oficiais da VPS:
- **Repositório GitHub:** `https://github.com/WesleyFreitass/PampoBoard`
- **Nome do Projeto & Container:** `pampoboard`
- **Endereço / DNS oficial:** `pampoboard.pampo.tech`
- **IP da VPS:** `187.127.17.88`
- **Porta no Host da VPS:** `3100` (alocada exclusivamente para o PampoBoard)
- **Diretório na VPS:** `/root/pampoboard`
- **Usuário SSH:** `root`
- **Porta SSH:** `22`

### 🛠️ Arquivos & Procedimentos Mapeados:

1. **Docker (`Dockerfile`, `docker-compose.yml`, `nginx.conf` e `.dockerignore`):**
   - Multi-stage build com Node.js (compilação do Vite) e Nginx Alpine servindo a SPA na porta interna `80`.
   - Mapeamento de portas: `"3100:80"`.
   - `restart: always` e container name: `pampoboard`.

2. **GitHub Actions CI/CD (`.github/workflows/deploy.yml`):**
   - Trigger em push na branch `main` e `workflow_dispatch`.
   - Action: `appleboy/ssh-action@v1.0.3` usando os secrets da VPS.
   - Script resiliente auto-suficiente:
     - Verifica se `/root/pampoboard` existe; se não existir, faz o `git clone` inicial.
     - `cd /root/pampoboard && git clean -fd && git fetch origin main && git reset --hard origin/main`.
     - `docker compose up -d --build`.

3. **Nginx Reverso, SSL e Firewall na VPS:**
   - Bloco `/etc/nginx/sites-available/pampoboard.pampo.tech`:
     - `proxy_pass http://127.0.0.1:3100;`
     - Suporte a WebSockets e headers de IP real (`X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`).
   - Ativação: `ln -s /etc/nginx/sites-available/pampoboard.pampo.tech /etc/nginx/sites-enabled/ && nginx -t && systemctl reload nginx`.
   - Certbot SSL automático:
     `certbot --nginx -d pampoboard.pampo.tech --redirect --agree-tos --non-interactive -m admin@pampo.tech`
   - Firewall: `ufw allow 3100/tcp && ufw reload`.

4. **Secrets do Repositório (via GitHub CLI `gh secret set`):**
   - `VPS_HOST`: `187.127.17.88`
   - `VPS_USER`: `root`
   - `VPS_PASSWORD`: `Nead1075846@`
   - `VPS_PORT`: `22`

---

*Atualizado em: 20/10/2026 pelo Lead Product Designer & DevOps Engineer.*
