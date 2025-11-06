# ============================================================
# INICIAR SERVIDOR FASTAPI - PLI 2050
# ============================================================

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🚀 FastAPI - PLI 2050 Sistema de Formulários       ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verificar Python
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Python não instalado!" -ForegroundColor Red
    Write-Host "   Instale em: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

$pythonVersion = python --version
Write-Host "✅ Python detectado: $pythonVersion" -ForegroundColor Green
Write-Host ""

# Navegar para diretório do FastAPI
$BackendPath = "D:\SISTEMA_FORMULARIOS_ENTREVISTA\backend-fastapi"
if (-not (Test-Path $BackendPath)) {
    Write-Host "❌ Diretório backend-fastapi não encontrado!" -ForegroundColor Red
    exit 1
}

Set-Location $BackendPath
Write-Host "📂 Diretório: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

# Verificar venv
if (-not (Test-Path "venv")) {
    Write-Host "⚙️  Criando ambiente virtual Python..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "✅ Ambiente virtual criado!" -ForegroundColor Green
}

# Ativar venv
Write-Host "🔄 Ativando ambiente virtual..." -ForegroundColor Cyan
& ".\venv\Scripts\Activate.ps1"

# Instalar dependências
if (-not (Test-Path "venv\Lib\site-packages\fastapi")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    pip install -r requirements.txt
    Write-Host "✅ Dependências instaladas!" -ForegroundColor Green
    Write-Host ""
}

# Verificar .env
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Arquivo .env não encontrado!" -ForegroundColor Yellow
    Write-Host "   Criando .env padrão..." -ForegroundColor Cyan
    Copy-Item ".env.example" ".env" -ErrorAction SilentlyContinue
}

# Iniciar servidor
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " 🎯 Iniciando servidor FastAPI..." -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📡 URL: http://localhost:8000" -ForegroundColor White
Write-Host "📚 Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "🏥 Health: http://localhost:8000/health" -ForegroundColor White
Write-Host ""
Write-Host "💡 Pressione Ctrl+C para parar o servidor" -ForegroundColor Yellow
Write-Host ""

# Executar uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " ⏹️  Servidor finalizado" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
