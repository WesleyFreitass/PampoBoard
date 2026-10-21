import React from 'react';
import { BoardCard, Connection, PortPosition, Position, ViewportTransform } from '../../types/board';
import { computeBezierPath, getPortCoordinates } from '../../utils/bezier';

interface ConnectionLayerProps {
  connections: Connection[];
  cards: BoardCard[];
  viewport: ViewportTransform;
  selectedConnectionIds: string[];
  connectingFrom: { cardId: string; port: PortPosition; itemId?: string } | null;
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
}) => {
  const cardMap = new Map<string, BoardCard>();
  cards.forEach((c) => cardMap.set(c.id, c));

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

          // Skip if column item no longer exists
          if (conn.fromItemId && fromCard.type === 'column') {
            const exists = fromCard.columnData?.items?.some((i) => i.id === conn.fromItemId);
            if (!exists) return null;
          }
          if (conn.toItemId && toCard.type === 'column') {
            const exists = toCard.columnData?.items?.some((i) => i.id === conn.toItemId);
            if (!exists) return null;
          }

          const p1 = getPortCoordinates(fromCard, conn.fromPort, conn.fromItemId);
          const p2 = getPortCoordinates(toCard, conn.toPort, conn.toItemId);

          const { path } = computeBezierPath(p1, conn.fromPort, p2, conn.toPort);
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
            </g>
          );
        })}

        {/* Live Preview Wire while user is dragging a port */}
        {connectingFrom && currentMousePos && (() => {
          const fromCard = cardMap.get(connectingFrom.cardId);
          if (!fromCard) return null;
          const p1 = getPortCoordinates(fromCard, connectingFrom.port, connectingFrom.itemId);
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
