# Inicia o backend como processo destacado e grava o PID em scripts/backend.pid
# Uso: Execute a partir da raiz do repositório (ou dê caminho completo)

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$backendDir = Join-Path $scriptRoot '..\backend-api' | Resolve-Path -ErrorAction Stop
$pidFile = Join-Path $scriptRoot 'backend.pid'

Write-Output "Iniciando backend em: $backendDir"

# Iniciar processo node server.js em background
$p = Start-Process -FilePath 'node' -ArgumentList 'server.js' -WorkingDirectory $backendDir -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 1

if ($p -and $p.Id) {
    $p.Id | Out-File -FilePath $pidFile -Encoding ascii -Force
    Write-Output "Servidor iniciado com PID: $($p.Id) (PID salvo em $pidFile)"
} else {
    Write-Error "Falha ao iniciar o servidor."
}
