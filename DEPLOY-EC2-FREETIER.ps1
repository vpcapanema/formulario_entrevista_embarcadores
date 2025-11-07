# ============================================
# DEPLOY-EC2-FREETIER.ps1
# Deploy automático EC2 t2.micro ($0/mês)
# ============================================

param(
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-east-1",
    
    [Parameter(Mandatory=$false)]
    [string]$KeyName = "pli2050-key",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipRDS,
    
    [Parameter(Mandatory=$false)]
    [string]$RDSPassword
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
function Write-Step($num, $text) { Write-Host "`n🔹 Passo $num`: $text" -ForegroundColor Blue }

Write-Header "🚀 Deploy EC2 t2.micro - FREE TIER ($0/mês)"

# ============================================
# Validações
# ============================================
Write-Step 1 "Validando AWS CLI"

$awsExe = Get-Command aws -ErrorAction SilentlyContinue
if (-not $awsExe) {
    Write-Error "AWS CLI não encontrado!"
    Write-Info "Execute: .\CONFIGURAR-AWS.ps1"
    exit 1
}

try {
    $identity = aws sts get-caller-identity | ConvertFrom-Json
    Write-Success "AWS CLI configurado"
    Write-Info "Account: $($identity.Account)"
    Write-Info "User: $($identity.Arn)"
} catch {
    Write-Error "AWS CLI não configurado!"
    Write-Info "Execute: .\CONFIGURAR-AWS.ps1"
    exit 1
}

# ============================================
# STEP 1: Criar Key Pair
# ============================================
Write-Step 2 "Criando Key Pair"

$keyExists = aws ec2 describe-key-pairs --key-names $KeyName --region $Region 2>$null
if ($keyExists) {
    Write-Info "Key pair '$KeyName' já existe"
} else {
    Write-Info "Criando key pair '$KeyName'..."
    $keyMaterial = aws ec2 create-key-pair --key-name $KeyName --region $Region --query 'KeyMaterial' --output text
    
    $keyPath = "$PSScriptRoot\$KeyName.pem"
    Set-Content -Path $keyPath -Value $keyMaterial -NoNewline
    
    Write-Success "Key pair criado: $keyPath"
    Write-Info "⚠️  GUARDE este arquivo em local seguro!"
}

# ============================================
# STEP 2: Obter VPC padrão
# ============================================
Write-Step 3 "Obtendo VPC padrão"

$vpcId = aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --region $Region --query 'Vpcs[0].VpcId' --output text

if ($vpcId -eq "None" -or [string]::IsNullOrEmpty($vpcId)) {
    Write-Error "VPC padrão não encontrada!"
    Write-Info "Crie uma VPC padrão no console AWS ou especifique uma VPC existente"
    exit 1
}

Write-Success "VPC encontrada: $vpcId"

# ============================================
# STEP 3: Criar Security Group
# ============================================
Write-Step 4 "Criando Security Group"

$sgName = "pli2050-sg-freetier"
$sgExists = aws ec2 describe-security-groups --filters "Name=group-name,Values=$sgName" "Name=vpc-id,Values=$vpcId" --region $Region --query 'SecurityGroups[0].GroupId' --output text 2>$null

if ($sgExists -and $sgExists -ne "None") {
    $sgId = $sgExists
    Write-Info "Security Group já existe: $sgId"
} else {
    Write-Info "Criando Security Group..."
    
    $sgId = aws ec2 create-security-group `
        --group-name $sgName `
        --description "Security Group PLI 2050 Free Tier" `
        --vpc-id $vpcId `
        --region $Region `
        --query 'GroupId' `
        --output text
    
    Write-Success "Security Group criado: $sgId"
    
    # Permitir HTTP (porta 80)
    Write-Info "Permitindo HTTP (porta 80)..."
    aws ec2 authorize-security-group-ingress `
        --group-id $sgId `
        --protocol tcp `
        --port 80 `
        --cidr 0.0.0.0/0 `
        --region $Region | Out-Null
    
    # Permitir SSH (porta 22)
    Write-Info "Permitindo SSH (porta 22)..."
    aws ec2 authorize-security-group-ingress `
        --group-id $sgId `
        --protocol tcp `
        --port 22 `
        --cidr 0.0.0.0/0 `
        --region $Region | Out-Null
    
    Write-Success "Regras de firewall configuradas"
}

# ============================================
# STEP 4: Criar Instância EC2 t2.micro
# ============================================
Write-Step 5 "Criando Instância EC2 t2.micro (FREE TIER)"

# AMI Ubuntu 22.04 LTS por região
$amiIds = @{
    "us-east-1" = "ami-0c7217cdde317cfec"
    "us-east-2" = "ami-0568773882d492fc8"
    "us-west-1" = "ami-0d5eff06f840b45e9"
    "us-west-2" = "ami-0735c191cf914754d"
}

$amiId = $amiIds[$Region]
if (-not $amiId) {
    Write-Info "AMI não encontrada para região $Region, buscando automaticamente..."
    $amiId = aws ec2 describe-images `
        --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" "Name=state,Values=available" `
        --region $Region `
        --query 'Images | sort_by(@, &CreationDate) | [-1].ImageId' `
        --output text
}

Write-Info "AMI Ubuntu 22.04: $amiId"
Write-Info "Lançando instância t2.micro..."

$instanceId = aws ec2 run-instances `
    --image-id $amiId `
    --instance-type t2.micro `
    --key-name $KeyName `
    --security-group-ids $sgId `
    --block-device-mappings "DeviceName=/dev/sda1,Ebs={VolumeSize=20,VolumeType=gp3,DeleteOnTermination=true}" `
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=PLI2050-FreeTier},{Key=Project,Value=PLI2050}]" `
    --region $Region `
    --query 'Instances[0].InstanceId' `
    --output text

