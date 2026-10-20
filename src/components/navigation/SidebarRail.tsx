import React from 'react';
import {
  LayoutGrid,
  BookOpen,
  Settings,
  Trash2,
  History,
  Moon,
  Sun,
  Palette,
} from 'lucide-react';
import { sound } from '../../utils/sound';

interface SidebarRailProps {
  activeTab: 'boards' | 'templates' | 'settings' | 'trash' | 'history';
  onSelectTab: (tab: 'boards' | 'templates' | 'settings' | 'trash' | 'history') => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
}

export const SidebarRail: React.FC<SidebarRailProps> = ({
  activeTab,
  onSelectTab,
  theme,
  onToggleTheme,
  isDrawerOpen,
  onToggleDrawer,
}) => {
  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 w-16 flex flex-col items-center justify-between py-3.5 border-r transition-colors select-none ${
        theme === 'dark'
          ? 'bg-[#15161b] border-[#262833]'
          : 'bg-[#ffffff] border-[#e2e8f0]'
      }`}
    >
      {/* Top: Pampo Brand Mark Logo */}
      <div className="flex flex-col items-center gap-5">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onToggleDrawer();
          }}
          title="Pampo Board — Alternar Painel"
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center shadow-md shadow-emerald-500/20 hover:scale-105 transition-transform"
        >
          <span className="font-black text-lg text-black tracking-tighter">P</span>
        </button>

        {/* Navigation Action Icons */}
        <nav className="flex flex-col items-center gap-2">
          {/* Quadros (Boards) */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onSelectTab('boards');
              if (!isDrawerOpen) onToggleDrawer();
            }}
            title="Quadros / Projetos"
            className={`flex flex-col items-center justify-center w-12 py-2 rounded-xl text-[10px] font-medium transition-all ${
              activeTab === 'boards'
                ? theme === 'dark'
                  ? 'bg-blue-600/25 text-blue-400 border border-blue-500/30 font-semibold'
                  : 'bg-blue-50 text-blue-600 border border-blue-200 font-semibold'
                : theme === 'dark'
                ? 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100'
            }`}
          >
            <LayoutGrid className="w-4 h-4 mb-0.5" />
            <span>Quadros</span>
          </button>

          {/* Modelos (Templates) */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onSelectTab('templates');
            }}
            title="Modelos & Templates"
            className={`flex flex-col items-center justify-center w-12 py-2 rounded-xl text-[10px] font-medium transition-all ${
              activeTab === 'templates'
                ? theme === 'dark'
                  ? 'bg-purple-600/25 text-purple-400 border border-purple-500/30'
                  : 'bg-purple-50 text-purple-600 border border-purple-200'
                : theme === 'dark'
                ? 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100'
            }`}
          >
            <BookOpen className="w-4 h-4 mb-0.5" />
            <span>Modelos</span>
          </button>

          {/* Configurações */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onSelectTab('settings');
            }}
            title="Configurações"
            className={`flex flex-col items-center justify-center w-12 py-2 rounded-xl text-[10px] font-medium transition-all ${
              activeTab === 'settings'
                ? theme === 'dark'
                  ? 'bg-indigo-600/25 text-indigo-400 border border-indigo-500/30'
                  : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                : theme === 'dark'
                ? 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100'
            }`}
          >
            <Settings className="w-4 h-4 mb-0.5" />
            <span>Configura.</span>
          </button>

          {/* Desodors / Lixeira */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onSelectTab('trash');
            }}
            title="Lixeira / Arquivados"
            className={`flex flex-col items-center justify-center w-12 py-2 rounded-xl text-[10px] font-medium transition-all ${
              activeTab === 'trash'
                ? theme === 'dark'
                  ? 'bg-rose-600/25 text-rose-400 border border-rose-500/30'
                  : 'bg-rose-50 text-rose-600 border border-rose-200'
                : theme === 'dark'
                ? 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100'
            }`}
          >
            <Trash2 className="w-4 h-4 mb-0.5" />
            <span>Desodors</span>
          </button>

          {/* Histórico */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onSelectTab('history');
            }}
            title="Histórico de Alterações"
            className={`flex flex-col items-center justify-center w-12 py-2 rounded-xl text-[10px] font-medium transition-all ${
              activeTab === 'history'
                ? theme === 'dark'
                  ? 'bg-amber-600/25 text-amber-400 border border-amber-500/30'
                  : 'bg-amber-50 text-amber-600 border border-amber-200'
                : theme === 'dark'
                ? 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100'
            }`}
          >
            <History className="w-4 h-4 mb-0.5" />
            <span>Histórico</span>
          </button>
        </nav>
      </div>

      {/* Bottom: Theme Switcher & User Profile Avatar */}
      <div className="flex flex-col items-center gap-3">
        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onToggleTheme();
          }}
          title={theme === 'dark' ? 'Mudar para Bright Creator Mode' : 'Mudar para Tactical Heavy Dark'}
          className={`p-2.5 rounded-xl transition-all ${
            theme === 'dark'
              ? 'text-neutral-400 hover:text-white hover:bg-white/10'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {/* Profile Avatar "P" */}
        <div
          title="Wesley (Usuário Ativo)"
          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs cursor-pointer shadow-md ${
            theme === 'dark'
              ? 'bg-neutral-800 text-neutral-200 border border-neutral-700'
              : 'bg-neutral-200 text-neutral-800 border border-neutral-300'
          }`}
        >
          <span>P</span>
        </div>
      </div>
    </aside>
  );
};
