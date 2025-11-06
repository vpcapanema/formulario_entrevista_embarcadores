# Para parar o processo Node iniciado pelo wrapper (scripts/backend.node.pid)
# Uso: pwsh.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\stop-backend-node.ps1

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$pidFile = Join-Path $scriptRoot 'backend.node.pid'

if (-Not (Test-Path $pidFile)) {
    Write-Error "Arquivo de PID não encontrado: $pidFile. Nenhum processo Node para parar."
    exit 1
}

$pidValue = Get-Content $pidFile | Select-Object -First 1
if (-Not $pidValue) {
    Write-Error "PID inválido no arquivo: $pidFile"
    exit 1
}

try {
    $proc = Get-Process -Id $pidValue -ErrorAction Stop
    Write-Output "Parando processo Node PID $pidValue (Nome: $($proc.ProcessName))..."
    Stop-Process -Id $pidValue -Force -ErrorAction Stop
    Remove-Item $pidFile -ErrorAction SilentlyContinue
    Write-Output "Processo parado e arquivo PID removido."
} catch {
    Write-Warning ("Não foi possível parar o processo Node PID {0}: {1}" -f $pidValue, $_.Exception.Message)
    if (Test-Path $pidFile) { Remove-Item $pidFile -ErrorAction SilentlyContinue }
    exit 1
}
