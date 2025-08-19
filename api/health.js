module.exports = (req, res) => {
  // 设置CORS头部
  res.setHeader('Access-Control-Allow-Origin', 'https://jianzhuanquan.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // 健康检查响应
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Function API working on Vercel',
    method: req.method,
    url: req.url
  });
};
