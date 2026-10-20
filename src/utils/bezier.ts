import { BoardCard, PortPosition, Position } from '../types/board';

export function getPortCoordinates(card: BoardCard, port: PortPosition): Position {
  const { x, y, width, height } = card;
  switch (port) {
    case 'top':
      return { x: x + width / 2, y };
    case 'right':
      return { x: x + width, y: y + height / 2 };
    case 'bottom':
      return { x: x + width / 2, y: y + height };
    case 'left':
      return { x, y: y + height / 2 };
  }
}

export function computeBezierPath(
  p1: Position,
  port1: PortPosition,
  p2: Position,
  port2?: PortPosition
): { path: string; midPoint: Position } {
  const dx = Math.abs(p2.x - p1.x);
  const dy = Math.abs(p2.y - p1.y);
  const distance = Math.sqrt(dx * dx + dy * dy);
  const offset = Math.max(40, Math.min(distance * 0.45, 160));

  let cp1 = { ...p1 };
  let cp2 = { ...p2 };

  switch (port1) {
    case 'top':
      cp1.y -= offset;
      break;
    case 'bottom':
      cp1.y += offset;
      break;
    case 'left':
      cp1.x -= offset;
      break;
    case 'right':
      cp1.x += offset;
      break;
  }

  if (port2) {
    switch (port2) {
      case 'top':
        cp2.y -= offset;
        break;
      case 'bottom':
        cp2.y += offset;
        break;
      case 'left':
        cp2.x -= offset;
        break;
      case 'right':
        cp2.x += offset;
        break;
    }
  } else {
    // Follow the direction of port1
    if (port1 === 'right') cp2.x -= offset * 0.5;
    else if (port1 === 'left') cp2.x += offset * 0.5;
    else if (port1 === 'bottom') cp2.y -= offset * 0.5;
    else if (port1 === 'top') cp2.y += offset * 0.5;
  }

  const path = `M ${p1.x} ${p1.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${p2.x} ${p2.y}`;

  // Evaluate cubic bezier at t = 0.5 for midPoint
  const t = 0.5;
  const mt = 1 - t;
  const midX = mt * mt * mt * p1.x + 3 * mt * mt * t * cp1.x + 3 * mt * t * t * cp2.x + t * t * t * p2.x;
  const midY = mt * mt * mt * p1.y + 3 * mt * mt * t * cp1.y + 3 * mt * t * t * cp2.y + t * t * t * p2.y;

  return {
    path,
    midPoint: { x: midX, y: midY },
  };
}

export function findSnapPort(
  pos: Position,
  cards: BoardCard[],
  excludeCardId?: string,
  threshold: number = 28
): { cardId: string; port: PortPosition; pos: Position } | null {
  let closest: { cardId: string; port: PortPosition; pos: Position } | null = null;
  let minDistance = threshold;

  const ports: PortPosition[] = ['top', 'right', 'bottom', 'left'];

  for (const card of cards) {
    if (card.id === excludeCardId) continue;
    for (const port of ports) {
      const portPos = getPortCoordinates(card, port);
      const d = Math.hypot(pos.x - portPos.x, pos.y - portPos.y);
      if (d < minDistance) {
        minDistance = d;
        closest = { cardId: card.id, port, pos: portPos };
      }
    }
  }

  return closest;
}
