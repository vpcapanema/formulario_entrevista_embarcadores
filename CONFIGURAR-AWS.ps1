# ============================================
# CONFIGURAR-AWS.ps1
# Script para configurar AWS CLI
# ============================================

param(
    [Parameter(Mandatory=$false)]
    [string]$AccessKeyId,
    
    [Parameter(Mandatory=$false)]
    [string]$SecretAccessKey,
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-east-1",
    
    [Parameter(Mandatory=$false)]
    [string]$OutputFormat = "json"
)

$ErrorActionPreference = "Stop"

function Write-Header($text) {
    Write-Host "`n╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  $text" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
}

function Write-Success($text) { Write-Host "✅ $text" -ForegroundColor Green }
function Write-Error($text) { Write-Host "❌ $text" -ForegroundColor Red }
function Write-Info($text) { Write-Host "ℹ️  $text" -ForegroundColor Yellow }

Write-Header "🔐 Configuração AWS CLI"

# ============================================
# Verificar se AWS CLI está instalado
# ============================================
Write-Info "Verificando AWS CLI..."

$awsPaths = @(
    "C:\Program Files\Amazon\AWSCLIV2\aws.exe",
    "C:\Program Files (x86)\Amazon\AWSCLIV2\aws.exe",
    "$env:LOCALAPPDATA\Programs\Amazon\AWSCLIV2\aws.exe"
)

$awsExe = $null
foreach ($path in $awsPaths) {
    if (Test-Path $path) {
        $awsExe = $path
        $awsDir = Split-Path $path -Parent
        $env:PATH = "$awsDir;$env:PATH"
        break
    }
}

if ($awsExe) {
    try {
        $version = & $awsExe --version 2>&1
        Write-Success "AWS CLI encontrado: $version"
    } catch {
        Write-Error "AWS CLI encontrado mas não executa corretamente"
        Write-Info "Tente fechar e reabrir o PowerShell"
        exit 1
    }
} else {
    Write-Error "AWS CLI não encontrado!"
    Write-Host @"

📥 INSTALE O AWS CLI:

Opção 1: Instalador MSI (Recomendado)
    1. Baixe: https://awscli.amazonaws.com/AWSCLIV2.msi
    2. Execute o instalador
    3. FECHE E REABRA o PowerShell
    4. Execute novamente este script

Opção 2: Via PowerShell (como administrador)
    Invoke-WebRequest -Uri "https://awscli.amazonaws.com/AWSCLIV2.msi" -OutFile AWSCLIV2.msi
    msiexec.exe /i AWSCLIV2.msi /qn /norestart
    
    Depois FECHE e REABRA o PowerShell

"@ -ForegroundColor Yellow
    exit 1
}

# ============================================
# Solicitar credenciais se não fornecidas
# ============================================
if (-not $AccessKeyId -or -not $SecretAccessKey) {
    Write-Host @"

╔═══════════════════════════════════════════════════════╗
║                                                       ║
║        📋 INFORME SUAS CREDENCIAIS AWS                ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝

🔍 Onde encontrar:
1. https://console.aws.amazon.com/iam/
2. Users → Seu usuário → Security credentials
3. Create access key → CLI → Create
4. ⚠️  COPIE (só aparece uma vez!)

"@ -ForegroundColor Cyan

    if (-not $AccessKeyId) {
        $AccessKeyId = Read-Host "🔑 AWS Access Key ID"
    }
    
    if (-not $SecretAccessKey) {
        $SecretAccessKey = Read-Host "🔐 AWS Secret Access Key" -AsSecureString
        $SecretAccessKey = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecretAccessKey)
        )
    }
}

# ============================================
# Configurar AWS CLI
# ============================================
Write-Info "Configurando AWS CLI..."

# Criar diretório .aws se não existir
$awsConfigDir = Join-Path $env:USERPROFILE ".aws"
if (-not (Test-Path $awsConfigDir)) {
    New-Item -ItemType Directory -Path $awsConfigDir | Out-Null
}

# Criar arquivo credentials
$credentialsPath = Join-Path $awsConfigDir "credentials"
$credentialsContent = @"
[default]
aws_access_key_id = $AccessKeyId
aws_secret_access_key = $SecretAccessKey
"@

Set-Content -Path $credentialsPath -Value $credentialsContent -NoNewline
Write-Success "Credenciais salvas em: $credentialsPath"

# Criar arquivo config
$configPath = Join-Path $awsConfigDir "config"
$configContent = @"
[default]
region = $Region
output = $OutputFormat
"@

Set-Content -Path $configPath -Value $configContent -NoNewline
Write-Success "Configuração salva em: $configPath"

# ============================================
# Testar credenciais
# ============================================
Write-Host "`n🧪 Testando credenciais..." -ForegroundColor Yellow

try {
    $identity = & $awsExe sts get-caller-identity 2>&1 | ConvertFrom-Json
    
    Write-Host "`n╔═══════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║        ✅ CREDENCIAIS VÁLIDAS!                         ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════════════╝`n" -ForegroundColor Green
    
    Write-Host "👤 User ID:    $($identity.UserId)" -ForegroundColor Cyan
    Write-Host "📦 Account ID: $($identity.Account)" -ForegroundColor Cyan
    Write-Host "🔐 ARN:        $($identity.Arn)" -ForegroundColor Cyan
    Write-Host "🌍 Região:     $Region" -ForegroundColor Cyan
    
} catch {
    Write-Error "Credenciais inválidas!"
    Write-Info "Verifique se Access Key e Secret Key estão corretos"
    Write-Host "`nErro: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# ============================================
# Próximos passos
# ============================================
Write-Host @"

╔═══════════════════════════════════════════════════════╗
║                                                       ║
║        🚀 PRONTO PARA DEPLOY!                        ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝

📊 OPÇÕES DE DEPLOY (FREE TIER):

1️⃣  EC2 t2.micro ($0/mês - 12 meses)
    .\DEPLOY-EC2-FREETIER.ps1
    
2️⃣  App Runner ($2.50/mês)
    .\DEPLOY-AWS.ps1 -Environment production -AwsAccountId $($identity.Account)

3️⃣  ECS Fargate ($0-7/mês)
    .\DEPLOY-AWS.ps1 -Environment production -AwsAccountId $($identity.Account)

📚 Guias detalhados:
    - GUIA_DEPLOY_FREE_TIER.md (deploy $0/mês)
    - GUIA_DEPLOY_AWS.md (todas as opções)
    - CHECKLIST_DEPLOY.md (checklist completo)

"@ -ForegroundColor Green
