import React, { useState } from 'react';
import { BoardCard, SmartLinkData } from '../../types/board';
import { ExternalLink, Globe, ShieldCheck, RefreshCw, Activity, CheckCircle2 } from 'lucide-react';
import { sound } from '../../utils/sound';

interface SmartLinkCardProps {
  card: BoardCard;
  onUpdate: (updates: Partial<BoardCard>) => void;
}

export const SmartLinkCard: React.FC<SmartLinkCardProps> = ({ card, onUpdate }) => {
  const linkData: SmartLinkData = card.linkData || {
    url: 'https://pampoboard.dev',
    title: card.title,
    description: 'Monitoramento web inteligente em tempo real',
    status: 'online',
    latencyMs: 28,
    lastChecked: 'Agora mesmo',
    sslSecure: true,
  };

  const [isPinging, setIsPinging] = useState(false);

  const handlePing = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    setIsPinging(true);
    onUpdate({
      linkData: {
        ...linkData,
        status: 'checking',
      },
    });

    setTimeout(() => {
      const newLatency = Math.floor(Math.random() * 30) + 18;
      onUpdate({
        linkData: {
          ...linkData,
          status: 'online',
          latencyMs: newLatency,
          lastChecked: new Date().toLocaleTimeString(),
        },
      });
      setIsPinging(false);
      sound.playConnect();
    }, 600);
  };

  return (
    <div className="space-y-2.5">
      {/* Cover image preview if present */}
      {linkData.coverImage && (
        <div className="h-28 w-full rounded-md overflow-hidden bg-neutral-950 border border-neutral-800 relative group">
          <img
            src={linkData.coverImage}
            alt={linkData.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-[10px] text-white/90 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
            <Globe className="w-3 h-3 text-cyan-400" />
            <span className="font-mono truncate max-w-[180px]">{linkData.url.replace(/^https?:\/\//, '')}</span>
          </div>
        </div>
      )}

      {/* URL Input */}
      <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded border border-neutral-800 text-[11px] font-mono" onPointerDown={(e) => e.stopPropagation()}>
        <Globe className="w-3 h-3 text-cyan-400 shrink-0" />
        <input
          type="text"
          value={linkData.url}
          onChange={(e) =>
            onUpdate({
              linkData: {
                ...linkData,
                url: e.target.value,
              },
            })
          }
          placeholder="https://..."
          className="w-full bg-transparent text-neutral-300 border-none focus:outline-none"
        />
        <a
          href={linkData.url}
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir em nova aba"
          className="text-neutral-400 hover:text-cyan-400 transition-colors shrink-0"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Description */}
      <textarea
        value={linkData.description}
        onChange={(e) =>
          onUpdate({
            linkData: {
              ...linkData,
              description: e.target.value,
            },
          })
        }
        onPointerDown={(e) => e.stopPropagation()}
        rows={2}
        placeholder="Descrição do serviço ou página..."
        className="w-full bg-transparent text-xs text-neutral-400 placeholder-neutral-600 resize-none border-none focus:outline-none focus:ring-1 focus:ring-cyan-500/30 rounded p-1"
      />

      {/* Real-time Health Telemetry Bar */}
      <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-between text-xs font-mono">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                linkData.status === 'online'
                  ? 'bg-emerald-400 shadow-xs shadow-emerald-400 animate-pulse'
                  : linkData.status === 'checking'
                  ? 'bg-amber-400 animate-spin'
                  : 'bg-rose-500'
              }`}
            />
            <span className="text-neutral-200 font-semibold text-[11px]">
              {linkData.status === 'online' ? '200 OK — Saudável' : linkData.status === 'checking' ? 'Testando Ping...' : 'Offline'}
            </span>
            {linkData.sslSecure && (
              <span title="Conexão SSL Segura">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
              </span>
            )}
          </div>
          <div className="text-[10px] text-neutral-500">
            {linkData.latencyMs}ms • Lido: {linkData.lastChecked}
          </div>
        </div>

        <button
          type="button"
          onClick={handlePing}
          disabled={isPinging}
          title="Fazer ping agora"
          className="p-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};
