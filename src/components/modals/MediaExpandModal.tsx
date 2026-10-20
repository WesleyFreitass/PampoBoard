import React from 'react';
import { BoardCard } from '../../types/board';
import { ThreeDViewer } from '../cards/ThreeDViewer';
import { X, Maximize2, Download } from 'lucide-react';

interface MediaExpandModalProps {
  card: BoardCard | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MediaExpandModal: React.FC<MediaExpandModalProps> = ({ card, isOpen, onClose }) => {
  if (!isOpen || !card) return null;

  const mediaData = card.mediaData;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl h-[80vh] rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div>
            <h2 className="text-sm font-bold text-white m-0">{card.title}</h2>
            <span className="text-[11px] font-mono text-neutral-400">
              Visualização Detalhada em Alta Resolução ({mediaData?.mediaType || card.type})
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 p-6 flex items-center justify-center overflow-hidden bg-neutral-950/60">
          {mediaData?.mediaType === '3d' ? (
            <div className="w-full h-full">
              <ThreeDViewer
                geometryType={mediaData.modelGeometry || 'torus'}
                wireframe={mediaData.wireframe}
                color={mediaData.modelColor || '#6366f1'}
                autoRotate={mediaData.autoRotate !== false}
              />
            </div>
          ) : mediaData?.mediaType === 'image' && mediaData.imageUrl ? (
            <img
              src={mediaData.imageUrl}
              alt={mediaData.caption || 'Mídia Expandida'}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          ) : (
            <div className="text-center text-neutral-400 text-sm">
              Visualização expandida para {card.title}
            </div>
          )}
        </div>

        {/* Modal Caption */}
        {mediaData?.caption && (
          <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950/40 text-xs text-neutral-400 font-mono">
            {mediaData.caption}
          </div>
        )}
      </div>
    </div>
  );
};
