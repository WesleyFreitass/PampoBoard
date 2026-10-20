import React from 'react';
import { BoardCard, LiveCardData } from '../../types/board';
import { Zap, Play, Activity, Sliders, ToggleLeft, ToggleRight, Radio } from 'lucide-react';
import { sound } from '../../utils/sound';

interface LiveCardProps {
  card: BoardCard;
  onUpdate: (updates: Partial<BoardCard>) => void;
  onTriggerPulse: (cardId: string) => void;
}

export const LiveCard: React.FC<LiveCardProps> = ({ card, onUpdate, onTriggerPulse }) => {
  const liveData: LiveCardData = card.liveData || {
    title: card.title,
    mode: 'trigger',
    value: 50,
    isActive: true,
    status: 'idle',
    unit: '%',
    actionLog: ['Inicializado'],
  };

  const handleTrigger = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTriggerPulse(card.id);
  };

  const toggleActive = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    onUpdate({
      liveData: {
        ...liveData,
        isActive: !liveData.isActive,
      },
    });
  };

  const updateMode = (mode: 'trigger' | 'counter' | 'slider' | 'toggle') => {
    sound.playClick();
    onUpdate({
      liveData: {
        ...liveData,
        mode,
      },
    });
  };

  return (
    <div className="space-y-3 select-none">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between p-1 bg-black/40 rounded-lg border border-neutral-800 text-[10px]">
        {(['trigger', 'counter', 'slider', 'toggle'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              updateMode(m);
            }}
            className={`px-2 py-0.5 rounded capitalize transition-colors ${
              liveData.mode === m
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {m === 'trigger' ? 'Disparo' : m === 'counter' ? 'Contador' : m === 'slider' ? 'Slider' : 'Toggle'}
          </button>
        ))}
      </div>

      {/* Main Dynamic Controller Display */}
      <div className="p-3 rounded-lg bg-gradient-to-br from-amber-950/20 to-neutral-950/40 border border-amber-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                liveData.status === 'pulsing'
                  ? 'bg-amber-400 animate-ping'
                  : liveData.status === 'active'
                  ? 'bg-emerald-400'
                  : 'bg-neutral-600'
              }`}
            />
            <span className="text-xs font-mono font-medium text-amber-300/90 uppercase tracking-wider">
              {liveData.status === 'pulsing'
                ? 'Transmitindo Pulso...'
                : liveData.status === 'active'
                ? 'Ativo & Conectado'
                : 'Em Espera (Idle)'}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleActive}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            {liveData.isActive ? (
              <ToggleRight className="w-5 h-5 text-amber-400" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-neutral-600" />
            )}
          </button>
        </div>

        {/* Dynamic Mode Controller */}
        {liveData.mode === 'slider' ? (
          <div className="space-y-1.5" onPointerDown={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between text-xs text-neutral-300 font-mono">
              <span>Nível de Saída</span>
              <span className="text-amber-400 font-bold">
                {liveData.value}
                {liveData.unit ? ` ${liveData.unit}` : ''}
              </span>
            </div>
            <input
              type="range"
              min={liveData.min || 0}
              max={liveData.max || 100}
              step={liveData.step || 1}
              value={liveData.value}
              onChange={(e) =>
                onUpdate({
                  liveData: {
                    ...liveData,
                    value: Number(e.target.value),
                  },
                })
              }
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        ) : liveData.mode === 'counter' ? (
          <div className="flex items-center justify-between py-1 px-2 bg-neutral-900/60 rounded border border-white/5">
            <span className="text-xs text-neutral-300">Contador de Eventos:</span>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold font-mono text-amber-300">
                {liveData.value}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playClick();
                  onUpdate({
                    liveData: {
                      ...liveData,
                      value: liveData.value + 1,
                    },
                  });
                }}
                className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs rounded border border-amber-500/30"
              >
                +1
              </button>
            </div>
          </div>
        ) : (
          /* Trigger Mode Action Button */
          <button
            type="button"
            onClick={handleTrigger}
            disabled={!liveData.isActive}
            className={`w-full py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider transition-all duration-150 active:scale-95 shadow-md ${
              liveData.isActive
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/20'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            <Zap className="w-4 h-4 fill-current animate-bounce" />
            <span>⚡ Disparar Pulso Conector</span>
          </button>
        )}
      </div>

      {/* Reactive Action Log */}
      <div className="space-y-1">
        <div className="text-[10px] text-neutral-500 font-mono flex items-center gap-1">
          <Activity className="w-3 h-3 text-amber-400" />
          <span>Barramento de Eventos (Log)</span>
        </div>
        <div className="bg-black/50 p-2 rounded text-[10px] font-mono text-neutral-400 max-h-16 overflow-y-auto space-y-0.5 border border-white/5">
          {liveData.actionLog?.map((log, idx) => (
            <div key={idx} className="truncate">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
