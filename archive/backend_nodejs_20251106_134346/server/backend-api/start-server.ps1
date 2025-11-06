# ============================================================
# Script para iniciar o servidor backend PLI 2050
# ============================================================

param(
    [switch]$SkipCheck = $false
)

# Cores
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor $InfoColor
Write-Host " 🚀 PLI 2050 - Iniciando Servidor Backend" -ForegroundColor $SuccessColor
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor $InfoColor
Write-Host ""

# Verificar se node está instalado
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ ERRO: Node.js não está instalado!" -ForegroundColor $ErrorColor
    Write-Host "   Instale em: https://nodejs.org/" -ForegroundColor $WarningColor
    exit 1
}

$nodeVersion = node --version
Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor $SuccessColor

# Navegar para o diretório do backend
$BackendPath = "D:\SISTEMA_FORMULARIOS_ENTREVISTA\backend\server\backend-api"
if (-not (Test-Path $BackendPath)) {
    Write-Host "❌ ERRO: Diretório do backend não encontrado!" -ForegroundColor $ErrorColor
    Write-Host "   Procurando em: $BackendPath" -ForegroundColor $WarningColor
    exit 1
}

Set-Location $BackendPath
Write-Host "� Diretório: $(Get-Location)" -ForegroundColor $InfoColor
Write-Host ""

# Verificar se package.json existe
if (-not (Test-Path "package.json")) {
    Write-Host "❌ ERRO: package.json não encontrado!" -ForegroundColor $ErrorColor
    exit 1
}

# Verificar se node_modules existe
if (-not (Test-Path "node_modules") -and -not $SkipCheck) {
    Write-Host "⚠️  node_modules não encontrado. Instalando dependências..." -ForegroundColor $WarningColor
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ ERRO ao instalar dependências!" -ForegroundColor $ErrorColor
        exit 1
    }
    Write-Host "✅ Dependências instaladas com sucesso!" -ForegroundColor $SuccessColor
    Write-Host ""
}

# Verificar se .env existe
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Arquivo .env não encontrado!" -ForegroundColor $WarningColor
    Write-Host "   Copiando .env da raiz do projeto..." -ForegroundColor $InfoColor
    
    $RootEnv = "D:\SISTEMA_FORMULARIOS_ENTREVISTA\.env"
    if (Test-Path $RootEnv) {
        Copy-Item $RootEnv ".env"
        Write-Host "✅ Arquivo .env copiado!" -ForegroundColor $SuccessColor
    } else {
        Write-Host "❌ ERRO: .env não encontrado na raiz do projeto!" -ForegroundColor $ErrorColor
        exit 1
    }
    Write-Host ""
}

# Verificar se a porta 3000 está em uso
$Port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($Port3000) {
    Write-Host "⚠️  ATENÇÃO: Porta 3000 já está em uso!" -ForegroundColor $WarningColor
    Write-Host "   Matando processos anteriores..." -ForegroundColor $InfoColor
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "✅ Processos anteriores finalizados" -ForegroundColor $SuccessColor
    Write-Host ""
}

# Iniciar servidor
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor $InfoColor
Write-Host " 🎯 Iniciando servidor..." -ForegroundColor $SuccessColor
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor $InfoColor
Write-Host ""
Write-Host "💡 Pressione Ctrl+C para parar o servidor" -ForegroundColor $WarningColor
Write-Host ""

# Executar servidor
node server.js

# Se chegou aqui, o servidor foi encerrado
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor $InfoColor
Write-Host " ⏹️  Servidor finalizado" -ForegroundColor $WarningColor
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor $InfoColor
Write-Host ""
