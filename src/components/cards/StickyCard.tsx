import React, { useRef } from 'react';
import { BoardCard, StickyCardData } from '../../types/board';
import { Palette, Trash2, Copy } from 'lucide-react';
import { sound } from '../../utils/sound';

interface StickyCardProps {
  card: BoardCard;
  onUpdate: (updates: Partial<BoardCard>) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  isSelected?: boolean;
}

export const STICKY_THEMES: Record<
  'yellow' | 'pink' | 'mint' | 'blue' | 'lavender' | 'peach',
  { bg: string; text: string; shadow: string; border: string; hex: string }
> = {
  yellow: {
    bg: 'bg-[#fef08a]',
    text: 'text-neutral-900',
    shadow: 'shadow-yellow-950/20',
    border: 'border-yellow-300',
    hex: '#fef08a',
  },
  pink: {
    bg: 'bg-[#fbcfe8]',
    text: 'text-neutral-900',
    shadow: 'shadow-pink-950/20',
    border: 'border-pink-300',
    hex: '#fbcfe8',
  },
  mint: {
    bg: 'bg-[#bbf7d0]',
    text: 'text-neutral-900',
    shadow: 'shadow-emerald-950/20',
    border: 'border-emerald-300',
    hex: '#bbf7d0',
  },
  blue: {
    bg: 'bg-[#bae6fd]',
    text: 'text-neutral-900',
    shadow: 'shadow-sky-950/20',
    border: 'border-sky-300',
    hex: '#bae6fd',
  },
  lavender: {
    bg: 'bg-[#e9d5ff]',
    text: 'text-neutral-900',
    shadow: 'shadow-purple-950/20',
    border: 'border-purple-300',
    hex: '#e9d5ff',
  },
  peach: {
    bg: 'bg-[#fed7aa]',
    text: 'text-neutral-900',
    shadow: 'shadow-orange-950/20',
    border: 'border-orange-300',
    hex: '#fed7aa',
  },
};

export const StickyCard: React.FC<StickyCardProps> = ({
  card,
  onUpdate,
  onDelete,
  onDuplicate,
  isSelected,
}) => {
  const stickyData: StickyCardData = card.stickyData || {
    text: card.title || '',
    color: 'yellow',
    fontSize: 'normal',
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const theme = STICKY_THEMES[stickyData.color] || STICKY_THEMES.yellow;

  return (
    <div
      className={`relative w-full h-full min-h-[190px] p-4 rounded-xl shadow-xl flex flex-col justify-between select-none transition-all duration-150 ${theme.bg} ${theme.text} ${theme.shadow} border ${theme.border} group/sticky`}
    >
      {/* Top Paper Pin / Shadow Accent */}
      <div className="flex items-center justify-between pb-2">
        <div className="w-8 h-2 rounded-full bg-black/10 mx-auto -mt-2" />
      </div>

      {/* Main Text Content */}
      <textarea
        ref={textareaRef}
        value={stickyData.text}
        onChange={(e) => {
          onUpdate({
            stickyData: { ...stickyData, text: e.target.value },
            title: e.target.value.substring(0, 30) || 'Post-it',
          });
        }}
        onPointerDown={(e) => e.stopPropagation()}
        placeholder="Escreva seu lembrete ou ideia..."
        rows={6}
        className={`w-full flex-1 bg-transparent border-none focus:outline-none resize-none text-sm font-medium leading-relaxed placeholder:text-neutral-600/70 p-0 ${theme.text}`}
      />

      {/* Footer Color Swatches on Hover or Selection */}
      <div className="pt-2 flex items-center justify-between opacity-0 group-hover/sticky:opacity-100 transition-opacity">
        <div className="flex items-center gap-1.5" onPointerDown={(e) => e.stopPropagation()}>
          {(['yellow', 'pink', 'mint', 'blue', 'lavender', 'peach'] as const).map((colorKey) => (
            <button
              key={colorKey}
              type="button"
              onClick={() => {
                sound.playClick();
                onUpdate({
                  stickyData: { ...stickyData, color: colorKey },
                });
              }}
              style={{ backgroundColor: STICKY_THEMES[colorKey].hex }}
              className={`w-3.5 h-3.5 rounded-full border border-black/20 transition-transform hover:scale-125 ${
                stickyData.color === colorKey ? 'ring-2 ring-black scale-110' : ''
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
          {onDuplicate && (
            <button
              type="button"
              title="Duplicar post-it"
              onClick={onDuplicate}
              className="p-1 rounded text-neutral-700 hover:text-black hover:bg-black/10 transition-colors"
            >
              <Copy className="w-3 h-3" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              title="Excluir post-it"
              onClick={onDelete}
              className="p-1 rounded text-neutral-700 hover:text-rose-600 hover:bg-rose-500/20 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
