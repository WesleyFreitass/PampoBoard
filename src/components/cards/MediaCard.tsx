import React, { useState } from 'react';
import { BoardCard, MediaCardData } from '../../types/board';
import { ThreeDViewer } from './ThreeDViewer';
import { Play, Pause, Volume2, Upload, FileImage, Box, Music, Sparkles } from 'lucide-react';
import { sound } from '../../utils/sound';

interface MediaCardProps {
  card: BoardCard;
  onUpdate: (updates: Partial<BoardCard>) => void;
  onExpand?: () => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({ card, onUpdate, onExpand }) => {
  const mediaData: MediaCardData = card.mediaData || {
    title: card.title,
    mediaType: '3d',
    modelGeometry: 'torus',
    wireframe: false,
    modelColor: '#6366f1',
    autoRotate: true,
  };

  const [isPlaying, setIsPlaying] = useState(mediaData.audioPlaying || false);
  const [audioProgress, setAudioProgress] = useState(mediaData.audioProgress || 0.35);

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    setIsPlaying(!isPlaying);
    onUpdate({
      mediaData: {
        ...mediaData,
        audioPlaying: !isPlaying,
      },
    });
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    sound.playClick();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(clickX / rect.width, 1));
    setAudioProgress(newProgress);
    onUpdate({
      mediaData: {
        ...mediaData,
        audioProgress: newProgress,
      },
    });
  };

  const switchMediaType = (type: '3d' | 'audio' | 'image') => {
    sound.playClick();
    onUpdate({
      mediaData: {
        ...mediaData,
        mediaType: type,
      },
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdate({
          mediaData: {
            ...mediaData,
            mediaType: 'image',
            imageUrl: event.target?.result as string,
            fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB ${file.type.split('/')[1]?.toUpperCase() || 'FILE'}`,
          },
        });
        sound.playConnect();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-3">
      {/* Media Type Switcher Tab */}
      <div className="flex items-center justify-between p-1 bg-black/40 rounded-lg border border-neutral-800 text-[10px]">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              switchMediaType('3d');
            }}
            className={`px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
              mediaData.mediaType === '3d'
                ? 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/40'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Box className="w-3 h-3" /> 3D
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              switchMediaType('audio');
            }}
            className={`px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
              mediaData.mediaType === 'audio'
                ? 'bg-emerald-600/30 text-emerald-300 font-semibold border border-emerald-500/40'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Music className="w-3 h-3" /> Áudio
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              switchMediaType('image');
            }}
            className={`px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
              mediaData.mediaType === 'image'
                ? 'bg-cyan-600/30 text-cyan-300 font-semibold border border-cyan-500/40'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileImage className="w-3 h-3" /> Imagem
          </button>
        </div>

        {/* Upload file trigger */}
        <label
          onPointerDown={(e) => e.stopPropagation()}
          className="cursor-pointer text-[10px] text-neutral-400 hover:text-white flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/5 transition-colors"
        >
          <Upload className="w-3 h-3" />
          <span>Upload</span>
          <input
            type="file"
            accept="image/*,audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Main Media Container */}
      <div className="relative rounded-lg overflow-hidden border border-neutral-800">
        {mediaData.mediaType === '3d' ? (
          <div className="w-full">
            <div className="h-48 w-full">
              <ThreeDViewer
                geometryType={mediaData.modelGeometry || 'dodecahedron'}
                wireframe={mediaData.wireframe}
                color={mediaData.modelColor || '#94a3b8'}
                autoRotate={mediaData.autoRotate !== false}
                onGeometryChange={(geom) =>
                  onUpdate({
                    mediaData: {
                      ...mediaData,
                      modelGeometry: geom,
                    },
                  })
                }
                onWireframeToggle={(wf) =>
                  onUpdate({
                    mediaData: {
                      ...mediaData,
                      wireframe: wf,
                    },
                  })
                }
              />
            </div>

            {/* Integrated Media Player Bar (matching the concept image) */}
            <div
              className="flex items-center gap-2.5 px-3 py-2 bg-neutral-950/80 border-t border-neutral-800 text-xs"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={toggleAudio}
                className="text-neutral-300 hover:text-white transition-colors"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>
              <span className="text-[10px] font-mono text-neutral-400">0:00</span>
              <div
                onClick={handleWaveformClick}
                className="flex-1 h-1 bg-neutral-700/80 rounded-full overflow-hidden cursor-pointer"
              >
                <div style={{ width: `${audioProgress * 100}%` }} className="h-full bg-neutral-300" />
              </div>
              <span className="text-[10px] font-mono text-neutral-500">1:33</span>
              <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
            </div>
          </div>
        ) : mediaData.mediaType === 'audio' ? (
          /* Waveform Audio Player */
          <div className="p-3 bg-gradient-to-br from-emerald-950/30 to-neutral-950/60 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleAudio}
                  className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center transition-transform active:scale-95 shadow-md shadow-emerald-500/20"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
                <div>
                  <div className="text-xs font-semibold text-neutral-200">
                    {mediaData.title || 'Pampo Synth Wave'}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400">
                    {Math.floor((audioProgress * (mediaData.audioDuration || 180)) / 60)}:
                    {String(Math.floor((audioProgress * (mediaData.audioDuration || 180)) % 60)).padStart(2, '0')}{' '}
                    / 03:04
                  </div>
                </div>
              </div>
              <Volume2 className="w-4 h-4 text-neutral-400" />
            </div>

            {/* Clickable Waveform */}
            <div
              onClick={handleWaveformClick}
              className="relative h-14 w-full flex items-center gap-0.5 px-1 bg-black/40 rounded cursor-pointer group"
            >
              {(mediaData.waveformData || [
                30, 50, 70, 40, 80, 95, 30, 60, 85, 40, 65, 90, 45, 75, 100, 85, 50,
                30, 60, 90, 70, 40, 80, 60, 95, 80, 45, 60, 35, 70, 90, 40, 65,
              ]).map((height, i, arr) => {
                const barRatio = i / arr.length;
                const isPassed = barRatio <= audioProgress;
                return (
                  <div
                    key={i}
                    style={{ height: `${height}%` }}
                    className={`flex-1 rounded-full transition-all duration-150 ${
                      isPassed
                        ? 'bg-emerald-400 group-hover:bg-emerald-300'
                        : 'bg-neutral-700 group-hover:bg-neutral-600'
                    }`}
                  />
                );
              })}

              {/* Playhead line */}
              <div
                style={{ left: `${audioProgress * 100}%` }}
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-xs pointer-events-none"
              />
            </div>
          </div>
        ) : (
          /* Image & Document Viewer */
          <div className="relative group min-h-[160px] max-h-56 overflow-hidden flex items-center justify-center bg-black/40">
            {mediaData.imageUrl ? (
              <img
                src={mediaData.imageUrl}
                alt={mediaData.caption || 'Mídia'}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="p-6 text-center text-neutral-500 text-xs flex flex-col items-center gap-2">
                <FileImage className="w-8 h-8 opacity-40" />
                <span>Nenhuma imagem carregada. Arraste ou clique em Upload.</span>
              </div>
            )}
            {mediaData.fileSize && (
              <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-[10px] font-mono text-neutral-300 px-1.5 py-0.5 rounded">
                {mediaData.fileSize}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Caption or info */}
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
        placeholder="Adicione uma legenda ou instrução técnica..."
        className="w-full bg-transparent text-[11px] text-neutral-400 placeholder-neutral-600 border-none focus:outline-none focus:ring-1 focus:ring-indigo-500/30 rounded px-1"
      />
    </div>
  );
};
