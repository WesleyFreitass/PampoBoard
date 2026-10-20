import React, { useState } from 'react';
import { X, Copy, Check, Globe, Lock, Share2, ExternalLink } from 'lucide-react';
import { sound } from '../../utils/sound';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceTitle: string;
  isPublic?: boolean;
  shareToken?: string;
  onTogglePublic?: (isPublic: boolean) => void;
  theme: 'dark' | 'light';
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  workspaceTitle,
  isPublic = false,
  shareToken,
  onTogglePublic,
  theme,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareIdentifier = shareToken || workspaceId;
  const shareUrl = `${window.location.origin}/share/${shareIdentifier}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    sound.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full max-w-md rounded-2xl border shadow-2xl p-6 transition-all ${
          theme === 'dark'
            ? 'bg-[#15161b] border-[#262833] text-neutral-100 shadow-cyan-500/5'
            : 'bg-white border-neutral-200 text-neutral-800 shadow-neutral-900/10'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${
            theme === 'dark'
              ? 'text-neutral-400 hover:text-white hover:bg-white/10'
              : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Compartilhar Quadro</h3>
            <p className="text-xs text-neutral-400 truncate max-w-[260px]">{workspaceTitle}</p>
          </div>
        </div>

        {/* Public Access Toggle */}
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between mb-4 ${
            theme === 'dark' ? 'bg-[#0c0d12] border-[#262833]' : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isPublic ? (
              <Globe className="w-4 h-4 text-emerald-400" />
            ) : (
              <Lock className="w-4 h-4 text-amber-400" />
            )}
            <div>
              <div className="text-xs font-semibold">
                {isPublic ? 'Link Público Ativo' : 'Acesso Privado'}
              </div>
              <div className="text-[11px] text-neutral-400">
                {isPublic
                  ? 'Qualquer pessoa com o link pode visualizar'
                  : 'Apenas você pode visualizar este quadro'}
              </div>
            </div>
          </div>

          {onTogglePublic && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onTogglePublic(!isPublic);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isPublic
                  ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
              }`}
            >
              {isPublic ? 'Desativar' : 'Tornar Público'}
            </button>
          )}
        </div>

        {/* Share Link Field */}
        <div>
          <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
            Link de Acesso Somente Leitura
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className={`flex-1 px-3 py-2 text-xs font-mono rounded-xl border outline-none select-all ${
                theme === 'dark'
                  ? 'bg-[#0c0d12] border-[#262833] text-cyan-300'
                  : 'bg-neutral-50 border-neutral-200 text-cyan-700'
              }`}
            />
            <button
              type="button"
              onClick={handleCopy}
              className="py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-600/20"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        <p className="text-[11px] text-neutral-400 mt-4 text-center">
          Os visitantes poderão navegar no canvas infinito em modo visualização sem alterar os seus cards originais.
        </p>
      </div>
    </div>
  );
};
