import React from 'react';
import { DrawingStroke, Position, ViewportTransform } from '../../types/board';

interface DrawingLayerProps {
  drawings: DrawingStroke[];
  currentStroke: { points: Position[]; color: string; width: number } | null;
  viewport: ViewportTransform;
  onDeleteDrawing?: (id: string) => void;
}

export function getStrokeSvgPath(points: Position[]): string {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y} l 0.01 0.01`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const xc = (points[i].x + points[i - 1].x) / 2;
    const yc = (points[i].y + points[i - 1].y) / 2;
    d += ` Q ${points[i - 1].x} ${points[i - 1].y}, ${xc} ${yc}`;
  }
  d += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;
  return d;
}

export const DrawingLayer: React.FC<DrawingLayerProps> = ({
  drawings,
  currentStroke,
  viewport,
  onDeleteDrawing,
}) => {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10">
      <defs>
        <filter id="draw-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}>
        {/* Render Saved Completed Strokes */}
        {drawings.map((stroke) => {
          const path = getStrokeSvgPath(stroke.points);
          if (!path) return null;

          return (
            <path
              key={stroke.id}
              d={path}
              fill="none"
              stroke={stroke.color || '#38bdf8'}
              strokeWidth={stroke.width || 3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#draw-glow)"
              className="pointer-events-auto cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDeleteDrawing?.(stroke.id);
              }}
            >
              <title>Clique com botão direito para apagar este traço</title>
            </path>
          );
        })}

        {/* Live Active Stroke Currently Being Drawn */}
        {currentStroke && currentStroke.points.length > 0 && (() => {
          const livePath = getStrokeSvgPath(currentStroke.points);
          return (
            <path
              d={livePath}
              fill="none"
              stroke={currentStroke.color}
              strokeWidth={currentStroke.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#draw-glow)"
            />
          );
        })()}
      </g>
    </svg>
  );
};
