const express = require('express');
const cors = require('cors');

const app = express();

// 基本中间件
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'https://jianzhuanquan.vercel.app',
    credentials: true
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// 健康检查
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        message: '简化版API服务器运行正常'
    });
});

// 测试路由
app.get('/test', (req, res) => {
    res.json({
        message: '测试路由工作正常',
        env: process.env.NODE_ENV,
        corsOrigin: process.env.CORS_ORIGIN
    });
});

// 根路径
app.get('/', (req, res) => {
    res.json({
        message: '🏗️ 建筑安全识别平台 API - 简化版',
        version: '1.0.1',
        status: 'running',
        endpoints: {
            health: '/health',
            test: '/test'
        }
    });
});

// 错误处理
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
        message: '路由不存在',
        path: req.originalUrl
    });
});

module.exports = app;
