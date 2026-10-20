import React from 'react';
import { BoardCard } from '../../types/board';
import { X, FolderOpen, ArrowLeft, Plus, CheckCircle2, FileText, Sparkles, Box } from 'lucide-react';
import { sound } from '../../utils/sound';

interface SubBoardModalProps {
  card: BoardCard | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SubBoardModal: React.FC<SubBoardModalProps> = ({ card, isOpen, onClose }) => {
  if (!isOpen || !card || card.type !== 'board') return null;

  const boardData = card.boardData;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl h-[80vh] rounded-2xl bg-neutral-900 border border-neutral-700/80 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header Breadcrumbs */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span>Pampo Board Principal</span>
              <span>/</span>
              <span className="text-emerald-400 font-semibold">{card.title}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-board Internal Workspace View */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="border-b border-neutral-800 pb-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-bold text-white m-0">{card.title}</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              {boardData?.description || 'Sub-quadro aninhado para desdobrar fluxos complexos.'}
            </p>
          </div>

          {/* Sub-Board Nested Elements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                <FileText className="w-4 h-4" />
                <span>Briefing Técnico</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Detalhamento dos entregáveis da fase 2.0 e alinhamento de arquitetura.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
                <span>Checklist de Aceite</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Validação de performance em 60fps no canvas infinito e testes de estresse com 50+ cards.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                <Box className="w-4 h-4" />
                <span>Ativos 3D & Modelos</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Arquivos GLTF e geometrias paramétricas prontas para injeção em viewport.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between text-xs text-neutral-500 font-mono">
          <span>Sub-Board sincronizado em tempo real com o Quadro Principal</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
          >
            Voltar ao Canvas Infinito
          </button>
        </div>
      </div>
    </div>
  );
};
