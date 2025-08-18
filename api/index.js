const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Vercel无状态环境：使用/tmp作为可写目录
const uploadDir = process.env.UPLOAD_PATH || '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(compression());
app.use(morgan('combined'));

// 动态CORS白名单：允许前端正式域和本项目在 vercel.app 下的预览域
const corsOptions = {
  origin(origin, callback) {
    const allowed = [
      'https://jianzhuanquan.vercel.app',
    ];
    const isVercelPreview = typeof origin === 'string' && /\.vercel\.app$/.test(origin);
    if (!origin || allowed.includes(origin) || isVercelPreview) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// 兜底CORS（防止某些路径/中间件未命中时丢失CORS头）
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (/\.vercel\.app$/.test(origin) || origin === 'https://jianzhuanquan.vercel.app')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

app.use('/uploads', express.static(uploadDir));

// 使用上层 routes
app.use('/api/analyze', require('../routes/analyze'));
app.use('/api/upload', require('../routes/upload'));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', ts: new Date().toISOString(), env: process.env.NODE_ENV || 'production' });
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log('API server running at http://localhost:' + PORT);
  });
}
