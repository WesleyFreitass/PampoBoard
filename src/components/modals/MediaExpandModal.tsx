import React from 'react';
import { BoardCard } from '../../types/board';
import { X, Download } from 'lucide-react';

interface MediaExpandModalProps {
  card: BoardCard | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MediaExpandModal: React.FC<MediaExpandModalProps> = ({ card, isOpen, onClose }) => {
  if (!isOpen || !card || !card.mediaData?.imageUrl) return null;

  const mediaData = card.mediaData;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!mediaData.imageUrl) return;
    const a = document.createElement('a');
    a.href = mediaData.imageUrl;
    a.download = `${card.title || 'imagem'}.png`;
    a.click();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-5xl max-h-[88vh] rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-neutral-800 bg-neutral-900/90">
          <div>
            <h2 className="text-sm font-bold text-white m-0">{card.title}</h2>
            {mediaData.fileSize && (
              <span className="text-[10px] font-mono text-neutral-400">
                {mediaData.fileSize}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              title="Baixar imagem"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Image Content */}
        <div className="p-4 flex items-center justify-center overflow-auto bg-neutral-950/80">
          <img
            src={mediaData.imageUrl}
            alt={mediaData.caption || card.title || 'Imagem Expandida'}
            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Modal Caption */}
        {mediaData.caption && (
          <div className="px-6 py-2.5 border-t border-neutral-800 bg-neutral-950/60 text-xs text-neutral-300 font-sans">
            {mediaData.caption}
          </div>
        )}
      </div>
    </div>
  );
};
