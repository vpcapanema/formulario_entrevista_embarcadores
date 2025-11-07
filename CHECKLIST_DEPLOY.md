# ✅ Checklist de Deploy - PLI 2050

## 📋 Pré-Deploy (Preparação)

### 1. Ambiente Local
- [ ] Docker instalado e funcionando
- [ ] AWS CLI instalado (`aws --version`)
- [ ] Credenciais AWS configuradas (`aws configure`)
- [ ] Git atualizado com última versão do código
- [ ] Testes locais passando (`.\CONSTRUIR-DOCKER.ps1 -Build -Run`)

### 2. Arquivos de Configuração
- [ ] `.env.production` criado e preenchido
- [ ] `ALLOWED_ORIGINS` atualizado com domínio de produção
- [ ] `ecs-task-definition.json` revisado
- [ ] Secrets Manager configurado (recomendado) ou variáveis de ambiente

### 3. Banco de Dados AWS RDS
- [ ] Instância RDS PostgreSQL 17 criada
- [ ] Schema `formulario_embarcadores` criado
- [ ] Tabelas criadas (executar `sql/database_schema_completo.sql`)
- [ ] Security Group permite conexão do ECS
- [ ] Backup automático habilitado
- [ ] Credenciais seguras definidas

---

## 🚀 Deploy (Execução)

### Opção A: Deploy Automatizado (Recomendado)

```powershell
# 1. Build, push e registrar task
.\DEPLOY-AWS.ps1 -Environment production -AwsAccountId <SEU_ACCOUNT_ID>

# 2. Criar infraestrutura (primeira vez)
# Ver seção "Primeira Deploy" abaixo

# 3. Atualizar serviço existente
.\DEPLOY-AWS.ps1 -Environment production -AwsAccountId <SEU_ACCOUNT_ID> -UpdateService
```

### Opção B: Deploy Manual

#### 1. Build e Push
- [ ] Build da imagem: `.\CONSTRUIR-DOCKER.ps1 -Build`
- [ ] Login ECR: `aws ecr get-login-password | docker login ...`
- [ ] Push: `.\CONSTRUIR-DOCKER.ps1 -Push -Registry <ECR_URL>`

#### 2. Criar Repositório ECR
```powershell
aws ecr create-repository --repository-name pli2050-backend --region us-east-1
```

#### 3. Registrar Task Definition
```powershell
# Editar ecs-task-definition.json (substituir <ACCOUNT_ID>)
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json
```

#### 4. Criar Cluster (primeira vez)
```powershell
aws ecs create-cluster --cluster-name pli2050-cluster --region us-east-1
```

#### 5. Criar Security Groups
```powershell
# ALB Security Group (porta 80, 443)
aws ec2 create-security-group --group-name pli2050-alb-sg --description "ALB PLI 2050" --vpc-id <VPC_ID>
aws ec2 authorize-security-group-ingress --group-id <ALB_SG_ID> --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id <ALB_SG_ID> --protocol tcp --port 443 --cidr 0.0.0.0/0

# ECS Security Group (porta 8000 do ALB)
aws ec2 create-security-group --group-name pli2050-ecs-sg --description "ECS PLI 2050" --vpc-id <VPC_ID>
aws ec2 authorize-security-group-ingress --group-id <ECS_SG_ID> --protocol tcp --port 8000 --source-group <ALB_SG_ID>
```

#### 6. Criar Application Load Balancer
```powershell
# Criar ALB
aws elbv2 create-load-balancer --name pli2050-alb --subnets <SUBNET_1> <SUBNET_2> --security-groups <ALB_SG_ID>

# Criar Target Group
aws elbv2 create-target-group --name pli2050-tg --protocol HTTP --port 8000 --vpc-id <VPC_ID> --target-type ip --health-check-path /health

# Criar Listener
aws elbv2 create-listener --load-balancer-arn <ALB_ARN> --protocol HTTP --port 80 --default-actions Type=forward,TargetGroupArn=<TG_ARN>
```

#### 7. Criar Serviço ECS
```powershell
aws ecs create-service \
    --cluster pli2050-cluster \
    --service-name pli2050-backend-service \
    --task-definition pli2050-backend-task \
    --desired-count 2 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[<SUBNET_1>,<SUBNET_2>],securityGroups=[<ECS_SG_ID>],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=<TG_ARN>,containerName=pli2050-backend,containerPort=8000"
```

---

## 🔍 Pós-Deploy (Validação)

### 1. Verificação de Saúde
- [ ] Serviço ECS em estado RUNNING
  ```powershell
  aws ecs describe-services --cluster pli2050-cluster --services pli2050-backend-service
  ```
- [ ] Health checks passando (2/2 targets healthy no ALB)
- [ ] Endpoint `/health` respondendo 200 OK
  ```powershell
  curl http://<ALB_DNS>/health
  ```

### 2. Testes Funcionais
- [ ] Frontend carrega corretamente: `http://<ALB_DNS>/`
- [ ] API Docs acessível: `http://<ALB_DNS>/docs`
- [ ] Listar pesquisas: `http://<ALB_DNS>/api/pesquisas/listar`
- [ ] Analytics endpoint: `http://<ALB_DNS>/api/analytics/kpis`
- [ ] Visualizador carrega dados

### 3. Logs e Monitoramento
- [ ] Logs aparecendo no CloudWatch
  - Grupo: `/ecs/pli2050-backend`
  - Verificar: https://console.aws.amazon.com/cloudwatch/
- [ ] Métricas de CPU/Memória normais (<50%)
- [ ] Alarmes configurados (opcional mas recomendado)

### 4. Segurança
- [ ] CORS configurado corretamente (testar de outro domínio)
- [ ] Secrets no Secrets Manager (não em variáveis de ambiente)
- [ ] HTTPS habilitado (certificado ACM)
- [ ] Security Groups restritivos (apenas portas necessárias)

