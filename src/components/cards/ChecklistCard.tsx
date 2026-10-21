import React, { useState } from 'react';
import { BoardCard, ChecklistCardData, NoteChecklistItem } from '../../types/board';
import { CheckSquare, Square, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { sound } from '../../utils/sound';

interface ChecklistCardProps {
  card: BoardCard;
  onUpdate: (updates: Partial<BoardCard>) => void;
}

export const ChecklistCard: React.FC<ChecklistCardProps> = ({ card, onUpdate }) => {
  const checklistData: ChecklistCardData = card.checklistData || {
    title: card.title,
    items: [],
  };

  const [newItemText, setNewItemText] = useState('');

  const items = checklistData.items || [];
  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;

  const updateItems = (updated: NoteChecklistItem[]) => {
    onUpdate({
      checklistData: {
        ...checklistData,
        items: updated,
      },
    });
  };

  const toggleItem = (id: string) => {
    sound.playClick();
    const updated = items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    updateItems(updated);
  };

  const addItem = () => {
    if (!newItemText.trim()) return;
    sound.playClick();
    const newItem: NoteChecklistItem = {
      id: `chk-${Date.now()}`,
      text: newItemText.trim(),
      completed: false,
    };
    updateItems([...items, newItem]);
    setNewItemText('');
  };

  const deleteItem = (id: string) => {
    sound.playDelete();
    updateItems(items.filter((item) => item.id !== id));
  };

  const updateItemText = (id: string, text: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, text } : item
    );
    updateItems(updated);
  };

  return (
    <div className="space-y-2.5 text-neutral-300 select-none">
      {/* Progress header metric */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pb-1 border-b border-white/5">
          <span className="flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tarefas</span>
          </span>
          <span className="text-emerald-300 font-semibold">
            {completedCount}/{totalCount} concluídos
          </span>
        </div>
      )}

      {/* Checklist items list */}
      <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
        {items.length === 0 && (
          <p className="text-xs text-neutral-500 py-1 italic">
            Nenhuma tarefa adicionada ainda.
          </p>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className="group flex items-center gap-2 py-1 px-1.5 rounded-lg hover:bg-white/5 transition-colors"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => toggleItem(item.id)}
              className="text-neutral-400 hover:text-emerald-400 shrink-0 transition-colors"
            >
              {item.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Square className="w-4 h-4 text-neutral-500 hover:text-neutral-300" />
              )}
            </button>

            <input
              type="text"
              value={item.text}
              onChange={(e) => updateItemText(item.id, e.target.value)}
              className={`flex-1 bg-transparent text-xs border-none focus:outline-none transition-colors ${
                item.completed
                  ? 'line-through text-neutral-500 font-medium'
                  : 'text-neutral-200'
              }`}
            />

            <button
              type="button"
              onClick={() => deleteItem(item.id)}
              title="Excluir tarefa"
              className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-rose-400 p-0.5 transition-opacity"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add new task input */}
      <div
        className="flex items-center gap-1.5 pt-1 border-t border-white/5"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addItem();
          }}
          placeholder="+ Adicionar nova tarefa..."
          className="flex-1 bg-neutral-900/80 text-xs px-2.5 py-1.5 rounded-lg border border-neutral-700/80 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="button"
          onClick={addItem}
          className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
