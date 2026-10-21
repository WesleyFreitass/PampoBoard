import React, { useState } from 'react';
import { BoardStore } from '../../stores/useBoardStore';
import { X, Download, Upload, RotateCcw, Check, AlertCircle, Camera } from 'lucide-react';
import { sound } from '../../utils/sound';
import { exportBoardAsPng } from '../../utils/exportImage';

interface ExportImportModalProps {
  store: BoardStore;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  store,
  isOpen,
  onClose,
}) => {
  const { exportBoard, importBoard, resetToDefault, cards, connections, zones } = store;
  const [importJsonText, setImportJsonText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    sound.playClick();
    exportBoard();
    setSuccessMsg('Arquivo JSON baixado com sucesso!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleExportPng = () => {
    sound.playClick();
    const activeWs = store.workspaces.find((w) => w.id === store.activeWorkspaceId);
    exportBoardAsPng({
      workspaceTitle: activeWs?.title || 'Quadro',
      cards: store.currentCards,
      connections: store.currentConnections,
      zones: store.currentZones,
      drawings: store.currentDrawings || [],
    });
    setSuccessMsg('Imagem PNG exportada com sucesso!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleImport = () => {
    if (!importJsonText.trim()) {
      setErrorMsg('Cole o código JSON do quadro para importar.');
      return;
    }
    const success = importBoard(importJsonText);
    if (success) {
      setSuccessMsg('Quadro importado com sucesso!');
      setErrorMsg(null);
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setErrorMsg('Estrutura de JSON inválida. Certifique-se de que é um backup do Pampo Board.');
    }
  };

  const handleReset = () => {
    if (confirm('Tem certeza de que deseja restaurar o quadro de demonstração padrão?')) {
      resetToDefault();
      onClose();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h2 className="text-sm font-bold text-white m-0">Gerenciador de Dados do Quadro</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs text-neutral-300">
          {/* Status info */}
          <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800 flex items-center justify-between text-neutral-400 font-mono text-[11px]">
            <span>Estado atual:</span>
            <span>{cards.length} cards • {connections.length} conexões • {zones.length} zonas</span>
          </div>

          {/* Export section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-neutral-200">Exportar Backup</h3>
            <p className="text-neutral-400 text-[11px]">
              Baixe um arquivo JSON com todas as coordenadas e dados do quadro, ou gere uma imagem PNG em alta definição.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleExport}
                className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium flex items-center justify-center gap-2 transition-colors border border-neutral-700"
              >
                <Download className="w-4 h-4 text-sky-400" />
                <span>Backup JSON</span>
              </button>
              <button
                type="button"
                onClick={handleExportPng}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-600/25"
              >
                <Camera className="w-4 h-4" />
                <span>Salvar Imagem PNG</span>
              </button>
            </div>
          </div>

          {/* Import section */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <h3 className="font-semibold text-neutral-200">Importar Quadro</h3>
            <textarea
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Cole aqui o conteúdo JSON do backup..."
              rows={4}
              className="w-full bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 text-[11px] font-mono text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-indigo-500"
            />
            {errorMsg && (
              <div className="text-rose-400 flex items-center gap-1.5 text-[11px]">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="text-emerald-400 flex items-center gap-1.5 text-[11px]">
                <Check className="w-3.5 h-3.5" />
                <span>{successMsg}</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleImport}
              className="w-full py-2 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Restaurar via JSON</span>
            </button>
          </div>

          {/* Reset section */}
          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
            <span className="text-neutral-400 text-[11px]">Deseja recomeçar?</span>
            <button
              type="button"
              onClick={handleReset}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px] font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restaurar Demo Padrão</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
