# ============================================
# CONSTRUIR-DOCKER.ps1
# Script para build e teste do Docker
# ============================================

param(
    [switch]$Build,
    [switch]$Run,
    [switch]$Stop,
    [switch]$Logs,
    [switch]$Clean,
    [switch]$Push,
    [string]$Registry = ""
)

$ErrorActionPreference = "Stop"

# Cores
function Write-Header($text) {
    Write-Host "`n╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  $text" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
}

function Write-Success($text) {
    Write-Host "✅ $text" -ForegroundColor Green
}

function Write-Error($text) {
    Write-Host "❌ $text" -ForegroundColor Red
}

function Write-Info($text) {
    Write-Host "ℹ️  $text" -ForegroundColor Yellow
}

# Variáveis
$IMAGE_NAME = "pli2050-backend"
$IMAGE_TAG = "latest"
$CONTAINER_NAME = "pli2050-backend"
$PORT = 8000

# ============================================
# BUILD - Construir imagem Docker
# ============================================
if ($Build) {
    Write-Header "🐳 Construindo Imagem Docker"
    
    Write-Info "Verificando arquivo .env..."
    if (-not (Test-Path "backend-fastapi\.env")) {
        Write-Error "Arquivo .env não encontrado em backend-fastapi\"
        Write-Info "Copie .env.example e preencha as variáveis"
        exit 1
    }
    
    Write-Success "Arquivo .env encontrado!"
    Write-Info "Construindo imagem $IMAGE_NAME`:$IMAGE_TAG..."
    
    docker build -t "$IMAGE_NAME`:$IMAGE_TAG" ./backend-fastapi
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Imagem construída com sucesso!"
        Write-Info "Tamanho da imagem:"
        docker images $IMAGE_NAME --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
    } else {
        Write-Error "Falha ao construir imagem"
        exit 1
    }
}

# ============================================
# RUN - Executar container
# ============================================
if ($Run) {
    Write-Header "🚀 Iniciando Container"
    
    # Verificar se já está rodando
    $existing = docker ps -q -f name=$CONTAINER_NAME
    if ($existing) {
        Write-Info "Container já está rodando. Parando..."
        docker stop $CONTAINER_NAME
        docker rm $CONTAINER_NAME
    }
    
    Write-Info "Iniciando container na porta $PORT..."
    
    # Carregar variáveis do .env
    if (Test-Path "backend-fastapi\.env") {
        docker run -d `
            --name $CONTAINER_NAME `
            --env-file backend-fastapi\.env `
            -p "$PORT`:8000" `
            --restart unless-stopped `
            $IMAGE_NAME`:$IMAGE_TAG
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Container iniciado!"
            Start-Sleep -Seconds 3
            
            Write-Info "Verificando saúde do container..."
            $health = docker inspect --format='{{.State.Health.Status}}' $CONTAINER_NAME 2>$null
            
            Write-Host "`n📡 URLs Disponíveis:" -ForegroundColor Cyan
            Write-Host "   Frontend:  http://localhost:$PORT" -ForegroundColor White
            Write-Host "   API Docs:  http://localhost:$PORT/docs" -ForegroundColor White
            Write-Host "   Health:    http://localhost:$PORT/health" -ForegroundColor White
            
            Write-Host "`n💡 Comandos úteis:" -ForegroundColor Yellow
            Write-Host "   Ver logs:       .\CONSTRUIR-DOCKER.ps1 -Logs" -ForegroundColor White
            Write-Host "   Parar:          .\CONSTRUIR-DOCKER.ps1 -Stop" -ForegroundColor White
            Write-Host "   Docker logs:    docker logs -f $CONTAINER_NAME" -ForegroundColor White
        } else {
            Write-Error "Falha ao iniciar container"
            exit 1
        }
    } else {
        Write-Error "Arquivo .env não encontrado!"
        exit 1
    }
}

