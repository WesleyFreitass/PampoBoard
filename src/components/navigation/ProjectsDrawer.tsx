import React, { useState } from 'react';
import { BoardWorkspace } from '../../types/board';
import {
  ChevronsLeft,
  LayoutGrid,
  ListTodo,
  Map,
  Archive,
  Plus,
  Trash2,
  FolderOpen,
} from 'lucide-react';
import { sound } from '../../utils/sound';

interface ProjectsDrawerProps {
  workspaces: BoardWorkspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  onCreateWorkspace: (title: string, color?: string) => void;
  onDeleteWorkspace: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  theme: 'dark' | 'light';
  cardsCount?: number;
  connectionsCount?: number;
}

export const ProjectsDrawer: React.FC<ProjectsDrawerProps> = ({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
  onDeleteWorkspace,
  isOpen,
  onToggle,
  theme,
  cardsCount = 0,
  connectionsCount = 0,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    onCreateWorkspace(newTitle.trim());
    setNewTitle('');
    setIsCreating(false);
  };

  const getWorkspaceIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('tower') || t.includes('jogo') || t.includes('game')) {
      return <LayoutGrid className="w-4 h-4 text-blue-500" />;
    }
    if (t.includes('backlog')) {
      return <ListTodo className="w-4 h-4 text-indigo-400" />;
    }
    if (t.includes('roadmap')) {
      return <Map className="w-4 h-4 text-cyan-400" />;
    }
    if (t.includes('arquivo') || t.includes('archive')) {
      return <Archive className="w-4 h-4 text-neutral-400" />;
    }
    return <FolderOpen className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <aside
      className={`fixed top-0 left-16 bottom-0 z-30 w-56 flex flex-col justify-between p-4 border-r transition-all duration-200 select-none ${
        theme === 'dark'
          ? 'bg-[#1a1b22] border-[#262833] text-neutral-200'
          : 'bg-[#ffffff] border-[#e2e8f0] text-neutral-800'
      }`}
    >
      <div className="space-y-5">
        {/* Header: Pampo Board Title & Collapse Icon << */}
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <h2 className="text-sm font-bold tracking-tight m-0 flex items-center gap-1.5">
            <span>Pampo Board</span>
          </h2>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onToggle();
            }}
            title="Recolher painel lateral (<<)"
            className={`p-1 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'text-neutral-400 hover:text-white hover:bg-white/10'
                : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Section: Projetos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
            <span>Projetos</span>
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              title="Adicionar novo projeto"
              className={`p-0.5 rounded transition-colors ${
                theme === 'dark'
                  ? 'hover:text-white hover:bg-white/10'
                  : 'hover:text-black hover:bg-neutral-100'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* List of projects */}
          <div className="space-y-1">
            {workspaces.map((ws) => {
              const isActive = ws.id === activeWorkspaceId;

              return (
                <div
                  key={ws.id}
                  onClick={() => {
                    sound.playClick();
                    onSelectWorkspace(ws.id);
                  }}
                  className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                    isActive
                      ? theme === 'dark'
                        ? 'bg-[#252836] text-white shadow-sm font-semibold border border-blue-500/30'
                        : 'bg-blue-100/70 text-blue-900 shadow-sm font-semibold border border-blue-200'
                      : theme === 'dark'
                      ? 'text-neutral-300 hover:bg-white/5 hover:text-white'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {getWorkspaceIcon(ws.title)}
                    <span className="truncate">{ws.title}</span>
                  </div>

                  {workspaces.length > 1 && !isActive && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteWorkspace(ws.id);
                      }}
                      title="Excluir projeto"
                      className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-400 p-0.5 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* New project inline input */}
          {isCreating && (
            <div
              className={`p-2 rounded-xl border space-y-2 mt-2 ${
                theme === 'dark'
                  ? 'bg-neutral-900 border-neutral-700'
                  : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <input
                type="text"
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') setIsCreating(false);
                }}
                placeholder="Nome do projeto..."
                className={`w-full text-xs px-2 py-1.5 rounded-lg border outline-none ${
                  theme === 'dark'
                    ? 'bg-neutral-950 border-neutral-700 text-white focus:border-blue-500'
                    : 'bg-white border-neutral-300 text-black focus:border-blue-500'
                }`}
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-2 py-1 text-[11px] text-neutral-400 hover:text-neutral-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  className="px-2.5 py-1 text-[11px] bg-blue-600 hover:bg-blue-500 text-white rounded-md font-medium"
                >
                  Criar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer stats: Quantidade de itens no rodapé da barra lateral */}
      <div className="pt-3 border-t border-white/10 flex flex-col gap-1.5 text-[11px] font-mono select-none">
        <div className="flex items-center justify-between text-neutral-300">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400">Total de itens:</span>
          <span className="px-2 py-0.5 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30 font-bold text-xs">
            {cardsCount} {cardsCount === 1 ? 'item' : 'itens'}
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-0.5 border-t border-white/5">
          <span>{connectionsCount} {connectionsCount === 1 ? 'ligação' : 'ligações'}</span>
          <span>•</span>
          <span>{workspaces.length} {workspaces.length === 1 ? 'projeto' : 'projetos'}</span>
        </div>
      </div>
    </aside>
  );
};
