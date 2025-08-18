const express = require('express');
const cors = require('cors');

const app = express();

// 更兼容的CORS配置
const corsOptions = {
    origin: function (origin, callback) {
        // 允许所有来源，或者特定的前端域名
        const allowedOrigins = [
            'https://jianzhuanquan.vercel.app',
            'http://localhost:3001',
            'http://localhost:3000'
        ];
        
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Origin', 
        'X-Requested-With', 
        'Content-Type', 
        'Accept', 
        'Authorization',
        'Cache-Control',
        'Pragma'
    ],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 204
};

// 应用CORS中间件
app.use(cors(corsOptions));

// 手动处理预检请求
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || 'https://jianzhuanquan.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(204).end();
});

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// 健康检查 - 立即可用
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        message: 'Express server working on Vercel with CORS fixed'
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
        }
    });
});

// 延迟加载路由 - 避免启动时错误
let routesLoaded = false;

const loadRoutes = () => {
    if (routesLoaded) return;
    
    try {
        // 延迟创建上传目录
        const fs = require('fs');
        const uploadDir = process.env.UPLOAD_PATH || '/tmp/uploads';
        
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // 加载路由
        app.use('/api/analyze', require('./routes/analyze'));
        app.use('/api/upload', require('./routes/upload'));
        
        // 静态文件服务
        app.use('/uploads', express.static(uploadDir));
        
        routesLoaded = true;
        console.log('路由加载完成');
    } catch (error) {
        console.error('路由加载失败:', error);
        // 即使路由加载失败，基本功能仍然可用
    }
};

// 在第一个API请求时加载路由
app.use('/api/*', (req, res, next) => {
    if (!routesLoaded) {
        loadRoutes();
    }
    next();
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
