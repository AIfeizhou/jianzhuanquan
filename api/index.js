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

app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://jianzhuanquan.vercel.app',
  credentials: true,
}));

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
