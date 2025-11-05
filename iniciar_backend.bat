@echo off
echo ════════════════════════════════════════════════════════════
echo 🚀 Iniciando Backend - PLI 2050
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
echo 🌍 Iniciando servidor na porta 3000...
echo 📊 Conectando ao banco PostgreSQL...
echo.
echo ═══════════════════════════════════════════════════════════
echo Para parar o servidor, pressione CTRL+C
echo ═══════════════════════════════════════════════════════════
echo.

call npm start

pause
