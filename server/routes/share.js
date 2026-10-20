import express from 'express';
import { Workspace } from '../models/Workspace.js';
import { Card } from '../models/Card.js';
import { Connection } from '../models/Connection.js';
import { Zone } from '../models/Zone.js';
import { User } from '../models/User.js';

const router = express.Router();

// Public read-only board access via share token or public workspace ID
router.get('/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;

    // Check by shareToken or workspace _id (if isPublic is true)
    let ws = await Workspace.findOne({ shareToken: shareId });
    if (!ws && shareId.match(/^[0-9a-fA-F]{24}$/)) {
      ws = await Workspace.findOne({ _id: shareId, isPublic: true });
    }

    if (!ws) {
      return res.status(404).json({ error: 'Quadro não encontrado ou compartilhamento desativado' });
    }

    const [author, cards, connections, zones] = await Promise.all([
      User.findById(ws.userId).select('name avatar'),
      Card.find({ workspaceId: ws._id.toString() }),
      Connection.find({ workspaceId: ws._id.toString() }),
      Zone.find({ workspaceId: ws._id.toString() }),
    ]);

    res.json({
      workspace: {
        id: ws._id.toString(),
        title: ws.title,
        description: ws.description,
        color: ws.color,
        icon: ws.icon,
        author: author ? { name: author.name, avatar: author.avatar } : null,
      },
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
        parentBoardId: z.parentBoardId,
      })),
    });
  } catch (err) {
    console.error('Erro ao acessar quadro compartilhado:', err);
    res.status(500).json({ error: 'Erro ao carregar quadro compartilhado' });
  }
});

export default router;
