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

function getBaseOrigin(req) {
  if (process.env.NODE_ENV === 'production' && !req.get('host')?.includes('localhost')) {
    return 'https://pampoboard.pampo.tech';
  }
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return protocol + '://' + host;
}

// OAuth Provider Config Info
router.get('/config', (req, res) => {
  res.json({
    hasGithubOAuth: !!process.env.GITHUB_CLIENT_ID,
    hasGoogleOAuth: !!process.env.GOOGLE_CLIENT_ID,
    githubClientId: process.env.GITHUB_CLIENT_ID || null,
  });
});

// Official GitHub OAuth Redirect Flow
router.get('/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.get('host');
  const redirectUri = `${protocol}://${host}/api/auth/github/callback`;

  if (!clientId) {
    return res.redirect('/?error=oauth_missing_config&provider=github');
  }

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email&redirect_uri=${encodeURIComponent(redirectUri)}`;
  res.redirect(githubAuthUrl);
});

// GitHub OAuth Callback from GitHub.com
router.get('/github/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect('/?error=no_code_provided');
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const redirectUri = `${protocol}://${host}/api/auth/github/callback`;

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
        redirect_uri: redirectUri,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error('GitHub token exchange error:', tokenData);
      return res.redirect('/?error=github_token_exchange_failed');
    }

    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: 'Bearer ' + tokenData.access_token,
        'User-Agent': 'PampoBoard-App',
      },
    });
    const ghUser = await userRes.json();

    let email = ghUser.email;
    if (!email) {
      try {
        const emailsRes = await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: 'Bearer ' + tokenData.access_token,
            'User-Agent': 'PampoBoard-App',
          },
        });
        const emails = await emailsRes.json();
        if (Array.isArray(emails)) {
          const primary = emails.find((e) => e.primary && e.verified) || emails[0];
          if (primary) email = primary.email;
        }
      } catch (e) {
        console.warn('Could not fetch GitHub private email:', e);
      }
    }

    if (!email) {
      email = `${ghUser.login.toLowerCase()}@github.com`;
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    let defaultWs = null;

    if (user) {
      if (ghUser.avatar_url) user.avatar = ghUser.avatar_url;
      if (ghUser.name && !user.name) user.name = ghUser.name;
      await user.save();

      defaultWs = await Workspace.findOne({ userId: user._id, isDefault: true });
      if (!defaultWs) {
        defaultWs = await Workspace.findOne({ userId: user._id });
      }
    } else {
      user = new User({
        name: ghUser.name || ghUser.login,
        email: email.toLowerCase(),
        password: Math.random().toString(36).slice(-12) + 'PB!2026',
        avatar: ghUser.avatar_url,
      });
      await user.save();
      defaultWs = await createDefaultUserData(user._id);
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });
    const userSafe = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    };

    const targetUrl = `/?oauth_token=${encodeURIComponent(token)}&oauth_user=${encodeURIComponent(JSON.stringify(userSafe))}&default_ws=${encodeURIComponent(defaultWs ? defaultWs._id.toString() : '')}`;
    res.redirect(targetUrl);
  } catch (err) {
    console.error('GitHub callback error:', err);
    res.redirect('/?error=oauth_failed');
  }
});

// Official Google OAuth Redirect Flow
router.get('/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.get('host');
  const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

  if (!clientId) {
    return res.redirect('/?error=oauth_missing_config&provider=google');
  }

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent`;
  res.redirect(googleAuthUrl);
});

// Google OAuth Callback from Google.com
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect('/?error=no_code_provided');
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error('Google token exchange error:', tokenData);
      return res.redirect('/?error=google_token_exchange_failed');
    }

    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: 'Bearer ' + tokenData.access_token },
    });
    const googleUser = await userInfoRes.json();

    if (!googleUser.email) {
      return res.redirect('/?error=no_google_email');
    }

    const email = googleUser.email.toLowerCase();
    let user = await User.findOne({ email });
    let defaultWs = null;

    if (user) {
      if (googleUser.picture) user.avatar = googleUser.picture;
      if (googleUser.name && !user.name) user.name = googleUser.name;
      await user.save();

      defaultWs = await Workspace.findOne({ userId: user._id, isDefault: true });
      if (!defaultWs) {
        defaultWs = await Workspace.findOne({ userId: user._id });
      }
    } else {
      user = new User({
        name: googleUser.name || email.split('@')[0],
        email,
        password: Math.random().toString(36).slice(-12) + 'PB!2026',
        avatar: googleUser.picture || '',
      });
      await user.save();
      defaultWs = await createDefaultUserData(user._id);
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });
    const userSafe = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    };

    const targetUrl = `/?oauth_token=${encodeURIComponent(token)}&oauth_user=${encodeURIComponent(JSON.stringify(userSafe))}&default_ws=${encodeURIComponent(defaultWs ? defaultWs._id.toString() : '')}`;
    res.redirect(targetUrl);
  } catch (err) {
    console.error('Google callback error:', err);
    res.redirect('/?error=oauth_failed');
  }
});

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

// Direct GitHub Profile Sync / Quick Login
router.post('/github', async (req, res) => {
  try {
    const { githubUsername } = req.body;
    if (!githubUsername || !githubUsername.trim()) {
      return res.status(400).json({ error: 'Usuário do GitHub é obrigatório' });
    }

    const cleanUser = githubUsername.trim();
    let ghProfile = null;

    try {
      const userRes = await fetch('https://api.github.com/users/' + encodeURIComponent(cleanUser), {
        headers: { 'User-Agent': 'PampoBoard-App' },
      });
      if (userRes.ok) {
        ghProfile = await userRes.json();
      }
    } catch (e) {
      console.warn('GitHub lookup error:', e);
    }

    if (!ghProfile) {
      ghProfile = {
        login: cleanUser,
        name: cleanUser,
        avatar_url: 'https://github.com/' + encodeURIComponent(cleanUser) + '.png',
        email: cleanUser.toLowerCase() + '@github.com',
      };
    }

    const email = (ghProfile.email || (cleanUser.toLowerCase() + '@github.com')).toLowerCase();
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
        name: ghProfile.name || cleanUser,
        email,
        password: Math.random().toString(36).slice(-12) + 'PB!2026',
        avatar: ghProfile.avatar_url || ('https://github.com/' + encodeURIComponent(cleanUser) + '.png'),
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
    console.error('Erro no login GitHub:', err);
    res.status(500).json({ error: 'Erro ao autenticar com o GitHub' });
  }
});

export default router;
