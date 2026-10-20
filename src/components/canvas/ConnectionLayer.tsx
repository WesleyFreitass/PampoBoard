import React, { useState } from 'react';
import { BoardCard, Connection, PortPosition, Position, ViewportTransform } from '../../types/board';
import { computeBezierPath, getPortCoordinates } from '../../utils/bezier';
import { Trash2, Edit2, Check } from 'lucide-react';
import { sound } from '../../utils/sound';

interface ConnectionLayerProps {
  connections: Connection[];
  cards: BoardCard[];
  viewport: ViewportTransform;
  selectedConnectionIds: string[];
  connectingFrom: { cardId: string; port: PortPosition } | null;
  currentMousePos: Position | null;
  activePulseConnectionId?: string | null;
  onSelectConnection: (id: string) => void;
  onDeleteConnection: (id: string) => void;
  onUpdateConnection: (id: string, updates: Partial<Connection>) => void;
}

export const ConnectionLayer: React.FC<ConnectionLayerProps> = ({
  connections,
  cards,
  viewport,
  selectedConnectionIds,
  connectingFrom,
  currentMousePos,
  activePulseConnectionId,
  onSelectConnection,
  onDeleteConnection,
  onUpdateConnection,
}) => {
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [labelText, setLabelText] = useState('');

  const cardMap = new Map<string, BoardCard>();
  cards.forEach((c) => cardMap.set(c.id, c));

  const startEditLabel = (conn: Connection) => {
    setEditingLabelId(conn.id);
    setLabelText(conn.label || '');
  };

  const saveLabel = (connId: string) => {
    onUpdateConnection(connId, { label: labelText });
    setEditingLabelId(null);
    sound.playClick();
  };

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20">
      <defs>
        {/* Glow Filters */}
        <filter id="glow-neon" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Pulse Glowing Marker */}
        <linearGradient id="pulse-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>

        {/* Arrowhead Markers */}
        <marker
          id="arrowhead-default"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#a855f7" />
        </marker>
        <marker
          id="arrowhead-selected"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
        </marker>
        <marker
          id="arrowhead-pulsing"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
        </marker>
      </defs>

      <g transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}>
        {/* Render all established connections */}
        {connections.map((conn) => {
          const fromCard = cardMap.get(conn.fromCardId);
          const toCard = cardMap.get(conn.toCardId);
          if (!fromCard || !toCard) return null;

          const p1 = getPortCoordinates(fromCard, conn.fromPort);
          const p2 = getPortCoordinates(toCard, conn.toPort);

          const { path, midPoint } = computeBezierPath(p1, conn.fromPort, p2, conn.toPort);
          const isSelected = selectedConnectionIds.includes(conn.id);
          const isPulsing = activePulseConnectionId === conn.id;

          const strokeColor = isPulsing
            ? '#f59e0b'
            : isSelected
            ? '#38bdf8'
            : conn.color || '#a855f7';

          return (
            <g key={conn.id} className="cursor-pointer pointer-events-auto">
              {/* Broad invisible stroke for easy click hit detection */}
              <path
                d={path}
                fill="none"
                stroke="transparent"
                strokeWidth="24"
                onClick={() => onSelectConnection(conn.id)}
              />

              {/* Glowing background halo */}
              <path
                d={path}
                fill="none"
                stroke={strokeColor}
                strokeWidth={isPulsing || isSelected ? '7' : '5'}
                strokeOpacity={isPulsing || isSelected ? '0.5' : '0.2'}
                filter="url(#glow-neon)"
              />

              {/* Main Bezier Curve */}
              <path
                d={path}
                fill="none"
                stroke={strokeColor}
                strokeWidth={isPulsing ? '3.5' : isSelected ? '3' : '2.5'}
                strokeDasharray={conn.style === 'dashed' ? '6 4' : undefined}
                markerEnd={
                  isPulsing
                    ? 'url(#arrowhead-pulsing)'
                    : isSelected
                    ? 'url(#arrowhead-selected)'
                    : 'url(#arrowhead-default)'
                }
                onClick={() => onSelectConnection(conn.id)}
                className="transition-colors duration-200"
              />

              {/* Animated Conductor Pulse Photon along the wire */}
              {isPulsing && (
                <circle r="5" fill="#f59e0b" filter="url(#glow-neon)">
                  <animateMotion path={path} dur="0.9s" repeatCount="1" />
                </circle>
              )}

              {/* Central Editable Label / Intent Badge */}
              <foreignObject
                x={midPoint.x - 70}
                y={midPoint.y - 16}
                width="140"
                height="36"
                className="overflow-visible pointer-events-auto"
              >
                <div className="flex items-center justify-center">
                  {editingLabelId === conn.id ? (
                    <div
                      onPointerDown={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 bg-neutral-900 border border-indigo-500 rounded-full px-2 py-0.5 shadow-lg"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={labelText}
                        onChange={(e) => setLabelText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveLabel(conn.id);
                          if (e.key === 'Escape') setEditingLabelId(null);
                        }}
                        className="bg-transparent text-[11px] font-mono text-white outline-none w-20"
                      />
                      <button
                        type="button"
                        onClick={() => saveLabel(conn.id)}
                        className="text-emerald-400 hover:text-emerald-300"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditLabel(conn);
                      }}
                      style={{
                        backgroundColor:
                          conn.label?.toLowerCase().includes('ciano') || conn.color === '#06b6d4'
                            ? '#06b6d4'
                            : conn.label?.toLowerCase().includes('magenta') || conn.color === '#d946ef'
                            ? '#d946ef'
                            : conn.label?.toLowerCase().includes('daowcana') || conn.color === '#10b981'
                            ? '#10b981'
                            : conn.color || '#6366f1',
                      }}
                      className={`group/label flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-sans font-semibold text-white shadow-md hover:scale-105 transition-all ${
                        isSelected
                          ? 'ring-2 ring-white scale-110'
                          : isPulsing
                          ? 'ring-2 ring-amber-400 scale-110 shadow-lg shadow-amber-400/50'
                          : ''
                      }`}
                    >
                      <span>{conn.label || 'Conexão'}</span>
                      <button
                        type="button"
                        title="Excluir conexão"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConnection(conn.id);
                        }}
                        className="opacity-0 group-hover/label:opacity-100 text-white/80 hover:text-white ml-0.5 transition-opacity"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                </div>
              </foreignObject>
            </g>
          );
        })}

        {/* Live Preview Wire while user is dragging a port */}
        {connectingFrom && currentMousePos && (() => {
          const fromCard = cardMap.get(connectingFrom.cardId);
          if (!fromCard) return null;
          const p1 = getPortCoordinates(fromCard, connectingFrom.port);
          const { path } = computeBezierPath(p1, connectingFrom.port, currentMousePos);

          return (
            <g>
              <path
                d={path}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3"
                strokeDasharray="6 6"
                filter="url(#glow-neon)"
              />
              <circle
                cx={currentMousePos.x}
                cy={currentMousePos.y}
                r="6"
                fill="#38bdf8"
                filter="url(#glow-neon)"
              />
              <circle
                cx={p1.x}
                cy={p1.y}
                r="5"
                fill="#38bdf8"
              />
            </g>
          );
        })()}
      </g>
    </svg>
  );
};
