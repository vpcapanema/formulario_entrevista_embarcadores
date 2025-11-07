# 🎉 Guia de Deploy GRATUITO - AWS Free Tier

## 🎯 Deploy TOTALMENTE GRÁTIS por 12 meses!

Este guia mostra como fazer deploy do **PLI 2050** usando **APENAS** recursos do AWS Free Tier, resultando em **$0/mês** pelos primeiros 12 meses!

---

## 📋 O que está incluído no Free Tier?

### ✅ Recursos Gratuitos (12 meses)

| Serviço | Limite Free Tier | Suficiente? |
|---------|------------------|-------------|
| **EC2 t2.micro** | 750 horas/mês | ✅ Sim (24/7) |
| **RDS db.t3.micro** | 750 horas/mês | ✅ Sim (24/7) |
| **EBS Storage** | 30GB SSD | ✅ Sim (15GB usado) |
| **Data Transfer OUT** | 15GB/mês | ✅ Sim |
| **CloudWatch Logs** | 5GB/mês | ✅ Sim |
| **ECR Storage** | 500MB | ✅ Sim (~300MB) |
| **S3 Storage** | 5GB | 🎁 Bônus (não usado) |

### 💰 Custo Total: **$0/mês por 12 meses!** 🎊

---

## 🚀 Opção 1: EC2 t2.micro (RECOMENDADO para Free Tier)

### Por que escolher EC2 t2.micro?
- ✅ **100% gratuito** por 12 meses
- ✅ Controle total do servidor
- ✅ Simples de configurar
- ✅ Pode rodar Docker diretamente
- ✅ 1 vCPU + 1GB RAM (suficiente para FastAPI)

### Passo a Passo

#### 1. Criar Instância EC2 Free Tier

```powershell
# Criar key pair
aws ec2 create-key-pair `
    --key-name pli2050-key `
    --query 'KeyMaterial' `
    --output text > pli2050-key.pem

# Criar Security Group
$VPC_ID = (aws ec2 describe-vpcs --query 'Vpcs[0].VpcId' --output text)

$SG_ID = (aws ec2 create-security-group `
    --group-name pli2050-sg `
    --description "Security Group PLI 2050 Free Tier" `
    --vpc-id $VPC_ID `
    --query 'GroupId' `
    --output text)

# Permitir HTTP (porta 80)
aws ec2 authorize-security-group-ingress `
    --group-id $SG_ID `
    --protocol tcp `
    --port 80 `
    --cidr 0.0.0.0/0

# Permitir SSH (porta 22)
aws ec2 authorize-security-group-ingress `
    --group-id $SG_ID `
    --protocol tcp `
    --port 22 `
    --cidr 0.0.0.0/0

# Lançar instância t2.micro (FREE TIER)
# AMI Ubuntu 22.04 LTS (us-east-1): ami-0c7217cdde317cfec
$INSTANCE_ID = (aws ec2 run-instances `
    --image-id ami-0c7217cdde317cfec `
    --instance-type t2.micro `
    --key-name pli2050-key `
    --security-group-ids $SG_ID `
    --block-device-mappings "DeviceName=/dev/sda1,Ebs={VolumeSize=20,VolumeType=gp3}" `
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=PLI2050-FreeТier}]' `
    --query 'Instances[0].InstanceId' `
    --output text)

Write-Host "✅ Instância criada: $INSTANCE_ID" -ForegroundColor Green

# Aguardar instância iniciar
aws ec2 wait instance-running --instance-ids $INSTANCE_ID

# Obter IP público
$PUBLIC_IP = (aws ec2 describe-instances `
    --instance-ids $INSTANCE_ID `
    --query 'Reservations[0].Instances[0].PublicIpAddress' `
    --output text)

Write-Host "🌐 IP Público: $PUBLIC_IP" -ForegroundColor Cyan
Write-Host "🔐 SSH: ssh -i pli2050-key.pem ubuntu@$PUBLIC_IP" -ForegroundColor Yellow
```

#### 2. Conectar via SSH e Configurar

```bash
# Conectar
ssh -i pli2050-key.pem ubuntu@<PUBLIC_IP>

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Instalar Docker Compose
sudo apt install -y docker-compose

# Relogar para aplicar grupo docker
exit
ssh -i pli2050-key.pem ubuntu@<PUBLIC_IP>

# Verificar Docker
docker --version
docker-compose --version
```

#### 3. Deploy da Aplicação

```bash
# Clonar repositório
git clone https://github.com/vpcapanema/formulario_entrevista_embarcadores.git
cd formulario_entrevista_embarcadores