Write-Success "Instância criada: $instanceId"

# Aguardar instância iniciar
Write-Info "Aguardando instância iniciar (1-2 minutos)..."
aws ec2 wait instance-running --instance-ids $instanceId --region $Region

# Obter IP público
$publicIp = aws ec2 describe-instances `
    --instance-ids $instanceId `
    --region $Region `
    --query 'Reservations[0].Instances[0].PublicIpAddress' `
    --output text

Write-Success "Instância rodando!"
Write-Success "IP Público: $publicIp"

# ============================================
# STEP 5: Criar RDS (opcional)
# ============================================
if (-not $SkipRDS) {
    Write-Step 6 "Criando RDS db.t3.micro (FREE TIER)"
    
    if (-not $RDSPassword) {
        # Gerar senha aleatória
        $RDSPassword = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 16 | ForEach-Object {[char]$_}) + "!@"
    }
    
    # Obter subnets
    $subnetIds = aws ec2 describe-subnets `
        --filters "Name=vpc-id,Values=$vpcId" `
        --region $Region `
        --query 'Subnets[*].SubnetId' `
        --output text
    
    $subnetArray = $subnetIds -split '\s+'
    
    # Criar DB Subnet Group
    $dbSubnetGroupName = "pli2050-subnet-group"
    $subnetGroupExists = aws rds describe-db-subnet-groups --db-subnet-group-name $dbSubnetGroupName --region $Region 2>$null
    
    if (-not $subnetGroupExists) {
        Write-Info "Criando DB Subnet Group..."
        aws rds create-db-subnet-group `
            --db-subnet-group-name $dbSubnetGroupName `
            --db-subnet-group-description "Subnet group PLI 2050" `
            --subnet-ids $subnetArray[0] $subnetArray[1] `
            --region $Region | Out-Null
    }
    
    # Criar Security Group para RDS
    $rdsSgName = "pli2050-rds-sg"
    $rdsSgExists = aws ec2 describe-security-groups --filters "Name=group-name,Values=$rdsSgName" "Name=vpc-id,Values=$vpcId" --region $Region --query 'SecurityGroups[0].GroupId' --output text 2>$null
    
    if ($rdsSgExists -and $rdsSgExists -ne "None") {
        $rdsSgId = $rdsSgExists
    } else {
        Write-Info "Criando RDS Security Group..."
        $rdsSgId = aws ec2 create-security-group `
            --group-name $rdsSgName `
            --description "RDS Security Group PLI 2050" `
            --vpc-id $vpcId `
            --region $Region `
            --query 'GroupId' `
            --output text
        
        # Permitir PostgreSQL do EC2
        aws ec2 authorize-security-group-ingress `
            --group-id $rdsSgId `
            --protocol tcp `
            --port 5432 `
            --source-group $sgId `
            --region $Region | Out-Null
    }
    
    # Criar RDS
    $dbInstanceId = "pli2050-db-freetier"
    $dbExists = aws rds describe-db-instances --db-instance-identifier $dbInstanceId --region $Region 2>$null
    
    if ($dbExists) {
        Write-Info "RDS já existe: $dbInstanceId"
        $rdsEndpoint = aws rds describe-db-instances `
            --db-instance-identifier $dbInstanceId `
            --region $Region `
            --query 'DBInstances[0].Endpoint.Address' `
            --output text
    } else {
        Write-Info "Criando RDS db.t3.micro (pode levar 5-10 minutos)..."
        
        aws rds create-db-instance `
            --db-instance-identifier $dbInstanceId `
            --db-instance-class db.t3.micro `
            --engine postgres `
            --engine-version 17.2 `
            --master-username postgres `
            --master-user-password $RDSPassword `
            --allocated-storage 20 `
            --storage-type gp3 `
            --vpc-security-group-ids $rdsSgId `
            --db-subnet-group-name $dbSubnetGroupName `
            --backup-retention-period 7 `
            --no-publicly-accessible `
            --no-multi-az `
            --db-name pli2050 `
            --region $Region | Out-Null
        
        Write-Info "Aguardando RDS ficar disponível..."
        aws rds wait db-instance-available --db-instance-identifier $dbInstanceId --region $Region
        
        $rdsEndpoint = aws rds describe-db-instances `
            --db-instance-identifier $dbInstanceId `
            --region $Region `
            --query 'DBInstances[0].Endpoint.Address' `
            --output text
        
        Write-Success "RDS criado: $rdsEndpoint"
    }
}

