import React, { useRef, useState, useEffect, useCallback } from 'react';
import { BoardStore } from '../../stores/useBoardStore';
import { CardWrapper } from '../cards/CardWrapper';
import { NoteCard } from '../cards/NoteCard';
import { ChecklistCard } from '../cards/ChecklistCard';
import { MediaCard } from '../cards/MediaCard';
import { SmartLinkCard } from '../cards/SmartLinkCard';
import { TableCard } from '../cards/TableCard';
import { ColumnCard } from '../cards/ColumnCard';
import { SubBoardCard } from '../cards/SubBoardCard';
import { ZoneComponent } from './ZoneComponent';
import { ConnectionLayer } from './ConnectionLayer';
import { findSnapPort, findSnapCardOrPort, getOptimalPortBetweenCards, getPortCoordinates } from '../../utils/bezier';
import { PortPosition, Position, BoardCard, ColumnItem } from '../../types/board';
import { sound } from '../../utils/sound';
import { CheckCircle2, Image as ImageIcon, Trash2, Sparkles } from 'lucide-react';

interface InfiniteCanvasProps {
  store: BoardStore;
  onOpenExpandMedia?: (cardId: string) => void;
  onOpenSubBoard?: (card: BoardCard) => void;
}

export const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({
  store,
  onOpenExpandMedia,
  onOpenSubBoard,
}) => {
  const {
    currentCards: cards,
    currentConnections: connections,
    currentZones: zones,
    viewport,
    activeTool,
    connectingFrom,
    selectedCardIds,
    selectedConnectionIds,
    selectedZoneIds,
    isSnappingEnabled,
    activePulseConnectionId,
    setViewport,
    panBy,
    zoomAt,
    selectCard,
    selectConnection,
    selectZone,
    clearSelection,
    addConnection,
    deleteConnection,
    updateConnection,
    setConnectingFrom,
    updateCard,
    updateCardPosition,
    moveCards,
    deleteCard,
    duplicateCard,
    bringToFront,
    updateZone,
    deleteZone,
    moveZoneAndChildren,
    triggerPulse,
    undo,
    redo,
    addPastedImageCard,
    addCard,
  } = store;

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [mouseCanvasPos, setMouseCanvasPos] = useState<Position | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [hoveredColumnId, setHoveredColumnId] = useState<string | null>(null);

  const cardsRef = useRef(cards);
  cardsRef.current = cards;
  const lastMovedCardPosRef = useRef<{ x: number; y: number } | null>(null);
  const hoveredColIdRef = useRef<string | null>(null);

  // Dragging an item OUT of a column onto the free canvas
  const [draggingItemOut, setDraggingItemOut] = useState<{
    columnCard: BoardCard;
    item: ColumnItem;
    clientX: number;
    clientY: number;
  } | null>(null);

  // Marquee selection state
  const [marqueeBox, setMarqueeBox] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  // Dragging cards state
  const draggingCardRef = useRef<{
    cardId: string;
    startX: number;
    startY: number;
    initialCardPositions: { id: string; x: number; y: number }[];
  } | null>(null);

  // Convert screen coordinates to canvas world coordinates
  const screenToWorld = useCallback(
    (clientX: number, clientY: number): Position => {
      return {
        x: (clientX - viewport.x) / viewport.zoom,
        y: (clientY - viewport.y) / viewport.zoom,
      };
    },
    [viewport]
  );

  // Wheel zoom handler
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, e.deltaY);
    },
    [zoomAt]
  );

  // Global keydown listeners for shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement;

      if (e.code === 'Space' && !isInputFocused) {
        setIsSpacePressed(true);
      }

      if (isInputFocused) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedCardIds.length > 0) {
          e.preventDefault();
          selectedCardIds.forEach((id) => deleteCard(id));
        }
        if (selectedConnectionIds.length > 0) {
          e.preventDefault();
          selectedConnectionIds.forEach((id) => deleteConnection(id));
          sound.playDelete();
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd' && selectedCardIds.length > 0) {
        e.preventDefault();
        selectedCardIds.forEach((id) => duplicateCard(id));
      }

      if (e.key === 'Escape') {
        clearSelection();
        setConnectingFrom(null);
        setMarqueeBox(null);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    // Clipboard Paste Listener for Screenshots / Prints (Ctrl+V) & Smart text/links
    const handlePaste = (e: ClipboardEvent) => {
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement;

      if (isInputFocused) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      // 1. Check for Image in Clipboard (Print Screen / Screenshot)
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const dataUrl = event.target?.result as string;
              if (dataUrl) {
                addPastedImageCard(dataUrl, mouseCanvasPos || undefined, `Print ${new Date().toLocaleTimeString()}`);
                setToastMsg('📸 Print colado com sucesso via Ctrl+V!');
                setTimeout(() => setToastMsg(null), 3500);
              }
            };
            reader.readAsDataURL(file);
          }
          return;
        }
      }

      // 2. Check for Text (URL or Note)
      const text = e.clipboardData?.getData('text');
      if (text && text.trim()) {
        const trimmed = text.trim();
        e.preventDefault();
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          const card = addCard('link', mouseCanvasPos || undefined, 'cyan');
          updateCard(card.id, {
            linkData: {
              url: trimmed,
              title: trimmed.replace(/^https?:\/\//, '').split('/')[0],
              description: 'Link colado via Ctrl+V',
              status: 'online',
              latencyMs: Math.floor(Math.random() * 25) + 15,
              lastChecked: 'Agora mesmo',
              sslSecure: trimmed.startsWith('https://'),
            },
          });
          setToastMsg('🔗 Link colado via Ctrl+V!');
          setTimeout(() => setToastMsg(null), 3000);
        } else {
          const card = addCard('note', mouseCanvasPos || undefined, 'lavender');
          updateCard(card.id, {
            title: trimmed.slice(0, 30),
            noteData: {
              title: trimmed.slice(0, 30),
              body: trimmed,
              checklist: [],
              tags: ['#colado'],
            },
          });
          setToastMsg('📝 Nova nota criada a partir de texto colado!');
          setTimeout(() => setToastMsg(null), 3000);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('paste', handlePaste);
    };
  }, [
    selectedCardIds,
    selectedConnectionIds,
    deleteCard,
    deleteConnection,
    duplicateCard,
    undo,
    redo,
    clearSelection,
    setConnectingFrom,
    addPastedImageCard,
    addCard,
    updateCard,
    mouseCanvasPos,
  ]);

  // Pointer Down on Canvas
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    // Only handle if clicking directly on canvas background
    if ((e.target as HTMLElement).closest('[id^="card-"]') || (e.target as HTMLElement).closest('[id^="zone-"]')) {
      return;
    }

    // Middle click or space + click or Pan tool: pan canvas
    if (e.button === 1 || isSpacePressed || activeTool === 'pan') {
      setIsPanning(true);
      return;
    }

    if (e.button === 0) {
      // If we were connecting, cancel it on empty click
      if (connectingFrom) {
        setConnectingFrom(null);
        return;
      }

      // Marquee selection start
      const worldPos = screenToWorld(e.clientX, e.clientY);
      setMarqueeBox({
        startX: worldPos.x,
        startY: worldPos.y,
        currentX: worldPos.x,
        currentY: worldPos.y,
      });

      if (!e.shiftKey) {
        clearSelection();
      }
    }
  };

  // Pointer Move on Canvas
  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    const worldPos = screenToWorld(e.clientX, e.clientY);
    setMouseCanvasPos(worldPos);

    // Pan canvas
    if (isPanning) {
      panBy(e.movementX, e.movementY);
      return;
    }

    // Marquee box expansion
    if (marqueeBox) {
      setMarqueeBox((prev) =>
        prev
          ? {
              ...prev,
              currentX: worldPos.x,
              currentY: worldPos.y,
            }
          : null
      );

      // Hit-test cards inside marquee
      const minX = Math.min(marqueeBox.startX, worldPos.x);
      const maxX = Math.max(marqueeBox.startX, worldPos.x);
      const minY = Math.min(marqueeBox.startY, worldPos.y);
      const maxY = Math.max(marqueeBox.startY, worldPos.y);

      const insideIds = cards
        .filter((c) => {
          const cRight = c.x + c.width;
          const cBottom = c.y + c.height;
          return !(c.x > maxX || cRight < minX || c.y > maxY || cBottom < minY);
        })
        .map((c) => c.id);

      store.setSelectedCardIds(insideIds);
    }
  };

  // Pointer Up on Canvas
  const handleCanvasPointerUp = (e: React.PointerEvent) => {
    if (isPanning) {
      setIsPanning(false);
    }

    if (marqueeBox) {
      setMarqueeBox(null);
    }

    // If releasing connection line, check if released over a card or snap port
    if (connectingFrom && mouseCanvasPos) {
      const snap = findSnapCardOrPort(mouseCanvasPos, cards, connectingFrom.cardId, connectingFrom.itemId, 45);
      if (snap) {
        addConnection(
          connectingFrom.cardId,
          connectingFrom.port,
          snap.cardId,
          snap.port,
          '',
          connectingFrom.itemId,
          snap.itemId
        );
        setToastMsg('Itens conectados com sucesso!');
        setTimeout(() => setToastMsg(null), 2500);
      }
      setConnectingFrom(null);
    }
  };

  // Milanote Column: Extract an item from a column back into a free-floating board card
  const handleExtractItemFromColumn = (columnCard: BoardCard, item: ColumnItem) => {
    sound.playConnect();
    const spawnX = columnCard.x + columnCard.width + 32;
    const spawnY = columnCard.y;

    if (item.type === 'table') {
      const newCard = addCard('table', { x: spawnX, y: spawnY }, columnCard.color);
      if (newCard) {
        updateCard(newCard.id, {
          title: item.title || 'Tabela',
          tableData: item.tableData,
        });
      }
    } else if (item.type === 'link') {
      const newCard = addCard('link', { x: spawnX, y: spawnY }, columnCard.color);
      if (newCard) {
        updateCard(newCard.id, {
          title: item.title || 'Link Web',
          linkData: item.linkData,
        });
      }
    } else if (item.type === 'checklist') {
      const newCard = addCard('checklist', { x: spawnX, y: spawnY }, columnCard.color);
      if (newCard) {
        updateCard(newCard.id, {
          title: item.title || 'Checklist',
          checklistData: {
            title: item.title || 'Checklist',
            items: item.checklist || [],
          },
        });
      }
    } else {
      // note or task
      const newCard = addCard('note', { x: spawnX, y: spawnY }, columnCard.color);
      if (newCard) {
        updateCard(newCard.id, {
          title: item.title || (item.text ? item.text.slice(0, 30) : 'Nota'),
          noteData: {
            title: item.title || 'Nota',
            body: item.body || item.text || '',
            tags: item.tag ? [item.tag] : [],
          },
        });
      }
    }

    // Remove extracted item from the column
    const currentItems = columnCard.columnData?.items || [];
    updateCard(columnCard.id, {
      columnData: {
        title: columnCard.columnData?.title || columnCard.title,
        items: currentItems.filter((i) => i.id !== item.id),
      },
    });

    setToastMsg(`Item "${item.title || item.text || 'Item'}" extraído para o quadro!`);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Milanote Column: Drag an item OUT of the column onto the free canvas or into another column
  const handleStartDragItemOut = (
    columnCard: BoardCard,
    item: ColumnItem,
    startEvt: React.PointerEvent
  ) => {
    startEvt.stopPropagation();
    const startX = startEvt.clientX;
    const startY = startEvt.clientY;

    setDraggingItemOut({
      columnCard,
      item,
      clientX: startX,
      clientY: startY,
    });

    const handleItemPointerMove = (moveEvt: PointerEvent) => {
      setDraggingItemOut({
        columnCard,
        item,
        clientX: moveEvt.clientX,
        clientY: moveEvt.clientY,
      });

      // Detect if hovering over another column to highlight it as drop target
      const mouseWorld = screenToWorld(moveEvt.clientX, moveEvt.clientY);
      const targetCol = cardsRef.current.find(
        (c) =>
          c.type === 'column' &&
          c.id !== columnCard.id &&
          mouseWorld.x >= c.x - 12 &&
          mouseWorld.x <= c.x + c.width + 12 &&
          mouseWorld.y >= c.y - 12 &&
          mouseWorld.y <= c.y + c.height + 12
      );
      hoveredColIdRef.current = targetCol ? targetCol.id : null;
      setHoveredColumnId(hoveredColIdRef.current);
    };

    const handleItemPointerUp = (upEvt: PointerEvent) => {
      window.removeEventListener('pointermove', handleItemPointerMove);
      window.removeEventListener('pointerup', handleItemPointerUp);
      setDraggingItemOut(null);

      const dx = Math.abs(upEvt.clientX - startX);
      const dy = Math.abs(upEvt.clientY - startY);
      const worldDrop = screenToWorld(upEvt.clientX, upEvt.clientY);
      const allCards = cardsRef.current;

      // 1. Check if dropped over another column!
      const targetCol = hoveredColIdRef.current
        ? allCards.find((c) => c.type === 'column' && c.id === hoveredColIdRef.current)
        : allCards.find(
            (c) =>
              c.type === 'column' &&
              c.id !== columnCard.id &&
              worldDrop.x >= c.x - 16 &&
              worldDrop.x <= c.x + c.width + 16 &&
              worldDrop.y >= c.y - 16 &&
              worldDrop.y <= c.y + c.height + 16
          );

      hoveredColIdRef.current = null;
      setHoveredColumnId(null);

      if ((dx > 20 || dy > 20) && targetCol && targetCol.id !== columnCard.id) {
        sound.playConnect();

        // Remove item from source column
        const currentItems = columnCard.columnData?.items || [];
        updateCard(columnCard.id, {
          columnData: {
            title: columnCard.columnData?.title || columnCard.title,
            items: currentItems.filter((i) => i.id !== item.id),
          },
        });

        // Add item to target column
        const targetItems = targetCol.columnData?.items || [];
        updateCard(targetCol.id, {
          columnData: {
            title: targetCol.columnData?.title || targetCol.title,
            items: [...targetItems, item],
          },
        });

        // Retain any existing connections attached to this item
        connections.forEach((conn) => {
          if (conn.fromItemId === item.id && conn.fromCardId === columnCard.id) {
            updateConnection(conn.id, { fromCardId: targetCol.id });
          }
          if (conn.toItemId === item.id && conn.toCardId === columnCard.id) {
            updateConnection(conn.id, { toCardId: targetCol.id });
          }
        });

        setToastMsg(`Card movido para "${targetCol.title || 'Coluna'}"!`);
        setTimeout(() => setToastMsg(null), 2500);
        return;
      }

      // 2. Check if dropped outside the source column bounds onto free canvas
      const isOutsideColumn =
        worldDrop.x < columnCard.x - 20 ||
        worldDrop.x > columnCard.x + columnCard.width + 20 ||
        worldDrop.y < columnCard.y - 20 ||
        worldDrop.y > columnCard.y + columnCard.height + 20;

      if ((dx > 25 || dy > 25) && isOutsideColumn) {
        sound.playConnect();
        const spawnX = Math.round(worldDrop.x - 160);
        const spawnY = Math.round(worldDrop.y - 40);

        let createdCard: BoardCard | undefined;

        if (item.type === 'table') {
          const newCard = addCard('table', { x: spawnX, y: spawnY }, columnCard.color);
          if (newCard) {
            updateCard(newCard.id, {
              title: item.title || 'Tabela',
              tableData: item.tableData,
            });
            createdCard = newCard;
          }
        } else if (item.type === 'link') {
          const newCard = addCard('link', { x: spawnX, y: spawnY }, columnCard.color);
          if (newCard) {
            updateCard(newCard.id, {
              title: item.title || 'Link Web',
              linkData: item.linkData,
            });
            createdCard = newCard;
          }
        } else if (item.type === 'checklist') {
          const newCard = addCard('checklist', { x: spawnX, y: spawnY }, columnCard.color);
          if (newCard) {
            updateCard(newCard.id, {
              title: item.title || 'Checklist',
              checklistData: {
                title: item.title || 'Checklist',
                items: item.checklist || [],
              },
            });
            createdCard = newCard;
          }
        } else {
          // note or task
          const newCard = addCard('note', { x: spawnX, y: spawnY }, columnCard.color);
          if (newCard) {
            updateCard(newCard.id, {
              title: item.title || (item.text ? item.text.slice(0, 30) : 'Nota'),
              noteData: {
                title: item.title || 'Nota',
                body: item.body || item.text || '',
                tags: item.tag ? [item.tag] : [],
              },
            });
            createdCard = newCard;
          }
        }

        // Migrate connections to the newly spawned card
        if (createdCard) {
          const cId = createdCard.id;
          connections.forEach((conn) => {
            if (conn.fromItemId === item.id && conn.fromCardId === columnCard.id) {
              updateConnection(conn.id, { fromCardId: cId, fromItemId: undefined });
            }
            if (conn.toItemId === item.id && conn.toCardId === columnCard.id) {
              updateConnection(conn.id, { toCardId: cId, toItemId: undefined });
            }
          });
        }

        // Remove item from column
        const currentItems = columnCard.columnData?.items || [];
        updateCard(columnCard.id, {
          columnData: {
            title: columnCard.columnData?.title || columnCard.title,
            items: currentItems.filter((i) => i.id !== item.id),
          },
        });

        setToastMsg(`Item "${item.title || item.text || 'Item'}" movido para o quadro!`);
        setTimeout(() => setToastMsg(null), 2500);
      }
    };

    window.addEventListener('pointermove', handleItemPointerMove);
    window.addEventListener('pointerup', handleItemPointerUp);
  };

  // Dragging Cards
  const handleCardDragStart = (cardId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    bringToFront(cardId);

    // If card isn't selected, select it
    if (!selectedCardIds.includes(cardId)) {
      if (e.shiftKey) {
        selectCard(cardId, true);
      } else {
        selectCard(cardId, false);
      }
    }

    const cardsToMove = selectedCardIds.includes(cardId)
      ? selectedCardIds
      : [cardId];

    const initialPositions = cards
      .filter((c) => cardsToMove.includes(c.id))
      .map((c) => ({ id: c.id, x: c.x, y: c.y }));

    draggingCardRef.current = {
      cardId,
      startX: e.clientX,
      startY: e.clientY,
      initialCardPositions: initialPositions,
    };

    const handlePointerMove = (moveEvt: PointerEvent) => {
      if (!draggingCardRef.current) return;
      const dx = (moveEvt.clientX - draggingCardRef.current.startX) / viewport.zoom;
      const dy = (moveEvt.clientY - draggingCardRef.current.startY) / viewport.zoom;

      const deltas = draggingCardRef.current.initialCardPositions.map((item) => {
        let nextX = item.x + dx;
        let nextY = item.y + dy;
        if (isSnappingEnabled) {
          nextX = Math.round(nextX / 16) * 16;
          nextY = Math.round(nextY / 16) * 16;
        }
        return {
          id: item.id,
          dx: nextX - item.x,
          dy: nextY - item.y,
        };
      });

      // Directly update coordinates
      cards.forEach((c) => {
        const delta = deltas.find((d) => d.id === c.id);
        if (delta) {
          const orig = draggingCardRef.current!.initialCardPositions.find((o) => o.id === c.id);
          if (orig) {
            updateCardPosition(c.id, orig.x + delta.dx, orig.y + delta.dy, false);
          }
        }
      });

      // Check if dragging single card over a column (block sub-board cards)
      if (cardsToMove.length === 1) {
        const movedId = cardsToMove[0];
        const cardObj = cardsRef.current.find((c) => c.id === movedId);
        if (cardObj && cardObj.type !== 'column' && cardObj.type !== 'board') {
          const orig = draggingCardRef.current!.initialCardPositions.find((o) => o.id === cardObj.id);
          const delta = deltas.find((d) => d.id === cardObj.id);
          const currentX = (orig?.x ?? cardObj.x) + (delta?.dx ?? 0);
          const currentY = (orig?.y ?? cardObj.y) + (delta?.dy ?? 0);
          lastMovedCardPosRef.current = { x: currentX, y: currentY };

          const mouseWorld = screenToWorld(moveEvt.clientX, moveEvt.clientY);
          const cx = currentX + cardObj.width / 2;
          const cy = currentY + 30;

          const targetCol = cardsRef.current.find(
            (c) =>
              c.type === 'column' &&
              c.id !== movedId &&
              (
                (mouseWorld.x >= c.x && mouseWorld.x <= c.x + c.width &&
                 mouseWorld.y >= c.y && mouseWorld.y <= c.y + c.height) ||
                (cx >= c.x && cx <= c.x + c.width && cy >= c.y && cy <= c.y + c.height)
              )
          );
          hoveredColIdRef.current = targetCol ? targetCol.id : null;
          setHoveredColumnId(hoveredColIdRef.current);
        }
      }
    };

    const handlePointerUp = (upEvt: PointerEvent) => {
      if (draggingCardRef.current && cardsToMove.length === 1) {
        const draggedCardId = cardsToMove[0];
        const allCards = cardsRef.current;
        const draggedCard = allCards.find((c) => c.id === draggedCardId);

        if (draggedCard && draggedCard.type !== 'column' && draggedCard.type !== 'board') {
          const mouseWorld = screenToWorld(upEvt.clientX, upEvt.clientY);
          const lastPos = lastMovedCardPosRef.current;
          const cardW = draggedCard.width || 320;
          const cx = lastPos ? lastPos.x + cardW / 2 : mouseWorld.x;
          const cy = lastPos ? lastPos.y + 30 : mouseWorld.y;

          // Find target column
          let targetCol = hoveredColIdRef.current
            ? allCards.find((c) => c.type === 'column' && c.id === hoveredColIdRef.current)
            : undefined;

          if (!targetCol) {
            targetCol = allCards.find(
              (c) =>
                c.type === 'column' &&
                c.id !== draggedCardId &&
                (
                  (mouseWorld.x >= c.x - 24 &&
                   mouseWorld.x <= c.x + c.width + 24 &&
                   mouseWorld.y >= c.y - 24 &&
                   mouseWorld.y <= c.y + c.height + 40) ||
                  (cx >= c.x && cx <= c.x + c.width && cy >= c.y && cy <= c.y + c.height)
                )
            );
          }

          if (targetCol) {
            let newItem: ColumnItem;
            const ts = Date.now();
            if (draggedCard.type === 'table') {
              newItem = {
                id: `ci-tbl-${ts}`,
                type: 'table',
                title: draggedCard.title || 'Tabela',
                tableData: draggedCard.tableData,
              };
            } else if (draggedCard.type === 'link') {
              newItem = {
                id: `ci-lnk-${ts}`,
                type: 'link',
                title: draggedCard.title || 'Link Web',
                linkData: draggedCard.linkData,
              };
            } else if (draggedCard.type === 'checklist') {
              newItem = {
                id: `ci-chk-${ts}`,
                type: 'checklist',
                title: draggedCard.title || 'Checklist',
                checklist: draggedCard.checklistData?.items || [],
              };
            } else {
              newItem = {
                id: `ci-note-${ts}`,
                type: 'note',
                title: draggedCard.title || 'Nota',
                body: draggedCard.noteData?.body || '',
                tag: draggedCard.noteData?.tags?.[0],
              };
            }

            const currentItems = targetCol.columnData?.items || [];
            updateCard(targetCol.id, {
              columnData: {
                title: targetCol.columnData?.title || targetCol.title,
                items: [...currentItems, newItem],
              },
            });

            deleteCard(draggedCard.id);
            setToastMsg(`Card colocado na coluna "${targetCol.title}"!`);
            setTimeout(() => setToastMsg(null), 2500);
            sound.playConnect();
          }
        }
      }

      hoveredColIdRef.current = null;
      lastMovedCardPosRef.current = null;
      setHoveredColumnId(null);
      draggingCardRef.current = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const startConnectPosRef = useRef<Position | null>(null);

  // Start connecting from an anchor port
  const handleStartConnect = (cardId: string, port: PortPosition, itemId?: string) => {
    setConnectingFrom({ cardId, port, itemId });
    const fromCard = cards.find((c) => c.id === cardId);
    if (fromCard) {
      const portCoords = getPortCoordinates(fromCard, port, itemId);
      setMouseCanvasPos(portCoords);
      startConnectPosRef.current = portCoords;
    }
  };

  // Global window listeners while connecting is active
  useEffect(() => {
    if (!connectingFrom) return;

    const handleWindowPointerMove = (e: PointerEvent) => {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      setMouseCanvasPos(worldPos);
    };

    const handleWindowPointerUp = (e: PointerEvent) => {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      const startPos = startConnectPosRef.current;

      const dx = startPos ? worldPos.x - startPos.x : 100;
      const dy = startPos ? worldPos.y - startPos.y : 100;
      const dist = Math.hypot(dx, dy);

      if (dist > 25) {
        const snap = findSnapCardOrPort(worldPos, cards, connectingFrom.cardId, connectingFrom.itemId, 60);
        if (snap) {
          addConnection(
            connectingFrom.cardId,
            connectingFrom.port,
            snap.cardId,
            snap.port,
            '',
            connectingFrom.itemId,
            snap.itemId
          );
          setToastMsg('Itens conectados com sucesso!');
          setTimeout(() => setToastMsg(null), 2500);
        }
        setConnectingFrom(null);
      }
    };

    const handleWindowKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setConnectingFrom(null);
      }
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('keydown', handleWindowKeyDown);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('keydown', handleWindowKeyDown);
    };
  }, [connectingFrom, cards, screenToWorld, addConnection, setConnectingFrom]);

  // Connect to target port directly
  const handleConnectToPort = (targetCardId: string, targetPort: PortPosition) => {
    if (!connectingFrom) return;
    if (connectingFrom.cardId === targetCardId && !connectingFrom.itemId) return;
    addConnection(
      connectingFrom.cardId,
      connectingFrom.port,
      targetCardId,
      targetPort,
      '',
      connectingFrom.itemId,
      undefined
    );
    setConnectingFrom(null);
    setToastMsg('Itens conectados com sucesso!');
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Connect to target card with automatic best port calculation
  const handleConnectToCard = (targetCardId: string) => {
    if (!connectingFrom) return;
    if (connectingFrom.cardId === targetCardId && !connectingFrom.itemId) return;
    const fromCard = cards.find((c) => c.id === connectingFrom.cardId);
    const toCard = cards.find((c) => c.id === targetCardId);
    if (!fromCard || !toCard) return;

    const { toPort } = getOptimalPortBetweenCards(fromCard, toCard);
    addConnection(
      connectingFrom.cardId,
      connectingFrom.port,
      targetCardId,
      toPort,
      '',
      connectingFrom.itemId,
      undefined
    );
    setConnectingFrom(null);
    setToastMsg('Itens conectados com sucesso!');
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Connect to target item inside a column
  const handleConnectToItemPort = (
    targetCardId: string,
    targetItemId: string,
    targetPort: PortPosition
  ) => {
    if (!connectingFrom) return;
    if (connectingFrom.cardId === targetCardId && connectingFrom.itemId === targetItemId) return;
    addConnection(
      connectingFrom.cardId,
      connectingFrom.port,
      targetCardId,
      targetPort,
      '',
      connectingFrom.itemId,
      targetItemId
    );
    setConnectingFrom(null);
    setToastMsg('Item conectado com sucesso!');
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Cursor style calculation
  const getCursorClass = () => {
    if (isPanning) return 'cursor-grabbing';
    if (isSpacePressed || activeTool === 'pan') return 'cursor-grab';
    if (connectingFrom) return 'cursor-crosshair';
    return 'cursor-default';
  };

  // Grid styling (scalable dots / geometric grid)
  const gridSize = 32 * viewport.zoom;
  const gridDotColor = store.theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)';

  return (
    <div
      ref={canvasRef}
      onWheel={handleWheel}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={handleCanvasPointerUp}
      className={`relative w-full h-full overflow-hidden select-none ${getCursorClass()} ${
        store.theme === 'dark' ? 'bg-[#0c0d12]' : 'bg-[#f8fafc]'
      }`}
    >
      {/* Infinite Dynamic Scalable Dot-Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundImage: `radial-gradient(circle, ${gridDotColor} 1.2px, transparent 1.2px)`,
          backgroundPosition: `${viewport.x}px ${viewport.y}px`,
        }}
      />

      {/* Connection Layer (Wires, Arrows, Pulses) rendered across full canvas */}
      <ConnectionLayer
        connections={connections}
        cards={cards}
        viewport={viewport}
        selectedConnectionIds={selectedConnectionIds}
        connectingFrom={connectingFrom}
        currentMousePos={mouseCanvasPos}
        activePulseConnectionId={activePulseConnectionId}
        onSelectConnection={selectConnection}
        onDeleteConnection={deleteConnection}
        onUpdateConnection={updateConnection}
      />

      {/* World Container transformed by Pan & Zoom */}
      <div
        style={{
          transform: `translate3d(${viewport.x}px, ${viewport.y}px, 0) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
        }}
        className="absolute inset-0 w-0 h-0 pointer-events-auto"
      >
        {/* Zones (Delimited Frames) */}
        {zones.map((zone) => (
          <ZoneComponent
            key={zone.id}
            zone={zone}
            isSelected={selectedZoneIds.includes(zone.id)}
            onSelect={(e) => {
              e.stopPropagation();
              selectZone(zone.id);
            }}
            onUpdate={(updates) => updateZone(zone.id, updates)}
            onDelete={() => deleteZone(zone.id)}
            onMoveDelta={(dx, dy) => moveZoneAndChildren(zone.id, dx, dy)}
            onResize={(w, h) => updateZone(zone.id, { width: w, height: h })}
          />
        ))}

        {/* Cards */}
        {cards.map((card) => {
          const isSelected = selectedCardIds.includes(card.id);

          return (
            <CardWrapper
              key={card.id}
              card={card}
              isSelected={isSelected}
              isConnectingActive={!!connectingFrom}
              isConnectionSource={connectingFrom?.cardId === card.id}
              onConnectToPort={(port) => handleConnectToPort(card.id, port)}
              onConnectToCard={() => handleConnectToCard(card.id)}
              onSelect={(e) => {
                e.stopPropagation();
                selectCard(card.id, e.shiftKey);
              }}
              onUpdate={(updates) => updateCard(card.id, updates)}
              onDelete={() => deleteCard(card.id)}
              onDuplicate={() => duplicateCard(card.id)}
              onStartConnect={(port) => handleStartConnect(card.id, port)}
              onDragStart={(e) => handleCardDragStart(card.id, e)}
              onExpand={() => onOpenExpandMedia?.(card.id)}
            >
              {card.type === 'note' && (
                <NoteCard
                  card={card}
                  onUpdate={(updates) => updateCard(card.id, updates)}
                />
              )}

              {card.type === 'checklist' && (
                <ChecklistCard
                  card={card}
                  onUpdate={(updates) => updateCard(card.id, updates)}
                />
              )}

              {card.type === 'media' && (
                <MediaCard
                  card={card}
                  onUpdate={(updates) => updateCard(card.id, updates)}
                  onExpand={() => onOpenExpandMedia?.(card.id)}
                />
              )}

              {card.type === 'link' && (
                <SmartLinkCard
                  card={card}
                  onUpdate={(updates) => updateCard(card.id, updates)}
                />
              )}

              {card.type === 'table' && (
                <TableCard
                  card={card}
                  onUpdate={(updates) => updateCard(card.id, updates)}
                />
              )}

              {card.type === 'column' && (
                <ColumnCard
                  card={card}
                  onUpdate={(updates) => updateCard(card.id, updates)}
                  onExtractToBoard={(item) => handleExtractItemFromColumn(card, item)}
                  onStartDragItemOut={(c, item, e) => handleStartDragItemOut(c, item, e)}
                  isDropTarget={hoveredColumnId === card.id}
                  connectingFrom={connectingFrom}
                  onStartConnectItem={(itemId, port) => handleStartConnect(card.id, port, itemId)}
                  onConnectToItemPort={(itemId, port) => handleConnectToItemPort(card.id, itemId, port)}
                />
              )}

              {card.type === 'board' && (
                <SubBoardCard
                  card={card}
                  isSelected={isSelected}
                  onUpdate={(updates) => updateCard(card.id, updates)}
                  onOpenSubBoard={onOpenSubBoard}
                  onDragStart={(e) => handleCardDragStart(card.id, e)}
                />
              )}
            </CardWrapper>
          );
        })}

        {/* Marquee Box Graphic */}
        {marqueeBox && (() => {
          const minX = Math.min(marqueeBox.startX, marqueeBox.currentX);
          const minY = Math.min(marqueeBox.startY, marqueeBox.currentY);
          const w = Math.abs(marqueeBox.currentX - marqueeBox.startX);
          const h = Math.abs(marqueeBox.currentY - marqueeBox.startY);

          return (
            <div
              style={{
                transform: `translate3d(${minX}px, ${minY}px, 0)`,
                width: `${w}px`,
                height: `${h}px`,
              }}
              className="absolute pointer-events-none border-2 border-indigo-400 bg-indigo-500/15 rounded-md shadow-xs shadow-indigo-500/20"
            />
          );
        })()}
      </div>

      {/* Floating Active Connection Mode Banner */}
      {connectingFrom && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#0c1824]/95 border border-cyan-400 text-cyan-200 text-xs shadow-2xl backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-bold text-white">Modo de Conexão:</span>
            <span>Clique ou solte sobre o card ou ponto desejado para ligar</span>
            <button
              type="button"
              onClick={() => setConnectingFrom(null)}
              className="ml-2 px-2.5 py-1 rounded-lg bg-cyan-800/80 hover:bg-cyan-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
            >
              Cancelar (ESC)
            </button>
          </div>
        </div>
      )}

      {/* Floating Toast Notification for Ctrl+V and Actions */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900/95 border border-indigo-500/60 shadow-2xl text-xs font-medium text-white backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Floating Ghost Card Follower when dragging item out of Column onto canvas or into another column */}
      {draggingItemOut && (
        <div
          style={{
            position: 'fixed',
            left: draggingItemOut.clientX + 14,
            top: draggingItemOut.clientY + 14,
            pointerEvents: 'none',
            zIndex: 9999,
          }}
          className={`px-3.5 py-2.5 rounded-2xl border-2 shadow-2xl backdrop-blur-xl flex items-center gap-2.5 text-xs font-semibold text-white animate-in fade-in duration-100 ${
            hoveredColumnId
              ? 'bg-purple-950/95 border-purple-300 ring-4 ring-purple-500/40 scale-105'
              : 'bg-neutral-900/95 border-purple-400'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          <span>{draggingItemOut.item.title || draggingItemOut.item.text || 'Item'}</span>
          <span className="text-[10px] font-mono text-purple-300 uppercase px-1.5 py-0.5 rounded bg-purple-500/20">
            {hoveredColumnId ? 'Mover para Coluna' : draggingItemOut.item.type || 'card'}
          </span>
        </div>
      )}
      {/* Floating Action Pill when an arrow/connection is selected */}
      {selectedConnectionIds.length > 0 && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-neutral-900/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-neutral-700/80 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-200">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>
              {selectedConnectionIds.length}{' '}
              {selectedConnectionIds.length === 1 ? 'seta selecionada' : 'setas selecionadas'}
            </span>
          </div>

          <div className="h-4 w-px bg-neutral-700" />

          <button
            type="button"
            title="Disparar pulso na conexão selecionada"
            onClick={() => {
              selectedConnectionIds.forEach((id) => triggerPulse(id));
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-white border border-amber-500/30 text-xs font-medium transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Testar Pulso</span>
          </button>

          <button
            type="button"
            title="Excluir seta selecionada (ou pressione Delete no teclado)"
            onClick={() => {
              selectedConnectionIds.forEach((id) => deleteConnection(id));
              sound.playDelete();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-medium transition-all active:scale-95 shadow-md shadow-rose-950/40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir Seta</span>
          </button>
        </div>
      )}
    </div>
  );
};
