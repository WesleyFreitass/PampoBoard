import express from 'express';
import crypto from 'crypto';
import { Workspace } from '../models/Workspace.js';
import { Card } from '../models/Card.js';
import { Connection } from '../models/Connection.js';
import { Zone } from '../models/Zone.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// List all workspaces of the user
router.get('/', async (req, res) => {
  try {
    const workspaces = await Workspace.find({ userId: req.user._id }).sort({ createdAt: 1 });
    res.json(
      workspaces.map((w) => ({
        id: w._id.toString(),
        title: w.title,
        description: w.description,
        color: w.color,
        icon: w.icon,
        isDefault: w.isDefault,
        isPublic: w.isPublic,
        shareToken: w.shareToken,
        updatedAt: w.updatedAt.getTime(),
      }))
    );
  } catch (err) {
    console.error('Erro ao buscar workspaces:', err);
    res.status(500).json({ error: 'Erro ao listar workspaces' });
  }
});

// Create new workspace (N boards per user)
router.post('/', async (req, res) => {
  try {
    const { title, description, color, icon } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'O título do quadro é obrigatório' });
    }

    const newWs = new Workspace({
      userId: req.user._id,
      title: title.trim(),
      description: description || '',
      color: color || '#3b82f6',
      icon: icon || '📁',
    });

    await newWs.save();

    res.status(201).json({
      id: newWs._id.toString(),
      title: newWs.title,
      description: newWs.description,
      color: newWs.color,
      icon: newWs.icon,
      isDefault: newWs.isDefault,
      updatedAt: newWs.updatedAt.getTime(),
    });
  } catch (err) {
    console.error('Erro ao criar workspace:', err);
    res.status(500).json({ error: 'Erro ao criar workspace' });
  }
});

// Update workspace
router.put('/:id', async (req, res) => {
  try {
    const { title, description, color, icon, isPublic } = req.body;
    const ws = await Workspace.findOne({ _id: req.params.id, userId: req.user._id });
    if (!ws) {
      return res.status(404).json({ error: 'Quadro não encontrado' });
    }

    if (title) ws.title = title.trim();
    if (description !== undefined) ws.description = description;
    if (color) ws.color = color;
    if (icon) ws.icon = icon;
    if (isPublic !== undefined) {
      ws.isPublic = isPublic;
      if (isPublic && !ws.shareToken) {
        ws.shareToken = crypto.randomBytes(16).toString('hex');
      }
    }

    await ws.save();

    res.json({
      id: ws._id.toString(),
      title: ws.title,
      description: ws.description,
      color: ws.color,
      icon: ws.icon,
      isPublic: ws.isPublic,
      shareToken: ws.shareToken,
      updatedAt: ws.updatedAt.getTime(),
    });
  } catch (err) {
    console.error('Erro ao atualizar workspace:', err);
    res.status(500).json({ error: 'Erro ao atualizar workspace' });
  }
});

// Delete workspace & cascade delete all board contents
router.delete('/:id', async (req, res) => {
  try {
    const ws = await Workspace.findOne({ _id: req.params.id, userId: req.user._id });
    if (!ws) {
      return res.status(404).json({ error: 'Quadro não encontrado' });
    }

    const wsIdStr = ws._id.toString();

    // Cascade delete
    await Promise.all([
      Workspace.deleteOne({ _id: ws._id }),
      Card.deleteMany({ userId: req.user._id, workspaceId: wsIdStr }),
      Connection.deleteMany({ userId: req.user._id, workspaceId: wsIdStr }),
      Zone.deleteMany({ userId: req.user._id, workspaceId: wsIdStr }),
    ]);

    res.json({ message: 'Quadro excluído com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir workspace:', err);
    res.status(500).json({ error: 'Erro ao excluir workspace' });
  }
});

export default router;
