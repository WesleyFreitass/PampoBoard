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

export function getOptimalPortBetweenCards(
  fromCard: BoardCard,
  toCard: BoardCard
): { fromPort: PortPosition; toPort: PortPosition } {
  const fromCenterX = fromCard.x + fromCard.width / 2;
  const fromCenterY = fromCard.y + fromCard.height / 2;
  const toCenterX = toCard.x + toCard.width / 2;
  const toCenterY = toCard.y + toCard.height / 2;

  const dx = toCenterX - fromCenterX;
  const dy = toCenterY - fromCenterY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) {
      return { fromPort: 'right', toPort: 'left' };
    } else {
      return { fromPort: 'left', toPort: 'right' };
    }
  } else {
    if (dy > 0) {
      return { fromPort: 'bottom', toPort: 'top' };
    } else {
      return { fromPort: 'top', toPort: 'bottom' };
    }
  }
}

export function findSnapCardOrPort(
  pos: Position,
  cards: BoardCard[],
  excludeCardId?: string,
  threshold: number = 36
): { cardId: string; port: PortPosition; pos: Position } | null {
  // 1. Direct port snap check
  const portSnap = findSnapPort(pos, cards, excludeCardId, threshold);
  if (portSnap) return portSnap;

  // 2. Card bounding box with generous margin
  for (const card of cards) {
    if (card.id === excludeCardId) continue;
    const margin = 24;
    if (
      pos.x >= card.x - margin &&
      pos.x <= card.x + card.width + margin &&
      pos.y >= card.y - margin &&
      pos.y <= card.y + card.height + margin
    ) {
      let bestPort: PortPosition = 'left';
      let minD = Infinity;
      const ports: PortPosition[] = ['top', 'right', 'bottom', 'left'];
      for (const p of ports) {
        const portCoords = getPortCoordinates(card, p);
        const d = Math.hypot(pos.x - portCoords.x, pos.y - portCoords.y);
        if (d < minD) {
          minD = d;
          bestPort = p;
        }
      }
      return { cardId: card.id, port: bestPort, pos: getPortCoordinates(card, bestPort) };
    }
  }

  // 3. Generous proximity fallback (up to 70px)
  return findSnapPort(pos, cards, excludeCardId, 70);
}
