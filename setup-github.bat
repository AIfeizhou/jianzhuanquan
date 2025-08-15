@echo off
echo ========================================
echo    建筑安全识别平台 - GitHub配置
echo ========================================
echo.

echo 正在配置GitHub远程仓库...
echo.

echo 1. 移除旧的远程仓库配置...
git remote remove origin

echo.
echo 2. 添加新的远程仓库...
git remote add origin https://github.com/scofileldyoong/jianzhuanquan123.git

echo.
echo 3. 验证远程仓库配置...
git remote -v

echo.
echo 4. 推送到GitHub...
git push -u origin master

echo.
echo ========================================
echo 配置完成！
echo ========================================
pause
