@echo off
echo ========================================
echo     提交更新的代码到GitHub
echo ========================================
echo.

echo 正在添加所有修改的文件...
git add .

echo.
echo 正在提交更改...
git commit -m "添加前端部署配置到Vercel：更新vercel.json、构建脚本和package.json"

echo.
echo 正在推送到GitHub...
git push origin master

echo.
echo ========================================
echo 代码提交完成！
echo ========================================
echo.
echo 现在Vercel会自动检测到更新并重新部署
echo 请等待几分钟后查看部署结果
pause
