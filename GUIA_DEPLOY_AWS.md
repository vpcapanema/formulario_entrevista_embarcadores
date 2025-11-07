# 🚀 Guia de Deploy AWS com Docker - PLI 2050

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Opções de Deploy](#opções-de-deploy)
3. [AWS ECS Fargate (RECOMENDADO)](#1-aws-ecs-fargate-recomendado)
4. [AWS App Runner](#2-aws-app-runner)
5. [AWS EC2 com Docker](#3-aws-ec2-com-docker)
6. [AWS Elastic Beanstalk](#4-aws-elastic-beanstalk)
7. [Configuração de Banco de Dados](#configuração-de-banco-de-dados)
8. [Configuração de DNS e SSL](#configuração-de-dns-e-ssl)

---

## Visão Geral

Este guia cobre as principais opções para fazer deploy da aplicação PLI 2050 na AWS usando Docker.

**Stack Atual:**
- Backend: FastAPI + Python 3.11
- Frontend: Vanilla JS (servido pelo FastAPI)
- Banco: PostgreSQL 17 (AWS RDS)
- Container: Docker multi-stage

**Pré-requisitos:**
- ✅ AWS CLI instalado e configurado
- ✅ Conta AWS ativa
- ✅ Docker instalado localmente
- ✅ Credenciais AWS com permissões apropriadas

---

## Opções de Deploy

| Opção | Complexidade | Custo | Escalabilidade | Auto-Scaling | Recomendado Para |
|-------|-------------|-------|----------------|--------------|------------------|
| **ECS Fargate** | Média | Médio | Alta | ✅ Sim | **Produção** |
| **App Runner** | Baixa | Médio | Média | ✅ Sim | Protótipos/MVPs |
| **EC2 + Docker** | Baixa | Baixo | Baixa | ❌ Não | Testes/Dev |
| **Elastic Beanstalk** | Baixa | Baixo | Alta | ✅ Sim | Apps tradicionais |

---

## 1. AWS ECS Fargate (RECOMENDADO) ⭐

**Por que usar:** Serverless, escalável, gerenciado pela AWS, sem gerenciamento de VMs.

### Passo 1: Criar ECR Repository

```powershell
# Login no ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Criar repositório
aws ecr create-repository --repository-name pli2050-backend --region us-east-1

# Output: Copie o "repositoryUri"
# Exemplo: 123456789012.dkr.ecr.us-east-1.amazonaws.com/pli2050-backend
```

### Passo 2: Build e Push da Imagem

```powershell
# Build local
.\CONSTRUIR-DOCKER.ps1 -Build

# Tag para ECR
docker tag pli2050-backend:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/pli2050-backend:latest

# Push
docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/pli2050-backend:latest
```

### Passo 3: Criar Task Definition

Crie arquivo `ecs-task-definition.json`:

```json
{
  "family": "pli2050-backend-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::<ACCOUNT_ID>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "pli2050-backend",
      "image": "<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/pli2050-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "APP_ENV", "value": "production"},
        {"name": "LOG_LEVEL", "value": "info"}
      ],
      "secrets": [
        {"name": "PGHOST", "valueFrom": "arn:aws:secretsmanager:us-east-1:<ACCOUNT_ID>:secret:pli2050/db/host"},
        {"name": "PGUSER", "valueFrom": "arn:aws:secretsmanager:us-east-1:<ACCOUNT_ID>:secret:pli2050/db/user"},
        {"name": "PGPASSWORD", "valueFrom": "arn:aws:secretsmanager:us-east-1:<ACCOUNT_ID>:secret:pli2050/db/password"},
        {"name": "PGDATABASE", "valueFrom": "arn:aws:secretsmanager:us-east-1:<ACCOUNT_ID>:secret:pli2050/db/name"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/pli2050-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

Registre a task:

```powershell
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json
```

### Passo 4: Criar Cluster ECS

```powershell
aws ecs create-cluster --cluster-name pli2050-cluster --region us-east-1
```

### Passo 5: Criar Application Load Balancer (ALB)

```powershell
# Criar security group para ALB
aws ec2 create-security-group `
    --group-name pli2050-alb-sg `
    --description "Security group para ALB do PLI 2050" `
    --vpc-id <VPC_ID>

# Permitir HTTP e HTTPS
aws ec2 authorize-security-group-ingress `
    --group-id <ALB_SG_ID> `
    --protocol tcp --port 80 --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress `
    --group-id <ALB_SG_ID> `
    --protocol tcp --port 443 --cidr 0.0.0.0/0

# Criar ALB
aws elbv2 create-load-balancer `
    --name pli2050-alb `
    --subnets <SUBNET_1> <SUBNET_2> `
    --security-groups <ALB_SG_ID> `
    --scheme internet-facing

# Criar target group
aws elbv2 create-target-group `
    --name pli2050-tg `
    --protocol HTTP `
    --port 8000 `
    --vpc-id <VPC_ID> `
    --target-type ip `
    --health-check-path /health

# Criar listener
aws elbv2 create-listener `
    --load-balancer-arn <ALB_ARN> `
    --protocol HTTP `
    --port 80 `
    --default-actions Type=forward,TargetGroupArn=<TG_ARN>
```

### Passo 6: Criar Serviço ECS

```powershell
aws ecs create-service `
    --cluster pli2050-cluster `
    --service-name pli2050-backend-service `
    --task-definition pli2050-backend-task `
    --desired-count 2 `
    --launch-type FARGATE `
    --network-configuration "awsvpcConfiguration={subnets=[<SUBNET_1>,<SUBNET_2>],securityGroups=[<ECS_SG_ID>],assignPublicIp=ENABLED}" `
    --load-balancers "targetGroupArn=<TG_ARN>,containerName=pli2050-backend,containerPort=8000"
```

### Custos Estimados (us-east-1)

- **Fargate (512 CPU, 1024 MB):** ~$14/mês (730 horas)
- **ALB:** ~$16/mês
- **ECR:** $0.10/GB/mês (primeiros 500 MB grátis)
- **CloudWatch Logs:** ~$2-5/mês
- **Total:** ~$30-35/mês

---

## 2. AWS App Runner

**Por que usar:** Mais simples que ECS, deploy direto do código ou container.

### Deploy

```powershell
# Criar service diretamente do ECR
aws apprunner create-service `
    --service-name pli2050-backend `
    --source-configuration '{
        "ImageRepository": {
            "ImageIdentifier": "<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/pli2050-backend:latest",
            "ImageRepositoryType": "ECR",
            "ImageConfiguration": {
                "Port": "8000",
                "RuntimeEnvironmentVariables": {
                    "APP_ENV": "production"
                }
            }
        },
        "AutoDeploymentsEnabled": true
    }' `
    --instance-configuration '{
        "Cpu": "1 vCPU",
        "Memory": "2 GB"
    }'
```

### Custos Estimados

- **Computação:** $0.007/hora (~$5/mês para uso contínuo)
- **Memória:** $0.0008/GB/hora (~$1.17/mês)
- **Total:** ~$6-7/mês

---

## 3. AWS EC2 com Docker

**Por que usar:** Controle total, custo baixo para testes.

### Passo 1: Criar Instância EC2

```powershell
# Criar key pair
aws ec2 create-key-pair --key-name pli2050-key --query 'KeyMaterial' --output text > pli2050-key.pem

# Lançar instância (Ubuntu 22.04)
aws ec2 run-instances `
    --image-id ami-0c7217cdde317cfec `
    --instance-type t3.small `
    --key-name pli2050-key `
    --security-group-ids <SG_ID> `
    --subnet-id <SUBNET_ID> `
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=PLI2050-Backend}]'
```

### Passo 2: Conectar e Instalar Docker

```bash
# SSH
ssh -i pli2050-key.pem ubuntu@<EC2_PUBLIC_IP>

# Instalar Docker
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# Relogar
exit
ssh -i pli2050-key.pem ubuntu@<EC2_PUBLIC_IP>
```

### Passo 3: Deploy

```bash
# Clonar repositório
git clone https://github.com/vpcapanema/formulario_entrevista_embarcadores.git
cd formulario_entrevista_embarcadores

# Criar .env
nano backend-fastapi/.env
# (colar variáveis de ambiente)

# Build e executar
docker-compose up --build -d

# Ver logs
docker-compose logs -f
```

### Custos Estimados

- **t3.small:** ~$15/mês
- **EBS (20GB):** ~$2/mês
- **Total:** ~$17/mês

---

## 4. AWS Elastic Beanstalk

**Por que usar:** Gerenciamento simplificado, auto-scaling, integração com outros serviços AWS.

### Passo 1: Criar arquivo `Dockerrun.aws.json`

```json
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/pli2050-backend:latest",
    "Update": "true"
  },
  "Ports": [
    {
      "ContainerPort": 8000,
      "HostPort": 80
    }
  ],
  "Logging": "/var/log/nginx"
}
```

### Passo 2: Criar e Fazer Deploy

```powershell
# Inicializar EB
eb init -p docker -r us-east-1 pli2050-backend

# Criar ambiente
eb create pli2050-prod --instance-type t3.small --envvars APP_ENV=production,PGHOST=<RDS_HOST>,PGUSER=<USER>,PGPASSWORD=<PASS>

# Deploy
eb deploy

# Abrir no navegador
eb open
```

### Custos Estimados

- **t3.small:** ~$15/mês
- **Load Balancer:** ~$16/mês
- **Total:** ~$31/mês

---

## Configuração de Banco de Dados

### AWS RDS PostgreSQL

Se você ainda não tem um RDS, crie:

```powershell
aws rds create-db-instance `
    --db-instance-identifier pli2050-db `
    --db-instance-class db.t3.micro `
    --engine postgres `
    --engine-version 17.2 `
    --master-username postgres `
    --master-user-password <SENHA_FORTE> `
    --allocated-storage 20 `
    --vpc-security-group-ids <SG_ID> `
    --db-subnet-group-name <SUBNET_GROUP> `
    --backup-retention-period 7 `
    --publicly-accessible false
```

**Custos:** db.t3.micro = ~$15/mês

---

## Configuração de DNS e SSL

### Route 53 + Certificate Manager

```powershell
# Criar certificado SSL (ACM)
aws acm request-certificate `
    --domain-name pli2050.exemplo.com.br `
    --validation-method DNS `
    --region us-east-1

# Configurar Route 53 (após validação)
aws route53 change-resource-record-sets `
    --hosted-zone-id <ZONE_ID> `
    --change-batch '{
        "Changes": [{
            "Action": "CREATE",
            "ResourceRecordSet": {
                "Name": "pli2050.exemplo.com.br",
                "Type": "A",
                "AliasTarget": {
                    "HostedZoneId": "<ALB_ZONE_ID>",
                    "DNSName": "<ALB_DNS>",
                    "EvaluateTargetHealth": false
                }
            }
        }]
    }'
