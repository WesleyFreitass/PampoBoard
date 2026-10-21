import React from 'react';
import { BoardCard, SubBoardCardData } from '../../types/board';
import { Folder, FolderOpen, ArrowUpRight, Layers, Sparkles } from 'lucide-react';
import { sound } from '../../utils/sound';

interface SubBoardCardProps {
  card: BoardCard;
  onUpdate: (updates: Partial<BoardCard>) => void;
  onOpenSubBoard?: (card: BoardCard) => void;
}

export const SubBoardCard: React.FC<SubBoardCardProps> = ({
  card,
  onUpdate,
  onOpenSubBoard,
}) => {
  const boardData: SubBoardCardData = card.boardData || {
    title: card.title,
    description: '',
    itemCount: 0,
    coverColor: '#10b981',
    tags: [],
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playConnect();
    onOpenSubBoard?.(card);
  };

  return (
    <div className="space-y-3 select-none">
      {/* Cover Header Banner */}
      <div
        onClick={handleOpen}
        style={{
          backgroundColor: `${boardData.coverColor}18`,
          borderColor: `${boardData.coverColor}40`,
        }}
        className="p-4 rounded-xl border flex flex-col justify-between h-28 cursor-pointer group/banner relative overflow-hidden transition-all hover:scale-[1.01]"
      >
        <div className="flex items-center justify-between">
          <div
            style={{ backgroundColor: boardData.coverColor }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-black shadow-md"
          >
            <Folder className="w-4 h-4 fill-current group-hover/banner:hidden" />
            <FolderOpen className="w-4 h-4 fill-current hidden group-hover/banner:block" />
          </div>

          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-black/40 text-neutral-300 backdrop-blur-xs flex items-center gap-1">
            <Layers className="w-3 h-3 text-emerald-400" />
            <span>{boardData.itemCount || 0} itens internos</span>
          </span>
        </div>

        <div className="flex items-end justify-between">
          <span className="text-xs font-bold text-neutral-100 group-hover/banner:text-white transition-colors">
            {boardData.title}
          </span>
          <span className="p-1 rounded-md bg-black/40 text-neutral-300 group-hover/banner:text-emerald-400 group-hover/banner:bg-emerald-500/20 transition-all">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Description */}
      <textarea
        value={boardData.description}
        onChange={(e) =>
          onUpdate({
            boardData: {
              ...boardData,
              description: e.target.value,
            },
          })
        }
        onPointerDown={(e) => e.stopPropagation()}
        rows={2}
        placeholder="Adicione o objetivo ou escopo deste sub-quadro..."
        className="w-full bg-transparent text-xs text-neutral-400 placeholder-neutral-600 resize-none border-none focus:outline-none focus:ring-1 focus:ring-emerald-500/30 rounded p-1"
      />

      {/* Tags */}
      {boardData.tags && (
        <div className="flex flex-wrap gap-1">
          {boardData.tags.map((t, idx) => (
            <span
              key={idx}
              className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