# Criar arquivo .env
nano backend-fastapi/.env
```

Cole as variáveis de ambiente:
```env
PGHOST=seu-rds-endpoint.rds.amazonaws.com
PGPORT=5432
PGDATABASE=pli2050
PGUSER=postgres
PGPASSWORD=SUA_SENHA_SEGURA
PGSCHEMA=formulario_embarcadores
ALLOWED_ORIGINS=http://<PUBLIC_IP>,http://<PUBLIC_IP>:8000
APP_ENV=production
LOG_LEVEL=info
```

Salve e saia (Ctrl+O, Enter, Ctrl+X)

```bash
# Construir e iniciar
docker-compose up --build -d

# Ver logs
docker-compose logs -f backend

# Verificar status
docker-compose ps

# Testar
curl http://localhost:8000/health
```

#### 4. Configurar para porta 80 (opcional)

```bash
# Parar container
docker-compose down

# Editar docker-compose.yml
nano docker-compose.yml

# Alterar porta de "8000:8000" para "80:8000"

# Reiniciar
docker-compose up -d

# Testar
curl http://localhost/health
```

Pronto! Acesse: `http://<PUBLIC_IP>`

---

## 🗄️ Configurar RDS PostgreSQL Free Tier

### Criar RDS db.t3.micro (Grátis por 12 meses)

```powershell
# Criar DB Subnet Group (usar subnets da VPC padrão)
$SUBNET_IDS = (aws ec2 describe-subnets `
    --filters "Name=vpc-id,Values=$VPC_ID" `
    --query 'Subnets[*].SubnetId' `
    --output text) -split '\s+'

aws rds create-db-subnet-group `
    --db-subnet-group-name pli2050-subnet-group `
    --db-subnet-group-description "Subnet group PLI 2050" `
    --subnet-ids $SUBNET_IDS[0] $SUBNET_IDS[1]

# Criar Security Group para RDS
$RDS_SG_ID = (aws ec2 create-security-group `
    --group-name pli2050-rds-sg `
    --description "RDS Security Group PLI 2050" `
    --vpc-id $VPC_ID `
    --query 'GroupId' `
    --output text)

# Permitir PostgreSQL do EC2
aws ec2 authorize-security-group-ingress `
    --group-id $RDS_SG_ID `
    --protocol tcp `
    --port 5432 `
    --source-group $SG_ID

# Criar RDS db.t3.micro (FREE TIER)
aws rds create-db-instance `
    --db-instance-identifier pli2050-db-freetier `
    --db-instance-class db.t3.micro `
    --engine postgres `
    --engine-version 17.2 `
    --master-username postgres `
    --master-user-password "SuaSenhaSegura123!" `
    --allocated-storage 20 `
    --storage-type gp3 `
    --vpc-security-group-ids $RDS_SG_ID `
    --db-subnet-group-name pli2050-subnet-group `
    --backup-retention-period 7 `
    --publicly-accessible false `
    --no-multi-az `
    --db-name pli2050

Write-Host "⏳ Aguardando RDS ficar disponível (5-10 minutos)..." -ForegroundColor Yellow

# Aguardar
aws rds wait db-instance-available --db-instance-identifier pli2050-db-freetier

