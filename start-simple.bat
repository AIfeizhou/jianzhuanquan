@echo off
echo 🏗️ 建筑安全识别平台启动脚本
echo ========================================

REM 设置环境变量
set ARK_API_KEY=fc1cb104-2428-4af0-831d-5a8b1c728bd9
set ARK_API_BASE_URL=https://ark.cn-beijing.volces.com
set ARK_MODEL_ID=ep-20250803221616-x98qx
set NODE_ENV=development
set PORT=3000
set UPLOAD_PATH=./uploads

echo ✅ 环境变量已配置
echo 🚀 启动后端服务器 (端口3000)...

REM 启动后端
start "后端服务" cmd /k "node server.js"

echo ⏳ 等待后端启动...
timeout /t 5 /nobreak > nul

echo 🚀 启动前端服务器 (端口3001)...
REM 启动前端
cd client
start "前端服务" cmd /k "set PORT=3001 && npm start"

echo ============================================
echo 🎉 启动完成！
echo 📱 前端地址: http://localhost:3001
echo ⚙️  后端地址: http://localhost:3000
echo ============================================
echo 💡 请等待前端完全启动后再访问网址
echo ⏹️  关闭窗口即可停止服务

pause
