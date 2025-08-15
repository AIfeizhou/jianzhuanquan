Write-Host "正在推送到GitHub仓库..." -ForegroundColor Green
Write-Host ""

Write-Host "设置Git配置..." -ForegroundColor Yellow
git config --global core.pager cat

Write-Host ""
Write-Host "推送到GitHub..." -ForegroundColor Yellow
git push origin master

Write-Host ""
Write-Host "完成！" -ForegroundColor Green
Read-Host "按回车键继续"
