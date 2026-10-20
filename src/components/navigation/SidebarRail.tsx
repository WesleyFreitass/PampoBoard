import React, { useState } from 'react';
import {
  LayoutGrid,
  BookOpen,
  Settings,
  Trash2,
  History,
  Moon,
  Sun,
  Palette,
  LogIn,
  LogOut,
  User as UserIcon,
  Camera,
} from 'lucide-react';
import { sound } from '../../utils/sound';
import { AuthUser } from '../../services/api';

interface SidebarRailProps {
  activeTab: 'boards' | 'templates' | 'settings' | 'trash' | 'history';
  onSelectTab: (tab: 'boards' | 'templates' | 'settings' | 'trash' | 'history') => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
  user: AuthUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenProfile?: () => void;
}

export const SidebarRail: React.FC<SidebarRailProps> = ({
  activeTab,
  onSelectTab,
  theme,
  onToggleTheme,
  isDrawerOpen,
  onToggleDrawer,
  user,
  onOpenAuth,
  onLogout,
  onOpenProfile,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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
            <span>Ajustes</span>
          </button>

          {/* Lixeira / Descarte */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onSelectTab('trash');
              if (!isDrawerOpen) onToggleDrawer();
            }}
            title="Lixeira e Itens Arquivados"
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
            <span>Lixeira</span>
          </button>

          {/* Histórico */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onSelectTab('history');
              if (!isDrawerOpen) onToggleDrawer();
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

        {/* Profile Avatar / Login Button */}
        <div className="relative">
          {user ? (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowProfileMenu((prev) => !prev);
              }}
              title={`${user.name} (${user.email}) — Clique para opções`}
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs cursor-pointer shadow-md transition-transform hover:scale-105 overflow-hidden ${
                theme === 'dark'
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-black border border-emerald-400/40'
                  : 'bg-emerald-500 text-white border border-emerald-600'
              }`}
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span>{user.name.charAt(0).toUpperCase()}</span>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenAuth();
              }}
              title="Fazer Login / Criar Conta no PampoBoard"
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs cursor-pointer shadow-md bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 transition-all hover:scale-105"
            >
              <LogIn className="w-4 h-4" />
            </button>
          )}

          {/* Profile Dropdown Menu */}
          {showProfileMenu && user && (
            <div
              className={`absolute bottom-0 left-12 z-50 w-52 rounded-xl p-3 shadow-2xl border backdrop-blur-xl animate-fade-in ${
                theme === 'dark'
                  ? 'bg-[#15161b] border-[#262833] text-neutral-200'
                  : 'bg-white border-neutral-200 text-neutral-800'
              }`}
            >
              <div className="pb-2 mb-2 border-b border-white/10">
                <div className="text-xs font-bold truncate">{user.name}</div>
                <div className="text-[10px] text-neutral-400 truncate">{user.email}</div>
              </div>

              {onOpenProfile && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setShowProfileMenu(false);
                    onOpenProfile();
                  }}
                  className="w-full py-1.5 px-2 mb-1 rounded-lg text-xs text-indigo-400 hover:bg-indigo-500/10 flex items-center gap-2 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Editar Perfil & Foto</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowProfileMenu(false);
                  onLogout();
                }}
                className="w-full py-1.5 px-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Desconectar / Sair</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