# ============================================
# RESUMO
# ============================================
Write-Header "✅ Deploy Concluído!"

Write-Host @"

╔═══════════════════════════════════════════════════════╗
║                                                       ║
║        📊 INFORMAÇÕES DO DEPLOY                      ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝

🖥️  INSTÂNCIA EC2:
   ID:              $instanceId
   Tipo:            t2.micro (FREE TIER ✅)
   IP Público:      $publicIp
   Região:          $Region
   Key Pair:        $KeyName.pem

🔐 ACESSO SSH:
   ssh -i $KeyName.pem ubuntu@$publicIp

"@ -ForegroundColor Green

if (-not $SkipRDS) {
    Write-Host @"
🗄️  RDS POSTGRESQL:
   Endpoint:        $rdsEndpoint
   Tipo:            db.t3.micro (FREE TIER ✅)
   Database:        pli2050
   Username:        postgres
   Password:        $RDSPassword
   
   ⚠️  GUARDE A SENHA EM LOCAL SEGURO!

"@ -ForegroundColor Green
}

Write-Host @"
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║        🚀 PRÓXIMOS PASSOS                            ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝

1️⃣  Conectar via SSH:
   ssh -i $KeyName.pem ubuntu@$publicIp

2️⃣  Instalar Docker no EC2:
   sudo apt update && sudo apt upgrade -y
   curl -fsSL https://get.docker.com | sudo sh
   sudo usermod -aG docker ubuntu
   sudo apt install -y docker-compose
   exit  # Relogar

3️⃣  Fazer deploy da aplicação:
   git clone https://github.com/vpcapanema/formulario_entrevista_embarcadores.git
   cd formulario_entrevista_embarcadores
   
   # Criar .env
   nano backend-fastapi/.env
   # Colar configurações (PGHOST=$rdsEndpoint, etc.)
   
   # Construir e rodar
   docker-compose up --build -d

4️⃣  Acessar aplicação:
   http://$publicIp

📚 Documentação completa: GUIA_DEPLOY_FREE_TIER.md

💰 Custo: `$0/mês por 12 meses (FREE TIER)

"@ -ForegroundColor Cyan

# Salvar informações em arquivo
$infoContent = @"
# Deploy PLI 2050 - Informações

Data: $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")

## EC2
- Instance ID: $instanceId
- Tipo: t2.micro
- IP Público: $publicIp
- Região: $Region
- Key Pair: $KeyName.pem

## Acesso SSH
ssh -i $KeyName.pem ubuntu@$publicIp

"@

if (-not $SkipRDS) {
    $infoContent += @"
## RDS PostgreSQL
- Endpoint: $rdsEndpoint
- Database: pli2050
- Username: postgres
- Password: $RDSPassword

## String de Conexão
PGHOST=$rdsEndpoint
PGPORT=5432
PGDATABASE=pli2050
PGUSER=postgres
PGPASSWORD=$RDSPassword
PGSCHEMA=formulario_embarcadores

"@
}

$infoPath = "$PSScriptRoot\DEPLOY_INFO_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
Set-Content -Path $infoPath -Value $infoContent
Write-Success "Informações salvas em: $infoPath"
