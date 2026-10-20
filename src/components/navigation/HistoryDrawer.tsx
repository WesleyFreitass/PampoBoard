import React from 'react';
import { ChevronsLeft, History, Undo2, Redo2, Clock, CheckCircle } from 'lucide-react';
import { sound } from '../../utils/sound';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  lastSavedTimestamp: number;
  theme: 'dark' | 'light';
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  lastSavedTimestamp,
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
            <History className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold tracking-tight m-0">Histórico de Ações</h2>
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

        {/* Undo / Redo Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2.5 rounded-xl border border-white/5 bg-white/5 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-all text-neutral-300 disabled:cursor-not-allowed"
          >
            <Undo2 className="w-4 h-4" />
            <span>Desfazer</span>
          </button>

          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2.5 rounded-xl border border-white/5 bg-white/5 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-all text-neutral-300 disabled:cursor-not-allowed"
          >
            <Redo2 className="w-4 h-4" />
            <span>Refazer</span>
          </button>
        </div>

        {/* Status */}
        <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Autosave Contínuo Ativo</span>
          </div>
          <div className="text-[10px] text-neutral-400 font-mono">
            Último salvamento: {new Date(lastSavedTimestamp).toLocaleTimeString()}
          </div>
        </div>

        {/* Info list */}
        <div className="space-y-2 text-[11px] text-neutral-400">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            <span>Atalhos rápidos do teclado:</span>
          </div>
          <div className="px-2 space-y-1 font-mono text-[10px] text-neutral-400">
            <div>• <kbd className="text-white">Ctrl + Z</kbd>: Desfazer ação</div>
            <div>• <kbd className="text-white">Ctrl + Y</kbd>: Refazer ação</div>
            <div>• <kbd className="text-white">Ctrl + V</kbd>: Colar print de tela</div>
            <div>• <kbd className="text-white">Espaço + Arraste</kbd>: Pan livre</div>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-neutral-500 font-mono text-center pt-2 border-t border-white/5">
        PampoBoard Session Memory
      </div>
    </aside>
  );
};
