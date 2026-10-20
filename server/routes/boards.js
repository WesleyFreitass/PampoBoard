import express from 'express';
import { Workspace } from '../models/Workspace.js';
import { Card } from '../models/Card.js';
import { Connection } from '../models/Connection.js';
import { Zone } from '../models/Zone.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// Get all board data for a workspace
router.get('/:workspaceId', async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const [cards, connections, zones] = await Promise.all([
      Card.find({ userId: req.user._id, workspaceId }),
      Connection.find({ userId: req.user._id, workspaceId }),
      Zone.find({ userId: req.user._id, workspaceId }),
    ]);

    res.json({
      cards: cards.map((c) => ({
        id: c.cardId,
        type: c.type,
        title: c.title,
        x: c.x,
        y: c.y,
        width: c.width,
        height: c.height,
        color: c.color,
        zIndex: c.zIndex,
        status: c.status,
        zoneId: c.zoneId,
        rootBoardId: c.workspaceId,
        parentBoardId: c.parentBoardId,
        noteData: c.noteData,
        liveData: c.liveData,
        mediaData: c.mediaData,
        linkData: c.linkData,
        tableData: c.tableData,
        columnData: c.columnData,
        boardData: c.boardData,
      })),
      connections: connections.map((conn) => ({
        id: conn.connId,
        fromCardId: conn.fromCardId,
        fromPort: conn.fromPort,
        toCardId: conn.toCardId,
        toPort: conn.toPort,
        rootBoardId: conn.workspaceId,
        parentBoardId: conn.parentBoardId,
        label: conn.label,
        style: conn.style,
        color: conn.color,
      })),
      zones: zones.map((z) => ({
        id: z.zoneId,
        title: z.title,
        description: z.description,
        x: z.x,
        y: z.y,
        width: z.width,
        height: z.height,
        color: z.color,
        rootBoardId: z.workspaceId,
        parentBoardId: z.parentBoardId,
      })),
    });
  } catch (err) {
    console.error('Erro ao buscar dados do quadro:', err);
    res.status(500).json({ error: 'Erro ao carregar dados do quadro' });
  }
});

// Full state cloud sync (debounced from frontend)
router.post('/:workspaceId/sync', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { cards = [], connections = [], zones = [] } = req.body;

    const userId = req.user._id;

    // 1. Sync Cards: Upsert existing and remove deleted
    const incomingCardIds = cards.map((c) => c.id);
    await Card.deleteMany({
      userId,
      workspaceId,
      cardId: { $nin: incomingCardIds },
    });

    const cardOps = cards.map((c) => ({
      updateOne: {
        filter: { userId, workspaceId, cardId: c.id },
        update: {
          $set: {
            type: c.type,
            title: c.title,
            x: c.x,
            y: c.y,
            width: c.width,
            height: c.height,
            color: c.color,
            zIndex: c.zIndex,
            status: c.status,
            zoneId: c.zoneId || null,
            parentBoardId: c.parentBoardId || 'root',
            noteData: c.noteData,
            liveData: c.liveData,
            mediaData: c.mediaData,
            linkData: c.linkData,
            tableData: c.tableData,
            columnData: c.columnData,
            boardData: c.boardData,
          },
        },
        upsert: true,
      },
    }));

    if (cardOps.length > 0) {
      await Card.bulkWrite(cardOps);
    }

    // 2. Sync Connections
    const incomingConnIds = connections.map((conn) => conn.id);
    await Connection.deleteMany({
      userId,
      workspaceId,
      connId: { $nin: incomingConnIds },
    });

    const connOps = connections.map((conn) => ({
      updateOne: {
        filter: { userId, workspaceId, connId: conn.id },
        update: {
          $set: {
            fromCardId: conn.fromCardId,
            fromPort: conn.fromPort,
            toCardId: conn.toCardId,
            toPort: conn.toPort,
            parentBoardId: conn.parentBoardId || 'root',
            label: conn.label || '',
            style: conn.style || 'solid',
            color: conn.color || '#a855f7',
          },
        },
        upsert: true,
      },
    }));

    if (connOps.length > 0) {
      await Connection.bulkWrite(connOps);
    }

    // 3. Sync Zones
    const incomingZoneIds = zones.map((z) => z.id);
    await Zone.deleteMany({
      userId,
      workspaceId,
      zoneId: { $nin: incomingZoneIds },
    });

    const zoneOps = zones.map((z) => ({
      updateOne: {
        filter: { userId, workspaceId, zoneId: z.id },
        update: {
          $set: {
            title: z.title,
            description: z.description || '',
            x: z.x,
            y: z.y,
            width: z.width,
            height: z.height,
            color: z.color || '#8b5cf6',
            parentBoardId: z.parentBoardId || 'root',
          },
        },
        upsert: true,
      },
    }));

    if (zoneOps.length > 0) {
      await Zone.bulkWrite(zoneOps);
    }

    res.json({ success: true, timestamp: Date.now() });
  } catch (err) {
    console.error('Erro na sincronização em nuvem do quadro:', err);
    res.status(500).json({ error: 'Erro ao salvar quadro na nuvem' });
  }
});

export default router;
