import React, { useState } from 'react';
import { BoardStore } from '../../stores/useBoardStore';
import { generateExecutiveSummary } from '../../utils/summaryAi';
import { X, Copy, Check, PlusCircle, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { sound } from '../../utils/sound';

interface SummaryModalProps {
  store: BoardStore;
  isOpen: boolean;
  onClose: () => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({ store, isOpen, onClose }) => {
  const { cards, connections, selectedCardIds, addCard } = store;
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const selectedCards = cards.filter((c) => selectedCardIds.includes(c.id));
  const summary = generateExecutiveSummary(selectedCards, connections);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary.markdownText);
    setCopied(true);
    sound.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateNoteFromSummary = () => {
    sound.playConnect();
    addCard('note', undefined, 'lavender');
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl bg-neutral-900 border border-neutral-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-gradient-to-r from-indigo-950/40 to-neutral-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white m-0">Assistente de Síntese Executiva</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Análise compilada de {selectedCards.length} cartões selecionados
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-neutral-300 text-xs">
          {/* Status Metric Banner */}
          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">
                Status Operacional
              </div>
              <div className="text-sm font-semibold text-neutral-200 mt-0.5">
                {summary.systemStatus}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">
                Total de Blocos
              </div>
              <div className="text-sm font-mono font-bold text-indigo-400 mt-0.5">
                {summary.cardCount} itens
              </div>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono text-[11px]">
              📝 {summary.typesBreakdown.note || 0} Notas
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-[11px]">
              ⚡ {summary.typesBreakdown.live || 0} Cards Vivos
            </span>
            <span className="px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 font-mono text-[11px]">
              📊 {summary.typesBreakdown.table || 0} Tabelas
            </span>
            <span className="px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 font-mono text-[11px]">
              📋 {summary.typesBreakdown.column || 0} Colunas
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-[11px]">
              📁 {summary.typesBreakdown.board || 0} Sub-Boards
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-[11px]">
              🎨 {summary.typesBreakdown.media || 0} Mídias
            </span>
            <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono text-[11px]">
              🌐 {summary.typesBreakdown.link || 0} Monitores
            </span>
          </div>

          {/* Key Findings */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">
              Principais Observações
            </h3>
            <div className="bg-neutral-950/50 p-3 rounded-xl border border-neutral-800 space-y-1.5">
              {summary.keyFindings.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-neutral-300">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">
              Próximos Passos
            </h3>
            <div className="bg-neutral-950/50 p-3 rounded-xl border border-neutral-800 space-y-1.5">
              {summary.actionItems.length > 0 ? (
                summary.actionItems.map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-neutral-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{a}</span>
                  </div>
                ))
              ) : (
                <div className="text-emerald-400">Todos os requisitos selecionados foram concluídos!</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-neutral-950/50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado para a Área de Transferência!' : 'Copiar Markdown'}</span>
          </button>

          <button
            type="button"
            onClick={handleCreateNoteFromSummary}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-lg shadow-indigo-600/30"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Inserir como Card de Nota</span>
          </button>
        </div>
      </div>
    </div>
  );
};
