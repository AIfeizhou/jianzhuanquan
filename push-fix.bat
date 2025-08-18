@echo off
echo ========================================
echo     建筑安全识别平台 - Git操作
echo ========================================
echo.

echo 正在添加修改的文件...
git add vercel.json

echo.
echo 正在提交更改...
git commit -m "修复Vercel部署配置：移除冲突的functions属性"

echo.
echo 正在推送到GitHub...
git push origin master

echo.
echo ========================================
echo 操作完成！
echo ========================================
pause
