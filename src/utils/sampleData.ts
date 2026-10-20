import { BoardCard, Connection, Zone, BoardWorkspace } from '../types/board';

export const initialWorkspaces: BoardWorkspace[] = [
  {
    id: 'ws-tower-defense',
    title: 'Jogo Tower Defense',
    description: 'Bancada principal do jogo com notas, mecânicas, mídias e conexões',
    color: '#3b82f6',
    icon: '🎮',
    updatedAt: Date.now(),
  },
  {
    id: 'ws-backlog',
    title: 'Backlog',
    description: 'Tarefas pendentes, ideias brutas e sprints futuras',
    color: '#8b5cf6',
    icon: '📋',
    updatedAt: Date.now() - 3600000,
  },
  {
    id: 'ws-roadmap',
    title: 'Roadmap',
    description: 'Planejamento de lançamento e marcos principais',
    color: '#06b6d4',
    icon: '🗺️',
    updatedAt: Date.now() - 7200000,
  },
  {
    id: 'ws-arquivados',
    title: 'Arquivados',
    description: 'Projetos e referências arquivadas',
    color: '#64748b',
    icon: '📦',
    updatedAt: Date.now() - 14400000,
  },
];

export const initialZones: Zone[] = [
  {
    id: 'zone-tower-defense',
    title: '🎯 Núcleo do Projeto — Jogo Tower Defense',
    description: 'Fluxo interativo de desenvolvimento e assets',
    x: 40,
    y: 40,
    width: 900,
    height: 940,
    color: '#3b82f6',
    rootBoardId: 'ws-tower-defense',
    parentBoardId: 'root',
  },
];

export const initialCards: BoardCard[] = [
  // Card 1: Notas e Checklists (Fiel à imagem de referência)
  {
    id: 'card-notas-checklists',
    type: 'note',
    title: 'Notas e Checklists',
    x: 80,
    y: 80,
    width: 340,
    height: 380,
    color: 'default',
    zIndex: 10,
    status: 'in_progress',
    rootBoardId: 'ws-tower-defense',
    parentBoardId: 'root',
    noteData: {
      title: 'Notas e Checklists',
      body: '',
      checklist: [
        { id: 'chk-1', text: 'Checklist', completed: true },
        { id: 'chk-2', text: 'Checkmasstics', completed: true },
        { id: 'chk-3', text: 'Código', completed: false },
      ],
      codeSnippet: {
        language: 'javascript',
        code: `codigo {\n  for class = 10+ {\n    Jogo Tower Defense\n  }\n  ...\n}`,
      },
      tags: ['#gamedev', '#core'],
    },
  },

  // Card 2: Mídias Interativas (Fiel à imagem de referência)
  {
    id: 'card-midias-interativas',
    type: 'media',
    title: 'Mídias Interativas',
    x: 480,
    y: 80,
    width: 380,
    height: 360,
    color: 'default',
    zIndex: 10,
    status: 'done',
    rootBoardId: 'ws-tower-defense',
    parentBoardId: 'root',
    mediaData: {
      title: 'Torreta 3D Interativa',
      mediaType: '3d',
      modelGeometry: 'dodecahedron',
      wireframe: false,
      modelColor: '#94a3b8',
      autoRotate: true,
      audioPlaying: false,
      audioDuration: 133,
      audioProgress: 0.15,
      caption: 'Inspecione a geometria 3D da torreta ou dê play no áudio.',
    },
  },

  // Card 3: Sub-Quadro (Fiel à imagem de referência)
  {
    id: 'card-sub-quadro-tower',
    type: 'board',
    title: 'Sub-Quadro',
    x: 80,
    y: 500,
    width: 340,
    height: 180,
    color: 'default',
    zIndex: 10,
    status: 'backlog',
    rootBoardId: 'ws-tower-defense',
    parentBoardId: 'root',
    boardData: {
      title: 'Sub-Quadro',
      description: 'Módulo interno aninhado com workspace infinito dedicado.',
      itemCount: 4,
      coverColor: '#6366f1',
      tags: ['#sub-board', '#tower-defense'],
    },
  },

  // Card 4: Monitor de Links (Fiel à imagem de referência)
  {
    id: 'card-monitor-links',
    type: 'link',
    title: 'Monitor de Links',
    x: 80,
    y: 720,
    width: 340,
    height: 220,
    color: 'cyan',
    zIndex: 10,
    status: 'done',
    rootBoardId: 'ws-tower-defense',
    parentBoardId: 'root',
    linkData: {
      url: 'https://towerdefense.pampo.tech',
      title: 'Quadro 1',
      description: 'Telemetria do servidor e status de conexão',
      status: 'online',
      latencyMs: 18,
      lastChecked: 'Agora',
      sslSecure: true,
    },
  },

  // Card 5: Tabela de Dados (Fiel à imagem de referência)
  {
    id: 'card-tabela-dados',
    type: 'table',
    title: 'Tabela de Dados',
    x: 480,
    y: 680,
    width: 380,
    height: 260,
    color: 'slate',
    zIndex: 10,
    status: 'in_progress',
    rootBoardId: 'ws-tower-defense',
    parentBoardId: 'root',
    tableData: {
      title: 'Tabela de Dados',
      columns: [
        { id: 'c1', header: 'Item', type: 'text', width: 90 },
        { id: 'c2', header: 'Data', type: 'text', width: 130 },
        { id: 'c3', header: 'Tipo', type: 'status', width: 100 },
      ],
      rows: [
        { id: 'r1', cells: { c1: '1', c2: 'Color 1', c3: 'Concluído' } },
        { id: 'r2', cells: { c1: '2', c2: 'Color 2', c3: 'Ativo' } },
      ],
    },
  },

  // ===== Cards Internos do Sub-Quadro (quando o usuário clica em Sub-Quadro) =====
  {
    id: 'card-sub-notas',
    type: 'note',
    title: 'Mecânica de Dano e Balanceamento',
    x: 100,
    y: 100,
    width: 340,
    height: 320,
    color: 'lavender',
    zIndex: 10,
    status: 'in_progress',
    rootBoardId: 'ws-tower-defense',
    parentBoardId: 'card-sub-quadro-tower',
    noteData: {
      title: 'Balanceamento de DPS',
      body: 'Cálculo de dano por segundo para as torretas nível 1 a 5.',
      checklist: [
        { id: 's1', text: 'Raio de alcance da torreta', completed: true },
        { id: 's2', text: 'Multiplicador de dano elemental', completed: true },
        { id: 's3', text: 'Efeito de congelamento / desaceleração', completed: false },
      ],
      tags: ['#balance', '#math'],
    },
  },
  {
    id: 'card-sub-3d',
    type: 'media',
    title: 'Asset 3D — Torre de Gelo',
    x: 500,
    y: 100,
    width: 380,
    height: 340,
    color: 'cyan',
    zIndex: 10,
    status: 'done',
    rootBoardId: 'ws-tower-defense',
    parentBoardId: 'card-sub-quadro-tower',
    mediaData: {
      title: 'Torre de Gelo Paramétrica',
      mediaType: '3d',
      modelGeometry: 'knot',
      wireframe: false,
      modelColor: '#06b6d4',
      autoRotate: true,
      caption: 'Modelo renderizado com WebGL / Three.js.',
    },
  },
];