# Obter endpoint
$RDS_ENDPOINT = (aws rds describe-db-instances `
    --db-instance-identifier pli2050-db-freetier `
    --query 'DBInstances[0].Endpoint.Address' `
    --output text)

Write-Host "✅ RDS criado!" -ForegroundColor Green
Write-Host "📊 Endpoint: $RDS_ENDPOINT" -ForegroundColor Cyan
```

### Criar Schema e Tabelas

```bash
# No EC2, instalar cliente PostgreSQL
sudo apt install -y postgresql-client

# Conectar ao RDS
psql -h <RDS_ENDPOINT> -U postgres -d pli2050

# No prompt psql, criar schema
CREATE SCHEMA IF NOT EXISTS formulario_embarcadores;

# Sair
\q

# Executar script SQL completo
git clone https://github.com/vpcapanema/formulario_entrevista_embarcadores.git
cd formulario_entrevista_embarcadores

psql -h <RDS_ENDPOINT> -U postgres -d pli2050 -f sql/database_schema_completo.sql
```

### Atualizar .env no EC2

```bash
cd ~/formulario_entrevista_embarcadores
nano backend-fastapi/.env

# Alterar PGHOST para o endpoint do RDS
PGHOST=<RDS_ENDPOINT>

# Salvar e reiniciar
docker-compose restart backend
```

---

## 📊 Monitoramento Gratuito

### CloudWatch (5GB logs/mês grátis)

```powershell
# Instalar CloudWatch Agent no EC2 (opcional)
# Ver logs do Docker
ssh -i pli2050-key.pem ubuntu@<PUBLIC_IP>
docker-compose logs -f
```

### Alarmes Básicos (Grátis)

```powershell
# Criar SNS Topic (notificações)
$SNS_ARN = (aws sns create-topic --name pli2050-alerts --query 'TopicArn' --output text)

# Assinar com seu email
aws sns subscribe `
    --topic-arn $SNS_ARN `
    --protocol email `
    --notification-endpoint seu-email@exemplo.com

# Alarme: CPU alta (>80%)
aws cloudwatch put-metric-alarm `
    --alarm-name pli2050-high-cpu `
    --alarm-description "CPU acima de 80%" `
    --metric-name CPUUtilization `
    --namespace AWS/EC2 `
    --statistic Average `
    --period 300 `
    --threshold 80 `
    --comparison-operator GreaterThanThreshold `
    --evaluation-periods 2 `
    --dimensions Name=InstanceId,Value=$INSTANCE_ID `
    --alarm-actions $SNS_ARN
```

---

## 🔒 Boas Práticas de Segurança (Grátis)

### 1. Atualizar Sistema Automaticamente

```bash
# No EC2
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 2. Configurar Firewall

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw enable
```

### 3. Trocar Senha do RDS

```powershell
aws rds modify-db-instance `
    --db-instance-identifier pli2050-db-freetier `
    --master-user-password "NovaSenhaSegura456!" `
    --apply-immediately
```

---

## 🎯 Checklist de Validação

- [ ] EC2 t2.micro rodando (750h/mês Free Tier)
- [ ] RDS db.t3.micro criado (750h/mês Free Tier)
- [ ] EBS ≤ 30GB (Free Tier)
- [ ] Docker instalado e funcionando
- [ ] Aplicação respondendo: `curl http://<PUBLIC_IP>/health`
- [ ] Frontend carrega: `http://<PUBLIC_IP>`
- [ ] API Docs: `http://<PUBLIC_IP>/docs`
- [ ] Banco conectado (verificar em /health)
- [ ] Logs funcionando: `docker-compose logs`
- [ ] Alarme CloudWatch configurado

---

## 📈 Após 12 Meses

### Opção 1: Continuar com EC2 (~$26/mês)
Nada muda, começa a cobrar.

### Opção 2: Migrar para App Runner (~$17.50/mês)
Mais barato que EC2, escalável.

```powershell
# Build e push para ECR
.\CONSTRUIR-DOCKER.ps1 -Build
aws ecr get-login-password | docker login ...
.\CONSTRUIR-DOCKER.ps1 -Push -Registry <ECR_URL>

# Criar App Runner
aws apprunner create-service --service-name pli2050 ...
```

### Opção 3: Manter EC2 mas reduzir custos
- Usar EBS gp3 ao invés de gp2 (30% mais barato)
- Reserved Instance (até 72% desconto com compromisso de 1 ano)
- Savings Plans

---

## 💡 Dicas para Maximizar Free Tier

1. **Use APENAS 1 instância EC2 t2.micro** (750h = 31 dias)
2. **Use APENAS 1 RDS db.t3.micro** (750h = 31 dias)
3. **Mantenha EBS ≤ 30GB total**
4. **Data Transfer OUT ≤ 15GB/mês** (evite downloads grandes)
5. **CloudWatch Logs ≤ 5GB/mês** (configure rotação)
6. **ECR ≤ 500MB** (apenas 1 imagem, delete old tags)

---

## 🆘 Troubleshooting Free Tier

### "Recebi cobrança!"

1. **Verificar Cost Explorer:**
   - Console AWS → Billing → Cost Explorer
   - Filtrar por serviço

2. **Serviços NÃO cobertos:**
   - ❌ ALB (~$16/mês)
   - ❌ Elastic IP não associado (~$3.60/mês)
   - ❌ Snapshots EBS extras
   - ❌ Data Transfer acima de 15GB/mês
   - ❌ Multi-AZ RDS

3. **Configurar Budget Alert:**
   ```powershell
   aws budgets create-budget `
       --account-id <ACCOUNT_ID> `
       --budget file://budget.json
   ```

---

## 📞 Recursos

- **AWS Free Tier:** https://aws.amazon.com/free/
- **Calculadora de Custos:** https://calculator.aws/
- **Painel de Uso Free Tier:** https://console.aws.amazon.com/billing/home#/freetier
- **Guia completo:** `GUIA_DEPLOY_AWS.md`

---

**🎉 Parabéns! Você tem um servidor rodando 24/7 por $0/mês! 🎉**

**Última atualização:** 07/11/2025
