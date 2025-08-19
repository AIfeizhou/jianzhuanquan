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
  
  // 测试上传响应
  res.status(200).json({
    success: true,
    message: '测试上传端点工作正常',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
};
