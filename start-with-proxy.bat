@echo off
chcp 65001 > nul
echo 🚀 启动建筑安全平台（Rubiz代理模式）
echo.

REM 设置代理环境变量
echo 📡 设置Rubiz代理环境变量...
set HTTP_PROXY=http://127.0.0.1:7890
set HTTPS_PROXY=http://127.0.0.1:7890
set SOCKS_PROXY=socks5://127.0.0.1:7890
set NO_PROXY=localhost,127.0.0.1,192.168.0.0/16,10.0.0.0/8,172.16.0.0/12,::1

REM 设置AI服务API密钥
echo 🔑 设置AI服务API密钥...
set ARK_API_KEY=fc1cb104-2428-4af0-831d-5a8b1c728bd9

echo ✅ HTTP_PROXY=%HTTP_PROXY%
echo ✅ HTTPS_PROXY=%HTTPS_PROXY%
echo ✅ SOCKS_PROXY=%SOCKS_PROXY%
echo ✅ NO_PROXY=%NO_PROXY%
echo ✅ ARK_API_KEY=%ARK_API_KEY%
echo.

REM 检查Rubiz代理是否运行
echo 🔍 检查Rubiz代理状态...
netstat -an | findstr ":7890" > nul
if %errorlevel% equ 0 (
    echo ✅ Rubiz代理端口7890正在监听
) else (
    echo ⚠️  警告: Rubiz代理端口7890未监听
    echo    请确保Rubiz应用已启动并配置正确端口
    echo.
    pause
    exit /b 1
)

echo.
echo 🧪 测试代理连接...
node test-proxy.js

echo.
echo 🏗️  启动建筑安全平台...
echo.

REM 启动应用
npm run dev

pause
