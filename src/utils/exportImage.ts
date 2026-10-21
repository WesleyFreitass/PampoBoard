import { BoardCard, Connection, Zone, DrawingStroke } from '../types/board';
import { computeBezierPath, getPortCoordinates } from './bezier';
import { getStrokeSvgPath } from '../components/canvas/DrawingLayer';

interface ExportBoardOptions {
  workspaceTitle: string;
  cards: BoardCard[];
  connections: Connection[];
  zones: Zone[];
  drawings: DrawingStroke[];
}

export async function exportBoardAsPng({
  workspaceTitle,
  cards,
  connections,
  zones,
  drawings,
}: ExportBoardOptions): Promise<void> {
  // If board is empty, alert and return
  if (cards.length === 0 && zones.length === 0 && drawings.length === 0) {
    alert('O quadro está vazio para exportar.');
    return;
  }

  // Calculate bounding box of all items
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  cards.forEach((c) => {
    minX = Math.min(minX, c.x);
    minY = Math.min(minY, c.y);
    maxX = Math.max(maxX, c.x + c.width);
    maxY = Math.max(maxY, c.y + c.height);
  });

  zones.forEach((z) => {
    minX = Math.min(minX, z.x);
    minY = Math.min(minY, z.y);
    maxX = Math.max(maxX, z.x + z.width);
    maxY = Math.max(maxY, z.y + z.height);
  });

  drawings.forEach((d) => {
    d.points.forEach((p) => {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    });
  });

  const margin = 80;
  minX = Math.floor(minX - margin);
  minY = Math.floor(minY - margin);
  maxX = Math.ceil(maxX + margin);
  maxY = Math.ceil(maxY + margin);

  const width = Math.max(800, maxX - minX);
  const height = Math.max(600, maxY - minY);

  // High-DPI Scale (2x for retina sharpness)
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(scale, scale);

  // 1. Draw Canvas Background
  ctx.fillStyle = '#0f1117';
  ctx.fillRect(0, 0, width, height);

  // 2. Draw Subtle Dot Grid
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  const gridSpacing = 24;
  for (let x = 0; x < width; x += gridSpacing) {
    for (let y = 0; y < height; y += gridSpacing) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Helper coordinate mapper
  const toCanvasX = (worldX: number) => worldX - minX;
  const toCanvasY = (worldY: number) => worldY - minY;

  // 3. Draw Zones
  zones.forEach((z) => {
    const zx = toCanvasX(z.x);
    const zy = toCanvasY(z.y);
    ctx.fillStyle = `${z.color}15`;
    ctx.strokeStyle = `${z.color}60`;
    ctx.lineWidth = 1.5;

    // Rounded Rect
    ctx.beginPath();
    ctx.roundRect(zx, zy, z.width, z.height, 16);
    ctx.fill();
    ctx.stroke();

    // Zone Title Header
    ctx.fillStyle = z.color;
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.fillText(z.title.toUpperCase(), zx + 16, zy + 28);
  });

  // 4. Draw Connections (Wires & Arrows)
  const cardMap = new Map<string, BoardCard>();
  cards.forEach((c) => cardMap.set(c.id, c));

  connections.forEach((conn) => {
    const fromCard = cardMap.get(conn.fromCardId);
    const toCard = cardMap.get(conn.toCardId);
    if (!fromCard || !toCard) return;

    const p1 = getPortCoordinates(fromCard, conn.fromPort, conn.fromItemId);
    const p2 = getPortCoordinates(toCard, conn.toPort, conn.toItemId);
    const { path } = computeBezierPath(p1, conn.fromPort, p2, conn.toPort);

    ctx.save();
    ctx.translate(-minX, -minY);
    ctx.strokeStyle = conn.color || '#a855f7';
    ctx.lineWidth = 2.5;
    if (conn.style === 'dashed') {
      ctx.setLineDash([6, 4]);
    }

    const p = new Path2D(path);
    ctx.stroke(p);
    ctx.restore();

    // Draw Arrowhead
    const targetX = toCanvasX(p2.x);
    const targetY = toCanvasY(p2.y);
    ctx.fillStyle = conn.color || '#a855f7';
    ctx.beginPath();
    ctx.arc(targetX, targetY, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // 5. Draw Freehand Drawings
  drawings.forEach((stroke) => {
    const pathStr = getStrokeSvgPath(stroke.points);
    if (!pathStr) return;

    ctx.save();
    ctx.translate(-minX, -minY);
    ctx.strokeStyle = stroke.color || '#38bdf8';
    ctx.lineWidth = stroke.width || 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke(new Path2D(pathStr));
    ctx.restore();
  });

  // 6. Draw Cards
  cards.forEach((c) => {
    const cx = toCanvasX(c.x);
    const cy = toCanvasY(c.y);

    if (c.type === 'text') {
      // Floating Header / Free Text
      const textData = c.textData || { text: c.title, fontSize: 'h1', color: '#f8fafc' };
      ctx.fillStyle = textData.color || '#ffffff';
      const fontSize =
        textData.fontSize === 'h1'
          ? 'bold 24px Inter, sans-serif'
          : textData.fontSize === 'h2'
          ? 'bold 18px Inter, sans-serif'
          : '14px Inter, sans-serif';
      ctx.font = fontSize;
      ctx.fillText(textData.text || c.title, cx + 4, cy + 28);
    } else if (c.type === 'sticky') {
      // Post-it Sticky Note
      const stickyData = c.stickyData || { text: c.title, color: 'yellow' };
      const stickyColors: Record<string, string> = {
        yellow: '#fef08a',
        pink: '#fbcfe8',
        mint: '#bbf7d0',
        blue: '#bae6fd',
        lavender: '#e9d5ff',
        peach: '#fed7aa',
      };
      const bg = stickyColors[stickyData.color] || '#fef08a';

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.roundRect(cx, cy, c.width, c.height, 12);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#1e1e1e';
      ctx.font = '500 13px Inter, sans-serif';
      const textLines = (stickyData.text || c.title).split('\n');
      textLines.slice(0, 7).forEach((line, idx) => {
        ctx.fillText(line, cx + 16, cy + 32 + idx * 20);
      });
    } else if (c.type === 'board') {
      // Sub-Board Squircle Tile
      ctx.fillStyle = '#d1989e';
      ctx.beginPath();
      ctx.roundRect(cx + (c.width - 96) / 2, cy, 96, 96, 24);
      ctx.fill();

      // Inner emblem
      ctx.fillStyle = '#3b1d24';
      ctx.beginPath();
      ctx.arc(cx + c.width / 2, cy + 48, 26, 0, Math.PI * 2);
      ctx.fill();

      // Title & count
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.title, cx + c.width / 2, cy + 116);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(`${c.boardData?.itemCount || 0} cards`, cx + c.width / 2, cy + 132);
      ctx.textAlign = 'start';
    } else {
      // Regular Cards (Note, Checklist, Column, Table, Link, Media)
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = '#1e2029';
      ctx.strokeStyle = '#2e3140';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(cx, cy, c.width, c.height, 12);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Header Bar
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(c.title || 'Card', cx + 14, cy + 24);

      // Card Type Badge
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(cx + c.width - 64, cy + 12, 52, 16, 4);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(c.type.toUpperCase(), cx + c.width - 38, cy + 24);
      ctx.textAlign = 'start';

      // Card Content preview
      if (c.noteData?.body) {
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '11px Inter, sans-serif';
        const lines = c.noteData.body.split('\n');
        lines.slice(0, 5).forEach((line, idx) => {
          ctx.fillText(line.substring(0, 36), cx + 14, cy + 52 + idx * 18);
        });
      }
    }
  });

  // 7. Watermark / Brand Header
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = 'bold 11px monospace';
  ctx.fillText(`PAMPO BOARD • ${workspaceTitle.toUpperCase()}`, 24, height - 20);

  // Convert to Blob and Trigger Download
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeTitle = workspaceTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
    a.download = `pampo-board-${safeTitle}-${Date.now()}.png`;
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 'image/png');
}
