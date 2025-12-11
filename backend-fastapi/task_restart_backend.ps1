# ============================================================
# Task: Reiniciar Backend PLI 2050 com Debug Detalhado
# ============================================================

Write-Host "🔄 Reiniciando Backend PLI 2050..." -ForegroundColor Cyan
Write-Host ""

# Passo 1: Matar todos os processos uvicorn na porta 8000
Write-Host "🛑 Matando processos uvicorn na porta 8000..." -ForegroundColor Yellow

# Usar Get-NetTCPConnection para encontrar processos na porta 8000
$connections = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($connections) {
    Write-Host "📋 Conexões encontradas na porta 8000:" -ForegroundColor Yellow
    $connections | ForEach-Object {
        Write-Host "   Local: $($_.LocalAddress):$($_.LocalPort) Remote: $($_.RemoteAddress):$($_.RemotePort) State: $($_.State) PID: $($_.OwningProcess)" -ForegroundColor Gray
    }

    # Extrair PIDs únicos e matar processos
    $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique

    foreach ($processId in $pids) {
        Write-Host "   🗡️  Matando processo PID: $processId" -ForegroundColor Red
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    }

    Write-Host "✅ Processos na porta 8000 finalizados" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Nenhum processo encontrado na porta 8000" -ForegroundColor Blue
}

Write-Host ""

# Passo 2: Aguardar um pouco para liberar a porta
Write-Host "⏳ Aguardando liberação da porta..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Verificar se a porta ainda está ocupada
$stillOccupied = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($stillOccupied) {
    Write-Host "⚠️  Porta 8000 ainda ocupada, tentando forçar liberação..." -ForegroundColor Yellow
    foreach ($conn in $stillOccupied) {
        Write-Host "   🗡️  Forçando kill do processo $($conn.OwningProcess)" -ForegroundColor Red
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

# Passo 3: Iniciar backend com debug detalhado
Write-Host "🚀 Iniciando Backend com debug detalhado..." -ForegroundColor Cyan
Write-Host ""

# Configurar variável de ambiente ALLOWED_ORIGINS
$env:ALLOWED_ORIGINS = "http://localhost:5500,http://127.0.0.1:5500,http://localhost:8000,http://127.0.0.1:8000,https://vpcapanema.github.io"

Write-Host "✅ CORS configurado para:" -ForegroundColor Green
Write-Host "   - http://localhost:5500" -ForegroundColor Yellow
Write-Host "   - http://127.0.0.1:5500" -ForegroundColor Yellow
Write-Host "   - http://localhost:8000" -ForegroundColor Yellow
Write-Host "   - http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host "   - https://vpcapanema.github.io" -ForegroundColor Green
Write-Host ""

# Mudar para o diretório correto
Set-Location -Path $PSScriptRoot

# Iniciar servidor com debug detalhado (sem reload para evitar problemas)
Write-Host "🔥 Iniciando Uvicorn com debug..." -ForegroundColor Cyan
Write-Host "   📊 Porta: 8000" -ForegroundColor White
Write-Host "   🔄 Reload: Desabilitado" -ForegroundColor White
Write-Host "   📝 Log Level: Debug" -ForegroundColor White
Write-Host ""

python -m uvicorn main:app --host 0.0.0.0 --port 8000 --log-level debug