---

## 🌐 DNS e SSL (Opcional mas Recomendado)

### 1. Configurar Certificado SSL
```powershell
# Solicitar certificado no ACM
aws acm request-certificate \
    --domain-name pli2050.exemplo.com.br \
    --validation-method DNS \
    --region us-east-1

# Validar (adicionar registro CNAME no Route 53)
# Aguardar status "Issued"
```

### 2. Atualizar Listener para HTTPS
```powershell
# Criar listener HTTPS
aws elbv2 create-listener \
    --load-balancer-arn <ALB_ARN> \
    --protocol HTTPS \
    --port 443 \
    --certificates CertificateArn=<CERT_ARN> \
    --default-actions Type=forward,TargetGroupArn=<TG_ARN>

# Redirecionar HTTP → HTTPS
aws elbv2 modify-listener \
    --listener-arn <HTTP_LISTENER_ARN> \
    --default-actions Type=redirect,RedirectConfig={Protocol=HTTPS,Port=443,StatusCode=HTTP_301}
```

### 3. Configurar Route 53
```powershell
# Criar registro A (Alias para ALB)
aws route53 change-resource-record-sets \
    --hosted-zone-id <ZONE_ID> \
    --change-batch '{
        "Changes": [{
            "Action": "CREATE",
            "ResourceRecordSet": {
                "Name": "pli2050.exemplo.com.br",
                "Type": "A",
                "AliasTarget": {
                    "HostedZoneId": "<ALB_ZONE_ID>",
                    "DNSName": "<ALB_DNS>",
                    "EvaluateTargetHealth": true
                }
            }
        }]
    }'
```

---

## 📊 Monitoramento Contínuo

### Configurar Alarmes CloudWatch
```powershell
# Alarme: CPU Alta (>80%)
aws cloudwatch put-metric-alarm \
    --alarm-name pli2050-high-cpu \
    --metric-name CPUUtilization \
    --namespace AWS/ECS \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2 \
    --alarm-actions <SNS_TOPIC_ARN>

# Alarme: Health Check Failures
aws cloudwatch put-metric-alarm \
    --alarm-name pli2050-unhealthy-targets \
    --metric-name UnHealthyHostCount \
    --namespace AWS/ApplicationELB \
    --statistic Average \
    --period 60 \
    --threshold 1 \
    --comparison-operator GreaterThanOrEqualToThreshold \
    --evaluation-periods 2
```

---

## 🔄 Atualizações Futuras

### Deploy de Nova Versão
```powershell
# 1. Commit e push do código
git add .
git commit -m "feat: nova funcionalidade"
git push

# 2. Deploy automático
.\DEPLOY-AWS.ps1 -Environment production -AwsAccountId <ID> -UpdateService

# 3. Verificar deploy
aws ecs describe-services --cluster pli2050-cluster --services pli2050-backend-service --query 'services[0].deployments'
```

### Rollback (se necessário)
```powershell
# Listar task definitions
aws ecs list-task-definitions --family-prefix pli2050-backend-task

# Reverter para versão anterior
aws ecs update-service \
    --cluster pli2050-cluster \
    --service pli2050-backend-service \
    --task-definition pli2050-backend-task:<VERSAO_ANTERIOR>
```

---

## 🆘 Troubleshooting

### Serviço não inicia
- [ ] Verificar logs CloudWatch: `/ecs/pli2050-backend`
- [ ] Checar variáveis de ambiente (PGHOST, PGPASSWORD, etc.)
- [ ] Confirmar Security Groups permitem conexão ao RDS
- [ ] Verificar se task tem recursos suficientes (CPU/memória)

### Health checks falhando
- [ ] Testar endpoint manualmente: `curl <TASK_IP>:8000/health`
- [ ] Verificar logs de erro no CloudWatch
- [ ] Confirmar que container está rodando: `docker ps`
- [ ] Checar timeout do health check (pode precisar aumentar `startPeriod`)

### 502 Bad Gateway no ALB
- [ ] Nenhum target healthy no Target Group
- [ ] Security Group do ECS não permite tráfego do ALB
- [ ] Porta incorreta no Target Group (deve ser 8000)
- [ ] Container não respondendo na porta 8000

### Banco de dados inacessível
- [ ] RDS Security Group permite conexão do ECS SG
- [ ] Credenciais corretas no Secrets Manager
- [ ] RDS no mesmo VPC que o ECS
- [ ] RDS não está em manutenção

---

## 💰 Estimativa de Custos (us-east-1)

| Recurso | Configuração | Custo/mês |
|---------|-------------|-----------|
| **ECS Fargate** | 512 CPU, 1GB RAM, 2 tasks | ~$28 |
| **ALB** | Standard | ~$16 |
| **RDS PostgreSQL** | db.t3.micro, 20GB | ~$15 |
| **ECR** | 1GB armazenamento | ~$0.10 |
| **CloudWatch Logs** | 5GB/mês | ~$2.50 |
| **Data Transfer** | 10GB OUT | ~$0.90 |
| **Route 53** | Hosted zone | ~$0.50 |
| **ACM Certificate** | 1 certificado | **Grátis** |
| **TOTAL ESTIMADO** | | **~$63/mês** |

*Custos podem variar com uso real. Use AWS Cost Calculator para estimativa precisa.*

---

## 📞 Suporte

- **Documentação AWS ECS**: https://docs.aws.amazon.com/ecs/
- **Guia completo**: `GUIA_DEPLOY_AWS.md`
- **Logs**: CloudWatch → `/ecs/pli2050-backend`
- **Status AWS**: https://health.aws.amazon.com/

---

**Última atualização**: 07/11/2025
