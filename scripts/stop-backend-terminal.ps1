# Para a janela/terminal iniciada por start-backend-terminal.ps1
# Uso: pwsh.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\stop-backend-terminal.ps1

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$pidFile = Join-Path $scriptRoot 'backend.terminal.pid'

if (-Not (Test-Path $pidFile)) {
    Write-Error "Arquivo de PID não encontrado: $pidFile. Nenhum processo para parar."
    exit 1
}

 $pidValue = Get-Content $pidFile | Select-Object -First 1
if (-Not $pidValue) {
    Write-Error "PID inválido no arquivo: $pidFile"
    exit 1
}

try {
    $proc = Get-Process -Id $pidValue -ErrorAction Stop
    Write-Output "Parando processo PID $pidValue (Nome: $($proc.ProcessName))..."
    Stop-Process -Id $pidValue -Force -ErrorAction Stop
    Remove-Item $pidFile -ErrorAction SilentlyContinue
    Write-Output "Processo parado e arquivo PID removido."
} catch {
    Write-Warning ("Não foi possível parar o processo PID {0}: {1}" -f $pidValue, $_.Exception.Message)
    if (Test-Path $pidFile) { Remove-Item $pidFile -ErrorAction SilentlyContinue }
    exit 1
}
