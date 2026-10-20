import React, { useRef, useState, useEffect, useCallback } from 'react';
import { BoardStore } from '../../stores/useBoardStore';
import { CardWrapper } from '../cards/CardWrapper';
import { NoteCard } from '../cards/NoteCard';
import { LiveCard } from '../cards/LiveCard';
import { MediaCard } from '../cards/MediaCard';
import { SmartLinkCard } from '../cards/SmartLinkCard';
import { TableCard } from '../cards/TableCard';
import { ColumnCard } from '../cards/ColumnCard';
import { SubBoardCard } from '../cards/SubBoardCard';
import { ZoneComponent } from './ZoneComponent';
import { ConnectionLayer } from './ConnectionLayer';
import { findSnapPort, getPortCoordinates } from '../../utils/bezier';
import { PortPosition, Position, BoardCard } from '../../types/board';
import { sound } from '../../utils/sound';
import { CheckCircle2, Image as ImageIcon } from 'lucide-react';

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

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedCardIds.length > 0) {
        e.preventDefault();
        selectedCardIds.forEach((id) => deleteCard(id));
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
  }, [selectedCardIds, deleteCard, duplicateCard, undo, redo, clearSelection, setConnectingFrom, addPastedImageCard, addCard, updateCard, mouseCanvasPos]);

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

    // If releasing connection line, check if released over a snap port
    if (connectingFrom && mouseCanvasPos) {
      const snap = findSnapPort(mouseCanvasPos, cards, connectingFrom.cardId, 36);
      if (snap) {
        addConnection(
          connectingFrom.cardId,
          connectingFrom.port,
          snap.cardId,
          snap.port,
          '⚡ Dispara'
        );
      }
      setConnectingFrom(null);
    }
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
    };

    const handlePointerUp = () => {
      draggingCardRef.current = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Start connecting from an anchor port
  const handleStartConnect = (cardId: string, port: PortPosition) => {
    setConnectingFrom({ cardId, port });
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

      {/* World Container transformed by Pan & Zoom */}
      <div
        style={{
          transform: `translate3d(${viewport.x}px, ${viewport.y}px, 0) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
        }}
        className="absolute inset-0 w-0 h-0 pointer-events-auto"
      >
        {/* Connection Layer (Wires, Arrows, Pulses) */}
        <ConnectionLayer
          connections={connections}
          cards={cards}
          selectedConnectionIds={selectedConnectionIds}
          connectingFrom={connectingFrom}
          currentMousePos={mouseCanvasPos}
          activePulseConnectionId={activePulseConnectionId}
          onSelectConnection={selectConnection}
          onDeleteConnection={deleteConnection}
          onUpdateConnection={updateConnection}
        />

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

              {card.type === 'live' && (
                <LiveCard
                  card={card}
                  onUpdate={(updates) => updateCard(card.id, updates)}
                  onTriggerPulse={triggerPulse}
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
                />
              )}

              {card.type === 'board' && (
                <SubBoardCard
                  card={card}
                  onUpdate={(updates) => updateCard(card.id, updates)}
                  onOpenSubBoard={onOpenSubBoard}
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

      {/* Floating Toast Notification for Ctrl+V and Actions */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900/95 border border-indigo-500/60 shadow-2xl text-xs font-medium text-white backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}
    </div>
  );
};
