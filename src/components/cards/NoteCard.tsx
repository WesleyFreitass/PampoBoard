import React from 'react';
import { BoardCard } from '../../types/board';
import { Hash } from 'lucide-react';

interface NoteCardProps {
  card: BoardCard;
  onUpdate: (updates: Partial<BoardCard>) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ card, onUpdate }) => {
  const noteData = card.noteData || {
    title: card.title,
    body: '',
    tags: [],
  };

  return (
    <div className="space-y-2 text-neutral-300">
      {/* Body text - Pure Notes */}
      <textarea
        value={noteData.body || ''}
        onChange={(e) =>
          onUpdate({
            noteData: {
              ...noteData,
              body: e.target.value,
            },
          })
        }
        onPointerDown={(e) => e.stopPropagation()}
        rows={4}
        placeholder="Escreva sua nota aqui..."
        className="w-full bg-transparent text-xs leading-relaxed text-neutral-200 placeholder-neutral-500 resize-y border-none focus:outline-none rounded p-1 min-h-[72px]"
      />

      {/* Tags if any */}
      {noteData.tags && noteData.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1 border-t border-white/5">
          {noteData.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-neutral-400 flex items-center gap-0.5"
            >
              <Hash className="w-2.5 h-2.5 opacity-60" />
              {tag.replace(/^#/, '')}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
