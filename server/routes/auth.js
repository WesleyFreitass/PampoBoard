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

// Helper to seed default workspace & board
async function createDefaultUserData(userId) {
  const defaultWs = new Workspace({
    userId,
    title: 'Jogo Tower Defense',
    description: 'Bancada inicial com notas, mecanicas, midias e conexoes',
    color: '#3b82f6',
    icon: '🎮',
    isDefault: true,
  });
  await defaultWs.save();

  const defaultZone = new Zone({
    userId,
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
    userId,
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
        code: 'codigo {\n  for class = 10+ {\n    Jogo Tower Defense\n  }\n  ...\n}',
      },
      tags: ['#gamedev', '#core'],
    },
  });

  const cardMedia = new Card({
    userId,
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
      modelType: 'turret',
      threeWireframe: false,
      threeAutoRotate: true,
      threeRotationSpeed: 1,
      caption: 'Modelo Three.js interativo (gire e inspecione no card)',
    },
  });

  const cardSub = new Card({
    userId,
    workspaceId: defaultWs._id.toString(),
    parentBoardId: 'root',
    cardId: 'card-sub-quadro-tower',
    type: 'board',
    title: 'Sub-Quadro de Assets & Inimigos',
    x: 80,
    y: 500,
    width: 340,
    height: 240,
    color: 'emerald',
    status: 'in_progress',
    boardData: {
      title: 'Assets & Inimigos',
      description: 'Estrutura detalhada de modelos de ondas de monstros',
      coverColor: '#10b981',
      itemCount: 4,
    },
  });

  const cardTable = new Card({
    userId,
    workspaceId: defaultWs._id.toString(),
    parentBoardId: 'root',
    cardId: 'card-tabela-dados',
    type: 'table',
    title: 'Balanço de Tropas e Torres',
    x: 480,
    y: 480,
    width: 420,
    height: 260,
    color: 'cyan',
    status: 'in_progress',
    tableData: {
      columns: [
        { id: 'c1', title: 'Tropa', type: 'text', width: 120 },
        { id: 'c2', title: 'HP', type: 'number', width: 80 },
        { id: 'c3', title: 'Dano', type: 'number', width: 80 },
        { id: 'c4', title: 'Tipo', type: 'select', width: 100 },
      ],
      rows: [
        { id: 'r1', cells: { c1: 'Torre Canhão', c2: 1200, c3: 85, c4: 'Físico' } },
        { id: 'r2', cells: { c1: 'Torre Laser', c2: 800, c3: 140, c4: 'Energia' } },
        { id: 'r3', cells: { c1: 'Torre Gelo', c2: 950, c3: 40, c4: 'Suporte' } },
      ],
    },
  });

  const cardLink = new Card({
    userId,
    workspaceId: defaultWs._id.toString(),
    parentBoardId: 'root',
    cardId: 'card-monitor-web',
    type: 'link',
    title: 'Repositório GitHub & Deploy',
    x: 80,
    y: 770,
    width: 340,
    height: 180,
    color: 'purple',
    status: 'in_progress',
    linkData: {
      url: 'https://github.com/WesleyFreitass/PampoBoard',
      title: 'PampoBoard Repository',
      description: 'Código-fonte do motor Milanote + Three.js + Node',
      favicon: 'https://github.githubassets.com/favicons/favicon.png',
      lastChecked: 'Agora',
      sslSecure: true,
    },
  });

  await Promise.all([cardNote.save(), cardMedia.save(), cardSub.save(), cardTable.save(), cardLink.save()]);

  const conn1 = new Connection({
    userId,
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
    userId,
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

  return defaultWs;
}

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
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(name),
    });
    await user.save();

    const defaultWs = await createDefaultUserData(user._id);
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

// Update Profile (Name & Avatar photo)
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (name && typeof name === 'string' && name.trim()) {
      user.name = name.trim();
    }
    if (avatar && typeof avatar === 'string' && avatar.trim()) {
      user.avatar = avatar.trim();
    }

    await user.save();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

// GitHub Login / Signup with Avatar Sync
router.post('/github', async (req, res) => {
  try {
    const { githubUsername, code } = req.body;
    let ghProfile = null;

    if (code) {
      const clientId = process.env.GITHUB_CLIENT_ID;
      const clientSecret = process.env.GITHUB_CLIENT_SECRET;
      if (clientId && clientSecret) {
        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code,
          }),
        });
        const tokenData = await tokenRes.json();
        if (tokenData.access_token) {
          const userRes = await fetch('https://api.github.com/user', {
            headers: {
              Authorization: Bearer ,
              'User-Agent': 'PampoBoard-App',
            },
          });
          ghProfile = await userRes.json();
        }
      }
    }

    if (!ghProfile && githubUsername) {
      try {
        const userRes = await fetch('https://api.github.com/users/' + encodeURIComponent(githubUsername.trim()), {
          headers: { 'User-Agent': 'PampoBoard-App' },
        });
        if (userRes.ok) {
          ghProfile = await userRes.json();
        }
      } catch (e) {
        console.warn('GitHub API lookup fallback:', e.message);
      }

      if (!ghProfile) {
        const cleanUser = githubUsername.trim();
        ghProfile = {
          login: cleanUser,
          name: cleanUser,
          avatar_url: 'https://github.com/' + encodeURIComponent(cleanUser) + '.png',
          email: cleanUser.toLowerCase() + '@github.com',
        };
      }
    }

    if (!ghProfile || !ghProfile.login) {
      return res.status(400).json({ error: 'Perfil do GitHub não encontrado ou inválido' });
    }

    const email = (ghProfile.email || (ghProfile.login.toLowerCase() + '@github.com')).toLowerCase();
    let user = await User.findOne({ email });

    let defaultWs = null;

    if (user) {
      if (ghProfile.avatar_url) user.avatar = ghProfile.avatar_url;
      if (ghProfile.name && !user.name) user.name = ghProfile.name;
      await user.save();

      defaultWs = await Workspace.findOne({ userId: user._id, isDefault: true });
      if (!defaultWs) {
        defaultWs = await Workspace.findOne({ userId: user._id });
      }
    } else {
      user = new User({
        name: ghProfile.name || ghProfile.login,
        email,
        password: Math.random().toString(36).slice(-12) + 'PB!2026',
        avatar: ghProfile.avatar_url || ('https://github.com/' + encodeURIComponent(ghProfile.login) + '.png'),
      });
      await user.save();

      defaultWs = await createDefaultUserData(user._id);
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });

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
    console.error('Erro na autenticação GitHub:', err);
    res.status(500).json({ error: 'Erro ao autenticar com GitHub' });
  }
});

// Google Login / Signup with Avatar Sync
router.post('/google', async (req, res) => {
  try {
    const { email, name, picture } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'E-mail do Google é obrigatório' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });
    let defaultWs = null;

    if (user) {
      if (picture) user.avatar = picture;
      if (name && !user.name) user.name = name;
      await user.save();

      defaultWs = await Workspace.findOne({ userId: user._id, isDefault: true });
      if (!defaultWs) {
        defaultWs = await Workspace.findOne({ userId: user._id });
      }
    } else {
      user = new User({
        name: name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        password: Math.random().toString(36).slice(-12) + 'PB!2026',
        avatar: picture || ('https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(normalizedEmail)),
      });
      await user.save();

      defaultWs = await createDefaultUserData(user._id);
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });

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
    console.error('Erro na autenticação Google:', err);
    res.status(500).json({ error: 'Erro ao autenticar com Google' });
  }
});

export default router;