# ============================================
# STOP - Parar container
# ============================================
if ($Stop) {
    Write-Header "⏹️  Parando Container"
    
    $existing = docker ps -q -f name=$CONTAINER_NAME
    if ($existing) {
        docker stop $CONTAINER_NAME
        docker rm $CONTAINER_NAME
        Write-Success "Container parado e removido"
    } else {
        Write-Info "Container não está rodando"
    }
}

# ============================================
# LOGS - Ver logs do container
# ============================================
if ($Logs) {
    Write-Header "📋 Logs do Container"
    
    $existing = docker ps -q -f name=$CONTAINER_NAME
    if ($existing) {
        docker logs -f --tail 100 $CONTAINER_NAME
    } else {
        Write-Error "Container não está rodando"
        exit 1
    }
}

# ============================================
# CLEAN - Limpar imagens e containers
# ============================================
if ($Clean) {
    Write-Header "🧹 Limpando Docker"
    
    Write-Info "Parando container..."
    docker stop $CONTAINER_NAME 2>$null
    docker rm $CONTAINER_NAME 2>$null
    
    Write-Info "Removendo imagem..."
    docker rmi "$IMAGE_NAME`:$IMAGE_TAG" 2>$null
    
    Write-Info "Limpando recursos não utilizados..."
    docker system prune -f
    
    Write-Success "Limpeza concluída!"
}

# ============================================
# PUSH - Enviar para registry (AWS ECR, Docker Hub, etc.)
# ============================================
if ($Push) {
    Write-Header "📤 Enviando Imagem para Registry"
    
    if (-not $Registry) {
        Write-Error "Registry não especificado!"
        Write-Info "Uso: .\CONSTRUIR-DOCKER.ps1 -Push -Registry '<account>.dkr.ecr.us-east-1.amazonaws.com'"
        exit 1
    }
    
    $fullImageName = "$Registry/$IMAGE_NAME`:$IMAGE_TAG"
    
    Write-Info "Taggeando imagem: $fullImageName"
    docker tag "$IMAGE_NAME`:$IMAGE_TAG" $fullImageName
    
    Write-Info "Enviando para $Registry..."
    docker push $fullImageName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Imagem enviada com sucesso!"
        Write-Info "Imagem: $fullImageName"
    } else {
        Write-Error "Falha ao enviar imagem"
        exit 1
    }
}

# ============================================
# Ajuda
# ============================================
if (-not ($Build -or $Run -or $Stop -or $Logs -or $Clean -or $Push)) {
    Write-Host @"

╔═══════════════════════════════════════════════════════╗
║     🐳 PLI 2050 - Docker Build Script                ║
╚═══════════════════════════════════════════════════════╝

USO:
    .\CONSTRUIR-DOCKER.ps1 [OPÇÃO]

OPÇÕES:
    -Build          Construir imagem Docker
    -Run            Executar container (porta $PORT)
    -Stop           Parar e remover container
    -Logs           Ver logs do container em tempo real
    -Clean          Limpar imagens e containers
    -Push           Enviar para registry (requer -Registry)
    
    -Registry <url> URL do registry (AWS ECR, Docker Hub, etc.)

EXEMPLOS:
    # Construir imagem
    .\CONSTRUIR-DOCKER.ps1 -Build
    
    # Construir e executar
    .\CONSTRUIR-DOCKER.ps1 -Build -Run
    
    # Ver logs
    .\CONSTRUIR-DOCKER.ps1 -Logs
    
    # Parar container
    .\CONSTRUIR-DOCKER.ps1 -Stop
    
    # Enviar para AWS ECR
    .\CONSTRUIR-DOCKER.ps1 -Push -Registry "123456789.dkr.ecr.us-east-1.amazonaws.com"
    
    # Limpar tudo
    .\CONSTRUIR-DOCKER.ps1 -Clean

DOCKER COMPOSE (alternativa):
    # Construir e executar
    docker-compose up --build -d
    
    # Parar
    docker-compose down
    
    # Ver logs
    docker-compose logs -f

"@ -ForegroundColor Cyan
}
