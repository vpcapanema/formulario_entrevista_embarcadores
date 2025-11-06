<#
Reorganize workspace into a cleaner directory layout.

Usage (DRY RUN - default):
  pwsh .\scripts\reorganize_workspace.ps1

To execute moves (destructive):
  pwsh .\scripts\reorganize_workspace.ps1 -Execute

Options:
  -MoveBackend   : Also move `backend-api` into `backend/server` (opt-in)
  -GitCommit     : After moves, stage and commit changes (requires git)
  -Force         : Overwrite destination files if they already exist

This script is conservative by default: it prints planned actions and does not move files
unless -Execute is provided. It moves files to the following directories (created if missing):
  frontend/html, frontend/js, frontend/css, frontend/assets, frontend/vendor
  backend/server (optional)
  sql
  scripts
  docs
  tests
  archive

It will also write a log at .\scripts\reorganize_workspace.log
#>

param(
    [switch]$Execute,
    [switch]$MoveBackend,
    [switch]$GitCommit,
    [switch]$Force
)

# Helper
function Log-Action($msg) {
    $t = (Get-Date).ToString('s')
    $entry = "$t `t $msg"
    Add-Content -Path "$PSScriptRoot\reorganize_workspace.log" -Value $entry -Encoding utf8
    Write-Host $msg
}

$root = Resolve-Path -Path "$PSScriptRoot\.." | Select-Object -ExpandProperty Path
Set-Location $root

# Directories to create
$dirs = @(
    "frontend/html",
    "frontend/js",
    "frontend/css",
    "frontend/assets",
    "frontend/vendor",
    "backend/server",
    "backend/migrations",
    "sql",
    "scripts",
    "docs",
    "tests",
    "archive"
)

foreach ($d in $dirs) {
    if (-not (Test-Path $d)) {
        if ($Execute) { New-Item -ItemType Directory -Path $d -Force | Out-Null; Log-Action "Created directory: $d" } else { Write-Host "DRY-RUN: would create directory: $d" }
    } else {
        Write-Host "Exists: $d"
    }
}

# Mapping: source -> destination (relative to repo root)
$movePlan = @{
    # HTML
    'index.html' = 'frontend/html/index.html'
    'respostas.html' = 'frontend/html/respostas.html'
    'instrucoes.html' = 'frontend/html/instrucoes.html'
    'executar_teste.html' = 'frontend/html/executar_teste.html'
    'diagnostico_api.html' = 'frontend/html/diagnostico_api.html'
    'limpar_cache.html' = 'frontend/html/limpar_cache.html'
    'testar_conexao_api.html' = 'frontend/html/testar_conexao_api.html'
    'visualizador_dados.html' = 'frontend/html/visualizador_dados.html'

    # CSS
    'styles.css' = 'frontend/css/styles.css'

    # Frontend JS (explicit list)
    'app.js' = 'frontend/js/app.js'
    'api-client.js' = 'frontend/js/api-client.js'
    'validation.js' = 'frontend/js/validation.js'
    'analytics.js' = 'frontend/js/analytics.js'
    'payload-manager.js' = 'frontend/js/payload-manager.js'
    'payload-init.js' = 'frontend/js/payload-init.js'
    'form-payload-integrator.js' = 'frontend/js/form-payload-integrator.js'
    'nome-pessoa-formatter.js' = 'frontend/js/nome-pessoa-formatter.js'
    'cnpj-validator.js' = 'frontend/js/cnpj-validator.js'

    # Scripts (helpers and test scripts) -> scripts/
    'send_full_payload.js' = 'scripts/send_full_payload.js'
    'preencher_formulario_teste.js' = 'scripts/preencher_formulario_teste.js'
    'executar_update_view.js' = 'scripts/executar_update_view.js'
    'executar_municipios.js' = 'scripts/executar_municipios.js'
    'executar_migracao_numericos.js' = 'scripts/executar_migracao_numericos.js'
    'criar_banco.js' = 'scripts/criar_banco.js'
    'testar_api.js' = 'scripts/testar_api.js'
    'test_auto_fill.js' = 'scripts/test_auto_fill.js'
    'test_front_db_edge_tests.js' = 'tests/test_front_db_edge_tests.js'

    # SQL -> sql/
    'database_schema_completo.sql' = 'sql/database_schema_completo.sql'
    'migrar_campos_numericos.sql' = 'sql/migrar_campos_numericos.sql'
    'municipios_sp_completo.sql' = 'sql/municipios_sp_completo.sql'
    'municipios_sp_ibge_oficial.sql' = 'sql/municipios_sp_ibge_oficial.sql'
    'paises.sql' = 'sql/paises.sql'
    'estados_brasil.sql' = 'sql/estados_brasil.sql'
    'CORRECAO_BANCO_DADOS.sql' = 'sql/CORRECAO_BANCO_DADOS.sql'
    'atualizar_view_respostas.sql' = 'sql/atualizar_view_respostas.sql'
    'adicionar_cnpj_instituicao.sql' = 'sql/adicionar_cnpj_instituicao.sql'

    # Docs -> docs/
    'README.md' = 'docs/README.md'
    'DOCUMENTACAO_COMPLETA.md' = 'docs/DOCUMENTACAO_COMPLETA.md'
    'GUIA_DEPLOY.md' = 'docs/GUIA_DEPLOY.md'
    'GUIA_TESTES.md' = 'docs/GUIA_TESTES.md'
    'COMECE_AQUI.md' = 'docs/COMECE_AQUI.md'

}

