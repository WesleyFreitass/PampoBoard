import React from 'react';
import { BoardStore } from '../../stores/useBoardStore';
import {
  MousePointer,
  Hand,
  StickyNote,
  CheckSquare,
  Zap,
  Box,
  Globe,
  Layers,
  Magnet,
  Volume2,
  VolumeX,
  Table as TableIcon,
  Columns3,
  FolderOpen,
} from 'lucide-react';
import { sound } from '../../utils/sound';

interface FloatingDockProps {
  store: BoardStore;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({ store }) => {
  const {
    activeTool,
    setActiveTool,
    isSnappingEnabled,
    setIsSnappingEnabled,
    addCard,
    addZone,
  } = store;

  const [soundEnabled, setSoundEnabled] = React.useState(sound.enabled);

  const toggleSound = () => {
    sound.enabled = !sound.enabled;
    setSoundEnabled(sound.enabled);
    sound.playClick();
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3">
      {/* Floating Toolbar Dock */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-neutral-900/90 dark:bg-neutral-900/90 backdrop-blur-2xl border border-neutral-700/80 shadow-2xl shadow-black/60">
        {/* Navigation Tools */}
        <div className="flex items-center gap-1 pr-1.5 border-r border-neutral-700/60">
          <button
            type="button"
            title="Ferramenta Seleção (V)"
            onClick={() => {
              setActiveTool('select');
              sound.playClick();
            }}
            className={`p-2 rounded-xl transition-all ${
              activeTool === 'select'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <MousePointer className="w-4 h-4" />
          </button>

          <button
            type="button"
            title="Ferramenta Navegar / Mão (H ou Barra de Espaço)"
            onClick={() => {
              setActiveTool('pan');
              sound.playClick();
            }}
            className={`p-2 rounded-xl transition-all ${
              activeTool === 'pan'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Hand className="w-4 h-4" />
          </button>
        </div>

        {/* Card Creation Shortcuts */}
        <div className="flex items-center gap-1 px-1">
          <button
            type="button"
            onClick={() => addCard('note')}
            title="Criar Nota de Texto (N)"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          >
            <StickyNote className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Nota</span>
          </button>

          <button
            type="button"
            onClick={() => addCard('checklist')}
            title="Criar Lista de Tarefas / Checklist (C)"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-emerald-500/15 transition-all active:scale-95"
          >
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Checklist</span>
          </button>

          <button
            type="button"
            onClick={() => addCard('live')}
            title="Criar Card Vivo Reativo (L)"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-amber-500/15 transition-all active:scale-95"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Card Vivo</span>
          </button>

          <button
            type="button"
            onClick={() => addCard('media')}
            title="Criar Card de Mídia 3D & Áudio (M)"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-emerald-500/15 transition-all active:scale-95"
          >
            <Box className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Mídia / 3D</span>
          </button>

          <button
            type="button"
            onClick={() => addCard('link')}
            title="Criar Smart Link & Monitor Web (U)"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-cyan-500/15 transition-all active:scale-95"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Link Monitor</span>
          </button>

          <button
            type="button"
            onClick={() => addCard('table')}
            title="Criar Tabela Dinâmica com Colunas Editáveis"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-slate-500/15 transition-all active:scale-95"
          >
            <TableIcon className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Tabela</span>
          </button>

          <button
            type="button"
            onClick={() => addCard('column')}
            title="Criar Coluna / Pilha de Itens Estilo Milanote"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-purple-500/15 transition-all active:scale-95"
          >
            <Columns3 className="w-4 h-4 text-pink-400" />
            <span className="hidden sm:inline">Coluna</span>
          </button>

          <button
            type="button"
            onClick={() => addCard('board')}
            title="Criar Sub-Quadro de Projeto / Pasta Aninhada"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-emerald-500/15 transition-all active:scale-95"
          >
            <FolderOpen className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Board</span>
          </button>

          <button
            type="button"
            onClick={() => addZone()}
            title="Criar Zona Delimitadora (Z)"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-purple-500/15 transition-all active:scale-95"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Zona</span>
          </button>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-1 pl-1.5 border-l border-neutral-700/60">
          <button
            type="button"
            title={`Alinhamento Magnético (Snapping): ${isSnappingEnabled ? 'Ativado' : 'Desativado'}`}
            onClick={() => {
              setIsSnappingEnabled(!isSnappingEnabled);
              sound.playClick();
            }}
            className={`p-2 rounded-xl transition-all ${
              isSnappingEnabled
                ? 'bg-neutral-800 text-indigo-400'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Magnet className="w-4 h-4" />
          </button>

          <button
            type="button"
            title={`Áudio e Feedback Tátil: ${soundEnabled ? 'Ativado' : 'Silenciado'}`}
            onClick={toggleSound}
            className={`p-2 rounded-xl transition-all ${
              soundEnabled
                ? 'text-neutral-300 hover:text-white'
                : 'text-neutral-600 hover:text-neutral-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
