@echo off
echo 正在推送到GitHub仓库...
echo.

echo 设置Git配置...
git config --global core.pager cat

echo.
echo 推送到GitHub...
git push origin master

echo.
echo 完成！
pause
