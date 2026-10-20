import React from 'react';
import { BoardStore } from '../../stores/useBoardStore';
import { ArrowLeft, GitBranch, ArrowRight, Zap, Box, Globe, StickyNote, Play, Table as TableIcon, Columns3, FolderOpen } from 'lucide-react';
import { sound } from '../../utils/sound';

interface GraphViewProps {
  store: BoardStore;
}

export const GraphView: React.FC<GraphViewProps> = ({ store }) => {
  const { cards, connections, setViewMode, focusCard, triggerPulse } = store;

  // Build dependency adjacency map
  const cardMap = new Map(cards.map((c) => [c.id, c]));

  // Find root nodes (nodes with 0 incoming connections)
  const incomingCount = new Map<string, number>();
  cards.forEach((c) => incomingCount.set(c.id, 0));
  connections.forEach((conn) => {
    incomingCount.set(conn.toCardId, (incomingCount.get(conn.toCardId) || 0) + 1);
  });

  const roots = cards.filter((c) => (incomingCount.get(c.id) || 0) === 0);

  const handleCardClick = (cardId: string) => {
    setViewMode('free');
    setTimeout(() => {
      focusCard(cardId);
    }, 100);
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
            <h2 className="text-lg font-bold text-white m-0">Árvore de Dependências e Grafo Reativo</h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Visualização hierárquica calculada a partir de {connections.length} conexões e condutores de ação.
          </p>
        </div>
      </div>

      {/* Graph Visual Pipeline */}
      <div className="max-w-6xl mx-auto pt-8 space-y-8">
        {/* Render each connection as a pipeline link */}
        <div className="bg-neutral-900/60 p-6 rounded-2xl border border-neutral-800 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">
            Fluxos de Execução & Condutores Detectados
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connections.map((conn) => {
              const fromCard = cardMap.get(conn.fromCardId);
              const toCard = cardMap.get(conn.toCardId);
              if (!fromCard || !toCard) return null;

              return (
                <div
                  key={conn.id}
                  className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between hover:border-purple-500/50 transition-all"
                >
                  {/* Source Node */}
                  <div
                    onClick={() => handleCardClick(fromCard.id)}
                    className="flex-1 p-2 rounded-lg bg-neutral-950/80 border border-neutral-800 hover:border-indigo-500/60 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {fromCard.type === 'live' && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                      {fromCard.type === 'note' && <StickyNote className="w-3.5 h-3.5 text-purple-400" />}
                      {fromCard.type === 'media' && <Box className="w-3.5 h-3.5 text-emerald-400" />}
                      {fromCard.type === 'link' && <Globe className="w-3.5 h-3.5 text-cyan-400" />}
                      {fromCard.type === 'table' && <TableIcon className="w-3.5 h-3.5 text-sky-400" />}
                      {fromCard.type === 'column' && <Columns3 className="w-3.5 h-3.5 text-pink-400" />}
                      {fromCard.type === 'board' && <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />}
                      <span className="text-xs font-semibold text-neutral-200 truncate max-w-[120px]">
                        {fromCard.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500">
                      Porta: {conn.fromPort}
                    </span>
                  </div>

                  {/* Wire Intent Badge */}
                  <div className="flex flex-col items-center px-3 text-center">
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/40 mb-1">
                      {conn.label || 'Fluxo'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-purple-400 animate-pulse" />
                  </div>

                  {/* Target Node */}
                  <div
                    onClick={() => handleCardClick(toCard.id)}
                    className="flex-1 p-2 rounded-lg bg-neutral-950/80 border border-neutral-800 hover:border-indigo-500/60 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {toCard.type === 'live' && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                      {toCard.type === 'note' && <StickyNote className="w-3.5 h-3.5 text-purple-400" />}
                      {toCard.type === 'media' && <Box className="w-3.5 h-3.5 text-emerald-400" />}
                      {toCard.type === 'link' && <Globe className="w-3.5 h-3.5 text-cyan-400" />}
                      {toCard.type === 'table' && <TableIcon className="w-3.5 h-3.5 text-sky-400" />}
                      {toCard.type === 'column' && <Columns3 className="w-3.5 h-3.5 text-pink-400" />}
                      {toCard.type === 'board' && <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />}
                      <span className="text-xs font-semibold text-neutral-200 truncate max-w-[120px]">
                        {toCard.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500">
                      Porta: {conn.toPort}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {connections.length === 0 && (
            <div className="text-center py-8 text-xs text-neutral-500">
              Nenhuma conexão desenhada ainda. Arraste fios entre as portas magnéticas dos cards no Canvas Livre.
            </div>
          )}
        </div>

        {/* Root Triggers */}
        <div className="bg-neutral-900/60 p-6 rounded-2xl border border-neutral-800">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono mb-4">
            Nós de Entrada Primários (Gatilhos Raiz)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {roots.map((r) => (
              <div
                key={r.id}
                className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-white">{r.title}</div>
                  <div className="text-[10px] text-neutral-400 font-mono">Tipo: {r.type}</div>
                </div>
                {r.type === 'live' && (
                  <button
                    type="button"
                    onClick={() => triggerPulse(r.id)}
                    className="p-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs flex items-center gap-1 transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Disparar</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
