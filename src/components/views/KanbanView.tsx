import React from 'react';
import { BoardStore } from '../../stores/useBoardStore';
import { BoardCard } from '../../types/board';
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, Plus, Zap, Box, Globe, StickyNote, Table as TableIcon, Columns3, FolderOpen } from 'lucide-react';
import { sound } from '../../utils/sound';

interface KanbanViewProps {
  store: BoardStore;
}

export const KanbanView: React.FC<KanbanViewProps> = ({ store }) => {
  const { cards, updateCard, setViewMode, focusCard } = store;

  const columns: { id: 'backlog' | 'in_progress' | 'done'; title: string; color: string; icon: React.ReactNode }[] = [
    {
      id: 'backlog',
      title: 'A Fazer (Backlog)',
      color: 'border-slate-500/40 text-slate-300',
      icon: <Clock className="w-4 h-4 text-slate-400" />,
    },
    {
      id: 'in_progress',
      title: 'Em Andamento (Ativo)',
      color: 'border-amber-500/40 text-amber-300',
      icon: <AlertCircle className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'done',
      title: 'Concluído (Entregue)',
      color: 'border-emerald-500/40 text-emerald-300',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    },
  ];

  const handleCardClick = (cardId: string) => {
    setViewMode('free');
    setTimeout(() => {
      focusCard(cardId);
    }, 100);
  };

  const handleMoveStatus = (cardId: string, nextStatus: 'backlog' | 'in_progress' | 'done') => {
    sound.playClick();
    updateCard(cardId, { status: nextStatus });
  };

  return (
    <div className="absolute inset-0 z-30 pt-20 px-8 pb-8 bg-neutral-950/95 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="max-w-6xl mx-auto flex items-center justify-between pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setViewMode('free');
                sound.playClick();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-xs transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Canvas Livre</span>
            </button>
            <h2 className="text-lg font-bold text-white m-0">Modo Kanban Dinâmico</h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Organização por colunas de status. Clique em qualquer card para focar a câmera nele no canvas.
          </p>
        </div>
      </div>

      {/* 3 Kanban Columns */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        {columns.map((col) => {
          const colCards = cards.filter((c) => (c.status || 'in_progress') === col.id);

          return (
            <div
              key={col.id}
              className="flex flex-col bg-neutral-900/60 rounded-2xl border border-neutral-800/80 p-4 min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800/60 mb-3">
                <div className="flex items-center gap-2">
                  {col.icon}
                  <span className="font-semibold text-xs text-neutral-200">{col.title}</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
                  {colCards.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colCards.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-indigo-500/60 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        {card.type === 'note' && <StickyNote className="w-3.5 h-3.5 text-purple-400" />}
                        {card.type === 'live' && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                        {card.type === 'media' && <Box className="w-3.5 h-3.5 text-emerald-400" />}
                        {card.type === 'link' && <Globe className="w-3.5 h-3.5 text-cyan-400" />}
                        {card.type === 'table' && <TableIcon className="w-3.5 h-3.5 text-sky-400" />}
                        {card.type === 'column' && <Columns3 className="w-3.5 h-3.5 text-pink-400" />}
                        {card.type === 'board' && <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />}
                        <span className="text-xs font-semibold text-neutral-200 truncate max-w-[170px]">
                          {card.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase">
                        {card.type}
                      </span>
                    </div>

                    {/* Preview details */}
                    {card.type === 'note' && card.noteData && (
                      <p className="text-[11px] text-neutral-400 line-clamp-2">
                        {card.noteData.body || 'Sem conteúdo de texto'}
                      </p>
                    )}

                    {card.type === 'table' && card.tableData && (
                      <div className="text-[11px] font-mono text-sky-300">
                        {card.tableData.rows.length} registros • {card.tableData.columns.length} colunas
                      </div>
                    )}

                    {card.type === 'column' && card.columnData && (
                      <div className="text-[11px] font-mono text-pink-300">
                        {card.columnData.items.length} itens empilhados
                      </div>
                    )}

                    {card.type === 'board' && card.boardData && (
                      <div className="text-[11px] font-mono text-emerald-300">
                        Sub-Board • {card.boardData.itemCount} itens internos
                      </div>
                    )}

                    {card.type === 'live' && card.liveData && (
                      <div className="text-[11px] font-mono text-amber-300">
                        Valor: {card.liveData.value} {card.liveData.unit || ''} • Modo: {card.liveData.mode}
                      </div>
                    )}

                    {card.type === 'link' && card.linkData && (
                      <div className="text-[11px] font-mono text-cyan-300">
                        Latência: {card.linkData.latencyMs}ms • {card.linkData.status}
                      </div>
                    )}

                    {/* Move to other column actions */}
                    <div className="mt-3 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[10px] text-neutral-500">
                      <span>Mover para:</span>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {col.id !== 'backlog' && (
                          <button
                            type="button"
                            onClick={() => handleMoveStatus(card.id, 'backlog')}
                            className="px-1.5 py-0.5 rounded bg-neutral-800 hover:text-white"
                          >
                            Backlog
                          </button>
                        )}
                        {col.id !== 'in_progress' && (
                          <button
                            type="button"
                            onClick={() => handleMoveStatus(card.id, 'in_progress')}
                            className="px-1.5 py-0.5 rounded bg-neutral-800 hover:text-white"
                          >
                            Em Andamento
                          </button>
                        )}
                        {col.id !== 'done' && (
                          <button
                            type="button"
                            onClick={() => handleMoveStatus(card.id, 'done')}
                            className="px-1.5 py-0.5 rounded bg-neutral-800 hover:text-white"
                          >
                            Concluído
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {colCards.length === 0 && (
                  <div className="text-center py-12 text-xs text-neutral-600">
                    Nenhum card nesta etapa.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
