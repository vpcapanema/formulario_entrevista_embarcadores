# ============================================================
# INICIAR BACKEND FASTAPI - PLI 2050
# ============================================================

$BackendPath = "D:\SISTEMA_FORMULARIOS_ENTREVISTA\backend-fastapi"
$VenvPython = "$BackendPath\venv\Scripts\python.exe"

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🚀 Iniciando Backend FastAPI - PLI 2050          ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Navegar para diretório do backend
Set-Location $BackendPath
Write-Host "📂 Diretório: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

# Verificar se main.py existe
if (Test-Path "main.py") {
    Write-Host "✅ main.py encontrado!" -ForegroundColor Green
} else {
    Write-Host "❌ main.py NÃO encontrado!" -ForegroundColor Red
    exit 1
}

# Verificar se venv existe
if (Test-Path $VenvPython) {
    Write-Host "✅ Ambiente virtual encontrado!" -ForegroundColor Green
    Write-Host "   Python: $VenvPython" -ForegroundColor DarkGray
} else {
    Write-Host "❌ Ambiente virtual NÃO encontrado!" -ForegroundColor Red
    Write-Host "   Crie o venv com: python -m venv venv" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🔧 Usando Python do ambiente virtual..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📡 URLs:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:8000" -ForegroundColor White
Write-Host "   API Docs:  http://localhost:8000/docs" -ForegroundColor White
Write-Host "   Health:    http://localhost:8000/health" -ForegroundColor White
Write-Host ""
Write-Host "💡 Pressione Ctrl+C para parar o servidor" -ForegroundColor Yellow
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Iniciar uvicorn usando Python do VENV
& $VenvPython -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
