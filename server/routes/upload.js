import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const hash = crypto.randomBytes(12).toString('hex');
    cb(null, `print-${Date.now()}-${hash}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});

// File upload endpoint
router.post('/file', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }
  const publicUrl = `/uploads/${req.file.filename}`;
  res.json({
    url: publicUrl,
    filename: req.file.filename,
    size: req.file.size,
  });
});

// Base64 upload endpoint (for instant Ctrl+V pasting)
router.post('/base64', (req, res) => {
  try {
    const { dataUrl, filename: customName } = req.body;
    if (!dataUrl) {
      return res.status(400).json({ error: 'dataUrl não fornecido' });
    }

    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Formato base64 inválido' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const ext = mimeType.split('/')[1] || 'png';
    const filename = `print-${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    res.json({
      url: publicUrl,
      filename,
      size: buffer.length,
    });
  } catch (err) {
    console.error('Erro ao salvar print base64:', err);
    res.status(500).json({ error: 'Erro ao processar imagem da área de transferência' });
  }
});

export default router;
