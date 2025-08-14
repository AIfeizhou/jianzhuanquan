# 建筑安全识别平台

基于AI视觉识别技术的建筑安全与质量检测平台，通过用户上传的施工现场图片，自动识别违规行为并提供整改建议。

## 🚀 项目特性

- **智能识别**: 使用豆包1.6 flash 0715模型进行建筑安全违规识别
- **实时分析**: 快速处理和分析上传的施工现场图片
- **可视化标注**: 在原图上直观标注违规区域
- **专业评估**: 提供详细的安全评估报告和整改建议
- **响应式设计**: 支持PC端和移动端访问
- **现代化UI**: 采用Ant Design设计语言，界面美观易用

## 📋 功能概览

### 核心功能
- **图片上传**: 支持拖拽上传、点击上传、移动端拍照
- **AI分析**: 自动识别严重违规和一般违规行为
- **结果展示**: 违规标注、详细报告、统计分析
- **数据导出**: 支持报告下载和打印

### 技术特性
- **前端**: React 18 + TypeScript + Ant Design 5.x
- **后端**: Node.js + Express.js
- **AI模型**: 豆包1.6 flash 0715
- **图片处理**: Canvas API + Fabric.js
- **文件上传**: Multer + Sharp

## 🛠️ 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0

### 安装依赖

```bash
# 安装后端依赖
npm install

# 安装前端依赖
npm run install-client
```

### 环境配置

复制环境变量文件并配置：

```bash
cp env.example .env
```

编辑 `.env` 文件，配置以下参数：

```env
# 豆包AI模型配置
ARK_API_KEY=fc1cb104-2428-4af0-831d-5a8b1c728bd9
ARK_API_BASE_URL=https://ark.cn-beijing.volces.com
ARK_MODEL_ID=doubao-seed-1-6-flash-250715

# 应用配置
NODE_ENV=development
PORT=3000
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=20971520

# 数据库配置（可选）
MONGODB_URI=mongodb://localhost:27017/construction_safety
```

### 启动应用

```bash
# 开发模式（同时启动前后端）
npm run dev

# 或分别启动
# 启动后端服务
npm run server

# 启动前端应用（新终端）
npm run client
```

访问应用：
- 前端: http://localhost:3001
- 后端API: http://localhost:3000

## 📁 项目结构

```
建筑安全和质量/
├── client/                 # 前端React应用
│   ├── public/             # 静态资源
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── services/       # API服务
│   │   ├── types/         # TypeScript类型定义
│   │   └── index.tsx      # 应用入口
│   └── package.json
├── routes/                 # 后端路由
│   ├── analyze.js         # AI分析路由
│   └── upload.js          # 文件上传路由
├── uploads/               # 上传文件目录
├── server.js              # 后端服务器
├── package.json           # 后端依赖
└── README.md
```

## 🔧 API 接口

### 文件上传
```
POST /api/upload/single
Content-Type: multipart/form-data

参数:
- image: 图片文件 (最大20MB)

返回:
{
  "success": true,
  "data": {
    "filename": "construction_xxx.jpg",
    "url": "http://localhost:3000/uploads/construction_xxx.jpg",
    "imageInfo": {
      "width": 1920,
      "height": 1080,
      "format": "jpeg"
    }
  }
}
```

### AI分析
```
POST /api/analyze
Content-Type: application/json

参数:
{
  "imageUrl": "http://localhost:3000/uploads/construction_xxx.jpg"
}

返回:
{
  "success": true,
  "data": {
    "analysis": {
      "violations": [...],
      "summary": {
        "severe_count": 2,
        "normal_count": 3,
        "total_score": 75
      }
    }
  }
}
```

## 🎯 使用说明

### 1. 上传图片
- 支持JPG、PNG、BMP、WebP格式
- 文件大小不超过20MB
- 建议分辨率不低于480x360

### 2. AI分析
- 自动识别建筑安全违规行为
- 区分严重违规（红色标注）和一般违规（紫色标注）
- 提供违规条例和整改建议

### 3. 查看结果
- **概览页面**: 违规标注图 + 违规列表
- **详细报告**: 综合评估 + 完整违规信息
- **统计数据**: 安全评分 + 违规统计

### 4. 导出报告
- 支持打印功能
- 可下载详细报告（开发中）

## 🔍 AI识别范围

### 严重违规（红色标注）
- 高空作业无安全防护
- 脚手架搭设不规范
- 临时用电安全隐患
- 起重机械违规操作
- 深基坑支护缺陷
- 模板支撑系统缺陷

### 一般违规（紫色标注）
- 安全帽佩戴不规范
- 安全警示标识缺失
- 材料堆放不规范
- 现场环境脏乱差
- 临时设施搭建不规范

## 📊 性能指标

- **识别准确率**: > 90%
- **响应时间**: < 30秒
- **图片处理**: 支持最大20MB文件
- **并发支持**: 100个并发用户

## 🛡️ 安全特性

- **文件验证**: 严格的文件类型和大小检查
- **数据加密**: HTTPS传输加密
- **错误处理**: 完善的异常处理机制
- **速率限制**: API访问频率限制

## 🌐 浏览器支持

- Chrome >= 88
- Firefox >= 85
- Safari >= 14
- Edge >= 88

## 📝 更新日志

### v1.0.0 (2024-12-09)
- ✨ 初始版本发布
- 🚀 基础AI识别功能
- 📱 响应式UI设计
- 📊 统计分析功能
- 🔧 完整的API接口

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 ISC 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系我们

- 项目主页: [GitHub Repository]
- 问题反馈: [Issues]
- 技术支持: [技术支持邮箱]

## 🙏 致谢

- [Ant Design](https://ant.design/) - UI 组件库
- [React](https://reactjs.org/) - 前端框架
- [Express.js](https://expressjs.com/) - 后端框架
- [豆包AI](https://www.volcengine.com/) - AI模型支持

---

**⚠️ 免责声明**: 本平台提供的AI识别结果仅供参考，不能替代专业的安全检查。实际施工中请严格按照相关安全规范执行。
