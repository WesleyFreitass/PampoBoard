import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Workspace } from '../models/Workspace.js';
import { Card } from '../models/Card.js';
import { Connection } from '../models/Connection.js';
import { Zone } from '../models/Zone.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'pampoboard_secret_dev_key_2026';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado' });
    }

    const user = new User({
      name,
      email,
      password,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
    });
    await user.save();

    // Create default workspace for user
    const defaultWs = new Workspace({
      userId: user._id,
      title: 'Jogo Tower Defense',
      description: 'Bancada inicial com notas, mecânicas, mídias e conexões',
      color: '#3b82f6',
      icon: '🎮',
      isDefault: true,
    });
    await defaultWs.save();

    // Seed default cards & zone for this workspace
    const defaultZone = new Zone({
      userId: user._id,
      workspaceId: defaultWs._id.toString(),
      parentBoardId: 'root',
      zoneId: 'zone-tower-defense',
      title: '🎯 Núcleo do Projeto — Jogo Tower Defense',
      description: 'Fluxo interativo de desenvolvimento e assets',
      x: 40,
      y: 40,
      width: 900,
      height: 940,
      color: '#3b82f6',
    });
    await defaultZone.save();

    const cardNote = new Card({
      userId: user._id,
      workspaceId: defaultWs._id.toString(),
      parentBoardId: 'root',
      cardId: 'card-notas-checklists',
      type: 'note',
      title: 'Notas e Checklists',
      x: 80,
      y: 80,
      width: 340,
      height: 380,
      color: 'default',
      status: 'in_progress',
      noteData: {
        title: 'Notas e Checklists',
        body: '',
        checklist: [
          { id: 'chk-1', text: 'Checklist', completed: true },
          { id: 'chk-2', text: 'Checkmasstics', completed: true },
          { id: 'chk-3', text: 'Código', completed: false },
        ],
        codeSnippet: {
          language: 'javascript',
          code: `codigo {\n  for class = 10+ {\n    Jogo Tower Defense\n  }\n  ...\n}`,
        },
        tags: ['#gamedev', '#core'],
      },
    });

    const cardMedia = new Card({
      userId: user._id,
      workspaceId: defaultWs._id.toString(),
      parentBoardId: 'root',
      cardId: 'card-midias-interativas',
      type: 'media',
      title: 'Mídias Interativas',
      x: 480,
      y: 80,
      width: 380,
      height: 360,
      color: 'default',
      status: 'done',
      mediaData: {
        title: 'Torreta 3D Interativa',
        mediaType: '3d',
        modelGeometry: 'dodecahedron',
        wireframe: false,
        modelColor: '#94a3b8',
        autoRotate: true,
        audioPlaying: false,
        audioDuration: 133,
        audioProgress: 0.15,
        caption: 'Inspecione a geometria 3D da torreta ou dê play no áudio.',
      },
    });

    const cardSub = new Card({
      userId: user._id,
      workspaceId: defaultWs._id.toString(),
      parentBoardId: 'root',
      cardId: 'card-sub-quadro-tower',
      type: 'board',
      title: 'Sub-Quadro',
      x: 80,
      y: 500,
      width: 340,
      height: 180,
      color: 'default',
      status: 'backlog',
      boardData: {
        title: 'Sub-Quadro',
        description: 'Módulo interno aninhado com workspace infinito dedicado.',
        itemCount: 2,
        coverColor: '#6366f1',
        tags: ['#sub-board', '#tower-defense'],
      },
    });

    const cardTable = new Card({
      userId: user._id,
      workspaceId: defaultWs._id.toString(),
      parentBoardId: 'root',
      cardId: 'card-tabela-dados',
      type: 'table',
      title: 'Tabela de Dados',
      x: 480,
      y: 680,
      width: 380,
      height: 260,
      color: 'slate',
      status: 'in_progress',
      tableData: {
        title: 'Tabela de Dados',
        columns: [
          { id: 'c1', header: 'Item', type: 'text', width: 90 },
          { id: 'c2', header: 'Data', type: 'text', width: 130 },
          { id: 'c3', header: 'Tipo', type: 'status', width: 100 },
        ],
        rows: [
          { id: 'r1', cells: { c1: '1', c2: 'Color 1', c3: 'Concluído' } },
          { id: 'r2', cells: { c1: '2', c2: 'Color 2', c3: 'Ativo' } },
        ],
      },
    });

    const cardLink = new Card({
      userId: user._id,
      workspaceId: defaultWs._id.toString(),
      parentBoardId: 'root',
      cardId: 'card-monitor-links',
      type: 'link',
      title: 'Monitor de Links',
      x: 80,
      y: 720,
      width: 340,
      height: 220,
      color: 'cyan',
      status: 'done',
      linkData: {
        url: 'https://pampoboard.pampo.tech',
        title: 'Quadro 1',
        description: 'Telemetria do servidor e status de conexão',
        status: 'online',
        latencyMs: 18,
        lastChecked: 'Agora',
        sslSecure: true,
      },
    });

    await Promise.all([cardNote.save(), cardMedia.save(), cardSub.save(), cardTable.save(), cardLink.save()]);

    // Initial Connections
    const conn1 = new Connection({
      userId: user._id,
      workspaceId: defaultWs._id.toString(),
      parentBoardId: 'root',
      connId: 'conn-notas-midia',
      fromCardId: 'card-notas-checklists',
      fromPort: 'right',
      toCardId: 'card-midias-interativas',
      toPort: 'left',
      label: 'Renderiza',
      style: 'pulse',
      color: '#a855f7',
    });
    const conn2 = new Connection({
      userId: user._id,
      workspaceId: defaultWs._id.toString(),
      parentBoardId: 'root',
      connId: 'conn-sub-tabela',
      fromCardId: 'card-sub-quadro-tower',
      fromPort: 'right',
      toCardId: 'card-tabela-dados',
      toPort: 'left',
      label: 'Claro ciano',
      style: 'pulse',
      color: '#06b6d4',
    });
    await Promise.all([conn1.save(), conn2.save()]);

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
      defaultWorkspaceId: defaultWs._id.toString(),
    });
  } catch (err) {
    console.error('Erro no registro:', err);
    res.status(500).json({ error: 'Erro interno ao criar conta' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Informe e-mail e senha' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });

    // Fetch user default workspace
    let defaultWs = await Workspace.findOne({ userId: user._id, isDefault: true });
    if (!defaultWs) {
      defaultWs = await Workspace.findOne({ userId: user._id });
    }

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
      defaultWorkspaceId: defaultWs ? defaultWs._id.toString() : null,
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Current user profile
router.get('/me', requireAuth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      role: req.user.role,
    },
  });
});

export default router;
