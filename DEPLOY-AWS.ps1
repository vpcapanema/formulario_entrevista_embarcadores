# ============================================
# DEPLOY-AWS.ps1
# Script automatizado para deploy na AWS ECS
# ============================================

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('dev', 'staging', 'production')]
    [string]$Environment,
    
    [Parameter(Mandatory=$true)]
    [string]$AwsAccountId,
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-east-1",
    
    [switch]$SkipBuild,
    [switch]$SkipPush,
    [switch]$UpdateService
)

$ErrorActionPreference = "Stop"

# ============================================
# Configurações
# ============================================
$IMAGE_NAME = "pli2050-backend"
$ECR_REPO = "$AwsAccountId.dkr.ecr.$Region.amazonaws.com/$IMAGE_NAME"
$CLUSTER_NAME = "pli2050-cluster-$Environment"
$SERVICE_NAME = "pli2050-backend-service-$Environment"
$TASK_FAMILY = "pli2050-backend-task-$Environment"

# ============================================
# Funções
# ============================================
function Write-Header($text) {
    Write-Host "`n╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  $text" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
}

function Write-Success($text) { Write-Host "✅ $text" -ForegroundColor Green }
function Write-Error($text) { Write-Host "❌ $text" -ForegroundColor Red }
function Write-Info($text) { Write-Host "ℹ️  $text" -ForegroundColor Yellow }
function Write-Step($text) { Write-Host "`n🔹 $text" -ForegroundColor Blue }

# ============================================
# Validações
# ============================================
Write-Header "🚀 Deploy AWS ECS - Ambiente: $Environment"

Write-Step "Verificando AWS CLI..."
try {
    $awsVersion = aws --version
    Write-Success "AWS CLI instalado: $awsVersion"
} catch {
    Write-Error "AWS CLI não encontrado! Instale: https://aws.amazon.com/cli/"
    exit 1
}

Write-Step "Verificando credenciais AWS..."
try {
    $identity = aws sts get-caller-identity | ConvertFrom-Json
    Write-Success "Conta AWS: $($identity.Account)"
    Write-Success "User/Role: $($identity.Arn)"
} catch {
    Write-Error "Credenciais AWS inválidas! Execute: aws configure"
    exit 1
}

Write-Step "Verificando Docker..."
try {
    $dockerVersion = docker --version
    Write-Success "Docker instalado: $dockerVersion"
} catch {
    Write-Error "Docker não encontrado!"
    exit 1
}

# ============================================
# STEP 1: Build da Imagem
# ============================================
if (-not $SkipBuild) {
    Write-Header "📦 Construindo Imagem Docker"
    
    Write-Info "Verificando arquivo .env..."
    if (-not (Test-Path "backend-fastapi\.env")) {
        Write-Error "Arquivo .env não encontrado!"
        Write-Info "Copie .env.production para backend-fastapi\.env e configure"
        exit 1
    }
    
    Write-Info "Building $IMAGE_NAME`:$Environment..."
    docker build -t "$IMAGE_NAME`:$Environment" -t "$IMAGE_NAME`:latest" ./backend-fastapi
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Falha no build!"
        exit 1
    }
    
    Write-Success "Imagem construída!"
    docker images $IMAGE_NAME --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
}

# ============================================
# STEP 2: Login no ECR
# ============================================
Write-Header "🔐 Login no Amazon ECR"

Write-Info "Fazendo login no ECR..."
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin "$AwsAccountId.dkr.ecr.$Region.amazonaws.com"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha no login ECR!"
    exit 1
}

Write-Success "Login ECR bem-sucedido!"

# ============================================
# STEP 3: Criar Repositório ECR (se não existir)
# ============================================
Write-Step "Verificando repositório ECR..."

$repoExists = aws ecr describe-repositories --repository-names $IMAGE_NAME --region $Region 2>$null

if (-not $repoExists) {
    Write-Info "Criando repositório ECR: $IMAGE_NAME"
    aws ecr create-repository --repository-name $IMAGE_NAME --region $Region | Out-Null
    Write-Success "Repositório criado!"
} else {
    Write-Success "Repositório já existe"
}

