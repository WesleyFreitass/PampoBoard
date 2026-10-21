import React, { useRef, useEffect } from 'react';
import { BoardCard, TextCardData } from '../../types/board';
import { Type } from 'lucide-react';

interface TextCardProps {
  card: BoardCard;
  onUpdate: (updates: Partial<BoardCard>) => void;
  isSelected?: boolean;
}

const FONT_STYLES: Record<'h1' | 'h2' | 'h3' | 'body', { label: string; className: string }> = {
  h1: { label: 'H1', className: 'text-3xl font-extrabold tracking-tight leading-tight' },
  h2: { label: 'H2', className: 'text-xl font-bold tracking-tight leading-snug' },
  h3: { label: 'H3', className: 'text-base font-semibold leading-normal' },
  body: { label: 'P', className: 'text-sm font-normal leading-relaxed text-neutral-300' },
};

const TEXT_COLORS = [
  { id: '#f8fafc', label: 'Branco', class: 'bg-white' },
  { id: '#38bdf8', label: 'Azul', class: 'bg-sky-400' },
  { id: '#34d399', label: 'Verde', class: 'bg-emerald-400' },
  { id: '#fbbf24', label: 'Amarelo', class: 'bg-amber-400' },
  { id: '#f43f5e', label: 'Rosa', class: 'bg-rose-500' },
  { id: '#c084fc', label: 'Roxo', class: 'bg-purple-400' },
  { id: '#94a3b8', label: 'Cinza', class: 'bg-slate-400' },
];

export const TextCard: React.FC<TextCardProps> = ({ card, onUpdate, isSelected }) => {
  const textData: TextCardData = card.textData || {
    text: card.title || 'Título',
    fontSize: 'h1',
    color: '#f8fafc',
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height to fit content
  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.max(48, scrollHeight)}px`;
      if (Math.abs(card.height - scrollHeight) > 10) {
        onUpdate({ height: Math.max(60, scrollHeight + 30) });
      }
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [textData.text, textData.fontSize]);

  const currentStyle = FONT_STYLES[textData.fontSize] || FONT_STYLES.h1;

  return (
    <div className="relative group/text w-full select-none">
      {/* Floating Font Size & Color Bar on Hover / Selection */}
      {isSelected && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute -top-10 left-0 z-40 flex items-center gap-1.5 px-2 py-1 rounded-xl bg-neutral-900/95 backdrop-blur-md border border-neutral-700/80 shadow-xl text-xs animate-in fade-in duration-100"
        >
          {/* Font Sizes: H1, H2, H3, P */}
          <div className="flex items-center gap-0.5 bg-black/40 p-0.5 rounded-lg border border-white/5">
            {(['h1', 'h2', 'h3', 'body'] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() =>
                  onUpdate({
                    textData: { ...textData, fontSize: size },
                  })
                }
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                  textData.fontSize === size
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {FONT_STYLES[size].label}
              </button>
            ))}
          </div>

          <div className="w-px h-3 bg-neutral-700" />

          {/* Color Dots */}
          <div className="flex items-center gap-1">
            {TEXT_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                title={c.label}
                onClick={() =>
                  onUpdate({
                    textData: { ...textData, color: c.id },
                  })
                }
                className={`w-3.5 h-3.5 rounded-full transition-transform hover:scale-125 ${c.class} ${
                  textData.color === c.id ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Editable Free Text Area */}
      <textarea
        ref={textareaRef}
        value={textData.text}
        onChange={(e) => {
          onUpdate({
            textData: { ...textData, text: e.target.value },
            title: e.target.value.substring(0, 40) || 'Texto',
          });
          adjustHeight();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        placeholder="Digite seu título ou texto..."
        style={{ color: textData.color || '#f8fafc' }}
        rows={1}
        className={`w-full bg-transparent border-none focus:outline-none resize-none p-1 rounded hover:bg-white/[0.04] focus:bg-white/[0.06] transition-colors placeholder:text-neutral-600 ${currentStyle.className}`}
      />
    </div>
  );
};
