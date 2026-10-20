import React, { useState } from 'react';
import { BoardCard, ColumnCardData, ColumnItem } from '../../types/board';
import { Plus, CheckCircle2, Circle, Trash2, Tag, Layers } from 'lucide-react';
import { sound } from '../../utils/sound';

interface ColumnCardProps {
  card: BoardCard;
  onUpdate: (updates: Partial<BoardCard>) => void;
}

export const ColumnCard: React.FC<ColumnCardProps> = ({ card, onUpdate }) => {
  const columnData: ColumnCardData = card.columnData || {
    title: card.title,
    items: [
      { id: '1', text: 'Pesquisa de referências visuais', done: true, tag: 'Design' },
      { id: '2', text: 'Suporte a prints com Ctrl+V', done: true, tag: 'UX' },
      { id: '3', text: 'Tabelas dinâmicas com colunas', done: true, tag: 'Core' },
      { id: '4', text: 'Sub-quadros de projeto (Boards)', done: false, tag: 'Milanote' },
    ],
  };

  const [newItemText, setNewItemText] = useState('');
  const [newItemTag, setNewItemTag] = useState('');

  const toggleItem = (itemId: string) => {
    sound.playClick();
    const updated = columnData.items.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    onUpdate({
      columnData: {
        ...columnData,
        items: updated,
      },
    });
  };

  const deleteItem = (itemId: string) => {
    sound.playDelete();
    onUpdate({
      columnData: {
        ...columnData,
        items: columnData.items.filter((i) => i.id !== itemId),
      },
    });
  };

  const addItem = () => {
    if (!newItemText.trim()) return;
    sound.playClick();
    const newItem: ColumnItem = {
      id: `ci-${Date.now()}`,
      text: newItemText.trim(),
      done: false,
      tag: newItemTag.trim() || undefined,
    };
    onUpdate({
      columnData: {
        ...columnData,
        items: [...columnData.items, newItem],
      },
    });
    setNewItemText('');
    setNewItemTag('');
  };

  const completedCount = columnData.items.filter((i) => i.done).length;

  return (
    <div className="space-y-3 select-none">
      {/* Column progress metric */}
      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pb-1 border-b border-white/5">
        <span className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span>Pilha de Itens</span>
        </span>
        <span className="text-purple-300 font-semibold">
          {completedCount}/{columnData.items.length} concluídos
        </span>
      </div>

      {/* Stack of items (cards inside the column) */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {columnData.items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`p-2.5 rounded-lg border transition-all cursor-pointer group flex items-start justify-between gap-2 ${
              item.done
                ? 'bg-neutral-950/40 border-neutral-800/60 opacity-60'
                : 'bg-neutral-900/90 border-neutral-700/80 hover:border-purple-500/60 shadow-sm'
            }`}
          >
            <div className="flex items-start gap-2 flex-1">
              <button
                type="button"
                className="mt-0.5 text-neutral-400 group-hover:text-purple-400 shrink-0"
              >
                {item.done ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Circle className="w-3.5 h-3.5" />
                )}
              </button>
              <div>
                <span
                  className={`text-xs block leading-snug break-words ${
                    item.done ? 'line-through text-neutral-500' : 'text-neutral-200'
                  }`}
                >
                  {item.text}
                </span>
                {item.tag && (
                  <span className="inline-block mt-1 text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {item.tag}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deleteItem(item.id);
              }}
              title="Excluir item"
              className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-rose-400 transition-opacity"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Quick Add input at bottom */}
      <div
        className="p-1.5 bg-neutral-950/80 rounded-lg border border-neutral-800 space-y-1.5"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addItem();
            }}
            placeholder="Adicionar novo card à coluna..."
            className="flex-1 bg-transparent text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none px-1"
          />
          <button
            type="button"
            onClick={addItem}
            className="p-1 rounded bg-purple-600 hover:bg-purple-500 text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
