import { BoardCard, PortPosition, Position } from '../types/board';

export function getPortCoordinates(
  card: BoardCard,
  port: PortPosition,
  itemId?: string
): Position {
  const { x, y, width, height } = card;

  if (itemId) {
    if (typeof document !== 'undefined') {
      const itemEl = document.getElementById(`col-item-${itemId}`);
      const cardEl = document.getElementById(`card-${card.id}`);

      if (itemEl && cardEl) {
        const itemRect = itemEl.getBoundingClientRect();
        const cardRect = cardEl.getBoundingClientRect();
        const zoom = cardRect.width > 0 ? cardRect.width / width : 1;

        const relCenterY = (itemRect.top + itemRect.height / 2 - cardRect.top) / zoom;
        const relLeft = (itemRect.left - cardRect.left) / zoom;
        const relRight = (itemRect.right - cardRect.left) / zoom;

        switch (port) {
          case 'left':
            return { x: x + relLeft, y: y + relCenterY };
          case 'right':
            return { x: x + relRight, y: y + relCenterY };
          case 'top':
            return { x: x + (relLeft + relRight) / 2, y: y + (itemRect.top - cardRect.top) / zoom };
          case 'bottom':
            return { x: x + (relLeft + relRight) / 2, y: y + (itemRect.bottom - cardRect.top) / zoom };
        }
      }
    }

    // Fallback if DOM element is not mounted/measured yet
    if (card.columnData?.items) {
      const idx = card.columnData.items.findIndex((i) => i.id === itemId);
      if (idx !== -1) {
        const approxRelY = Math.min(height - 20, Math.max(50, 60 + idx * 75 + 30));
        return {
          x: port === 'left' ? x + 16 : x + width - 16,
          y: y + approxRelY,
        };
      }
    }
  }

  switch (port) {
    case 'top':
      return { x: x + width / 2, y };
    case 'right':
      return { x: x + width, y: y + height / 2 };
    case 'bottom':
      return { x: x + width / 2, y: y + height };
    case 'left':
      return { x, y: y + height / 2 };
    default:
      return { x: x + width / 2, y: y + height / 2 };
  }
}

export function computeBezierPath(
  p1: Position,
  port1: PortPosition,
  p2: Position,
  port2?: PortPosition
): { path: string; midPoint: Position } {
  if (!p1 || !p2 || isNaN(p1.x) || isNaN(p1.y) || isNaN(p2.x) || isNaN(p2.y)) {
    return { path: '', midPoint: { x: 0, y: 0 } };
  }
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
  excludeItemId?: string,
  threshold: number = 28
): { cardId: string; port: PortPosition; pos: Position; itemId?: string } | null {
  let closest: { cardId: string; port: PortPosition; pos: Position; itemId?: string } | null = null;
  let minDistance = threshold;

  const ports: PortPosition[] = ['top', 'right', 'bottom', 'left'];

  for (const card of cards) {
    // 1. Check card ports (skip if entire card is excluded and no item is specified)
    if (card.id !== excludeCardId || excludeItemId) {
      for (const port of ports) {
        const portPos = getPortCoordinates(card, port);
        const d = Math.hypot(pos.x - portPos.x, pos.y - portPos.y);
        if (d < minDistance) {
          minDistance = d;
          closest = { cardId: card.id, port, pos: portPos };
        }
      }
    }

    // 2. Check column items ports
    if (card.type === 'column' && card.columnData?.items) {
      for (const item of card.columnData.items) {
        if (card.id === excludeCardId && item.id === excludeItemId) continue;
        const itemPorts: PortPosition[] = ['left', 'right'];
        for (const port of itemPorts) {
          const portPos = getPortCoordinates(card, port, item.id);
          const d = Math.hypot(pos.x - portPos.x, pos.y - portPos.y);
          if (d < minDistance) {
            minDistance = d;
            closest = { cardId: card.id, port, pos: portPos, itemId: item.id };
          }
        }
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
  excludeItemId?: string,
  threshold: number = 36
): { cardId: string; port: PortPosition; pos: Position; itemId?: string } | null {
  // 1. Direct port snap check (both card and column item ports)
  const portSnap = findSnapPort(pos, cards, excludeCardId, excludeItemId, threshold);
  if (portSnap) return portSnap;

  // 2. Column Item bounding box check
  for (const card of cards) {
    if (card.type === 'column' && card.columnData?.items) {
      for (const item of card.columnData.items) {
        if (card.id === excludeCardId && item.id === excludeItemId) continue;
        const leftCoords = getPortCoordinates(card, 'left', item.id);
        const rightCoords = getPortCoordinates(card, 'right', item.id);
        const itemMinX = Math.min(leftCoords.x, rightCoords.x) - 10;
        const itemMaxX = Math.max(leftCoords.x, rightCoords.x) + 10;
        const itemMinY = leftCoords.y - 25;
        const itemMaxY = leftCoords.y + 25;

        if (pos.x >= itemMinX && pos.x <= itemMaxX && pos.y >= itemMinY && pos.y <= itemMaxY) {
          const dLeft = Math.hypot(pos.x - leftCoords.x, pos.y - leftCoords.y);
          const dRight = Math.hypot(pos.x - rightCoords.x, pos.y - rightCoords.y);
          const bestPort: PortPosition = dLeft < dRight ? 'left' : 'right';
          return {
            cardId: card.id,
            port: bestPort,
            pos: bestPort === 'left' ? leftCoords : rightCoords,
            itemId: item.id,
          };
        }
      }
    }
  }

  // 3. Card bounding box with generous margin
  for (const card of cards) {
    if (card.id === excludeCardId && !excludeItemId) continue;
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

  // 4. Generous proximity fallback (up to 70px)
  return findSnapPort(pos, cards, excludeCardId, excludeItemId, 70);
}
