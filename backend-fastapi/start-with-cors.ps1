# ============================================================
# Start Backend com CORS configurado para GitHub Pages
# ============================================================

Write-Host "🚀 Iniciando Backend PLI 2050 com CORS configurado..." -ForegroundColor Cyan
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
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
