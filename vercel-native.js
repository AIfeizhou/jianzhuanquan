const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
    // 设置CORS头部
    res.setHeader('Access-Control-Allow-Origin', 'https://jianzhuanquan.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // 解析URL
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    
    // 设置响应头
    res.setHeader('Content-Type', 'application/json');
    
    try {
        if (path === '/health') {
            // 健康检查
            res.writeHead(200);
            res.end(JSON.stringify({
                status: 'OK',
                timestamp: new Date().toISOString(),
                message: 'Native Node.js server working on Vercel',
                server: 'native-http'
            }));
        } else if (path === '/') {
            // 根路径
            res.writeHead(200);
            res.end(JSON.stringify({
                message: '🏗️ 建筑安全识别平台 API - 原生版',
                version: '1.0.1',
                status: 'running',
                server: 'native-http'
            }));
        } else if (path === '/api/upload/single' && req.method === 'POST') {
            // 测试上传端点
            res.writeHead(200);
            res.end(JSON.stringify({
                success: true,
                message: '测试上传端点工作正常',
                timestamp: new Date().toISOString(),
                server: 'native-http'
            }));
        } else if (path === '/api/analyze' && req.method === 'POST') {
            // 测试分析端点
            res.writeHead(200);
            res.end(JSON.stringify({
                success: true,
                message: '测试分析端点工作正常',
                timestamp: new Date().toISOString(),
                server: 'native-http'
            }));
        } else {
            // 404处理
            res.writeHead(404);
            res.end(JSON.stringify({
                success: false,
                message: '路由不存在',
                path: path,
                server: 'native-http'
            }));
        }
    } catch (error) {
        // 错误处理
        console.error('服务器错误:', error);
        res.writeHead(500);
        res.end(JSON.stringify({
            success: false,
            message: '服务器内部错误',
            error: error.message,
            server: 'native-http'
        }));
    }
});

module.exports = server;
