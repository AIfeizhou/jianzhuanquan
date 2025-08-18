@echo off
echo ========================================
echo     最终部署配置 - 提交到GitHub
echo ========================================
echo.

echo 正在添加所有修改的文件...
git add .

echo.
echo 正在提交更改...
git commit -m "最终修复Vercel部署：分离前后端，优化路由配置"

echo.
echo 正在推送到GitHub...
git push origin master

echo.
echo ========================================
echo 代码提交完成！
echo ========================================
echo.
echo 现在请：
echo 1. 回到Vercel项目页面
echo 2. 等待自动重新部署
echo 3. 或者手动点击"Redeploy"
echo.
pause
