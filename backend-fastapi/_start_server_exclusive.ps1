$Host.UI.RawUI.WindowTitle = "PLI 2050 - FastAPI Server (Porta 8000)"
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🚀 FastAPI - PLI 2050 (Terminal Exclusivo)         ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📡 Servidor rodando em: http://localhost:8000" -ForegroundColor White
Write-Host "📚 Documentação: http://localhost:8000/docs" -ForegroundColor White
Write-Host "🏥 Health Check: http://localhost:8000/health" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor DarkGray
Write-Host " 📋 LOGS EM TEMPO REAL" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor DarkGray
Write-Host ""

Set-Location "D:\SISTEMA_FORMULARIOS_ENTREVISTA\backend-fastapi"
.\venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Red
Write-Host " ⏹️  SERVIDOR FINALIZADO" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Red
Write-Host ""
Write-Host "Pressione qualquer tecla para fechar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
