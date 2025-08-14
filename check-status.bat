@echo off
echo 🏗️ 建筑安全识别平台状态检查
echo ========================================

echo 📡 检查后端服务 (端口3000)...
netstat -an | findstr ":3000" > nul
if %errorlevel% equ 0 (
    echo ✅ 后端服务运行正常 (端口3000)
) else (
    echo ❌ 后端服务未运行
)

echo 📱 检查前端服务 (端口3001)...
netstat -an | findstr ":3001" > nul
if %errorlevel% equ 0 (
    echo ✅ 前端服务运行正常 (端口3001)
) else (
    echo ❌ 前端服务未运行
)

echo.
echo 🌐 服务地址:
echo   前端: http://localhost:3001
echo   后端: http://localhost:3000
echo.

echo 🔍 测试后端API...
curl -s http://localhost:3000/health > nul
if %errorlevel% equ 0 (
    echo ✅ 后端API响应正常
) else (
    echo ❌ 后端API无响应
)

echo.
echo ========================================
pause
