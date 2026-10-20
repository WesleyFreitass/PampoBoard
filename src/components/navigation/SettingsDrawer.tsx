import React, { useState, useEffect } from 'react';
import { ChevronsLeft, Settings, Grid, Volume2, VolumeX, Moon, Sun, Database, RotateCcw, CheckCircle2 } from 'lucide-react';
import { sound } from '../../utils/sound';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isSnappingEnabled: boolean;
  onToggleSnapping: () => void;
  onResetDefault: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  isSnappingEnabled,
  onToggleSnapping,
  onResetDefault,
}) => {
  const [isMuted, setIsMuted] = useState(sound.isMuted());
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'offline'>('checking');

  useEffect(() => {
    if (isOpen) {
      fetch('/api/health')
        .then((res) => res.json())
        .then((data) => {
          if (data.database === 'connected') setDbStatus('connected');
          else setDbStatus('offline');
        })
        .catch(() => setDbStatus('offline'));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSound = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  return (
    <aside
      className={`fixed top-0 left-16 bottom-0 z-30 w-60 flex flex-col justify-between p-4 border-r transition-all duration-200 select-none ${
        theme === 'dark'
          ? 'bg-[#1a1b22] border-[#262833] text-neutral-200'
          : 'bg-[#ffffff] border-[#e2e8f0] text-neutral-800'
      }`}
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold tracking-tight m-0">Ajustes & Config</h2>
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

        {/* Options List */}
        <div className="space-y-3">
          {/* Snapping to 16px grid */}
          <div className="p-3 rounded-xl border border-white/5 bg-white/5 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold">Grade Inteligente</span>
              </div>
              <input
                type="checkbox"
                checked={isSnappingEnabled}
                onChange={onToggleSnapping}
                className="w-4 h-4 rounded text-emerald-500 cursor-pointer accent-emerald-500"
              />
            </div>
            <p className="text-[10px] text-neutral-400 m-0">
              Alinha automaticamente os cards na grade de 16px.
            </p>
          </div>

          {/* Sound Synthesizer */}
          <div className="p-3 rounded-xl border border-white/5 bg-white/5 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                )}
                <span className="text-xs font-semibold">Efeitos Sonoros</span>
              </div>
              <input
                type="checkbox"
                checked={!isMuted}
                onChange={toggleSound}
                className="w-4 h-4 rounded text-emerald-500 cursor-pointer accent-emerald-500"
              />
            </div>
            <p className="text-[10px] text-neutral-400 m-0">
              Sons táteis de clique, conexão e ações do canvas.
            </p>
          </div>

          {/* Theme Switcher */}
          <div className="p-3 rounded-xl border border-white/5 bg-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Tema da Interface</span>
              <button
                type="button"
                onClick={onToggleTheme}
                className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors flex items-center gap-1.5"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dark</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Light</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* MongoDB Connection Badge */}
          <div className="p-3 rounded-xl border border-white/5 bg-white/5 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold">Banco MongoDB</span>
              </div>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                  dbStatus === 'connected'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {dbStatus === 'connected' ? 'Conectado' : 'Offline'}
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 m-0">
              Sincronização na nuvem para cards e conexões.
            </p>
          </div>

          {/* Reset Template */}
          <button
            type="button"
            onClick={onResetDefault}
            className="w-full py-2 px-3 rounded-xl text-xs font-medium text-neutral-400 hover:text-amber-400 hover:bg-amber-500/10 border border-white/5 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Demonstração Inicial</span>
          </button>
        </div>
      </div>

      <div className="text-[10px] text-neutral-500 font-mono text-center pt-2 border-t border-white/5">
        PampoBoard Engine 2.0
      </div>
    </aside>
  );
};
