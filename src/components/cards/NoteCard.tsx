import React, { useState } from 'react';
import { BoardCard, NoteChecklistItem } from '../../types/board';
import { CheckSquare, Square, Plus, Copy, Check, Code, Hash } from 'lucide-react';
import { sound } from '../../utils/sound';

interface NoteCardProps {
  card: BoardCard;
  onUpdate: (updates: Partial<BoardCard>) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ card, onUpdate }) => {
  const noteData = card.noteData || {
    title: card.title,
    body: '',
    checklist: [],
    tags: [],
  };

  const [copiedCode, setCopiedCode] = useState(false);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);

  const checklist = noteData.checklist || [];
  const completedCount = checklist.filter((i) => i.completed).length;
  const totalCount = checklist.length;

  const toggleChecklistItem = (id: string) => {
    sound.playClick();
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    onUpdate({
      noteData: {
        ...noteData,
        checklist: updated,
      },
    });
  };

  const addChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    sound.playClick();
    const newItem: NoteChecklistItem = {
      id: `chk-${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false,
    };
    onUpdate({
      noteData: {
        ...noteData,
        checklist: [...checklist, newItem],
      },
    });
    setNewChecklistText('');
    setIsAddingItem(false);
  };

  const handleCopyCode = () => {
    if (noteData.codeSnippet?.code) {
      navigator.clipboard.writeText(noteData.codeSnippet.code);
      setCopiedCode(true);
      sound.playClick();
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="space-y-3 text-neutral-300">
      {/* Body text */}
      <textarea
        value={noteData.body}
        onChange={(e) =>
          onUpdate({
            noteData: {
              ...noteData,
              body: e.target.value,
            },
          })
        }
        onPointerDown={(e) => e.stopPropagation()}
        rows={2}
        placeholder="Adicione anotações, objetivos ou requisitos..."
        className="w-full bg-transparent text-xs leading-relaxed text-neutral-300 placeholder-neutral-500 resize-none border-none focus:outline-none focus:ring-1 focus:ring-indigo-500/30 rounded p-1"
      />

      {/* Checklist section */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium">
          <span className="flex items-center gap-1.5">
            <span>Checklist</span>
            {totalCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 bg-white/5 rounded text-neutral-400">
                {completedCount}/{totalCount}
              </span>
            )}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsAddingItem(!isAddingItem);
            }}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 transition-colors"
          >
            <Plus className="w-3 h-3" /> Item
          </button>
        </div>

        {checklist.map((item) => (
          <div
            key={item.id}
            onClick={(e) => {
              e.stopPropagation();
              toggleChecklistItem(item.id);
            }}
            className="group flex items-start gap-2 py-1 px-1 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-xs transition-colors"
          >
            <div className="mt-0.5 shrink-0">
              {item.completed ? (
                <div className="w-3.5 h-3.5 rounded bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                  ✓
                </div>
              ) : (
                <div className="w-3.5 h-3.5 rounded border border-neutral-400 dark:border-neutral-600 group-hover:border-blue-400 transition-colors" />
              )}
            </div>
            <span
              className={`leading-tight flex-1 break-words select-text ${
                item.completed
                  ? 'text-neutral-500 dark:text-neutral-400 font-medium'
                  : 'text-neutral-800 dark:text-neutral-200'
              }`}
            >
              {item.text}
            </span>
          </div>
        ))}

        {isAddingItem && (
          <div className="flex items-center gap-1 pt-1" onPointerDown={(e) => e.stopPropagation()}>
            <input
              type="text"
              autoFocus
              value={newChecklistText}
              onChange={(e) => setNewChecklistText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addChecklistItem();
                if (e.key === 'Escape') setIsAddingItem(false);
              }}
              placeholder="Novo item..."
              className="flex-1 bg-neutral-800/80 text-xs px-2 py-1 rounded border border-neutral-700 text-neutral-200 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={addChecklistItem}
              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded font-medium"
            >
              Adicionar
            </button>
          </div>
        )}
      </div>

      {/* Code Snippet block */}
      {noteData.codeSnippet && (
        <div className="relative rounded-md bg-neutral-950/80 border border-neutral-800/80 overflow-hidden font-mono text-[11px] group">
          <div className="flex items-center justify-between px-2 py-1 bg-neutral-900/60 border-b border-neutral-800/60 text-neutral-400 text-[10px]">
            <span className="flex items-center gap-1">
              <Code className="w-3 h-3 text-indigo-400" />
              {noteData.codeSnippet.language}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
            >
              {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCode ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
          <pre
            onPointerDown={(e) => e.stopPropagation()}
            className="p-2.5 overflow-x-auto text-neutral-300 leading-snug whitespace-pre select-text font-mono"
          >
            <code>{noteData.codeSnippet.code}</code>
          </pre>
        </div>
      )}

      {/* Tags */}
      {noteData.tags && noteData.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
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
