import React, { useState, useRef, useEffect } from 'react';
import { BoardCard, PortPosition, CardColor } from '../../types/board';
import {
  Trash2,
  Copy,
  Palette,
} from 'lucide-react';
import { sound } from '../../utils/sound';

interface CardWrapperProps {
  card: BoardCard;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onUpdate: (updates: Partial<BoardCard>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onStartConnect: (port: PortPosition) => void;
  onConnectToPort?: (port: PortPosition) => void;
  onConnectToCard?: () => void;
  isConnectingActive?: boolean;
  isConnectionSource?: boolean;
  onDragStart: (e: React.PointerEvent) => void;
  onExpand?: () => void;
  children: React.ReactNode;
}

const colorStyles: Record<CardColor, { bg: string; border: string; accent: string; badge: string }> = {
  default: {
    bg: 'bg-[#1e2029] dark:bg-[#1e2029] light:bg-white',
    border: 'border-[#2e3140] dark:border-[#2e3140] light:border-slate-200 hover:border-slate-400',
    accent: 'bg-neutral-700',
    badge: 'bg-neutral-800 text-neutral-300 light:bg-slate-100 light:text-slate-700',
  },
  slate: {
    bg: 'bg-[#1e2029] dark:bg-[#1e2029] light:bg-white',
    border: 'border-[#333748] dark:border-[#333748] light:border-emerald-200 hover:border-emerald-400',
    accent: 'bg-emerald-600',
    badge: 'bg-emerald-950/70 text-emerald-300 light:bg-emerald-50 light:text-emerald-700',
  },
  lavender: {
    bg: 'bg-[#1f1d2b] dark:bg-[#1f1d2b] light:bg-white',
    border: 'border-purple-800/40 dark:border-purple-800/40 light:border-amber-200 hover:border-amber-400',
    accent: 'bg-purple-600',
    badge: 'bg-purple-950/70 text-purple-300 light:bg-amber-50 light:text-amber-800',
  },
  emerald: {
    bg: 'bg-[#16221c] dark:bg-[#16221c] light:bg-white',
    border: 'border-emerald-800/40 dark:border-emerald-800/40 light:border-emerald-200 hover:border-emerald-400',
    accent: 'bg-emerald-600',
    badge: 'bg-emerald-950/70 text-emerald-300 light:bg-emerald-50 light:text-emerald-700',
  },
  amber: {
    bg: 'bg-[#221c13] dark:bg-[#221c13] light:bg-white',
    border: 'border-amber-800/40 dark:border-amber-800/40 light:border-amber-200 hover:border-amber-400',
    accent: 'bg-amber-600',
    badge: 'bg-amber-950/70 text-amber-300 light:bg-amber-50 light:text-amber-700',
  },
  rose: {
    bg: 'bg-[#24151b] dark:bg-[#24151b] light:bg-white',
    border: 'border-rose-800/40 dark:border-rose-800/40 light:border-rose-200 hover:border-rose-400',
    accent: 'bg-rose-600',
    badge: 'bg-rose-950/70 text-rose-300 light:bg-rose-50 light:text-rose-700',
  },
  cyan: {
    bg: 'bg-[#12222b] dark:bg-[#12222b] light:bg-white',
    border: 'border-cyan-800/40 dark:border-cyan-800/40 light:border-cyan-200 hover:border-cyan-400',
    accent: 'bg-cyan-600',
    badge: 'bg-cyan-950/70 text-cyan-300 light:bg-cyan-50 light:text-cyan-700',
  },
};

const defaultPortPositions: { port: PortPosition; className: string }[] = [
  { port: 'top', className: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' },
  { port: 'right', className: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2' },
  { port: 'bottom', className: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' },
  { port: 'left', className: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2' },
];

const boardPortPositions: { port: PortPosition; className: string }[] = [
  { port: 'top', className: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' },
  { port: 'right', className: 'top-12 left-[118px] -translate-x-1/2 -translate-y-1/2' },
  { port: 'bottom', className: 'top-24 left-1/2 -translate-x-1/2 -translate-y-1/2' },
  { port: 'left', className: 'top-12 left-[22px] -translate-x-1/2 -translate-y-1/2' },
];

export const CardWrapper: React.FC<CardWrapperProps> = ({
  card,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onStartConnect,
  onConnectToPort,
  onConnectToCard,
  isConnectingActive = false,
  isConnectionSource = false,
  onDragStart,
  children,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef(card.height);
  heightRef.current = card.height;

  const isBoard = card.type === 'board';

  // Dynamically synchronize DOM height
  useEffect(() => {
    if (!wrapperRef.current || isBoard) return;
    const el = wrapperRef.current;

    const syncHeight = () => {
      const measured = Math.round(el.offsetHeight);
      if (measured > 0 && Math.abs(measured - heightRef.current) > 2) {
        heightRef.current = measured;
        onUpdate({ height: measured });
      }
    };

    syncHeight();

    const observer = new ResizeObserver(() => {
      syncHeight();
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, [card.id, onUpdate, isBoard]);

  const style = colorStyles[card.color] || colorStyles.default;

  const handlePointerDownHeader = (e: React.PointerEvent) => {
    onDragStart(e);
  };

  const colors: CardColor[] = ['default', 'slate', 'lavender', 'emerald', 'amber', 'rose', 'cyan'];
  const isTargetCard = isConnectingActive && !isConnectionSource;
  const portPositions = isBoard ? boardPortPositions : defaultPortPositions;

  return (
    <div
      ref={wrapperRef}
      id={`card-${card.id}`}
      style={{
        transform: `translate3d(${card.x}px, ${card.y}px, 0)`,
        width: isBoard ? '140px' : `${card.width}px`,
        zIndex: isSelected ? 50 : card.zIndex,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowColorPicker(false);
      }}
      onClick={(e) => {
        if (isTargetCard && onConnectToCard) {
          e.stopPropagation();
          onConnectToCard();
          return;
        }
        onSelect(e);
      }}
      onPointerUp={(e) => {
        if (isTargetCard && onConnectToCard) {
          e.stopPropagation();
          onConnectToCard();
        }
      }}
      className={`absolute select-none transition-all duration-150 ${
        isBoard
          ? isTargetCard
            ? 'cursor-crosshair ring-2 ring-cyan-400/80 rounded-3xl'
            : ''
          : `rounded-xl backdrop-blur-xl border ${style.bg} ${
              isTargetCard
                ? 'cursor-crosshair ring-2 ring-cyan-400/80 shadow-2xl shadow-cyan-500/25 border-cyan-400 hover:ring-4 hover:ring-cyan-300'
                : isSelected
                ? 'ring-2 ring-indigo-500/90 shadow-2xl shadow-indigo-500/20 border-indigo-400/80'
                : `shadow-lg shadow-black/40 ${style.border}`
            }`
      }`}
    >
      {/* 4 Magnetic Anchor Ports */}
      {portPositions.map(({ port, className }) => {
        const isPortTarget = isTargetCard;
        const isPortSource = isConnectionSource;

        return (
          <button
            key={port}
            type="button"
            data-port={port}
            title={
              isPortTarget
                ? `Clique para ligar a este ponto (${port})`
                : `Conectar ponto: ${port}`
            }
            onPointerDown={(e) => {
              e.stopPropagation();
              if (isPortTarget && onConnectToPort) {
                onConnectToPort(port);
              } else {
                onStartConnect(port);
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (isPortTarget && onConnectToPort) {
                onConnectToPort(port);
              }
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              if (isPortTarget && onConnectToPort) {
                onConnectToPort(port);
              }
            }}
            className={`absolute ${className} z-30 w-5 h-5 rounded-full border-2 transition-all duration-150 flex items-center justify-center cursor-crosshair ${
              isPortTarget
                ? 'opacity-100 scale-125 bg-cyan-950 border-cyan-400 ring-2 ring-cyan-400/60 shadow-lg shadow-cyan-400/50 hover:scale-150 hover:bg-cyan-400 hover:border-white animate-pulse'
                : isPortSource
                ? 'opacity-100 scale-110 bg-indigo-950 border-indigo-300 ring-2 ring-indigo-400/40'
                : isHovered || isSelected
                ? 'opacity-100 scale-100 bg-neutral-900 border-indigo-400 hover:border-white hover:scale-135'
                : 'opacity-0 scale-75 bg-neutral-900 border-indigo-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isPortTarget ? 'bg-cyan-300' : 'bg-indigo-400 group-hover:bg-white'
              }`}
            />
          </button>
        );
      })}

      {/* Floating Action Menu for Sub-Board */}
      {isBoard && (isHovered || isSelected) && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute -top-9 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 bg-neutral-900/95 backdrop-blur-md px-2 py-1 rounded-full border border-neutral-700/80 shadow-lg text-neutral-300 animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            type="button"
            title="Alterar cor do quadro"
            onClick={(e) => {
              e.stopPropagation();
              setShowColorPicker(!showColorPicker);
            }}
            className="p-1 rounded-full hover:text-white hover:bg-white/10 transition-colors"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Duplicar quadro"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1 rounded-full hover:text-white hover:bg-white/10 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Excluir quadro"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 rounded-full hover:text-rose-400 hover:bg-rose-500/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header bar (Drag Handle) for regular cards */}
      {!isBoard && (
        <div
          onPointerDown={handlePointerDownHeader}
          className="px-3.5 pt-3 pb-2 flex items-center justify-between cursor-grab active:cursor-grabbing border-b border-white/5"
        >
          <div className="flex items-center gap-2 overflow-hidden pr-2 flex-1">
            <input
              type="text"
              value={card.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              onPointerDown={(e) => e.stopPropagation()}
              className="text-xs font-semibold tracking-wide text-neutral-200 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-indigo-500/50 rounded px-1 truncate w-full"
              placeholder="Título do card..."
            />
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-1 shrink-0 opacity-80 hover:opacity-100">
            <button
              type="button"
              title="Alterar tema de cor"
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
              className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-white/10 transition-colors"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              title="Duplicar card"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-white/10 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              title="Excluir card"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 rounded text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Color Palette Popover */}
      {showColorPicker && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className={`absolute ${isBoard ? 'top-1 -right-4' : 'top-10 right-2'} z-50 p-1.5 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl flex items-center gap-1.5`}
        >
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                onUpdate({ color: c });
                setShowColorPicker(false);
                sound.playClick();
              }}
              className={`w-5 h-5 rounded-full border transition-transform hover:scale-120 ${
                card.color === c ? 'border-white scale-110' : 'border-transparent'
              } ${
                c === 'default'
                  ? isBoard ? 'bg-[#d1989e]' : 'bg-neutral-700'
                  : c === 'slate'
                  ? isBoard ? 'bg-[#cbd5e1]' : 'bg-slate-600'
                  : c === 'lavender'
                  ? isBoard ? 'bg-[#c4b5fd]' : 'bg-purple-600'
                  : c === 'emerald'
                  ? isBoard ? 'bg-[#86efac]' : 'bg-emerald-600'
                  : c === 'amber'
                  ? isBoard ? 'bg-[#fde047]' : 'bg-amber-600'
                  : c === 'rose'
                  ? isBoard ? 'bg-[#d1989e]' : 'bg-rose-600'
                  : isBoard ? 'bg-[#67e8f9]' : 'bg-cyan-600'
              }`}
            />
          ))}
        </div>
      )}

      {/* Card Content Body */}
      {isBoard ? (
        <div className="w-full">{children}</div>
      ) : (
        <div className="p-3.5 pt-2">{children}</div>
      )}

      {/* Footer / Status Tag for regular cards */}
      {!isBoard && (
        <div className="px-3.5 pb-2.5 flex items-center justify-between text-[11px] text-neutral-400 border-t border-white/5 pt-2">
          <div className="flex items-center gap-1.5">
            <select
              value={card.status || 'in_progress'}
              onChange={(e) => onUpdate({ status: e.target.value as 'backlog' | 'in_progress' | 'done' })}
              onPointerDown={(e) => e.stopPropagation()}
              className="bg-transparent text-[11px] font-medium text-neutral-400 hover:text-neutral-200 border-none focus:outline-none cursor-pointer"
            >
              <option value="backlog" className="bg-neutral-900 text-neutral-300">Backlog</option>
              <option value="in_progress" className="bg-neutral-900 text-neutral-300">Em Andamento</option>
              <option value="done" className="bg-neutral-900 text-neutral-300">Concluído</option>
            </select>
          </div>

          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${style.badge}`}>
            {card.type}
          </span>
        </div>
      )}
    </div>
  );
};