# ============================================
# STEP 4: Tag e Push da Imagem
# ============================================
if (-not $SkipPush) {
    Write-Header "📤 Enviando Imagem para ECR"
    
    Write-Info "Taggeando imagem..."
    docker tag "$IMAGE_NAME`:$Environment" "$ECR_REPO`:$Environment"
    docker tag "$IMAGE_NAME`:$Environment" "$ECR_REPO`:latest"
    
    Write-Info "Enviando para ECR..."
    docker push "$ECR_REPO`:$Environment"
    docker push "$ECR_REPO`:latest"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Falha no push!"
        exit 1
    }
    
    Write-Success "Imagem enviada: $ECR_REPO`:$Environment"
}

# ============================================
# STEP 5: Atualizar Task Definition
# ============================================
Write-Header "📝 Atualizando Task Definition"

Write-Info "Lendo template ecs-task-definition.json..."
if (-not (Test-Path "ecs-task-definition.json")) {
    Write-Error "Arquivo ecs-task-definition.json não encontrado!"
    exit 1
}

$taskDef = Get-Content "ecs-task-definition.json" -Raw
$taskDef = $taskDef -replace '<ACCOUNT_ID>', $AwsAccountId
$taskDef = $taskDef -replace 'pli2050-backend-task"', "$TASK_FAMILY`""
$taskDef = $taskDef -replace ':latest', ":$Environment"

$taskDef | Out-File "ecs-task-definition-$Environment.json" -Encoding UTF8

Write-Info "Registrando nova task definition..."
$taskDefArn = aws ecs register-task-definition --cli-input-json "file://ecs-task-definition-$Environment.json" --query 'taskDefinition.taskDefinitionArn' --output text

if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha ao registrar task definition!"
    exit 1
}

Write-Success "Task definition registrada: $taskDefArn"

# ============================================
# STEP 6: Atualizar Serviço ECS (se solicitado)
# ============================================
if ($UpdateService) {
    Write-Header "🔄 Atualizando Serviço ECS"
    
    Write-Info "Verificando se serviço existe..."
    $serviceExists = aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $Region 2>$null
    
    if ($serviceExists) {
        Write-Info "Atualizando serviço: $SERVICE_NAME"
        aws ecs update-service `
            --cluster $CLUSTER_NAME `
            --service $SERVICE_NAME `
            --task-definition $TASK_FAMILY `
            --force-new-deployment `
            --region $Region | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Serviço atualizado! Aguardando estabilização..."
            
            Write-Info "Aguardando deploy (isso pode levar 2-5 minutos)..."
            aws ecs wait services-stable --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $Region
            
            Write-Success "Deploy concluído com sucesso!"
        } else {
            Write-Error "Falha ao atualizar serviço!"
            exit 1
        }
    } else {
        Write-Error "Serviço $SERVICE_NAME não encontrado no cluster $CLUSTER_NAME"
        Write-Info "Crie o serviço primeiro usando o console AWS ou CLI"
        exit 1
    }
}

# ============================================
# Resumo
# ============================================
Write-Header "✅ Deploy Concluído!"

Write-Host @"

📊 RESUMO DO DEPLOY
═══════════════════════════════════════════════
Ambiente:       $Environment
Região:         $Region
Conta AWS:      $AwsAccountId

Imagem:         $ECR_REPO`:$Environment
Task Def:       $taskDefArn
Cluster:        $CLUSTER_NAME
Serviço:        $SERVICE_NAME

═══════════════════════════════════════════════

🔗 PRÓXIMOS PASSOS:

"@ -ForegroundColor Green

if (-not $UpdateService) {
    Write-Host "1. Criar cluster ECS (se não existir):" -ForegroundColor Yellow
    Write-Host "   aws ecs create-cluster --cluster-name $CLUSTER_NAME --region $Region" -ForegroundColor White
    
    Write-Host "`n2. Criar serviço ECS:" -ForegroundColor Yellow
    Write-Host "   Consulte GUIA_DEPLOY_AWS.md, seção 'Criar Serviço ECS'" -ForegroundColor White
    
    Write-Host "`n3. Configurar Load Balancer e DNS" -ForegroundColor Yellow
} else {
    Write-Host "✅ Serviço atualizado e estável!" -ForegroundColor Green
    Write-Host "`nVerifique os logs em CloudWatch:" -ForegroundColor Yellow
    Write-Host "https://console.aws.amazon.com/cloudwatch/home?region=$Region#logsV2:log-groups/log-group//ecs/pli2050-backend" -ForegroundColor White
}

Write-Host "`n"
