export type CardType = 'note' | 'checklist' | 'live' | 'media' | 'link' | 'table' | 'column' | 'board';

export type CardColor = 'default' | 'slate' | 'lavender' | 'emerald' | 'amber' | 'rose' | 'cyan';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type PortPosition = 'top' | 'right' | 'bottom' | 'left';

export interface ConnectionPort {
  id: string;
  cardId: string;
  position: PortPosition;
}

export interface NoteChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface NoteCardData {
  title: string;
  body: string;
  checklist?: NoteChecklistItem[];
  codeSnippet?: {
    code: string;
    language: string;
  };
  tags?: string[];
}

export interface LiveCardData {
  title: string;
  mode: 'counter' | 'toggle' | 'trigger' | 'slider';
  value: number;
  isActive: boolean;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  status: 'idle' | 'pulsing' | 'active' | 'success';
  lastFiredAt?: number;
  actionLog?: string[];
}

export interface MediaCardData {
  title: string;
  mediaType: '3d' | 'audio' | 'image';
  // 3D
  modelGeometry?: 'torus' | 'dodecahedron' | 'cube' | 'knot' | 'cylinder';
  wireframe?: boolean;
  modelColor?: string;
  autoRotate?: boolean;
  // Audio
  audioPlaying?: boolean;
  audioDuration?: number;
  audioProgress?: number;
  waveformData?: number[];
  // Image / File
  imageUrl?: string;
  caption?: string;
  fileSize?: string;
}

export interface SmartLinkData {
  url: string;
  title: string;
  description: string;
  favicon?: string;
  coverImage?: string;
  status: 'online' | 'degraded' | 'offline' | 'checking';
  latencyMs: number;
  lastChecked: string;
  sslSecure: boolean;
}

export interface TableColumn {
  id: string;
  header: string;
  type: 'text' | 'number' | 'status' | 'checkbox';
  width?: number;
}

export interface TableRow {
  id: string;
  cells: Record<string, string | number | boolean>;
}

export interface TableCardData {
  title: string;
  columns: TableColumn[];
  rows: TableRow[];
}

export type ColumnItemType = 'note' | 'checklist' | 'table' | 'link' | 'task';

export interface ColumnItem {
  id: string;
  type?: ColumnItemType;
  title?: string;
  text?: string;
  done?: boolean;
  body?: string;
  checklist?: NoteChecklistItem[];
  tableData?: TableCardData;
  linkData?: SmartLinkData;
  tag?: string;
}

export interface ColumnCardData {
  title: string;
  items: ColumnItem[];
}

export interface ChecklistCardData {
  title: string;
  items: NoteChecklistItem[];
}

export interface SubBoardCardData {
  title: string;
  description: string;
  itemCount: number;
  coverColor: string;
  icon?: string;
  tags?: string[];
}

export interface BoardCard {
  id: string;
  type: CardType;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: CardColor;
  zIndex: number;
  pinned?: boolean;
  zoneId?: string;
  rootBoardId?: string; // id of the root Workspace Board
  parentBoardId?: string; // 'root' or id of parent Sub-Board
  status?: 'backlog' | 'in_progress' | 'done' | 'archived'; // Used for Kanban and Trash mode mapping
  noteData?: NoteCardData;
  checklistData?: ChecklistCardData;
  liveData?: LiveCardData;
  mediaData?: MediaCardData;
  linkData?: SmartLinkData;
  tableData?: TableCardData;
  columnData?: ColumnCardData;
  boardData?: SubBoardCardData;
}

export interface Connection {
  id: string;
  fromCardId: string;
  fromPort: PortPosition;
  toCardId: string;
  toPort: PortPosition;
  rootBoardId?: string;
  parentBoardId?: string;
  label?: string; // e.g. "Dispara", "Gera", "Depende de"
  style?: 'solid' | 'dashed' | 'pulse';
  animated?: boolean;
  color?: string;
}

export interface Zone {
  id: string;
  title: string;
  description?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rootBoardId?: string;
  parentBoardId?: string;
}

export type ViewMode = 'free' | 'kanban' | 'graph';

export interface ViewportTransform {
  x: number;
  y: number;
  zoom: number;
}

export interface BoardBreadcrumb {
  id: string;
  title: string;
}

export interface BoardWorkspace {
  id: string;
  title: string;
  description?: string;
  color?: string;
  icon?: string;
  isDefault?: boolean;
  isPublic?: boolean;
  shareToken?: string;
  updatedAt: number;
}

export interface BoardState {
  activeBoardId: string; // 'root' or nested board ID
  boardBreadcrumbs: BoardBreadcrumb[];
  cards: BoardCard[];
  connections: Connection[];
  zones: Zone[];
  selectedCardIds: string[];
  selectedConnectionIds: string[];
  selectedZoneIds: string[];
  viewMode: ViewMode;
  theme: 'dark' | 'light';
  viewport: ViewportTransform;
  activeTool: 'select' | 'pan' | 'connect';
  connectingFrom: { cardId: string; port: PortPosition } | null;
  dragSelectionBox: { startX: number; startY: number; endX: number; endY: number } | null;
  isSnappingEnabled: boolean;
  lastSavedTimestamp: number;
  activePulseConnectionId?: string | null;
}
