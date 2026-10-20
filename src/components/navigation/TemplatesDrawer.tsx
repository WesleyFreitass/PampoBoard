import React from 'react';
import { ChevronsLeft, Sparkles, Gamepad2, Kanban, Table, Image, Plus } from 'lucide-react';
import { sound } from '../../utils/sound';

interface TemplatesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (templateType: 'gamedev' | 'roadmap' | 'data' | 'moodboard') => void;
  theme: 'dark' | 'light';
}

export const TemplatesDrawer: React.FC<TemplatesDrawerProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  theme,
}) => {
  if (!isOpen) return null;

  const templates = [
    {
      id: 'gamedev' as const,
      title: 'Game Dev & 3D Assets',
      description: 'Notas técnicas, torreta 3D Three.js, áudio waveform e conexões',
      badge: 'Popular',
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400',
    },
    {
      id: 'roadmap' as const,
      title: 'Roadmap & Sprint',
      description: 'Coluna Milanote com tarefas, prazos, tags e tabela de progresso',
      badge: 'Produtivo',
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
    },
    {
      id: 'data' as const,
      title: 'Tabelas & Monitor Web',
      description: 'Tabela de dados dinâmica conectada a monitores de latência online',
      badge: 'Dados',
      color: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/30 text-cyan-400',
    },
    {
      id: 'moodboard' as const,
      title: 'Moodboard & Ideias',
      description: 'Área livre preparada para colar prints (Ctrl+V) e notas visuais',
      badge: 'Visual',
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
    },
  ];

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
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold tracking-tight m-0">Modelos Prontos</h2>
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

        <p className="text-[11px] text-neutral-400 m-0">
          Inicie um novo quadro pré-estruturado com 1 clique:
        </p>

        {/* Template List */}
        <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => {
                sound.playConnect();
                onApplyTemplate(tpl.id);
              }}
              className={`p-3 rounded-xl border bg-gradient-to-br transition-all hover:scale-[1.02] cursor-pointer ${
                tpl.color
              } ${
                theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-neutral-50 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-neutral-200">{tpl.title}</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 uppercase">
                  {tpl.badge}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-snug m-0">
                {tpl.description}
              </p>
              <div className="mt-2.5 flex items-center justify-end text-[10px] font-semibold text-emerald-400">
                <span>Usar modelo →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-[10px] text-neutral-500 font-mono text-center pt-2 border-t border-white/5">
        Pampo Board Templates v2
      </div>
    </aside>
  );
};
