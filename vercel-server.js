const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Vercel环境下的路径配置
const uploadDir = process.env.UPLOAD_PATH || '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 中间件配置
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "blob:", "https:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", "https://ark.cn-beijing.volces.com"]
        }
    }
}));

app.use(compression());
app.use(morgan('combined'));

// CORS配置
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'https://jianzhuanquan.vercel.app',
    credentials: true
}));

// 请求大小限制
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// 速率限制
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: '请求过于频繁，请稍后再试',
        retryAfter: '15分钟'
    }
});
app.use('/api/', limiter);

// 静态文件服务
app.use('/uploads', express.static(uploadDir));

// 路由
app.use('/api/analyze', require('./routes/analyze'));
app.use('/api/upload', require('./routes/upload'));

// 健康检查
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production'
    });
});

// API状态页面
app.get('/api/status', (req, res) => {
    res.json({
        message: '🏗️ 建筑安全识别平台 API',
        version: '1.0.1',
        status: 'running',
        endpoints: {
            health: '/health',
            upload: '/api/upload/single',
            analyze: '/api/analyze'
        },
        frontend: 'https://jianzhuanquan.vercel.app'
    });
});

// 错误处理中间件
app.use((error, req, res, next) => {
    console.error('服务器错误:', error);
    res.status(500).json({
        success: false,
        message: '服务器内部错误',
        error: process.env.NODE_ENV === 'development' ? error.message : '请联系管理员'
    });
});

// Vercel需要导出app
module.exports = app;

// 本地开发时启动服务器
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 建筑安全识别服务器启动成功`);
        console.log(`📡 服务地址: http://localhost:${PORT}`);
        console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
        console.log(`📁 上传目录: ${uploadDir}`);
    });
}
