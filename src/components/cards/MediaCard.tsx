import React, { useState } from 'react';
import { BoardCard, MediaCardData } from '../../types/board';
import { Image as ImageIcon, Upload, Trash2, Maximize2, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { sound } from '../../utils/sound';

interface MediaCardProps {
  card: BoardCard;
  onUpdate: (updates: Partial<BoardCard>) => void;
  onExpand?: () => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({ card, onUpdate, onExpand }) => {
  const mediaData: MediaCardData = card.mediaData || {
    title: card.title,
    mediaType: 'image',
    imageUrl: '',
    caption: '',
  };

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      onUpdate({
        title: card.title === 'Imagem' ? file.name.replace(/\.[^/.]+$/, '') : card.title,
        mediaData: {
          ...mediaData,
          mediaType: 'image',
          imageUrl: event.target?.result as string,
          fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB • ${file.type.split('/')[1]?.toUpperCase() || 'IMG'}`,
        },
      });
      sound.playConnect();
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleApplyUrl = () => {
    if (!imageUrlInput.trim()) return;
    onUpdate({
      mediaData: {
        ...mediaData,
        mediaType: 'image',
        imageUrl: imageUrlInput.trim(),
        fileSize: 'Web URL',
      },
    });
    sound.playConnect();
    setShowUrlInput(false);
    setImageUrlInput('');
  };

  const handleRemoveImage = () => {
    sound.playDelete();
    onUpdate({
      mediaData: {
        ...mediaData,
        imageUrl: '',
        fileSize: undefined,
      },
    });
  };

  return (
    <div className="space-y-2.5">
      {/* Image Display Area */}
      {mediaData.imageUrl ? (
        <div className="relative group/img rounded-xl overflow-hidden border border-neutral-800 bg-black/60 shadow-inner">
          <img
            src={mediaData.imageUrl}
            alt={mediaData.caption || card.title || 'Imagem'}
            className="w-full max-h-80 object-cover rounded-xl transition-transform duration-300 group-hover/img:scale-[1.01]"
          />

          {/* Quick Action Overlay (Visible on Hover) */}
          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/70 backdrop-blur-md p-1 rounded-lg border border-white/10 shadow-lg">
            {onExpand && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand();
                }}
                title="Visualizar em tela cheia"
                className="p-1 rounded text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}

            <label
              title="Trocar imagem"
              onPointerDown={(e) => e.stopPropagation()}
              className="p-1 rounded text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage();
              }}
              title="Remover imagem"
              className="p-1 rounded text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* File Size Badge */}
          {mediaData.fileSize && (
            <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-[10px] font-mono text-neutral-300 px-2 py-0.5 rounded-md border border-white/5 pointer-events-none">
              {mediaData.fileSize}
            </div>
          )}
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);
          }}
          onDrop={handleDrop}
          className={`p-6 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 text-center ${
            isDragOver
              ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
              : 'border-neutral-700/80 hover:border-emerald-500/50 bg-neutral-900/40'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
            <ImageIcon className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-neutral-200">
              Carregue ou arraste uma imagem aqui
            </p>
            <p className="text-[11px] text-neutral-500">
              PNG, JPG, WebP, GIF ou SVG
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <label
              onPointerDown={(e) => e.stopPropagation()}
              className="cursor-pointer px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Escolher arquivo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>URL</span>
            </button>
          </div>

          {/* Paste URL Input bar */}
          {showUrlInput && (
            <div
              className="w-full mt-2 flex items-center gap-1.5 bg-neutral-950/80 p-1 rounded-lg border border-neutral-700"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyUrl();
                }}
                placeholder="https://exemplo.com/imagem.png"
                className="flex-1 bg-transparent border-none text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none px-2"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
              >
                Aplicar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Caption Input */}
      <input
        type="text"
        value={mediaData.caption || ''}
        onChange={(e) =>
          onUpdate({
            mediaData: {
              ...mediaData,
              caption: e.target.value,
            },
          })
        }
        onPointerDown={(e) => e.stopPropagation()}
        placeholder="Adicione uma legenda ou anotação da imagem..."
        className="w-full bg-transparent text-xs text-neutral-400 placeholder-neutral-600 border-none focus:outline-none focus:ring-1 focus:ring-emerald-500/30 rounded px-1.5 py-1"
      />
    </div>
  );
};
