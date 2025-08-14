# 🚀 快速启动指南

## 一键启动

1. **安装依赖**
   ```bash
   npm run install-all
   ```

2. **启动应用**
   ```bash
   npm run dev
   ```

3. **访问应用**
   - 前端: http://localhost:3001
   - 后端: http://localhost:3000

## 🏗️ 使用步骤

### 1. 上传图片
- 支持拖拽上传或点击上传
- 格式：JPG、PNG、BMP、WebP
- 大小：最大 20MB

### 2. AI分析
- 点击"开始AI分析"按钮
- 等待 AI 处理（通常 10-30 秒）

### 3. 查看结果
- **标注图片**：红色框=严重违规，紫色框=一般违规
- **违规列表**：详细的违规信息和整改建议
- **统计报告**：安全评分和综合评估

## 🔧 配置说明

### 环境变量
复制 `env.example` 为 `config.env` 并配置：

```env
# 豆包AI配置（已预配置）
ARK_API_KEY=fc1cb104-2428-4af0-831d-5a8b1c728bd9
ARK_API_BASE_URL=https://ark.cn-beijing.volces.com
ARK_MODEL_ID=doubao-seed-1-6-flash-250715

# 应用配置
NODE_ENV=development
PORT=3000
MAX_FILE_SIZE=20971520
```

## 🐛 常见问题

### Q: npm install 失败
**A:** 使用兼容模式安装：
```bash
cd client
npm install --legacy-peer-deps
```

### Q: 端口冲突
**A:** 修改环境变量中的端口配置：
```env
PORT=3000          # 后端端口
CORS_ORIGIN=http://localhost:3001  # 前端端口
```

### Q: AI分析失败
**A:** 检查网络连接和API配置，确保豆包API密钥正确

### Q: 图片上传失败
**A:** 
- 检查文件格式和大小
- 确保 `uploads` 目录存在且有写权限

## 📱 功能特性

### ✅ 已实现功能
- 🖼️ 图片上传（拖拽/点击/移动端拍照）
- 🤖 AI安全违规识别
- 🏷️ 可视化标注（严重/一般违规）
- 📊 统计分析和安全评分
- 📋 详细违规报告
- 📱 响应式设计（PC/移动端）
- 🖨️ 报告打印功能

### 🔮 计划功能
- 📈 历史记录管理
- 📄 报告导出（PDF/Excel）
- 👥 用户管理系统
- 🗄️ 数据库集成

## 🏗️ 项目结构

```
建筑安全和质量/
├── client/          # React前端应用
├── routes/          # Express路由
├── uploads/         # 上传文件目录
├── server.js        # 后端服务器
├── start.js         # 启动脚本
└── README.md        # 详细文档
```

## 🆘 获取帮助

- 📖 详细文档：`README.md`
- 🔧 环境检查：`npm run check`
- ⚙️ 配置示例：`env.example`

---

**💡 提示**：首次使用建议阅读完整的 `README.md` 文档
