@echo off
chcp 65001 >nul
cls
echo ════════════════════════════════════════════════════════════
echo 🚀 Sistema PLI 2050 - Backend + Frontend
echo ════════════════════════════════════════════════════════════
echo.

cd /d "%~dp0backend-api"

echo 📦 Verificando dependências...
if not exist "node_modules\" (
    echo ⚠️  Pasta node_modules não encontrada!
    echo 📥 Instalando dependências...
    call npm install
    echo.
)

echo ✅ Dependências OK!
echo.
echo ════════════════════════════════════════════════════════════
echo 🌍 SERVIDOR INICIADO!
echo ════════════════════════════════════════════════════════════
echo.
echo 📡 Backend API:  http://localhost:3000/api
echo 🏠 Frontend:     http://localhost:3000
echo 📊 Visualizador: http://localhost:3000/visualizador
echo 🧹 Limpar Cache: http://localhost:3000/limpar-cache.html
echo.
echo ════════════════════════════════════════════════════════════
echo � COMO USAR:
echo ════════════════════════════════════════════════════════════
echo.
echo 1. Abra seu navegador (Chrome/Edge)
echo 2. Acesse: http://localhost:3000
echo 3. Se tiver problemas de cache:
echo    - Acesse: http://localhost:3000/limpar-cache.html
echo    - Clique: 'Limpar Tudo'
echo.
echo ════════════════════════════════════════════════════════════
echo ⚠️  Para parar o servidor, pressione CTRL+C
echo ════════════════════════════════════════════════════════════
echo.

node server.js

pause
