import React from 'react';
import { BoardStore } from '../../stores/useBoardStore';
import {
  LayoutGrid,
  Layers,
  Trash2,
  X,
  Sparkles,
  GitFork,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignEndVertical,
  ArrowLeftRight,
  ArrowDownUp,
} from 'lucide-react';
import { sound } from '../../utils/sound';

interface SelectionBarProps {
  store: BoardStore;
  onOpenExecutiveSummary: () => void;
}

export const SelectionBar: React.FC<SelectionBarProps> = ({
  store,
  onOpenExecutiveSummary,
}) => {
  const {
    selectedCardIds,
    alignSelectedCardsInGrid,
    alignSelectedCards,
    groupSelectedIntoZone,
    deleteCard,
    clearSelection,
  } = store;

  if (selectedCardIds.length < 2) return null;

  const handleDeleteSelected = () => {
    sound.playDelete();
    selectedCardIds.forEach((id) => deleteCard(id));
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-neutral-900/95 backdrop-blur-2xl border border-indigo-500/40 shadow-2xl shadow-indigo-500/20 text-xs flex-wrap justify-center">
        <div className="px-2.5 py-1 flex items-center gap-1.5 text-neutral-300 font-mono text-[11px] border-r border-neutral-700/60">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span>{selectedCardIds.length} selecionados</span>
        </div>

        {/* Alignment Actions Group */}
        <div className="flex items-center gap-0.5 bg-black/40 p-0.5 rounded-xl border border-white/5">
          <button
            type="button"
            title="Alinhar à Esquerda"
            onClick={() => alignSelectedCards('left')}
            className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Alinhar ao Centro Horizontal"
            onClick={() => alignSelectedCards('center-h')}
            className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Alinhar à Direita"
            onClick={() => alignSelectedCards('right')}
            className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3 bg-neutral-700 mx-0.5" />
          <button
            type="button"
            title="Alinhar ao Topo"
            onClick={() => alignSelectedCards('top')}
            className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <AlignStartVertical className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Alinhar à Base"
            onClick={() => alignSelectedCards('bottom')}
            className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <AlignEndVertical className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3 bg-neutral-700 mx-0.5" />
          <button
            type="button"
            title="Distribuir Espaço Horizontalmente"
            onClick={() => alignSelectedCards('distribute-h')}
            className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
          </button>
          <button
            type="button"
            title="Distribuir Espaço Verticalmente"
            onClick={() => alignSelectedCards('distribute-v')}
            className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowDownUp className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>

        {/* Action: Align in Grid */}
        <button
          type="button"
          onClick={alignSelectedCardsInGrid}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-neutral-200 hover:text-white hover:bg-white/10 transition-colors"
          title="Organizar cards em formato de grade retangular"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Grade</span>
        </button>

        {/* Action: Connect Selected Cards */}
        <button
          type="button"
          onClick={() => {
            for (let i = 0; i < selectedCardIds.length - 1; i++) {
              const fromId = selectedCardIds[i];
              const toId = selectedCardIds[i + 1];
              const c1 = store.cards.find((c) => c.id === fromId);
              const c2 = store.cards.find((c) => c.id === toId);
              if (c1 && c2) {
                const fromPort = c1.x <= c2.x ? 'right' : 'left';
                const toPort = c1.x <= c2.x ? 'left' : 'right';
                store.addConnection(fromId, fromPort, toId, toPort, '');
              }
            }
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-cyan-300 hover:text-white hover:bg-cyan-500/20 transition-colors"
          title="Conectar cards selecionados em sequência"
        >
          <GitFork className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Ligar</span>
        </button>

        {/* Action: Group in Zone */}
        <button
          type="button"
          onClick={groupSelectedIntoZone}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-neutral-200 hover:text-white hover:bg-white/10 transition-colors"
          title="Criar uma zona colorida envolvendo os cards"
        >
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Zona</span>
        </button>

        {/* Action: Executive Summary */}
        <button
          type="button"
          onClick={onOpenExecutiveSummary}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:opacity-90 shadow-md shadow-indigo-500/20 transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Resumo</span>
        </button>

        <div className="w-px h-4 bg-neutral-700/60" />

        {/* Delete */}
        <button
          type="button"
          onClick={handleDeleteSelected}
          title="Excluir selecionados"
          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Close */}
        <button
          type="button"
          onClick={clearSelection}
          title="Desmarcar seleção"
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
