import React, { useRef, useState } from 'react';
import { Zone } from '../../types/board';
import { Trash2, GripHorizontal, Palette } from 'lucide-react';
import { sound } from '../../utils/sound';

interface ZoneComponentProps {
  zone: Zone;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onUpdate: (updates: Partial<Zone>) => void;
  onDelete: () => void;
  onMoveDelta: (dx: number, dy: number) => void;
  onResize: (width: number, height: number) => void;
}

export const ZoneComponent: React.FC<ZoneComponentProps> = ({
  zone,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMoveDelta,
  onResize,
}) => {
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Drag Zone (moves zone + all children inside!)
  const handlePointerDownHeader = (e: React.PointerEvent) => {
    e.stopPropagation();
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    const handlePointerMove = (moveEvt: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = moveEvt.clientX - lastMousePosRef.current.x;
      const dy = moveEvt.clientY - lastMousePosRef.current.y;
      onMoveDelta(dx, dy);
      lastMousePosRef.current = { x: moveEvt.clientX, y: moveEvt.clientY };
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Resize Zone
  const handlePointerDownResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    isResizingRef.current = true;
    const startW = zone.width;
    const startH = zone.height;
    const startX = e.clientX;
    const startY = e.clientY;

    const handlePointerMove = (moveEvt: PointerEvent) => {
      if (!isResizingRef.current) return;
      const newW = Math.max(260, startW + (moveEvt.clientX - startX));
      const newH = Math.max(180, startH + (moveEvt.clientY - startY));
      onResize(newW, newH);
    };

    const handlePointerUp = () => {
      isResizingRef.current = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#64748b'];

  return (
    <div
      id={`zone-${zone.id}`}
      style={{
        transform: `translate3d(${zone.x}px, ${zone.y}px, 0)`,
        width: `${zone.width}px`,
        height: `${zone.height}px`,
        borderColor: isSelected ? '#a855f7' : `${zone.color}44`,
        backgroundColor: `${zone.color}0a`,
      }}
      onClick={onSelect}
      className={`absolute select-none rounded-2xl border-2 border-dashed transition-all pointer-events-auto group ${
        isSelected ? 'ring-2 ring-purple-500/50 shadow-2xl' : 'hover:border-purple-400/40'
      }`}
    >
      {/* Zone Header Bar */}
      <div
        onPointerDown={handlePointerDownHeader}
        style={{ backgroundColor: `${zone.color}18` }}
        className="px-4 py-2.5 rounded-t-2xl flex items-center justify-between cursor-grab active:cursor-grabbing border-b border-white/5 backdrop-blur-md"
      >
        <div className="flex items-center gap-2 flex-1 mr-2">
          <GripHorizontal className="w-4 h-4 text-neutral-400 opacity-60" />
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: zone.color }}
          />
          <input
            type="text"
            value={zone.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            onPointerDown={(e) => e.stopPropagation()}
            placeholder="Título da Zona..."
            className="text-sm font-semibold text-neutral-200 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-purple-400/40 rounded px-1 w-full"
          />
        </div>

        {/* Zone Controls */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            title="Mudar cor da zona"
            onClick={(e) => {
              e.stopPropagation();
              setShowColorPicker(!showColorPicker);
            }}
            className="p-1 rounded text-neutral-400 hover:text-white transition-colors"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            title="Excluir zona"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 rounded text-neutral-400 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Color picker dropdown */}
      {showColorPicker && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute top-12 right-4 z-50 p-2 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl flex items-center gap-1.5"
        >
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              style={{ backgroundColor: c }}
              onClick={() => {
                onUpdate({ color: c });
                setShowColorPicker(false);
                sound.playClick();
              }}
              className="w-5 h-5 rounded-full border border-white/20 hover:scale-120 transition-transform"
            />
          ))}
        </div>
      )}

      {/* Zone Description helper watermark */}
      <div className="p-4 pointer-events-none">
        <span className="text-xs font-mono text-neutral-400 opacity-60">
          {zone.description || 'Mova a barra de título para arrastar todos os itens juntos'}
        </span>
      </div>

      {/* Resizing Handle at bottom-right corner */}
      <div
        onPointerDown={handlePointerDownResize}
        title="Redimensionar zona"
        className="absolute bottom-1 right-1 w-4 h-4 cursor-nwse-resize flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
      >
        <div
          className="w-2.5 h-2.5 rounded-br border-r-2 border-b-2"
          style={{ borderColor: zone.color }}
        />
      </div>
    </div>
  );
};
