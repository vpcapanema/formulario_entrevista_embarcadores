# Inicia o backend em uma NOVA janela do PowerShell (terminal exclusivo)
# Uso: execute a partir da raiz do repositório:
#   pwsh.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-backend-terminal.ps1

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$backendDir = Join-Path $scriptRoot '..\backend-api' | Resolve-Path -ErrorAction Stop
$pidFile = Join-Path $scriptRoot 'backend.terminal.pid'

Write-Output "Iniciando backend em nova janela (diretório: $backendDir)"

# Monta o comando para rodar dentro do novo terminal e manter a janela aberta (-NoExit)
$escapedBackendDir = $backendDir -replace "'", "''"
$cmd = "Set-Location -Path '$escapedBackendDir'; node server.js"

# Abrir nova janela do PowerShell que executa o comando e permanece aberta
$p = Start-Process -FilePath 'pwsh.exe' -ArgumentList ('-NoProfile','-NoExit','-Command', $cmd) -PassThru -WindowStyle Normal

Start-Sleep -Milliseconds 500

if ($p -and $p.Id) {
    $p.Id | Out-File -FilePath $pidFile -Encoding ascii -Force
    Write-Output "Servidor iniciado em janela separada com PID: $($p.Id) (PID salvo em $pidFile)"
} else {
    Write-Error "Falha ao iniciar o servidor em nova janela."
}

Write-Output "Se quiser parar: pwsh.exe -File .\scripts\stop-backend-terminal.ps1"
