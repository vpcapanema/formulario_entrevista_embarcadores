# ============================================================
# Start Backend com CORS configurado para GitHub Pages
# ============================================================

Write-Host "🚀 Iniciando Backend PLI 2050 com CORS configurado..." -ForegroundColor Cyan
Write-Host ""

# ============================================================
# CONFIGURAÇÃO DO BANCO DE DADOS - RENDER POSTGRESQL
# ============================================================
$env:DATABASE_URL = "postgresql://sigma_user:pzRszi7xZ4IzjehPVNdCR73DNCJ9jiq5@dpg-d5rc90pr0fns73e2q4n0-a.oregon-postgres.render.com:5432/sigma_pli_qr53"
$env:PGHOST = "dpg-d5rc90pr0fns73e2q4n0-a.oregon-postgres.render.com"
$env:PGPORT = "5432"
$env:PGDATABASE = "sigma_pli_qr53"
$env:PGUSER = "sigma_user"
$env:PGPASSWORD = "pzRszi7xZ4IzjehPVNdCR73DNCJ9jiq5"
$env:SCHEMA_NAME = "formulario_embarcadores"

Write-Host "✅ Banco de dados configurado para: Render PostgreSQL" -ForegroundColor Green
Write-Host "   - Host: $($env:PGHOST)" -ForegroundColor Yellow
Write-Host "   - Database: $($env:PGDATABASE)" -ForegroundColor Yellow
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

# Iniciar servidor
Write-Host "🔥 Iniciando Uvicorn..." -ForegroundColor Cyan
python -m uvicorn main:app --host 0.0.0.0 --port 8000
