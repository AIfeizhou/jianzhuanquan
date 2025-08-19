const express = require('express');

const app = express();

// 基本中间件
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// 手动设置CORS头部 - 确保在所有响应中都有
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://jianzhuanquan.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    next();
});

// 健康检查
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'Minimal Express server working on Vercel'
    });
});

// 根路径
app.get('/', (req, res) => {
    res.json({
        message: '🏗️ 建筑安全识别平台 API - 简化版',
        version: '1.0.1',
        status: 'running'
    });
});

// 测试上传端点
app.post('/api/upload/single', (req, res) => {
    res.json({
        success: true,
        message: '测试上传端点工作正常',
        timestamp: new Date().toISOString()
    });
});

// 测试分析端点
app.post('/api/analyze', (req, res) => {
    res.json({
        success: true,
        message: '测试分析端点工作正常',
        timestamp: new Date().toISOString()
    });
});

// 错误处理
app.use((error, req, res, next) => {
    console.error('服务器错误:', error);
    res.status(500).json({
        success: false,
        message: '服务器内部错误',
        error: error.message
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