export const initialConnections: Connection[] = [
  // Conexão 1: Notas -> Mídias Interativas (Magenta/Roxo)
  {
    id: 'conn-notas-midia',
    fromCardId: 'card-notas-checklists',
    fromPort: 'right',
    toCardId: 'card-midias-interativas',
    toPort: 'left',
    label: 'Renderiza',
    style: 'pulse',
    color: '#a855f7',
    rootBoardId: 'ws-tower-defense',
    parentBoardId: 'root',
  },

  // Conexão 2: Notas -> Sub-Quadro
  {
    id: 'conn-notas-sub',
    fromCardId: 'card-notas-checklists',
    fromPort: 'bottom',
    toCardId: 'card-sub-quadro-tower',
    toPort: 'top',
    label: 'Estrutura',
    style: 'solid',
    color: '#6366f1',
    rootBoardId: 'ws-tower-defense',
    parentBoardId: 'root',
  },

  // Conexão 3: Sub-Quadro -> Tabela de Dados (com Pílula Magenta / Claro Ciano)
  {
    id: 'conn-sub-tabela',
    fromCardId: 'card-sub-quadro-tower',
    fromPort: 'right',
    toCardId: 'card-tabela-dados',
    toPort: 'left',
    label: 'Claro ciano',
    style: 'pulse',
    color: '#06b6d4',
    rootBoardId: 'ws-tower-defense',
    parentBoardId: 'root',
  },

  // Conexão 4: Mídias -> Tabela de Dados (Pílula Magenta escis)
  {
    id: 'conn-midia-tabela',
    fromCardId: 'card-midias-interativas',
    fromPort: 'bottom',
    toCardId: 'card-tabela-dados',
    toPort: 'top',
    label: 'Magenta escis',
    style: 'pulse',
    color: '#d946ef',
    rootBoardId: 'ws-tower-defense',
    parentBoardId: 'root',
  },

  // Conexão 5: Sub-Quadro -> Monitor de Links
  {
    id: 'conn-sub-links',
    fromCardId: 'card-sub-quadro-tower',
    fromPort: 'bottom',
    toCardId: 'card-monitor-links',
    toPort: 'top',
    label: 'Daowcana',
    style: 'solid',
    color: '#10b981',
    rootBoardId: 'ws-tower-defense',
    parentBoardId: 'root',
  },
];
