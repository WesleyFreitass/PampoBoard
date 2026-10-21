import React, { useState, useEffect } from 'react';
import { BoardStore } from '../../stores/useBoardStore';
import {
  Search,
  X,
  StickyNote,
  CheckSquare,
  Image as ImageIcon,
  Globe,
  ArrowRight,
  LayoutDashboard,
  Kanban,
  GitBranch,
  Table as TableIcon,
  Columns3,
  FolderOpen,
} from 'lucide-react';
import { sound } from '../../utils/sound';

interface CommandPaletteProps {
  store: BoardStore;
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ store, isOpen, onClose }) => {
  const { cards, focusCard, setViewMode, addCard } = store;
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else store.clearSelection();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, store]);

  if (!isOpen) return null;

  // Filter cards
  const filteredCards = cards.filter((c) => {
    const q = query.toLowerCase();
    const matchTitle = c.title.toLowerCase().includes(q);
    const matchBody = c.noteData?.body?.toLowerCase().includes(q) || false;
    const matchTags = c.noteData?.tags?.some((t) => t.toLowerCase().includes(q)) || false;
    const matchType = c.type.toLowerCase().includes(q);
    return matchTitle || matchBody || matchTags || matchType;
  });

  const handleSelectCard = (cardId: string) => {
    sound.playClick();
    setViewMode('free');
    focusCard(cardId);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center pt-24 px-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl bg-neutral-900 border border-neutral-700/80 shadow-2xl overflow-hidden"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-800">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Buscar por nome, notas, tags ou tipos..."
            className="w-full bg-transparent text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCards.length > 0 ? (
            <div>
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-neutral-500">
                Cards no Canvas ({filteredCards.length})
              </div>
              {filteredCards.map((card, idx) => (
                <div
                  key={card.id}
                  onClick={() => handleSelectCard(card.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    idx === selectedIndex
                      ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                      : 'hover:bg-neutral-800/60 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {card.type === 'note' && <StickyNote className="w-4 h-4 text-purple-400" />}
                    {card.type === 'checklist' && <CheckSquare className="w-4 h-4 text-emerald-400" />}
                    {card.type === 'media' && <ImageIcon className="w-4 h-4 text-emerald-400" />}
                    {card.type === 'link' && <Globe className="w-4 h-4 text-cyan-400" />}

                    <div>
                      <div className="text-xs font-semibold">{card.title}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        Tipo: {card.type} • Status: {card.status || 'ativo'}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-indigo-400 font-mono flex items-center gap-1">
                    Navegar <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-neutral-500">
              Nenhum card correspondente encontrado para &quot;{query}&quot;.
            </div>
          )}

          {/* Quick Shortcuts */}
          <div className="pt-2 border-t border-neutral-800/80 mt-2">
            <div className="px-2 py-1 text-[10px] font-mono uppercase text-neutral-500">
              Ações Rápidas
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  addCard('note');
                  onClose();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-300 hover:bg-neutral-800 text-left"
              >
                <StickyNote className="w-3.5 h-3.5 text-purple-400" />
                <span>+ Criar Nota</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  addCard('checklist');
                  onClose();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-300 hover:bg-neutral-800 text-left"
              >
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ Criar Checklist</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  addCard('media');
                  onClose();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-300 hover:bg-neutral-800 text-left"
              >
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ Criar Imagem</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  addCard('table');
                  onClose();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-300 hover:bg-neutral-800 text-left"
              >
                <TableIcon className="w-3.5 h-3.5 text-sky-400" />
                <span>+ Criar Tabela</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  addCard('column');
                  onClose();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-300 hover:bg-neutral-800 text-left"
              >
                <Columns3 className="w-3.5 h-3.5 text-pink-400" />
                <span>+ Criar Coluna</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  addCard('board');
                  onClose();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-300 hover:bg-neutral-800 text-left"
              >
                <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ Criar Sub-Board</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('kanban');
                  onClose();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-300 hover:bg-neutral-800 text-left"
              >
                <Kanban className="w-3.5 h-3.5 text-indigo-400" />
                <span>Modo Kanban</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('graph');
                  onClose();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-300 hover:bg-neutral-800 text-left"
              >
                <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                <span>Modo Grafo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-neutral-950/60 border-t border-neutral-800 flex items-center justify-between text-[10px] font-mono text-neutral-500">
          <span>Pressione Esc para fechar</span>
          <span>Enter para navegar até o card</span>
        </div>
      </div>
    </div>
  );
};
