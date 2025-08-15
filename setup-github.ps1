Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    建筑安全识别平台 - GitHub配置" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "正在配置GitHub远程仓库..." -ForegroundColor Green
Write-Host ""

Write-Host "1. 移除旧的远程仓库配置..." -ForegroundColor Yellow
git remote remove origin

Write-Host ""
Write-Host "2. 添加新的远程仓库..." -ForegroundColor Yellow
git remote add origin https://github.com/scofileldyoong/jianzhuanquan123.git

Write-Host ""
Write-Host "3. 验证远程仓库配置..." -ForegroundColor Yellow
git remote -v

Write-Host ""
Write-Host "4. 推送到GitHub..." -ForegroundColor Yellow
git push -u origin master

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "配置完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Read-Host "按回车键继续"
