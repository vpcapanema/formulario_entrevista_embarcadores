# Inicia o backend em uma NOVA janela do PowerShell executando o wrapper Node
# O wrapper grava o PID real do processo Node em scripts/backend.node.pid
# Uso: pwsh.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-backend-node-terminal.ps1

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Resolve-Path (Join-Path $scriptRoot '..')
$wrapper = Join-Path $repoRoot 'backend-api\run-server-wrapper.js'
$pidFile = Join-Path $scriptRoot 'backend.node.pid'

Write-Output "Iniciando backend (node) em nova janela. Wrapper: $wrapper"

# Comando a executar na nova janela (-NoExit para manter visível)
$cmd = "node '$wrapper'"

# Abrir nova janela do PowerShell que executa o wrapper
$p = Start-Process -FilePath 'pwsh.exe' -ArgumentList ('-NoProfile','-NoExit','-Command', $cmd) -PassThru -WindowStyle Normal

Start-Sleep -Milliseconds 700

# Tentar ler o PID escrito pelo wrapper (pode demorar um pouco até o Node gravar)
for ($i = 0; $i -lt 10; $i++) {
    Start-Sleep -Milliseconds 300
    if (Test-Path $pidFile) { break }
}

if (Test-Path $pidFile) {
    $nodePid = Get-Content $pidFile | Select-Object -First 1
    Write-Output "Servidor Node iniciado (PID: $nodePid). PID salvo em: $pidFile"
} else {
    Write-Warning "Não foi possível localizar o arquivo de PID ($pidFile). A janela do servidor foi aberta, verifique manualmente."
}
