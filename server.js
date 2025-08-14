const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// 信任代理设置（解决速率限制警告）
app.set('trust proxy', 1);

// 确保上传目录存在
const uploadDir = process.env.UPLOAD_PATH || './uploads';
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
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true
}));

// 请求大小限制
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// 速率限制
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 限制每个IP在15分钟内最多100个请求
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
        environment: process.env.NODE_ENV || 'development'
    });
});

// 根路径
app.get('/', (req, res) => {
    res.json({
        message: '🏗️ 建筑安全识别平台 API',
        version: '1.0.1',
        status: 'running',
        endpoints: {
            health: '/health',
            upload: '/api/upload/single',
            analyze: '/api/analyze'
        },
        frontend: 'http://localhost:3001'
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

// 404处理
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: '接口不存在'
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 建筑安全识别服务器启动成功`);
    console.log(`📡 服务地址: http://localhost:${PORT}`);
    console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 上传目录: ${uploadDir}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信号，正在优雅关闭服务器...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('收到 SIGINT 信号，正在优雅关闭服务器...');
    process.exit(0);
});

module.exports = app;
