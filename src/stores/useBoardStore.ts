import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BoardCard,
  BoardState,
  Connection,
  PortPosition,
  ViewMode,
  ViewportTransform,
  Zone,
  CardType,
  CardColor,
  BoardWorkspace,
} from '../types/board';
import { initialCards, initialConnections, initialZones, initialWorkspaces } from '../utils/sampleData';
import { sound } from '../utils/sound';
import { api, AuthUser } from '../services/api';

const STORAGE_KEY = 'pampo_board_mvp_v2';

export function useBoardStore() {
  const [user, setUser] = useState<AuthUser | null>(() => api.auth.getCurrentUser());
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [lastCloudSyncedAt, setLastCloudSyncedAt] = useState<number | null>(null);

  const [workspaces, setWorkspaces] = useState<BoardWorkspace[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_workspaces');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialWorkspaces;
  });

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_active_ws');
      if (saved) return saved;
    } catch {}
    return 'ws-tower-defense';
  });

  // Load initial state from localStorage if available
  const [cards, setCards] = useState<BoardCard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_cards');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialCards;
  });

  const [connections, setConnections] = useState<Connection[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_connections');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialConnections;
  });

  const [zones, setZones] = useState<Zone[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_zones');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialZones;
  });

  const [viewport, setViewport] = useState<ViewportTransform>({
    x: 0,
    y: 0,
    zoom: 1,
  });

  const [activeBoardId, setActiveBoardId] = useState<string>('root');
  const [boardBreadcrumbs, setBoardBreadcrumbs] = useState<{ id: string; title: string }[]>([
    { id: 'root', title: 'Jogo Tower Defense' },
  ]);

  const [viewMode, setViewMode] = useState<ViewMode>('free');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTool, setActiveTool] = useState<'select' | 'pan' | 'connect'>('select');
  const [connectingFrom, setConnectingFrom] = useState<{ cardId: string; port: PortPosition } | null>(null);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [selectedConnectionIds, setSelectedConnectionIds] = useState<string[]>([]);
  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>([]);
  const [dragSelectionBox, setDragSelectionBox] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const [isSnappingEnabled, setIsSnappingEnabled] = useState<boolean>(true);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<number>(Date.now());
  const [activePulseConnectionId, setActivePulseConnectionId] = useState<string | null>(null);

  // History for undo/redo
  const historyRef = useRef<{ cards: BoardCard[]; connections: Connection[]; zones: Zone[] }[]>([]);
  const futureRef = useRef<{ cards: BoardCard[]; connections: Connection[]; zones: Zone[] }[]>([]);

  const pushHistory = useCallback(() => {
    historyRef.current.push({
      cards: JSON.parse(JSON.stringify(cards)),
      connections: JSON.parse(JSON.stringify(connections)),
      zones: JSON.parse(JSON.stringify(zones)),
    });
    if (historyRef.current.length > 30) historyRef.current.shift();
    futureRef.current = [];
  }, [cards, connections, zones]);

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const previous = historyRef.current.pop()!;
    futureRef.current.push({
      cards: JSON.parse(JSON.stringify(cards)),
      connections: JSON.parse(JSON.stringify(connections)),
      zones: JSON.parse(JSON.stringify(zones)),
    });
    setCards(previous.cards);
    setConnections(previous.connections);
    setZones(previous.zones);
    sound.playClick();
  }, [cards, connections, zones]);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current.pop()!;
    historyRef.current.push({
      cards: JSON.parse(JSON.stringify(cards)),
      connections: JSON.parse(JSON.stringify(connections)),
      zones: JSON.parse(JSON.stringify(zones)),
    });
    setCards(next.cards);
    setConnections(next.connections);
    setZones(next.zones);
    sound.playClick();
  }, [cards, connections, zones]);

  // Autosave to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY + '_cards', JSON.stringify(cards));
      localStorage.setItem(STORAGE_KEY + '_connections', JSON.stringify(connections));
      localStorage.setItem(STORAGE_KEY + '_zones', JSON.stringify(zones));
      localStorage.setItem(STORAGE_KEY + '_workspaces', JSON.stringify(workspaces));
      localStorage.setItem(STORAGE_KEY + '_active_ws', activeWorkspaceId);
      setLastSavedTimestamp(Date.now());
    } catch (e) {
      console.error('Failed to autosave:', e);
    }
  }, [cards, connections, zones, workspaces, activeWorkspaceId]);

  // Cloud Synchronization Debounce Effect
  const syncTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (!user || !activeWorkspaceId) return;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        setIsCloudSyncing(true);
        const currentWsCards = cards.filter((c) => !c.rootBoardId || c.rootBoardId === activeWorkspaceId);
        const currentWsConns = connections.filter((c) => !c.rootBoardId || c.rootBoardId === activeWorkspaceId);
        const currentWsZones = zones.filter((z) => !z.rootBoardId || z.rootBoardId === activeWorkspaceId);

        await api.boards.sync(activeWorkspaceId, {
          cards: currentWsCards,
          connections: currentWsConns,
          zones: currentWsZones,
        });
        setLastCloudSyncedAt(Date.now());
      } catch (err) {
        console.warn('Sincronização em nuvem offline fallback:', err);
      } finally {
        setIsCloudSyncing(false);
      }
    }, 1500);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [cards, connections, zones, user, activeWorkspaceId]);

  // Auth actions
  const login = useCallback(async (loggedInUser: AuthUser, defaultWsId?: string) => {
    setUser(loggedInUser);
    sound.playConnect();
    try {
      setIsCloudSyncing(true);
      const remoteWorkspaces = await api.workspaces.list();
      if (remoteWorkspaces && remoteWorkspaces.length > 0) {
        setWorkspaces(remoteWorkspaces);
        const targetWsId = defaultWsId || remoteWorkspaces[0].id;
        setActiveWorkspaceId(targetWsId);
        const remoteData = await api.boards.get(targetWsId);
        if (remoteData && remoteData.cards) {
          setCards(remoteData.cards);
          setConnections(remoteData.connections || []);
          setZones(remoteData.zones || []);
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar dados do usuário:', err);
    } finally {
      setIsCloudSyncing(false);
    }
  }, []);

  const logout = useCallback(() => {
    api.auth.logout();
    setUser(null);
    sound.playClick();
  }, []);

  const updateUserProfile = useCallback(
    async (data: { name?: string; avatar?: string }) => {
      const res = await api.auth.updateProfile(data);
      setUser(res.user);
      sound.playConnect();
      return res.user;
    },
    []
  );

  // Workspace management
  const switchWorkspace = useCallback(async (workspaceId: string) => {
    setActiveWorkspaceId(workspaceId);
    setActiveBoardId('root');
    const ws = workspaces.find((w) => w.id === workspaceId);
    const title = ws ? ws.title : 'Quadro Principal';
    setBoardBreadcrumbs([{ id: 'root', title }]);
    setSelectedCardIds([]);
    setSelectedConnectionIds([]);
    setSelectedZoneIds([]);
    setViewport({ x: 0, y: 0, zoom: 1 });
    sound.playClick();

    if (user) {
      try {
        setIsCloudSyncing(true);
        const remoteData = await api.boards.get(workspaceId);
        if (remoteData && remoteData.cards) {
          setCards((prev) => [
            ...prev.filter((c) => c.rootBoardId !== workspaceId),
            ...remoteData.cards,
          ]);
          setConnections((prev) => [
            ...prev.filter((c) => c.rootBoardId !== workspaceId),
            ...(remoteData.connections || []),
          ]);
          setZones((prev) => [
            ...prev.filter((z) => z.rootBoardId !== workspaceId),
            ...(remoteData.zones || []),
          ]);
        }
      } catch (err) {
        console.warn('Erro ao buscar dados remotos do quadro:', err);
      } finally {
        setIsCloudSyncing(false);
      }
    }
  }, [workspaces, user]);

  const createWorkspace = useCallback(async (title: string, color: string = '#3b82f6') => {
    let newId = `ws-${Date.now()}`;
    if (user) {
      try {
        const created = await api.workspaces.create(title, '', color);
        newId = created.id;
      } catch (e) {
        console.warn('Fallback offline ao criar workspace:', e);
      }
    }
    const newWs: BoardWorkspace = {
      id: newId,
      title,
      description: 'Novo workspace do Pampo Board',
      color,
      icon: '📁',
      updatedAt: Date.now(),
    };
    setWorkspaces((prev) => [...prev, newWs]);
    switchWorkspace(newWs.id);
    sound.playConnect();
    return newWs.id;
  }, [user, switchWorkspace]);

  const deleteWorkspace = useCallback(async (workspaceId: string) => {
    if (workspaces.length <= 1) return;
    if (user) {
      api.workspaces.delete(workspaceId).catch((e) => console.warn('Erro ao deletar workspace:', e));
    }
    setWorkspaces((prev) => prev.filter((w) => w.id !== workspaceId));
    setCards((prev) => prev.filter((c) => c.rootBoardId !== workspaceId));
    setConnections((prev) => prev.filter((c) => c.rootBoardId !== workspaceId));
    setZones((prev) => prev.filter((z) => z.rootBoardId !== workspaceId));
    if (activeWorkspaceId === workspaceId) {
      const remaining = workspaces.filter((w) => w.id !== workspaceId);
      if (remaining.length > 0) {
        setActiveWorkspaceId(remaining[0].id);
        setActiveBoardId('root');
        setBoardBreadcrumbs([{ id: 'root', title: remaining[0].title }]);
        setViewport({ x: 0, y: 0, zoom: 1 });
      }
    }
    sound.playDelete();
  }, [workspaces, activeWorkspaceId, user]);

  const toggleWorkspacePublic = useCallback(async (workspaceId: string, isPublic: boolean) => {
    setWorkspaces((prev) =>
      prev.map((w) => (w.id === workspaceId ? { ...w, isPublic } : w))
    );
    if (user) {
      try {
        const updated = await api.workspaces.update(workspaceId, { isPublic });
        setWorkspaces((prev) =>
          prev.map((w) =>
            w.id === workspaceId
              ? { ...w, isPublic: updated.isPublic, shareToken: updated.shareToken }
              : w
          )
        );
      } catch (e) {
        console.warn('Erro ao atualizar compartilhamento:', e);
      }
    }
  }, [user]);

  // Board Drill-Down Navigation
  const navigateToBoard = useCallback((boardId: string, title: string) => {
    sound.playConnect();
    setActiveBoardId(boardId);
    setBoardBreadcrumbs((prev) => {
      // Avoid duplicate append if already at this board
      if (prev.length > 0 && prev[prev.length - 1].id === boardId) return prev;
      return [...prev, { id: boardId, title }];
    });
    setSelectedCardIds([]);
    setSelectedConnectionIds([]);
    setSelectedZoneIds([]);
    setViewport({ x: 0, y: 0, zoom: 1 });
  }, []);

  const navigateToBreadcrumb = useCallback((index: number) => {
    sound.playClick();
    setBoardBreadcrumbs((prev) => {
      const target = prev[index];
      if (!target) return prev;
      setActiveBoardId(target.id);
      return prev.slice(0, index + 1);
    });
    setSelectedCardIds([]);
    setSelectedConnectionIds([]);
    setSelectedZoneIds([]);
    setViewport({ x: 0, y: 0, zoom: 1 });
  }, []);

  const navigateUp = useCallback(() => {
    if (boardBreadcrumbs.length <= 1) return;
    navigateToBreadcrumb(boardBreadcrumbs.length - 2);
  }, [boardBreadcrumbs, navigateToBreadcrumb]);

  // Card management
  const addCard = useCallback(
    (type: CardType, customPos?: { x: number; y: number }, color: CardColor = 'default') => {
      pushHistory();
      sound.playClick();

      // Calculate position at center of current viewport
      const spawnX = customPos ? customPos.x : -viewport.x / viewport.zoom + (window.innerWidth / 2) / viewport.zoom - 160;
      const spawnY = customPos ? customPos.y : -viewport.y / viewport.zoom + (window.innerHeight / 2) / viewport.zoom - 140;

      const newId = `card-${type}-${Date.now()}`;
      let newCard: BoardCard;

      if (type === 'note') {
        newCard = {
          id: newId,
          type: 'note',
          title: 'Nova Ideia',
          rootBoardId: activeWorkspaceId,
          parentBoardId: activeBoardId,
          x: Math.round(spawnX),
          y: Math.round(spawnY),
          width: 320,
          height: 320,
          color,
          zIndex: 20,
          status: 'backlog',
          noteData: {
            title: 'Nota',
            body: '',
            checklist: [],
            tags: [],
          },
        };
      } else if (type === 'checklist') {
        newCard = {
          id: newId,
          type: 'checklist',
          title: 'Checklist',
          rootBoardId: activeWorkspaceId,
          parentBoardId: activeBoardId,
          x: Math.round(spawnX),
          y: Math.round(spawnY),
          width: 320,
          height: 240,
          color: 'emerald',
          zIndex: 20,
          status: 'in_progress',
          checklistData: {
            title: 'Checklist',
            items: [],
          },
        };
      } else if (type === 'live') {
        newCard = {
          id: newId,
          type: 'live',
          title: 'Card Vivo',
          rootBoardId: activeWorkspaceId,
          parentBoardId: activeBoardId,
          x: Math.round(spawnX),
          y: Math.round(spawnY),
          width: 320,
          height: 330,
          color: 'amber',
          zIndex: 20,
          status: 'backlog',
          liveData: {
            title: 'Card Vivo',
            mode: 'trigger',
            value: 0,
            isActive: true,
            status: 'idle',
            unit: '%',
            actionLog: [],
          },
        };
      } else if (type === 'media') {
        newCard = {
          id: newId,
          type: 'media',
          title: 'Viewport 3D',
          rootBoardId: activeWorkspaceId,
          parentBoardId: activeBoardId,
          x: Math.round(spawnX),
          y: Math.round(spawnY),
          width: 380,
          height: 360,
          color: 'default',
          zIndex: 20,
          status: 'in_progress',
          mediaData: {
            title: 'Visualizador 3D Paramétrico',
            mediaType: '3d',
            modelGeometry: 'dodecahedron',
            wireframe: false,
            modelColor: '#8b5cf6',
            autoRotate: true,
            caption: '',
          },
        };
      } else if (type === 'table') {
        newCard = {
          id: newId,
          type: 'table',
          title: 'Tabela',
          rootBoardId: activeWorkspaceId,
          parentBoardId: activeBoardId,
          x: Math.round(spawnX),
          y: Math.round(spawnY),
          width: 480,
          height: 350,
          color: 'slate',
          zIndex: 20,
          status: 'in_progress',
          tableData: {
            title: 'Tabela',
            columns: [
              { id: 'col-1', header: 'Coluna 1', type: 'text', width: 160 },
              { id: 'col-2', header: 'Coluna 2', type: 'text', width: 160 },
            ],
            rows: [],
          },
        };
      } else if (type === 'column') {
        newCard = {
          id: newId,
          type: 'column',
          title: 'Coluna',
          rootBoardId: activeWorkspaceId,
          parentBoardId: activeBoardId,
          x: Math.round(spawnX),
          y: Math.round(spawnY),
          width: 330,
          height: 380,
          color: 'lavender',
          zIndex: 20,
          status: 'in_progress',
          columnData: {
            title: 'Coluna',
            items: [],
          },
        };
      } else if (type === 'board') {
        newCard = {
          id: newId,
          type: 'board',
          title: 'Sub-Quadro',
          rootBoardId: activeWorkspaceId,
          parentBoardId: activeBoardId,
          x: Math.round(spawnX),
          y: Math.round(spawnY),
          width: 320,
          height: 250,
          color: 'emerald',
          zIndex: 20,
          status: 'backlog',
          boardData: {
            title: 'Sub-Quadro',
            description: '',
            itemCount: 0,
            coverColor: '#10b981',
            icon: 'folder',
            tags: [],
          },
        };
      } else {
        // Smart link
        newCard = {
          id: newId,
          type: 'link',
          title: 'Link Web',
          rootBoardId: activeWorkspaceId,
          parentBoardId: activeBoardId,
          x: Math.round(spawnX),
          y: Math.round(spawnY),
          width: 320,
          height: 340,
          color: 'cyan',
          zIndex: 20,
          status: 'backlog',
          linkData: {
            url: '',
            title: 'Link Web',
            description: '',
            status: 'online',
            latencyMs: 0,
            lastChecked: '',
            sslSecure: true,
          },
        };
      }

      setCards((prev) => [...prev, newCard]);
      setSelectedCardIds([newId]);
      return newCard;
    },
    [viewport, pushHistory, activeBoardId, activeWorkspaceId]
  );

  const addPastedImageCard = useCallback(
    (dataUrl: string, customPos?: { x: number; y: number }, title: string = 'Captura de Tela (Print)') => {
      pushHistory();
      sound.playConnect();

      const spawnX = customPos ? customPos.x : -viewport.x / viewport.zoom + (window.innerWidth / 2) / viewport.zoom - 220;
      const spawnY = customPos ? customPos.y : -viewport.y / viewport.zoom + (window.innerHeight / 2) / viewport.zoom - 180;

      const newId = `card-media-${Date.now()}`;
      const newCard: BoardCard = {
        id: newId,
        type: 'media',
        title,
        rootBoardId: activeWorkspaceId,
        parentBoardId: activeBoardId,
        x: Math.round(spawnX),
        y: Math.round(spawnY),
        width: 440,
        height: 380,
        color: 'slate',
        zIndex: 30,
        status: 'in_progress',
        mediaData: {
          title,
          mediaType: 'image',
          imageUrl: dataUrl,
          caption: 'Colado diretamente via Ctrl+V da área de transferência',
          fileSize: `${Math.round((dataUrl.length * 3) / 4 / 1024)} KB Print`,
        },
      };

      setCards((prev) => [...prev, newCard]);
      setSelectedCardIds([newId]);

      // Cloud upload in background if available
      if (user || api.auth.hasToken()) {
        api.upload.base64(dataUrl).then((res) => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === newId
                ? {
                    ...c,
                    mediaData: {
                      title: c.mediaData?.title || c.title,
                      mediaType: 'image' as const,
                      ...(c.mediaData || {}),
                      imageUrl: res.url,
                      caption: 'Sincronizado na nuvem (Storage)',
                    },
                  }
                : c
            )
          );
        }).catch((err) => console.warn('Upload de print fallback local:', err));
      }

      return newCard;
    },
    [viewport, pushHistory, activeBoardId, activeWorkspaceId, user]
  );

  const updateCard = useCallback(
    (id: string, updates: Partial<BoardCard>) => {
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
    },
    []
  );

  const updateCardPosition = useCallback(
    (id: string, x: number, y: number, snap: boolean = isSnappingEnabled) => {
      let finalX = x;
      let finalY = y;
      if (snap) {
        finalX = Math.round(x / 16) * 16;
        finalY = Math.round(y / 16) * 16;
      }
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, x: finalX, y: finalY } : c))
      );
    },
    [isSnappingEnabled]
  );

  const moveCards = useCallback(
    (deltas: { id: string; dx: number; dy: number }[]) => {
      setCards((prev) =>
        prev.map((card) => {
          const delta = deltas.find((d) => d.id === card.id);
          if (!delta) return card;
          return {
            ...card,
            x: Math.round(card.x + delta.dx),
            y: Math.round(card.y + delta.dy),
          };
        })
      );
    },
    []
  );

  const deleteCard = useCallback(
    (id: string) => {
      pushHistory();
      sound.playDelete();
      // Soft-delete: mark as archived so it appears in TrashDrawer
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'archived' } : c))
      );
      // Remove connections linked to this card
      setConnections((prev) =>
        prev.filter((conn) => conn.fromCardId !== id && conn.toCardId !== id)
      );
      setSelectedCardIds((prev) => prev.filter((selId) => selId !== id));
    },
    [pushHistory]
  );

  const restoreCard = useCallback(
    (id: string) => {
      pushHistory();
      sound.playConnect();
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'in_progress' } : c))
      );
    },
    [pushHistory]
  );

  const permanentlyDeleteCard = useCallback(
    (id: string) => {
      pushHistory();
      sound.playDelete();
      setCards((prev) => prev.filter((c) => c.id !== id));
      setConnections((prev) =>
        prev.filter((conn) => conn.fromCardId !== id && conn.toCardId !== id)
      );
      setSelectedCardIds((prev) => prev.filter((selId) => selId !== id));
    },
    [pushHistory]
  );

  const emptyTrash = useCallback(() => {
    pushHistory();
    sound.playDelete();
    setCards((prev) => prev.filter((c) => c.status !== 'archived'));
  }, [pushHistory]);

  const duplicateCard = useCallback(
    (id: string) => {
      const original = cards.find((c) => c.id === id);
      if (!original) return;
      pushHistory();
      sound.playClick();
      const newCard: BoardCard = {
        ...JSON.parse(JSON.stringify(original)),
        id: `card-${original.type}-${Date.now()}`,
        title: `${original.title} (Cópia)`,
        x: original.x + 32,
        y: original.y + 32,
        zIndex: original.zIndex + 1,
      };
      setCards((prev) => [...prev, newCard]);
      setSelectedCardIds([newCard.id]);
    },
    [cards, pushHistory]
  );

  const bringToFront = useCallback((id: string) => {
    setCards((prev) => {
      const maxZ = Math.max(...prev.map((c) => c.zIndex), 10);
      return prev.map((c) => (c.id === id ? { ...c, zIndex: maxZ + 1 } : c));
    });
  }, []);

  // Zones
  const addZone = useCallback(
    (title: string = 'Nova Zona Delimitadora', color: string = '#8b5cf6') => {
      pushHistory();
      sound.playClick();
      const spawnX = -viewport.x / viewport.zoom + (window.innerWidth / 2) / viewport.zoom - 300;
      const spawnY = -viewport.y / viewport.zoom + (window.innerHeight / 2) / viewport.zoom - 200;

      const newZone: Zone = {
        id: `zone-${Date.now()}`,
        title,
        rootBoardId: activeWorkspaceId,
        parentBoardId: activeBoardId,
        description: 'Arraste cards para dentro desta zona para movê-los em conjunto',
        x: Math.round(spawnX),
        y: Math.round(spawnY),
        width: 620,
        height: 420,
        color,
      };
      setZones((prev) => [...prev, newZone]);
      setSelectedZoneIds([newZone.id]);
      return newZone;
    },
    [viewport, pushHistory, activeBoardId, activeWorkspaceId]
  );

  const updateZone = useCallback((id: string, updates: Partial<Zone>) => {
    setZones((prev) => prev.map((z) => (z.id === id ? { ...z, ...updates } : z)));
  }, []);

  const deleteZone = useCallback(
    (id: string) => {
      pushHistory();
      sound.playDelete();
      setZones((prev) => prev.filter((z) => z.id !== id));
      setSelectedZoneIds((prev) => prev.filter((zid) => zid !== id));
    },
    [pushHistory]
  );

  const moveZoneAndChildren = useCallback(
    (zoneId: string, dx: number, dy: number) => {
      const targetZone = zones.find((z) => z.id === zoneId);
      if (!targetZone) return;

      // Update zone coordinates
      setZones((prev) =>
        prev.map((z) =>
          z.id === zoneId
            ? { ...z, x: Math.round(z.x + dx), y: Math.round(z.y + dy) }
            : z
        )
      );

      // Move all cards that are inside this zone
      setCards((prev) =>
        prev.map((card) => {
          const cardCenterX = card.x + card.width / 2;
          const cardCenterY = card.y + card.height / 2;
          const isInside =
            card.zoneId === zoneId ||
            (cardCenterX >= targetZone.x &&
              cardCenterX <= targetZone.x + targetZone.width &&
              cardCenterY >= targetZone.y &&
              cardCenterY <= targetZone.y + targetZone.height);

          if (isInside) {
            return {
              ...card,
              zoneId,
              x: Math.round(card.x + dx),
              y: Math.round(card.y + dy),
            };
          }
          return card;
        })
      );
    },
    [zones]
  );

  // Connections
  const addConnection = useCallback(
    (
      fromCardId: string,
      fromPort: PortPosition,
      toCardId: string,
      toPort: PortPosition,
      label: string = ''
    ) => {
      if (fromCardId === toCardId) return; // Prevent self-loop if desired
      pushHistory();
      sound.playConnect();

      // Check if duplicate exists
      const exists = connections.some(
        (c) =>
          c.fromCardId === fromCardId &&
          c.toCardId === toCardId &&
          c.fromPort === fromPort &&
          c.toPort === toPort
      );
      if (exists) return;

      const newConn: Connection = {
        id: `conn-${Date.now()}`,
        fromCardId,
        fromPort,
        toCardId,
        toPort,
        rootBoardId: activeWorkspaceId,
        parentBoardId: activeBoardId,
        label,
        style: 'pulse',
        color: '#a855f7',
      };
      setConnections((prev) => [...prev, newConn]);
      setConnectingFrom(null);
    },
    [connections, pushHistory, activeBoardId, activeWorkspaceId]
  );

  const deleteConnection = useCallback(
    (id: string) => {
      pushHistory();
      sound.playDelete();
      setConnections((prev) => prev.filter((c) => c.id !== id));
      setSelectedConnectionIds((prev) => prev.filter((cid) => cid !== id));
    },
    [pushHistory]
  );

  const updateConnection = useCallback((id: string, updates: Partial<Connection>) => {
    setConnections((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  // Reactive Conductor Pulse (Triggering Live Card logic)
  const triggerPulse = useCallback(
    (sourceCardId: string) => {
      sound.playPulse();

      // Find all connections originating from this card
      const outgoingConns = connections.filter((c) => c.fromCardId === sourceCardId);

      // Set source card to pulsing state
      setCards((prev) =>
        prev.map((c) => {
          if (c.id === sourceCardId && c.liveData) {
            const nextValue = c.liveData.mode === 'counter' ? c.liveData.value + 1 : c.liveData.value;
            return {
              ...c,
              liveData: {
                ...c.liveData,
                status: 'pulsing',
                value: nextValue,
                lastFiredAt: Date.now(),
                actionLog: [
                  `⚡ Pulso disparado às ${new Date().toLocaleTimeString()}`,
                  ...(c.liveData.actionLog || []).slice(0, 5),
                ],
              },
            };
          }
          return c;
        })
      );

      // Light up connection lines
      outgoingConns.forEach((conn) => {
        setActivePulseConnectionId(conn.id);
        setTimeout(() => setActivePulseConnectionId(null), 1200);

        // Cascade effect on target card after brief signal delay
        setTimeout(() => {
          setCards((prev) =>
            prev.map((targetCard) => {
              if (targetCard.id === conn.toCardId) {
                // If target is live card: increment or activate
                if (targetCard.type === 'live' && targetCard.liveData) {
                  return {
                    ...targetCard,
                    liveData: {
                      ...targetCard.liveData,
                      status: 'active',
                      value: targetCard.liveData.value + 1,
                      actionLog: [
                        `📥 Pulso recebido de ${sourceCardId} às ${new Date().toLocaleTimeString()}`,
                        ...(targetCard.liveData.actionLog || []).slice(0, 5),
                      ],
                    },
                  };
                }
                // If target is note card: check off first unchecked item or append a log
                if (targetCard.type === 'note' && targetCard.noteData) {
                  const items = targetCard.noteData.checklist || [];
                  const firstUnchecked = items.findIndex((i) => !i.completed);
                  let updatedList = [...items];
                  if (firstUnchecked !== -1) {
                    updatedList[firstUnchecked] = { ...updatedList[firstUnchecked], completed: true };
                  }
                  return {
                    ...targetCard,
                    noteData: {
                      ...targetCard.noteData,
                      checklist: updatedList,
                    },
                  };
                }
                // If target is media 3D card: toggle geometry or wireframe
                if (targetCard.type === 'media' && targetCard.mediaData && targetCard.mediaData.mediaType === '3d') {
                  const geoms: ('torus' | 'dodecahedron' | 'cube' | 'knot' | 'cylinder')[] = [
                    'torus',
                    'knot',
                    'dodecahedron',
                    'cylinder',
                    'cube',
                  ];
                  const currentIdx = geoms.indexOf(targetCard.mediaData.modelGeometry || 'torus');
                  const nextGeom = geoms[(currentIdx + 1) % geoms.length];
                  return {
                    ...targetCard,
                    mediaData: {
                      ...targetCard.mediaData,
                      modelGeometry: nextGeom,
                    },
                  };
                }
                // If target is Web Link card: refresh latency
                if (targetCard.type === 'link' && targetCard.linkData) {
                  return {
                    ...targetCard,
                    linkData: {
                      ...targetCard.linkData,
                      latencyMs: Math.floor(Math.random() * 25) + 15,
                      lastChecked: 'Agora mesmo (via pulso)',
                    },
                  };
                }
              }
              return targetCard;
            })
          );
        }, 400);
      });

      // Reset source state back to idle after pulse
      setTimeout(() => {
        setCards((prev) =>
          prev.map((c) =>
            c.id === sourceCardId && c.liveData
              ? { ...c, liveData: { ...c.liveData, status: 'idle' } }
              : c
          )
        );
      }, 1000);
    },
    [connections]
  );

  // Viewport navigation
  const panBy = useCallback((dx: number, dy: number) => {
    setViewport((prev) => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy,
    }));
  }, []);

  const zoomAt = useCallback((clientX: number, clientY: number, delta: number) => {
    setViewport((prev) => {
      const zoomFactor = delta < 0 ? 1.15 : 0.88;
      const newZoom = Math.min(Math.max(prev.zoom * zoomFactor, 0.15), 3.0);
      const mouseX = clientX;
      const mouseY = clientY;
      const newX = mouseX - (mouseX - prev.x) * (newZoom / prev.zoom);
      const newY = mouseY - (mouseY - prev.y) * (newZoom / prev.zoom);
      return { x: newX, y: newY, zoom: newZoom };
    });
  }, []);

  const resetZoom = useCallback(() => {
    sound.playClick();
    setViewport({ x: 0, y: 0, zoom: 1 });
  }, []);

  const zoomToFit = useCallback(() => {
    if (cards.length === 0) return;
    sound.playClick();
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const c of cards) {
      minX = Math.min(minX, c.x);
      minY = Math.min(minY, c.y);
      maxX = Math.max(maxX, c.x + c.width);
      maxY = Math.max(maxY, c.y + c.height);
    }

    const padding = 120;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;
    const scaleX = window.innerWidth / width;
    const scaleY = window.innerHeight / height;
    const targetZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.25), 1.5);

    const targetX = window.innerWidth / 2 - (minX + (maxX - minX) / 2) * targetZoom;
    const targetY = window.innerHeight / 2 - (minY + (maxY - minY) / 2) * targetZoom;

    setViewport({ x: targetX, y: targetY, zoom: targetZoom });
  }, [cards]);

  const focusCard = useCallback(
    (cardId: string) => {
      const card = cards.find((c) => c.id === cardId);
      if (!card) return;
      sound.playClick();
      setSelectedCardIds([cardId]);

      const targetZoom = 1.05;
      const cardCenterX = card.x + card.width / 2;
      const cardCenterY = card.y + card.height / 2;
      const targetX = window.innerWidth / 2 - cardCenterX * targetZoom;
      const targetY = window.innerHeight / 2 - cardCenterY * targetZoom;

      setViewport({ x: targetX, y: targetY, zoom: targetZoom });
    },
    [cards]
  );

  // Selection actions
  const selectCard = useCallback((id: string, multi: boolean = false) => {
    sound.playClick();
    setSelectedCardIds((prev) => {
      if (multi) {
        return prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      }
      return [id];
    });
    setSelectedConnectionIds([]);
    setSelectedZoneIds([]);
  }, []);

  const selectConnection = useCallback((id: string) => {
    sound.playClick();
    setSelectedConnectionIds([id]);
    setSelectedCardIds([]);
    setSelectedZoneIds([]);
  }, []);

  const selectZone = useCallback((id: string) => {
    sound.playClick();
    setSelectedZoneIds([id]);
    setSelectedCardIds([]);
    setSelectedConnectionIds([]);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCardIds([]);
    setSelectedConnectionIds([]);
    setSelectedZoneIds([]);
  }, []);

  // Assistant: Organize selected in grid
  const alignSelectedCardsInGrid = useCallback(() => {
    if (selectedCardIds.length <= 1) return;
    pushHistory();
    sound.playClick();

    const selectedCards = cards.filter((c) => selectedCardIds.includes(c.id));
    const startX = Math.min(...selectedCards.map((c) => c.x));
    const startY = Math.min(...selectedCards.map((c) => c.y));

    const cols = Math.ceil(Math.sqrt(selectedCards.length));
    const gapX = 360;
    const gapY = 380;

    setCards((prev) =>
      prev.map((c) => {
        const index = selectedCards.findIndex((sc) => sc.id === c.id);
        if (index === -1) return c;
        const col = index % cols;
        const row = Math.floor(index / cols);
        return {
          ...c,
          x: Math.round(startX + col * gapX),
          y: Math.round(startY + row * gapY),
        };
      })
    );
  }, [cards, selectedCardIds, pushHistory]);

  // Assistant: Group selected in new zone
  const groupSelectedIntoZone = useCallback(() => {
    if (selectedCardIds.length === 0) return;
    pushHistory();
    sound.playClick();

    const selectedCards = cards.filter((c) => selectedCardIds.includes(c.id));
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const c of selectedCards) {
      minX = Math.min(minX, c.x);
      minY = Math.min(minY, c.y);
      maxX = Math.max(maxX, c.x + c.width);
      maxY = Math.max(maxY, c.y + c.height);
    }

    const padding = 50;
    const newZone: Zone = {
      id: `zone-${Date.now()}`,
      title: 'Agrupamento Estratégico',
      description: `${selectedCards.length} cartões organizados`,
      x: Math.round(minX - padding),
      y: Math.round(minY - padding),
      width: Math.round(maxX - minX + padding * 2),
      height: Math.round(maxY - minY + padding * 2),
      color: '#3b82f6',
    };

    setZones((prev) => [...prev, newZone]);
    setCards((prev) =>
      prev.map((c) => (selectedCardIds.includes(c.id) ? { ...c, zoneId: newZone.id } : c))
    );
    setSelectedZoneIds([newZone.id]);
  }, [cards, selectedCardIds, pushHistory]);

  // Export / Import
  const exportBoard = useCallback(() => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      cards,
      connections,
      zones,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pampo-board-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [cards, connections, zones]);

  const importBoard = useCallback((jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.cards && parsed.connections) {
        pushHistory();
        setCards(parsed.cards);
        setConnections(parsed.connections);
        setZones(parsed.zones || []);
        sound.playConnect();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  }, [pushHistory]);

  const resetToDefault = useCallback(() => {
    pushHistory();
    sound.playClick();
    const targetWsId = activeWorkspaceId || 'ws-tower-defense';
    const reboundCards = initialCards.map((c) => ({
      ...c,
      rootBoardId: targetWsId,
      parentBoardId: 'root',
      status: 'in_progress' as const,
    }));
    const reboundConns = initialConnections.map((cn) => ({
      ...cn,
      rootBoardId: targetWsId,
      parentBoardId: 'root',
    }));
    const reboundZones = initialZones.map((z) => ({
      ...z,
      rootBoardId: targetWsId,
      parentBoardId: 'root',
    }));
    setCards(reboundCards);
    setConnections(reboundConns);
    setZones(reboundZones);
    setActiveBoardId('root');
    const currentWs = workspaces.find((w) => w.id === activeWorkspaceId);
    setBoardBreadcrumbs([{ id: 'root', title: currentWs ? currentWs.title : 'Pampo Board Principal' }]);
    setViewport({ x: 0, y: 0, zoom: 1 });
  }, [pushHistory, activeWorkspaceId, workspaces]);

  const applyTemplate = useCallback(
    (templateType: 'gamedev' | 'roadmap' | 'data' | 'moodboard') => {
      pushHistory();
      sound.playConnect();
      const targetWsId = activeWorkspaceId || 'ws-tower-defense';
      const targetParentId = activeBoardId || 'root';
      const ts = Date.now();

      // Find an offset based on existing cards so we don't overlap directly if board already has cards
      const existingInBoard = cards.filter(
        (c) =>
          (!c.rootBoardId || c.rootBoardId === targetWsId) &&
          (c.parentBoardId || 'root') === targetParentId &&
          c.status !== 'archived'
      );
      let baseOffsetX = 80;
      let baseOffsetY = 80;
      if (existingInBoard.length > 0) {
        const maxX = Math.max(...existingInBoard.map((c) => c.x + c.width));
        baseOffsetX = maxX + 80;
      }

      let newCards: BoardCard[] = [];
      let newConns: Connection[] = [];

      if (templateType === 'gamedev') {
        const idTurret = `card-3d-${ts}`;
        const idAudio = `card-audio-${ts}`;
        const idNote = `card-gdd-${ts}`;
        newCards = [
          {
            id: idTurret,
            rootBoardId: targetWsId,
            parentBoardId: targetParentId,
            type: 'media',
            title: 'Torreta Defensiva (Three.js)',
            x: baseOffsetX,
            y: baseOffsetY,
            width: 360,
            height: 400,
            zIndex: 10,
            color: 'default',
            status: 'in_progress',
            mediaData: {
              title: 'Torreta Defensiva 3D',
              mediaType: '3d',
              modelGeometry: 'dodecahedron',
              wireframe: false,
              modelColor: '#818cf8',
              autoRotate: true,
            },
          },
          {
            id: idAudio,
            rootBoardId: targetWsId,
            parentBoardId: targetParentId,
            type: 'media',
            title: 'Trilha Sonora & SFX de Combate',
            x: baseOffsetX + 400,
            y: baseOffsetY,
            width: 360,
            height: 250,
            zIndex: 11,
            color: 'lavender',
            status: 'in_progress',
            mediaData: {
              title: 'Trilha Sonora & SFX',
              mediaType: 'audio',
              audioPlaying: false,
              audioDuration: 165,
              audioProgress: 0,
              caption: 'Combat Synthwave 128 BPM',
            },
          },
          {
            id: idNote,
            rootBoardId: targetWsId,
            parentBoardId: targetParentId,
            type: 'note',
            title: 'GDD — Mecânicas & Balanço',
            x: baseOffsetX + 400,
            y: baseOffsetY + 280,
            width: 360,
            height: 330,
            zIndex: 12,
            color: 'amber',
            status: 'in_progress',
            noteData: {
              title: 'GDD — Mecânicas & Balanço',
              body: '## Sistema de Combate\\n- Alcance da torreta: 15 unidades\\n- Dano por projétil: 25 HP\\n- Cadência: 1.2 tiros/seg',
              checklist: [
                { id: `chk-1-${ts}`, text: 'Shaders de iluminação Three.js', completed: true },
                { id: `chk-2-${ts}`, text: 'Sistema de detecção de inimigos', completed: false },
                { id: `chk-3-${ts}`, text: 'Áudio dinâmico por proximidade', completed: false },
              ],
              tags: ['#gamedev', '#3d', '#mechanics'],
            },
          },
        ];
        newConns = [
          {
            id: `conn-gd-${ts}`,
            rootBoardId: targetWsId,
            parentBoardId: targetParentId,
            fromCardId: idTurret,
            fromPort: 'right',
            toCardId: idNote,
            toPort: 'left',
            label: 'Assets 3D',
            style: 'pulse',
            color: '#6366f1',
          },
        ];
      } else if (templateType === 'roadmap') {
        const idCol = `card-col-${ts}`;
        const idTbl = `card-tbl-${ts}`;
        const idNote = `card-note-${ts}`;
        newCards = [
          {
            id: idCol,
            rootBoardId: targetWsId,
            parentBoardId: targetParentId,
            type: 'column',
            title: 'Sprint Backlog & Tarefas',
            x: baseOffsetX,
            y: baseOffsetY,
            width: 360,
            height: 480,
            zIndex: 10,
            color: 'lavender',
            status: 'in_progress',
            columnData: {
              title: 'Sprint Backlog & Tarefas',
              items: [
                { id: `ci-1-${ts}`, text: 'Refatoração da arquitetura WebSocket', done: true, tag: 'Backend' },
                { id: `ci-2-${ts}`, text: 'Design responsivo mobile', done: false, tag: 'UI/UX' },
                { id: `ci-3-${ts}`, text: 'Testes de estresse de carga', done: false, tag: 'QA' },
                { id: `ci-4-${ts}`, text: 'Otimização WebGL Three.js', done: false, tag: '3D' },
              ],
            },
          },
          {
            id: idTbl,
            rootBoardId: targetWsId,
            parentBoardId: targetParentId,
            type: 'table',
            title: 'Cronograma e Entregas',
            x: baseOffsetX + 400,
            y: baseOffsetY,
            width: 560,
            height: 420,
            zIndex: 11,
            color: 'default',
            status: 'in_progress',
            tableData: {
              title: 'Cronograma e Entregas',
              columns: [
                { id: 'c1', header: 'Entregável', type: 'text', width: 180 },
                { id: 'c2', header: 'Responsável', type: 'text', width: 140 },
                { id: 'c3', header: 'Status', type: 'status', width: 120 },
                { id: 'c4', header: 'Prioridade', type: 'number', width: 90 },
              ],
              rows: [
                { id: `r1-${ts}`, cells: { c1: 'Autenticação & Sessões', c2: 'Time Core', c3: 'Concluído', c4: 1 } },
                { id: `r2-${ts}`, cells: { c1: 'Templates de Quadros', c2: 'Wesley', c3: 'Em Andamento', c4: 2 } },
                { id: `r3-${ts}`, cells: { c1: 'Deploy Automático CI/CD', c2: 'Wesley', c3: 'Concluído', c4: 1 } },
              ],
            },
          },
          {
            id: idNote,
            rootBoardId: targetWsId,
            parentBoardId: targetParentId,
            type: 'note',
            title: 'Metas da Sprint',
            x: baseOffsetX + 400,
            y: baseOffsetY + 450,
            width: 360,
            height: 220,
            zIndex: 12,
            color: 'emerald',
            status: 'in_progress',
            noteData: {
              title: 'Metas da Sprint',
              body: 'Entregar todos os itens com qualidade, performance e zero bugs visuais.',
              tags: ['#sprint', '#roadmap'],
            },
          },
        ];
        newConns = [
          {
            id: `conn-sp-${ts}`,
            rootBoardId: targetWsId,
            parentBoardId: targetParentId,
            fromCardId: idCol,
            fromPort: 'right',
            toCardId: idTbl,
            toPort: 'left',
            label: 'Backlog Sync',
            style: 'solid',
            color: '#a855f7',
          },
        ];
      } else if (templateType === 'data') {
        const idLive = `card-live-${ts}`;
        const idTbl = `card-tbl-${ts}`;
        newCards = [
          {
            id: idLive,
            rootBoardId: targetWsId,
            parentBoardId: targetParentId,
            type: 'live',
            title: 'Monitor de Serviços & Uptime',
            x: baseOffsetX,
            y: baseOffsetY,
            width: 340,
            height: 380,
            zIndex: 10,
            color: 'cyan',
            status: 'in_progress',
            liveData: {
              title: 'Monitor de Serviços & Uptime',
              mode: 'counter',
              value: 99.9,
              isActive: true,
              status: 'active',
              unit: '%',
              actionLog: ['API OK (14ms)', 'MongoDB OK (4ms)'],
            },
          },
          {
            id: idTbl,
            rootBoardId: targetWsId,
            parentBoardId: targetParentId,
            type: 'table',
            title: 'Métricas de Performance de Nós',
            x: baseOffsetX + 380,
            y: baseOffsetY,
            width: 560,
            height: 380,
            zIndex: 11,
            color: 'default',
            status: 'in_progress',
            tableData: {
              title: 'Métricas de Performance de Nós',
              columns: [
                { id: 'c1', header: 'Microsserviço', type: 'text', width: 180 },
                { id: 'c2', header: 'Latência', type: 'text', width: 120 },
                { id: 'c3', header: 'Memória (MB)', type: 'number', width: 120 },
                { id: 'c4', header: 'Status', type: 'status', width: 110 },
              ],
              rows: [
                { id: `r1-${ts}`, cells: { c1: 'Backend Node API', c2: '14ms', c3: 184, c4: 'Estável' } },
                { id: `r2-${ts}`, cells: { c1: 'MongoDB 7 Jammy', c2: '4ms', c3: 412, c4: 'Estável' } },
                { id: `r3-${ts}`, cells: { c1: 'Nginx SSL Gateway', c2: '2ms', c3: 64, c4: 'Estável' } },
              ],
            },
          },
        ];
        newConns = [
          {
            id: `conn-live-${ts}`,
            rootBoardId: targetWsId,
            parentBoardId: targetParentId,
            fromCardId: idLive,
            fromPort: 'right',
            toCardId: idTbl,
            toPort: 'left',
            label: 'Telemetria',
            style: 'pulse',
            color: '#06b6d4',
          },
        ];
      } else if (templateType === 'moodboard') {
        const idImg1 = `card-img1-${ts}`;
        const idImg2 = `card-img2-${ts}`;
        const idNote = `card-note-${ts}`;
        newCards = [
          {
            id: idImg1,
            rootBoardId: targetWsId,
            parentBoardId: targetParentId,
            type: 'media',
            title: 'Direção de Arte & Glassmorphism',
            x: baseOffsetX,
            y: baseOffsetY,
            width: 380,
            height: 340,
            zIndex: 10,
            color: 'default',
            status: 'in_progress',
            mediaData: {
              title: 'Direção de Arte & Glassmorphism',
              mediaType: 'image',
              imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
              caption: 'Gradientes etéreos e vidro fosco',
            },
          },
          {
            id: idImg2,
            rootBoardId: targetWsId,
            parentBoardId: targetParentId,
            type: 'media',
            title: 'Paleta Cibernética',
            x: baseOffsetX + 410,
            y: baseOffsetY,
            width: 380,
            height: 340,
            zIndex: 11,
            color: 'default',
            status: 'in_progress',
            mediaData: {
              title: 'Paleta Cibernética',
              mediaType: 'image',
              imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
              caption: 'Neons azuis e roxos cyberpunk',
            },
          },
          {
            id: idNote,
            rootBoardId: targetWsId,
            parentBoardId: targetParentId,
            type: 'note',
            title: 'Paleta e Identidade Visual',
            x: baseOffsetX,
            y: baseOffsetY + 370,
            width: 440,
            height: 260,
            zIndex: 12,
            color: 'amber',
            status: 'in_progress',
            noteData: {
              title: 'Paleta e Identidade Visual',
              body: '## Identidade Visual\\n- Dark `#0c0d12`\\n- Violeta `#6366f1`\\n- Ciano `#06b6d4` & Âmbar `#f59e0b`\\n- Glassmorphism com blur 20px',
              tags: ['#moodboard', '#design'],
            },
          },
        ];
        newConns = [
          {
            id: `conn-mb-${ts}`,
            rootBoardId: targetWsId,
            parentBoardId: targetParentId,
            fromCardId: idImg1,
            fromPort: 'right',
            toCardId: idImg2,
            toPort: 'left',
            label: 'Referências',
            style: 'dashed',
            color: '#f59e0b',
          },
        ];
      }

      setCards((prev) => [...prev, ...newCards]);
      if (newConns.length > 0) {
        setConnections((prev) => [...prev, ...newConns]);
      }
      setSelectedCardIds(newCards.map((c) => c.id));
      if (newCards.length > 0) {
        setViewport({
          x: -newCards[0].x * 0.9 + 150,
          y: -newCards[0].y * 0.9 + 120,
          zoom: 0.9,
        });
      }
    },
    [pushHistory, activeWorkspaceId, activeBoardId, cards]
  );

  // Current active board items (filtered by activeWorkspaceId & activeBoardId)
  const currentCards = cards
    .filter((c) => {
      const matchesWs = !c.rootBoardId || c.rootBoardId === activeWorkspaceId;
      const matchesBoard = (c.parentBoardId || 'root') === activeBoardId;
      return matchesWs && matchesBoard && c.status !== 'archived';
    })
    .map((c) => {
      if (c.type === 'board') {
        const count = cards.filter((child) => child.parentBoardId === c.id).length;
        return {
          ...c,
          boardData: {
            ...(c.boardData || {
              title: c.title,
              description: '',
              coverColor: '#10b981',
              itemCount: 0,
            }),
            itemCount: count,
          },
        };
      }
      return c;
    });

  const currentConnections = connections.filter((c) => {
    const matchesWs = !c.rootBoardId || c.rootBoardId === activeWorkspaceId;
    const matchesBoard = (c.parentBoardId || 'root') === activeBoardId;
    return matchesWs && matchesBoard;
  });

  const currentZones = zones.filter((z) => {
    const matchesWs = !z.rootBoardId || z.rootBoardId === activeWorkspaceId;
    const matchesBoard = (z.parentBoardId || 'root') === activeBoardId;
    return matchesWs && matchesBoard;
  });

  return {
    // Auth & Cloud
    user,
    isAuthenticated: !!user,
    isCloudSyncing,
    lastCloudSyncedAt,
    login,
    logout,
    updateUserProfile,
    toggleWorkspacePublic,
    // Workspaces
    workspaces,
    activeWorkspaceId,
    switchWorkspace,
    createWorkspace,
    deleteWorkspace,
    // State
    cards,
    currentCards,
    connections,
    currentConnections,
    zones,
    currentZones,
    activeBoardId,
    boardBreadcrumbs,
    viewport,
    viewMode,
    theme,
    activeTool,
    connectingFrom,
    selectedCardIds,
    selectedConnectionIds,
    selectedZoneIds,
    dragSelectionBox,
    isSnappingEnabled,
    lastSavedTimestamp,
    activePulseConnectionId,
    // Board Navigation
    navigateToBoard,
    navigateToBreadcrumb,
    navigateUp,
    // Setters & Actions
    setViewMode,
    setTheme,
    setActiveTool,
    setConnectingFrom,
    setSelectedCardIds,
    setSelectedConnectionIds,
    setSelectedZoneIds,
    setDragSelectionBox,
    setIsSnappingEnabled,
    // Cards
    addCard,
    addPastedImageCard,
    updateCard,
    updateCardPosition,
    moveCards,
    deleteCard,
    restoreCard,
    permanentlyDeleteCard,
    emptyTrash,
    duplicateCard,
    bringToFront,
    // Zones
    addZone,
    updateZone,
    deleteZone,
    moveZoneAndChildren,
    // Connections
    addConnection,
    deleteConnection,
    updateConnection,
    triggerPulse,
    // Viewport
    setViewport,
    panBy,
    zoomAt,
    resetZoom,
    zoomToFit,
    focusCard,
    // Selection
    selectCard,
    selectConnection,
    selectZone,
    clearSelection,
    alignSelectedCardsInGrid,
    groupSelectedIntoZone,
    // History
    undo,
    redo,
    canUndo: historyRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
    // Data
    exportBoard,
    importBoard,
    resetToDefault,
    applyTemplate,
  };
}

export type BoardStore = ReturnType<typeof useBoardStore>;
