import React from 'react';
import { ChevronsLeft, Trash2, RefreshCw, Archive, AlertCircle } from 'lucide-react';
import { sound } from '../../utils/sound';
import { BoardCard } from '../../types/board';

interface TrashDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  archivedCards: BoardCard[];
  onRestoreCard: (id: string) => void;
  onEmptyTrash: () => void;
  theme: 'dark' | 'light';
}

export const TrashDrawer: React.FC<TrashDrawerProps> = ({
  isOpen,
  onClose,
  archivedCards,
  onRestoreCard,
  onEmptyTrash,
  theme,
}) => {
  if (!isOpen) return null;

  return (
    <aside
      className={`fixed top-0 left-16 bottom-0 z-30 w-60 flex flex-col justify-between p-4 border-r transition-all duration-200 select-none ${
        theme === 'dark'
          ? 'bg-[#1a1b22] border-[#262833] text-neutral-200'
          : 'bg-[#ffffff] border-[#e2e8f0] text-neutral-800'
      }`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-1.5">
            <Trash2 className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-bold tracking-tight m-0">Lixeira & Arquivados</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            title="Recolher painel"
            className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
        </div>

        {archivedCards.length === 0 ? (
          <div className="p-6 text-center text-neutral-500 space-y-2">
            <Archive className="w-8 h-8 mx-auto opacity-30" />
            <p className="text-xs">A lixeira está vazia.</p>
            <p className="text-[10px] text-neutral-600 leading-tight">
              Cards excluídos ou arquivados aparecerão aqui para restauração.
            </p>
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-180px)] pr-1">
            {archivedCards.map((card) => (
              <div
                key={card.id}
                className="p-2.5 rounded-xl border border-white/5 bg-white/5 flex items-center justify-between gap-2"
              >
                <div className="truncate">
                  <div className="text-xs font-semibold truncate">{card.title || 'Sem título'}</div>
                  <div className="text-[10px] text-neutral-400 uppercase font-mono">{card.type}</div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sound.playConnect();
                    onRestoreCard(card.id);
                  }}
                  title="Restaurar este card no quadro"
                  className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {archivedCards.length > 0 && (
        <button
          type="button"
          onClick={() => {
            sound.playDelete();
            onEmptyTrash();
          }}
          className="w-full py-2 px-3 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors flex items-center justify-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Esvaziar Lixeira</span>
        </button>
      )}
    </aside>
  );
};
