import React from 'react';
import { BoardStore } from '../../stores/useBoardStore';

interface MiniMapProps {
  store: BoardStore;
}

export const MiniMap: React.FC<MiniMapProps> = ({ store }) => {
  const { cards, viewport, setViewport } = store;

  if (cards.length === 0) return null;

  // Compute bounding box of all cards
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

  const padding = 200;
  const worldW = Math.max(1200, maxX - minX + padding * 2);
  const worldH = Math.max(800, maxY - minY + padding * 2);

  const mapW = 160;
  const mapH = 100;
  const scaleX = mapW / worldW;
  const scaleY = mapH / worldH;
  const scale = Math.min(scaleX, scaleY);

  const originX = minX - padding;
  const originY = minY - padding;

  // Viewport camera rect
  const viewX = -viewport.x / viewport.zoom;
  const viewY = -viewport.y / viewport.zoom;
  const viewW = window.innerWidth / viewport.zoom;
  const viewH = window.innerHeight / viewport.zoom;

  const vpRect = {
    x: (viewX - originX) * scale,
    y: (viewY - originY) * scale,
    w: viewW * scale,
    h: viewH * scale,
  };

  const handleMiniMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const targetWorldX = originX + clickX / scale;
    const targetWorldY = originY + clickY / scale;

    const newX = window.innerWidth / 2 - targetWorldX * viewport.zoom;
    const newY = window.innerHeight / 2 - targetWorldY * viewport.zoom;

    setViewport({ ...viewport, x: newX, y: newY });
  };

  return (
    <div
      onClick={handleMiniMapClick}
      title="Radar do Canvas Infinito (Clique para navegar)"
      className="fixed bottom-6 right-6 z-30 hidden md:block w-40 h-24 rounded-xl bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 shadow-xl overflow-hidden cursor-crosshair select-none"
    >
      <div className="relative w-full h-full p-1">
        {/* Render card dots */}
        {cards.map((c) => {
          const cx = (c.x - originX) * scale;
          const cy = (c.y - originY) * scale;
          const cw = Math.max(2, c.width * scale);
          const ch = Math.max(2, c.height * scale);

          return (
            <div
              key={c.id}
              style={{
                left: `${cx}px`,
                top: `${cy}px`,
                width: `${cw}px`,
                height: `${ch}px`,
              }}
              className={`absolute rounded-xs ${
                c.type === 'live'
                  ? 'bg-amber-400'
                  : c.type === 'media'
                  ? 'bg-emerald-400'
                  : c.type === 'link'
                  ? 'bg-cyan-400'
                  : 'bg-indigo-400'
              }`}
            />
          );
        })}

        {/* Viewport Camera Box */}
        <div
          style={{
            left: `${vpRect.x}px`,
            top: `${vpRect.y}px`,
            width: `${vpRect.w}px`,
            height: `${vpRect.h}px`,
          }}
          className="absolute border border-white/80 bg-white/10 rounded-xs pointer-events-none"
        />
      </div>
    </div>
  );
};
