# Para o backend iniciado por start-backend.ps1 usando o PID gravado em scripts/backend.pid
# Uso: Execute a partir da raiz do repositório (ou dê caminho completo)

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$pidFile = Join-Path $scriptRoot 'backend.pid'

if (-Not (Test-Path $pidFile)) {
    Write-Output "Arquivo de PID não encontrado ($pidFile). Procure por processos node manualmente se necessário."
    exit 0
}

$backendPid = (Get-Content $pidFile | Select-Object -First 1).ToString().Trim()
if ([string]::IsNullOrWhiteSpace($backendPid)) {
    Write-Output "PID inválido no arquivo. Removendo arquivo de PID e saindo."
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
    exit 0
}

try {
    Stop-Process -Id $backendPid -Force -ErrorAction Stop
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
    Write-Output "Servidor parado (PID $backendPid)."
} catch {
    Write-Warning ("Não foi possível parar PID " + $backendPid + ": " + $_.Exception.Message)
    Write-Output "Tentando localizar processos node associados..."
    Get-Process node -ErrorAction SilentlyContinue | Format-Table Id, ProcessName, StartTime
}