```

---

## Monitoramento

### CloudWatch

```powershell
# Criar dashboard
aws cloudwatch put-dashboard `
    --dashboard-name PLI2050-Dashboard `
    --dashboard-body file://cloudwatch-dashboard.json

# Criar alarme (CPU > 80%)
aws cloudwatch put-metric-alarm `
    --alarm-name pli2050-high-cpu `
    --alarm-description "CPU acima de 80%" `
    --metric-name CPUUtilization `
    --namespace AWS/ECS `
    --statistic Average `
    --period 300 `
    --threshold 80 `
    --comparison-operator GreaterThanThreshold `
    --evaluation-periods 2
```

---

## Resumo de Custos

| Serviço | Free Tier | Baixo Custo | Produção |
|---------|-----------|-------------|----------|
| **Opção** | App Runner | EC2 t3.small | ECS Fargate |
| **Custo/mês** | ~$7 | ~$17 | ~$35 |
| **Escalabilidade** | Automática | Manual | Automática |
| **Gerenciamento** | Baixo | Médio | Baixo |

---

## Próximos Passos

1. ✅ Escolher opção de deploy
2. ✅ Configurar AWS CLI com credenciais
3. ✅ Criar .env com variáveis de produção
4. ✅ Fazer build da imagem Docker
5. ✅ Enviar para ECR (se usar ECS/Fargate)
6. ✅ Criar infraestrutura AWS
7. ✅ Fazer deploy
8. ✅ Configurar DNS e SSL
9. ✅ Configurar monitoramento

---

**Suporte:**
- Documentação AWS ECS: https://docs.aws.amazon.com/ecs/
- Documentação App Runner: https://docs.aws.amazon.com/apprunner/
- Troubleshooting: Ver logs em CloudWatch ou `docker logs`
