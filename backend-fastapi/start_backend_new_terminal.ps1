# Script para iniciar backend em terminal Windows SEPARADO
Write-Host "🚀 Iniciando backend em NOVO terminal..."

# Parar processos existentes
Stop-Process -Name "python" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Abrir NOVO terminal Windows e executar backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\SISTEMA_FORMULARIOS_ENTREVISTA\backend-fastapi ; python main.py"

Write-Host "✅ Backend iniciado em terminal separado"
Write-Host "💡 Aguarde 3-5 segundos antes de executar testes"
