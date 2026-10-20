import React from 'react';
import { BoardStore } from '../../stores/useBoardStore';
import {
  LayoutDashboard,
  Kanban,
  GitBranch,
  Search,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Folder,
  Share2,
  LogIn,
} from 'lucide-react';
import { sound } from '../../utils/sound';

interface TopHeaderProps {
  store: BoardStore;
  onOpenCommandPalette: () => void;
  onOpenExportImport: () => void;
  onOpenShare?: () => void;
  onOpenAuth?: () => void;
  leftOffset?: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  store,
  onOpenCommandPalette,
  onOpenExportImport,
  onOpenShare,
  onOpenAuth,
  leftOffset = 248,
}) => {
  const {
    viewMode,
    setViewMode,
    cards,
    connections,
    viewport,
    theme,
    setTheme,
    undo,
    redo,
    canUndo,
    canRedo,
    zoomAt,
    resetZoom,
    zoomToFit,
    resetToDefault,
  } = store;

  const liveCardsCount = cards.filter((c) => c.type === 'live').length;

  return (
    <header
      style={{ left: `${leftOffset}px` }}
      className="fixed top-3.5 right-4 z-20 flex items-center justify-between pointer-events-none transition-[left] duration-200"
    >
      {/* Brand & Sub-Board Section */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Nested Sub-Board Breadcrumbs Trail */}
        {store.boardBreadcrumbs.length > 1 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-950/80 backdrop-blur-xl border border-emerald-500/50 shadow-xl text-xs">
            <button
              type="button"
              onClick={() => store.navigateUp()}
              title="Voltar ao nível anterior"
              className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1 text-[11px] font-mono">
              {store.boardBreadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.id}>
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-emerald-400/60" />}
                  <button
                    type="button"
                    onClick={() => store.navigateToBreadcrumb(idx)}
                    className={`px-1.5 py-0.5 rounded transition-colors ${
                      idx === store.boardBreadcrumbs.length - 1
                        ? 'font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30'
                        : 'text-neutral-400 hover:text-white hover:underline'
                    }`}
                  >
                    {crumb.title}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* View Mode 1-Click Switcher */}
        <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 shadow-xl">
          <button
            type="button"
            onClick={() => {
              setViewMode('free');
              sound.playClick();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'free'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Canvas Livre</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setViewMode('kanban');
              sound.playClick();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'kanban'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Modo Kanban</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setViewMode('graph');
              sound.playClick();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'graph'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Modo Grafo</span>
          </button>
        </div>
      </div>

      {/* Right Action Tools: Search, Zoom, History, Theme */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Quick Search Ctrl+K Button */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 shadow-xl transition-all"
        >
          <Search className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-xs hidden sm:inline">Buscar...</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
            ⌘K
          </kbd>
        </button>

        {/* Undo / Redo */}
        <div className="hidden sm:flex items-center gap-0.5 p-1 rounded-xl bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 shadow-xl">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            title="Desfazer (Ctrl+Z)"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            title="Refazer (Ctrl+Y)"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 shadow-xl">
          <button
            type="button"
            onClick={() => zoomAt(window.innerWidth / 2, window.innerHeight / 2, 100)}
            title="Diminuir Zoom"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={resetZoom}
            title="Redefinir Zoom para 100%"
            className="px-1.5 py-1 text-[11px] font-mono text-neutral-300 hover:text-white"
          >
            {Math.round(viewport.zoom * 100)}%
          </button>

          <button
            type="button"
            onClick={() => zoomAt(window.innerWidth / 2, window.innerHeight / 2, -100)}
            title="Aumentar Zoom"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-3 bg-neutral-700" />

          <button
            type="button"
            onClick={zoomToFit}
            title="Ajustar à Tela (Fit to Screen)"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Buttons: Guest Login & Share */}
        {(!store.user || onOpenShare) && (
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 shadow-xl">
            {!store.user && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  if (onOpenAuth) onOpenAuth();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25 rounded-lg border border-emerald-500/30 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Entrar / Salvar</span>
              </button>
            )}

            {/* Share Button */}
            {onOpenShare && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onOpenShare();
                }}
                title="Compartilhar link somente-leitura deste quadro"
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Compartilhar</span>
              </button>
            )}
          </div>
        )}

        {/* Board Options */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 shadow-xl">
          <button
            type="button"
            onClick={onOpenExportImport}
            title="Exportar ou Importar Quadro JSON"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={resetToDefault}
            title="Restaurar Demonstração Inicial"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
