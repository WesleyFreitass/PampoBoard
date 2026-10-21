import React from 'react';
import { BoardCard, SubBoardCardData, CardColor } from '../../types/board';
import { ArrowUpRight } from 'lucide-react';
import { sound } from '../../utils/sound';

export const boardPastelThemes: Record<
  CardColor,
  { bg: string; iconBg: string; text: string; hex: string }
> = {
  rose: { bg: 'bg-[#d1989e]', iconBg: 'bg-[#3b1d24]', text: 'text-[#3b1d24]', hex: '#d1989e' },
  default: { bg: 'bg-[#d1989e]', iconBg: 'bg-[#3b1d24]', text: 'text-[#3b1d24]', hex: '#d1989e' },
  lavender: { bg: 'bg-[#c4b5fd]', iconBg: 'bg-[#2e1d4a]', text: 'text-[#2e1d4a]', hex: '#c4b5fd' },
  emerald: { bg: 'bg-[#86efac]', iconBg: 'bg-[#143825]', text: 'text-[#143825]', hex: '#86efac' },
  amber: { bg: 'bg-[#fde047]', iconBg: 'bg-[#43230a]', text: 'text-[#43230a]', hex: '#fde047' },
  cyan: { bg: 'bg-[#67e8f9]', iconBg: 'bg-[#0e3b43]', text: 'text-[#0e3b43]', hex: '#67e8f9' },
  slate: { bg: 'bg-[#cbd5e1]', iconBg: 'bg-[#1e293b]', text: 'text-[#1e293b]', hex: '#cbd5e1' },
};

interface SubBoardCardProps {
  card: BoardCard;
  isSelected?: boolean;
  onUpdate: (updates: Partial<BoardCard>) => void;
  onOpenSubBoard?: (card: BoardCard) => void;
  onDragStart?: (e: React.PointerEvent) => void;
}

export const SubBoardCard: React.FC<SubBoardCardProps> = ({
  card,
  isSelected,
  onUpdate,
  onOpenSubBoard,
  onDragStart,
}) => {
  const boardData: SubBoardCardData = card.boardData || {
    title: card.title || 'novo quadro',
    description: '',
    itemCount: 0,
    coverColor: '#d1989e',
    icon: 'emblem',
    tags: [],
  };

  const currentTheme = boardPastelThemes[card.color] || boardPastelThemes.rose;

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playConnect();
    onOpenSubBoard?.(card);
  };

  return (
    <div className="flex flex-col items-center w-full select-none group/subboard">
      {/* Milanote-style Pastel Squircle Tile */}
      <div
        onPointerDown={onDragStart}
        onDoubleClick={handleOpen}
        style={{ backgroundColor: currentTheme.hex }}
        className={`w-24 h-24 rounded-[26px] mx-auto flex items-center justify-center cursor-pointer shadow-md shadow-black/20 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 relative group/tile ${
          isSelected ? 'ring-4 ring-indigo-500/80 ring-offset-2 ring-offset-transparent shadow-xl' : ''
        }`}
      >
        {/* Dark Circular Emblem Badge */}
        <div
          className={`w-14 h-14 rounded-full ${currentTheme.iconBg} flex items-center justify-center shadow-inner group-hover/tile:scale-105 transition-transform duration-200`}
        >
          {/* Stylized Milanote Falcon/Emblem Crest */}
          <svg
            className="w-9 h-9 fill-current text-white/90"
            viewBox="0 0 32 32"
          >
            <path d="M16 4C9.37 4 4 9.37 4 16s5.37 12 12 12 12-5.37 12-12S22.63 4 16 4zm0 2.5c5.25 0 9.5 4.25 9.5 9.5 0 2.22-.76 4.26-2.03 5.88-.63-1.68-1.89-3.08-3.53-3.95 1.34-1.07 2.19-2.73 2.19-4.58 0-3.23-2.62-5.85-5.85-5.85-2.48 0-4.61 1.55-5.46 3.74-.46-.17-.96-.26-1.48-.26-1.52 0-2.88.76-3.71 1.93C7.45 13.9 8.5 7.9 16 6.5zm-3.5 8.2c0-1.85 1.5-3.35 3.35-3.35 1.85 0 3.35 1.5 3.35 3.35 0 1.25-.69 2.34-1.71 2.91-.77.43-1.68.64-2.64.64-1.3 0-2.35-.55-2.35-1.55 0-.55.45-1 1-1h1.5c.55 0 1-.45 1-1s-.45-1-1-1h-1.5c-1.66 0-3 1.34-3 3 0 .8.31 1.53.82 2.07-.51-.62-.82-1.41-.82-2.07z" />
          </svg>
        </div>

        {/* Hover Action Badge for opening */}
        <div
          onClick={handleOpen}
          title="Duplo clique para abrir este quadro"
          className="absolute bottom-1.5 right-1.5 p-1 rounded-full bg-black/40 text-white/80 opacity-0 group-hover/tile:opacity-100 hover:bg-black/70 hover:scale-110 transition-all shadow"
        >
          <ArrowUpRight className="w-3 h-3" />
        </div>
      </div>

      {/* Board Title (novo quadro) */}
      <input
        type="text"
        value={card.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
        onPointerDown={(e) => e.stopPropagation()}
        className="mt-2 text-center font-bold text-sm text-neutral-800 dark:text-neutral-100 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-indigo-500/50 rounded px-1.5 py-0.5 truncate w-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        placeholder="novo quadro"
      />

      {/* Card Count (0 cards) */}
      <div className="text-xs font-normal text-neutral-500 dark:text-neutral-400 text-center select-none mt-0.5">
        {boardData.itemCount || 0} cards
      </div>
    </div>
  );
};
