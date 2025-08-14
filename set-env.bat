@echo off
chcp 65001 > nul
echo 🔑 设置环境变量...
echo.

REM 设置AI服务API密钥
set ARK_API_KEY=fc1cb104-2428-4af0-831d-5a8b1c728bd9

REM 设置代理环境变量
set HTTP_PROXY=http://127.0.0.1:7890
set HTTPS_PROXY=http://127.0.0.1:7890
set SOCKS_PROXY=socks5://127.0.0.1:7890
set NO_PROXY=localhost,127.0.0.1,192.168.0.0/16,10.0.0.0/8,172.16.0.0/12,::1

echo ✅ 环境变量设置完成：
echo.
echo   ARK_API_KEY=%ARK_API_KEY%
echo   HTTP_PROXY=%HTTP_PROXY%
echo   HTTPS_PROXY=%HTTPS_PROXY%
echo   SOCKS_PROXY=%SOCKS_PROXY%
echo   NO_PROXY=%NO_PROXY%
echo.
echo 💡 现在可以运行以下命令启动应用：
echo   npm run dev
echo.
echo 或者使用代理启动脚本：
echo   start-with-proxy.bat
echo.
pause
