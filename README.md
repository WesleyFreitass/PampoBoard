# 🚀 Pampo Board — Bancada Visual Infinita (MVP)

O **Pampo Board** é um espaço de trabalho infinito para organizar ideias, projetos e fluxos de trabalho visuais, inspirado no Milanote, mas focado em **cards vivos**, velocidade máxima, conexões lógicas condutoras e total liberdade criativa.

- **Repositório GitHub:** [https://github.com/WesleyFreitass/PampoBoard](https://github.com/WesleyFreitass/PampoBoard)

---

## 🌟 Funcionalidades Centrais Entregues

### 1. Canvas Infinito & Navegação Fluida
- **Pan e Zoom Livres:** Navegação por arrasto com o mouse ou segurando a barra de espaço. Zoom fluído com a roda do scroll centrado no cursor, botões de reset (100%) e ajuste automático à tela (*Fit to Screen*).
- **Grade Dinâmica Escalável:** Grid pontilhado moderno com escala proporcional ao zoom.
- **Alinhamento Magnético (Snapping):** Guias magnéticas de 16px para alinhamento limpo e automático dos blocos.
- **Seleção Retangular por Área (Marquee):** Clique no vazio do canvas e arraste para envolver e selecionar dezenas de elementos simultaneamente.
- **Radar Minimap:** Miniatura flutuante em tempo real no canto inferior direito para orientação imediata em qualquer escala do quadro.

---

### 2. Tipos de Cards e Blocos de Conteúdo

| Tipo de Card | Principais Recursos |
| :--- | :--- |
| **📝 Card de Nota & Ideias** | Checklist interativa com contador de progresso (`X/Y`), trechos de código com destaque e cópia em 1 clique, paleta de cores moderna de baixa saturação e tags dinâmicas. |
| **📊 Card de Tabela Dinâmica** | Tabela com colunas e linhas adicionáveis em tempo real, suporte a tipos (texto, números, status dinâmicos), cálculo de somas automáticas e células editáveis no canvas. |
| **📋 Card de Coluna / Pilha** | Pilha vertical de itens estilo Milanote. Adicione micro-cartões em lote pressionando Enter, marque conclusões e adicione tags temáticas. |
| **📁 Card de Sub-Quadro (Board)** | Sub-quadro aninhado para desdobrar fluxos complexos. Exibe contador de itens internos e abre um workspace modular via modal com breadcrumbs. |
| **🎨 Card de Mídia Avançada** | **Visualizador 3D Three.js** interativo com rotação no próprio card (geometrias *Torus*, *Knot*, *Dodecahedron*, *Cube*, alternador de *Wireframe*), **Player de Áudio com Waveform clicável** e player de imagens com upload e expansão em tela cheia via clique duplo. |
| **📸 Colar Prints com Ctrl+V** | Pressione <kbd>Ctrl+V</kbd> em qualquer lugar do canvas com uma captura de tela na área de transferência para criar instantaneamente um Card de Imagem! |
| **⚡ Card Dinâmico ("Card Vivo")** | Bloco reativo com botão de pulso condutor, alternador de automação, contador de eventos e slider. Possui log de telemetria em tempo real e transmite pulsos para cards conectados. |
| **🌐 Card de Link Inteligente** | Bookmark com cover, título, descrição, botão de ping em tempo real com medição de latência (`ms`), status de integridade (`200 OK`) e selo SSL. |
| **📦 Zonas Delimitadoras (Frames)** | Caixas translúcidas redimensionáveis com cores personalizadas. Arrastar o cabeçalho da zona move todos os cards situados dentro dela juntos. |

---

### 3. Conexões Visuais & Lógicas Condutoras
- **Portas Magnéticas de Ancoragem:** 4 portas (Topo, Direita, Baixo, Esquerda) em cada card com brilho magnético ao aproximar o cursor.
- **Curvas de Bézier Suaves:** Linhas dinâmicas com pontas de seta que calculam a melhor trajetória de conexão.
- **Rótulos Centrais Editáveis:** Tags ao centro da linha (ex: `⚡ Dispara`, `🔗 Monitora`, `📡 Notifica`, `🔄 Atualiza Geometria`).
- **Condutores de Pulso Reativo:** Ao disparar um Card Vivo, um fóton de energia percorre a curva de conexão até o card alvo, disparando reações em cadeia (incrementando contadores, completando itens de checklist ou alterando modelos 3D).

---

### 4. Modos Alternativos de Visualização em 1 Clique
1. **Modo Canvas Livre:** O espaço 2D infinito sem barreiras.
2. **Modo Kanban:** Transforma instantaneamente os cards em colunas de status (*Backlog*, *Em Andamento*, *Concluído*), permitindo mover status e navegar de volta ao canvas com foco no item.
3. **Modo Grafo / Hierarquia:** Árvore de dependências e diagrama de fluxo baseado nas setas desenhadas, permitindo disparar nós raiz diretamente.

---

### 5. Assistente de Seleção & Foco
Ao selecionar múltiplos cards via caixa de seleção ou clique com Shift:
- **Organizar em Grade:** Alinha e distribui uniformemente todos os cards selecionados.
- **Agrupar em Zona:** Cria instantaneamente um container delimitador ao redor dos itens.
- **Resumo Executivo (IA/Síntese):** Analisa a seleção, gera métricas de conclusão, pendências e um relatório executivo em Markdown copiável ou inserível como novo card de nota.

---

### 6. Atalhos de Teclado & Usabilidade
- <kbd>Barra de Espaço</kbd> + Arrastar: Pan no canvas.
- <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>K</kbd>: Busca rápida com navegação automática de câmera até o card.
- <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>Z</kbd> / <kbd>Y</kbd>: Desfazer e Refazer.
- <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>D</kbd>: Duplicar cards selecionados.
- <kbd>Delete</kbd> / <kbd>Backspace</kbd>: Excluir cards ou conexões selecionadas.
- <kbd>Esc</kbd>: Limpar seleções e fechar modais.
