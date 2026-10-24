# 🗺️ Roadmap de Produto — Pampo Board

Este documento consolida o histórico de entregas e os próximos passos estratégicos para o desenvolvimento e evolução contínua do **Pampo Board**.

- **URL de Produção:** [https://pampoboard.pampo.tech](https://pampoboard.pampo.tech)
- **Repositório Oficial:** [WesleyFreitass/PampoBoard](https://github.com/WesleyFreitass/PampoBoard)
- **Organização / Domínio:** Pampo Tech (`pampo.tech`)

---

## ✅ Módulos Concluídos (Em Produção)

- [x] **Infinite Canvas 60 FPS:** Navegação suave com pan, zoom, roda do mouse e trackpad.
- [x] **Colunas no Estilo Milanote:** Empilhamento vertical de cards (tarefas, notas, checklists e mídias) com suporte a arrastar para dentro e fora da coluna.
- [x] **Conexões Magnéticas Fluídas:** Curvas suaves dinâmicas, rótulos de texto, setas direcionais e pulsos de fluxo visual em tempo real.
- [x] **Tipos de Cards Nativos:**
  - Notas de texto formatado e blocos de código
  - Post-its coloridos (*Stickies*)
  - Checklists de tarefas com contadores de progresso
  - Cards de Mídia (Imagens, formas 3D com Three.js e visualizador de áudio)
  - Cards Vivos Interativos (contadores, gatilhos, sliders)
  - Sub-Quadros aninhados (*SubBoards*) com navegação em profundidade
- [x] **Camada de Desenho Livre (*Freehand Brush*):** Caneta digital com espessuras e paleta de cores.
- [x] **Navegação & Gestão:**
  - Minimapa interativo com radar de viewport
  - Paleta de Comandos rápida (`Ctrl + K`)
  - Barra de seleção múltipla (alinhamento, duplicação e exclusão em lote)
  - Lixeira com restauração e histórico de versões
- [x] **Autenticação & Contas:**
  - Login e Cadastro nativo com JWT e senhas criptografadas em Argon2
  - OAuth Social oficial via **Google** e **GitHub**
  - Modo Visitante (*Guest Mode*) instantâneo para experimentação sem cadastro
  - Persistência em banco de dados MongoDB na nuvem
- [x] **Identidade Visual Oficial:**
  - Nova logo oficial com monograma fluido 'P' em degradê ciano, índigo e esmeralda
  - Logo sem moldura e com fundo transparente (`pampo-logo.png`)
  - Favicon e identidade consistente em toda a aplicação
- [x] **Landing Page Institucional:**
  - Hero com mockup interativo de canvas e conexões
  - Grid de diferenciais e vitrine das colunas Milanote
  - Rodapé minimalista integrado ao ecossistema Pampo Tech
  - Rolagem fluída vertical e alternador de tema Claro/Escuro
- [x] **Infraestrutura & DevOps:**
  - Deploy contínuo automatizado com **GitHub Actions** em cada commit na `main`
  - Contêiner Docker isolado em VPS Linux com Nginx reverso e SSL Let's Encrypt

---

## 🚀 Próximas Fases do Roadmap

### 🎯 Fase 1: Usabilidade Rápida & Produtividade no Canvas
*Foco: Reduzir fricção e acelerar o fluxo de pensamento do usuário.*

- [ ] **Criação Rápida por Duplo Clique no Canvas (*Double-Click Creation*):**
  - Clicar duas vezes em qualquer área vazia do quadro cria instantaneamente um post-it ou abre um menu circular rápido de tipos de card na posição exata do cursor.
- [ ] **Drag & Drop de Arquivos do Computador:**
  - Arrastar imagens (`.png`, `.jpg`, `.webp`) diretamente do desktop ou pasta de downloads e soltar no canvas, criando automaticamente um card na posição do drop.
- [ ] **Guias Inteligentes de Alinhamento Magnético (*Smart Snapping & Guides*):**
  - Exibir linhas guia sutis (estilo Figma) indicando quando o card arrastado alinhou pelo topo, centro, base ou manteve espaçamento uniforme em relação a outros cards.
- [ ] **Busca Rápida no Quadro com Centralização (`Ctrl + F`):**
  - Campo de busca flutuante que pesquisa o texto de notas, tarefas e post-its, destacando e centralizando o viewport no card correspondente.
- [ ] **Atalhos Globais de Teclado:**
  - `Espaço + Arrastar`: Panning rápido estilo Photoshop/Figma.
  - `N`: Inserir nova Nota na posição do cursor.
  - `S`: Inserir novo Post-it.
  - `C`: Ativar modo de conexão de setas.
  - `Ctrl + D`: Duplicar o card selecionado com offset de 20px.

---

### 🎨 Fase 2: Novos Tipos de Cards & Mídias Ricas
*Foco: Expandir a versatilidade visual para moodboards, design e estudos.*

- [ ] **Áreas e Frames Delimitados de Agrupamento (*Grouping Sections / Artboards*):**
  - Retângulos visuais delimitadores com título customizável (ex: *"Sprint 1"*, *"Referências Visuais"*). Ao arrastar o frame, todos os cards contidos nele se movem juntos.
- [ ] **Embeds Interativos de Mídia:**
  - Incorporação direta de links externos como players interativos:
    - YouTube / Vimeo (player de vídeo embutido)
    - Spotify / Soundcloud (player de áudio)
    - Figma / CodePen (protótipos interativos)
- [ ] **Anexo e Visualizador de Documentos PDF:**
  - Suporte a upload de PDFs com pré-visualização das páginas e download direto pelo card.
- [ ] **Formatação Markdown & Realce de Sintaxe Avançado:**
  - Suporte a tabelas, listas ordenadas, citações e syntax highlighting aprimorado para múltiplas linguagens de programação.

---

### 📢 Fase 3: Apresentação, Compartilhamento & Colaboração
*Foco: Facilitar a entrega de projetos para clientes e trabalho em equipe.*

- [ ] **Modo Apresentação (*Pitch Mode / Slides*):**
  - Botão de tela cheia que oculta toda a interface de edição e permite navegar suavemente entre os cards ou colunas com as setas do teclado `←` `→`.
- [ ] **Link Público de Compartilhamento Somente-Leitura (`/share/:token`):**
  - Geração de link público seguro para envio a clientes ou parceiros, permitindo navegar pelo quadro sem permissão de edição e sem exigir login.
- [ ] **Exportação em Ultra Alta Resolução:**
  - Exportação em PNG 2x e 4x para impressão ou apresentações de alta definição sem perda de nitidez, além de exportação em PDF vetorial.
- [ ] **Colaboração em Tempo Real (*Multiplayer Cursors*):**
  - Visualização de múltiplos cursores de usuários com cores e nomes em tempo real via WebSockets.

---

### 🧠 Fase 4: Inteligência & Templates
*Foco: Automação inteligente do fluxo de trabalho.*

- [ ] **Biblioteca de Templates Prontos:**
  - Modelos pré-configurados com um clique:
    - *Sprint Kanban* (A Fazer, Em Andamento, Concluído)
    - *Design Moodboard & Branding*
    - *Brainstorming & Mapa Mental*
    - *Arquitetura de Microsserviços & APIs*
- [ ] **Assistente de IA no Canvas:**
  - Transformar tópicos soltos em resumos estruturados, gerar ideias complementares ou organizar cards dispersos automaticamente em colunas categorizadas.

---

*Documento mantido e versionado pela equipe de engenharia do Pampo Board.*
