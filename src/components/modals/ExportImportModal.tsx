import React, { useState } from 'react';
import { BoardStore } from '../../stores/useBoardStore';
import { X, Download, Upload, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { sound } from '../../utils/sound';

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
              Baixe um arquivo JSON contendo todos os cartões, coordenadas do canvas, conexões ativas e zonas delimitadoras.
            </p>
            <button
              type="button"
              onClick={handleExport}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center justify-center gap-2 transition-colors shadow-md shadow-indigo-600/30"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Arquivo JSON</span>
            </button>
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