# Files that we will archive instead of moving (large or one-off)
$archiveList = @(
    'index.html.backup_20251105_122539',
    'server_debug.log',
    'server_debug.err'
)

# Apply move plan
foreach ($src in $movePlan.Keys) {
    $dst = $movePlan[$src]
    if (-not (Test-Path $src)) {
        Write-Host "SKIP (not found): $src"
        continue
    }

    $dstDir = Split-Path -Path $dst -Parent
    if (-not (Test-Path $dstDir)) { if ($Execute) { New-Item -ItemType Directory -Path $dstDir -Force | Out-Null } else { Write-Host "DRY-RUN: would create $dstDir" } }

    if (-not $Execute) {
        Write-Host "DRY-RUN: would move $src -> $dst"
    } else {
        if ((Test-Path $dst) -and -not $Force) {
            # destination exists: move existing destination to archive with timestamp
            $time = (Get-Date).ToString('yyyyMMdd_HHmmss')
            $arch = "archive/" + (Split-Path -Path $dst -Leaf) + ".$time.bak"
            Move-Item -Path $dst -Destination $arch -Force
            Log-Action "Destination existed - archived $dst -> $arch"
        }
        try {
            Move-Item -Path $src -Destination $dst -Force -ErrorAction Stop
            Log-Action "Moved: $src -> $dst"
        } catch {
            Log-Action "ERROR moving $src -> $dst : $_"
        }
    }
}

# Archive list
foreach ($f in $archiveList) {
    if (Test-Path $f) {
        $dest = "archive/" + (Split-Path -Path $f -Leaf)
        if (-not $Execute) { Write-Host "DRY-RUN: would archive $f -> $dest" } else { Move-Item -Path $f -Destination $dest -Force; Log-Action "Archived: $f -> $dest" }
    } else { Write-Host "Archive skip (not found): $f" }
}

# Optionally move backend-api -> backend/server
if ($MoveBackend) {
    if (Test-Path 'backend-api') {
        if (-not $Execute) { Write-Host "DRY-RUN: would move backend-api -> backend/server/backend-api" } else {
            $dst = 'backend/server/backend-api'
            if (Test-Path $dst) {
                $time = (Get-Date).ToString('yyyyMMdd_HHmmss')
                $arch = "archive/backend-api.$time.bak"
                Move-Item -Path $dst -Destination $arch -Force
                Log-Action "Archived existing $dst -> $arch"
            }
            Move-Item -Path 'backend-api' -Destination $dst -Force
            Log-Action "Moved backend-api -> $dst"
        }
    } else { Write-Host "backend-api not found; skipping MoveBackend" }
}

# Optional: git commit
if ($GitCommit -and $Execute) {
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Write-Host "Git not found in PATH; cannot commit" } else {
        try {
            git checkout -b chore/reorganize-frontend | Out-Null
            git add -A
            git commit -m "chore: reorganize workspace into frontend/backend/sql/docs/scripts" | Out-Null
            Log-Action "Created branch chore/reorganize-frontend and committed changes"
        } catch {
            Log-Action "Git commit failed: $_"
        }
    }
}

Write-Host "\nDone. If you used DRY-RUN, re-run with -Execute to apply changes. Check scripts/reorganize_workspace.log for details."