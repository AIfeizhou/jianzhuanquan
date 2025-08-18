const express = require('express');
const app = express();

// 最简单的健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Minimal server working' });
});

// 根路径
app.get('/', (req, res) => {
    res.json({ message: 'Minimal API server' });
});

module.exports = app;
