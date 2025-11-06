# ============================================================
# Diagnóstico Rápido - PLI 2050
# Verifica se o ambiente está pronto para rodar
# ============================================================

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🔍 PLI 2050 - Diagnóstico do Ambiente              ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$allOk = $true

# ============================================================
# 1. Node.js
# ============================================================
Write-Host "1️⃣  Verificando Node.js..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ Node.js NÃO instalado!" -ForegroundColor Red
    Write-Host "      Instale em: https://nodejs.org/" -ForegroundColor White
    $allOk = $false
}

# ============================================================
# 2. VS Code
# ============================================================
Write-Host ""
Write-Host "2️⃣  Verificando VS Code..." -ForegroundColor Yellow
if (Get-Command code -ErrorAction SilentlyContinue) {
    Write-Host "   ✅ VS Code instalado e no PATH" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  VS Code não detectado no PATH" -ForegroundColor Yellow
    Write-Host "      (Não é crítico, mas recomendado)" -ForegroundColor White
}

# ============================================================
# 3. Estrutura de pastas
# ============================================================
Write-Host ""
Write-Host "3️⃣  Verificando estrutura de pastas..." -ForegroundColor Yellow

$paths = @{
    "Backend" = "D:\SISTEMA_FORMULARIOS_ENTREVISTA\backend\server\backend-api"
    "Frontend" = "D:\SISTEMA_FORMULARIOS_ENTREVISTA\frontend\html\index.html"
    ".env raiz" = "D:\SISTEMA_FORMULARIOS_ENTREVISTA\.env"
    "package.json" = "D:\SISTEMA_FORMULARIOS_ENTREVISTA\backend\server\backend-api\package.json"
}

foreach ($name in $paths.Keys) {
    $path = $paths[$name]
    if (Test-Path $path) {
        Write-Host "   ✅ $name encontrado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $name NÃO encontrado!" -ForegroundColor Red
        Write-Host "      Esperado em: $path" -ForegroundColor White
        $allOk = $false
    }
}

# ============================================================
# 4. Dependências do backend
# ============================================================
Write-Host ""
Write-Host "4️⃣  Verificando dependências do backend..." -ForegroundColor Yellow
$nodeModulesPath = "D:\SISTEMA_FORMULARIOS_ENTREVISTA\backend\server\backend-api\node_modules"
if (Test-Path $nodeModulesPath) {
    Write-Host "   ✅ node_modules existe" -ForegroundColor Green
    
    # Verificar pacotes principais
    $requiredPackages = @("express", "pg", "cors", "helmet", "dotenv")
    $missingPackages = @()
    
    foreach ($pkg in $requiredPackages) {
        $pkgPath = Join-Path $nodeModulesPath $pkg
        if (-not (Test-Path $pkgPath)) {
            $missingPackages += $pkg
        }
    }
    
    if ($missingPackages.Count -eq 0) {
        Write-Host "   ✅ Pacotes principais instalados: $($requiredPackages -join ', ')" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Pacotes faltando: $($missingPackages -join ', ')" -ForegroundColor Yellow
        Write-Host "      Execute: cd backend\server\backend-api && npm install" -ForegroundColor White
    }
} else {
    Write-Host "   ⚠️  node_modules NÃO encontrado" -ForegroundColor Yellow
    Write-Host "      Execute: cd backend\server\backend-api && npm install" -ForegroundColor White
}

# ============================================================
# 5. Arquivo .env
# ============================================================
Write-Host ""
Write-Host "5️⃣  Verificando configuração (.env)..." -ForegroundColor Yellow

$envPath = "D:\SISTEMA_FORMULARIOS_ENTREVISTA\backend\server\backend-api\.env"
if (Test-Path $envPath) {
    Write-Host "   ✅ .env existe em backend/server/backend-api" -ForegroundColor Green
    
    # Verificar conteúdo
    $envContent = Get-Content $envPath -Raw
    $requiredVars = @("PGHOST", "PGPORT", "PGDATABASE", "PGUSER", "PGPASSWORD", "ALLOWED_ORIGINS")
    $missingVars = @()
    
    foreach ($varName in $requiredVars) {
        if ($envContent -notmatch "$varName=") {
            $missingVars += $varName
        }
    }
    
    if ($missingVars.Count -eq 0) {
        Write-Host "   ✅ Variáveis obrigatórias configuradas" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Variáveis faltando: $($missingVars -join ', ')" -ForegroundColor Yellow
        $allOk = $false
    }
} else {
    Write-Host "   ⚠️  .env NÃO encontrado em backend/server/backend-api" -ForegroundColor Yellow
    
    $rootEnvPath = "D:\SISTEMA_FORMULARIOS_ENTREVISTA\.env"
    if (Test-Path $rootEnvPath) {
        Write-Host "      Mas existe na raiz. Execute:" -ForegroundColor White
        Write-Host "      Copy-Item '$rootEnvPath' '$envPath'" -ForegroundColor Cyan
    } else {
        Write-Host "   ❌ .env NÃO encontrado nem na raiz!" -ForegroundColor Red
        $allOk = $false
    }
}

# ============================================================
# 6. Porta 3000 disponível
# ============================================================
Write-Host ""
Write-Host "6️⃣  Verificando porta 3000..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Host "   ⚠️  Porta 3000 em uso!" -ForegroundColor Yellow
    Write-Host "      Um servidor já está rodando, ou execute:" -ForegroundColor White
    Write-Host "      Stop-Process -Name 'node' -Force" -ForegroundColor Cyan
} else {
    Write-Host "   ✅ Porta 3000 disponível" -ForegroundColor Green
}

# ============================================================
# 7. Conectividade com RDS (se backend estiver rodando)
# ============================================================
Write-Host ""
Write-Host "7️⃣  Testando conectividade com backend (se estiver rodando)..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/health" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "   ✅ Backend ONLINE!" -ForegroundColor Green
    Write-Host "      Status: $($response.status)" -ForegroundColor Cyan
    Write-Host "      Database: $($response.database)" -ForegroundColor Cyan
} catch {
    Write-Host "   ℹ️  Backend não está rodando (OK se ainda não iniciou)" -ForegroundColor Cyan
    Write-Host "      Para iniciar: .\START-PLI2050.ps1" -ForegroundColor White
}

# ============================================================
# Resumo Final
# ============================================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan

if ($allOk) {
    Write-Host " ✅ AMBIENTE OK - Pronto para rodar!" -ForegroundColor Green
    Write-Host ""
    Write-Host " 🚀 Para iniciar:" -ForegroundColor Yellow
    Write-Host "    .\START-PLI2050.ps1" -ForegroundColor Cyan
} else {
    Write-Host " ⚠️  Alguns problemas encontrados" -ForegroundColor Yellow
    Write-Host ""
    Write-Host " 📝 Corrija os itens marcados com ❌ acima" -ForegroundColor White
}

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
