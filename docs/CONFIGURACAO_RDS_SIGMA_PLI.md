# ===============================================================================
# 🎯 CONFIGURAÇÃO COMPLETA - PLI 2050 COM RDS SIGMA PLI
# ===============================================================================
# Data: 07/11/2025
# Status: ✅ CONFIGURADO E TESTADO
# ===============================================================================

## 📊 RESUMO DA CONFIGURAÇÃO

### 🔗 Banco de Dados RDS AWS
- **Instância**: sigma-pli-postgresql-db
- **Endpoint**: sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com
- **Porta**: 5432
- **Database**: sigma_pli
- **User**: sigma_admin
- **Password**: Malditas131533*
- **Engine**: PostgreSQL 17.4
- **Classe**: db.t3.micro (Free Tier)
- **Região**: us-east-1 (North Virginia)
- **Status**: ✅ AVAILABLE

### 📦 Schema e Tabelas
- **Schema**: `formulario_embarcadores`
- **Status**: ✅ EXISTE E OPERACIONAL
- **Tabelas**: 15 (10 tabelas + 5 views)

#### Tabelas Principais:
1. `empresas` - Dados das empresas embarcadoras
2. `entrevistadores` - Dados dos entrevistadores
3. `entrevistados` - Dados dos entrevistados
4. `estados_brasil` - Estados brasileiros
5. `funcoes_entrevistado` - Funções dos entrevistados
6. `instituicoes` - Instituições
7. `municipios_sp` - Municípios de São Paulo
8. `paises` - Países
9. `pesquisas` - Respostas do formulário (47 campos)
10. `produtos_transportados` - Produtos transportados pelas empresas

#### Views Analíticas:
11. `v_distribuicao_modal` - Distribuição por modal de transporte
12. `v_kpis_gerais` - KPIs gerais do sistema
13. `v_pesquisas_completa` - View completa com JOINs de todas as tabelas
14. `v_produtos_detalhados` - Produtos com detalhes completos
15. `v_produtos_ranking` - Ranking de produtos por movimentação

---

## 🔧 ARQUIVOS CONFIGURADOS

### 1. `.env` (Desenvolvimento Local)
**Localização**: `backend-fastapi/.env`
```bash
PGHOST=sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com
PGPORT=5432
PGDATABASE=sigma_pli
PGUSER=sigma_admin
PGPASSWORD=Malditas131533*
SCHEMA_NAME=formulario_embarcadores
DEBUG=True
ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500
```

### 2. `.env.production` (Produção AWS)
**Localização**: `backend-fastapi/.env.production`
```bash
PGHOST=sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com
PGPORT=5432
PGDATABASE=sigma_pli
PGUSER=sigma_admin
PGPASSWORD=Malditas131533*
ALLOWED_ORIGINS=https://vpcapanema.github.io,http://localhost:5500
APP_ENV=production
DEBUG=false
```

### 3. `docker-compose.yml`
**Localização**: Raiz do projeto
```yaml
environment:
  PGHOST: sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com
  PGPORT: 5432
  PGDATABASE: sigma_pli
  PGUSER: sigma_admin
  PGPASSWORD: Malditas131533*
  PGSCHEMA: formulario_embarcadores
```

---

## 🚀 COMO USAR

### 🔹 Desenvolvimento Local (FastAPI sem Docker)

1. **Ativar ambiente virtual**:
   ```powershell
   cd backend-fastapi
   .\venv\Scripts\Activate.ps1
   ```

2. **Testar conexão com RDS**:
   ```powershell
   python testar_rds.py
   ```

3. **Iniciar backend**:
   ```powershell
   python -m uvicorn main:app --reload --port 8000
   ```

4. **Acessar**:
   - API: http://localhost:8000
   - Docs: http://localhost:8000/docs
   - Health: http://localhost:8000/health

### 🔹 Desenvolvimento com Docker

1. **Build da imagem**:
   ```powershell
   docker-compose build
   ```

2. **Iniciar serviços**:
   ```powershell
   docker-compose up -d
   ```

3. **Ver logs**:
   ```powershell
   docker-compose logs -f backend
   ```

4. **Parar serviços**:
   ```powershell
   docker-compose down
   ```

### 🔹 Deploy em AWS EC2 Free Tier

1. **Configurar AWS CLI**:
   ```powershell
   .\CONFIGURAR-AWS.ps1
   ```
   - Vai pedir: Access Key ID e Secret Key

2. **Deploy automatizado**:
   ```powershell
   .\DEPLOY-EC2-FREETIER.ps1
   ```
   - Cria EC2 t2.micro
   - Configura Security Groups
   - Gera chave SSH
   - Salva informações em `DEPLOY_INFO_*.txt`

3. **SSH na instância EC2**:
   ```bash
   ssh -i pli2050-key.pem ubuntu@<IP_PUBLICO>
   ```

4. **Instalar Docker no EC2**:
   ```bash
   sudo apt update
   sudo apt install -y docker.io docker-compose
   sudo usermod -aG docker ubuntu
   ```

5. **Clonar repositório**:
   ```bash
   git clone https://github.com/vpcapanema/formulario_entrevista_embarcadores.git
   cd formulario_entrevista_embarcadores
   ```

6. **Iniciar aplicação**:
   ```bash
   docker-compose up -d --build
   ```

7. **Acessar aplicação**:
   ```
   http://<IP_PUBLICO>:8000
   ```

---

## 🧪 TESTAR ENDPOINTS DA API

### Health Check
```bash
curl http://localhost:8000/health
```

### Listar Estados
```bash
curl http://localhost:8000/api/estados
```

### Listar Municípios de SP
```bash
curl http://localhost:8000/api/municipios-sp
```

### Listar Funções de Entrevistado
```bash
curl http://localhost:8000/api/funcoes-entrevistado
```

### Listar Instituições
```bash
curl http://localhost:8000/api/instituicoes
```

### Submeter Formulário (POST)
```bash
curl -X POST http://localhost:8000/api/submit-form \
  -H "Content-Type: application/json" \
  -d @exemplo_payload.json
```

---

## 💰 CUSTOS AWS FREE TIER

### Recursos Utilizados (12 meses grátis):

| Recurso | Especificação | Free Tier | Custo Atual |
|---------|---------------|-----------|-------------|
| RDS PostgreSQL | db.t3.micro | 750h/mês | **$0** ✅ |
| Storage RDS | 20 GB gp2 | 20 GB | **$0** ✅ |
| Backup RDS | 20 GB | 20 GB | **$0** ✅ |
| EC2 (se usar) | t2.micro | 750h/mês | **$0** ✅ |
| EBS (se usar) | 30 GB gp3 | 30 GB | **$0** ✅ |
| Data Transfer | Out | 100 GB/mês | **$0** ✅ |
| **TOTAL** | | | **$0/mês** 🎉 |

**Após 12 meses**: ~$13-15/mês (apenas RDS) ou ~$26/mês (RDS + EC2)

---

## 🔒 SEGURANÇA

### Security Group: sigma-pli-rds-sg
- **ID**: sg-0409cba0ee50043ae
- **VPC**: vpc-01206280978218c03
- **Regras de Entrada**:
  - Porta 5432 (PostgreSQL) aberta para 0.0.0.0/0
- **Acesso Público**: ✅ Habilitado

### ⚠️ RECOMENDAÇÕES:
1. **NÃO commitar arquivo `.env` com senha**
2. Adicionar `.env` ao `.gitignore`
3. Usar AWS Secrets Manager em produção
4. Rotacionar senha periodicamente
5. Restringir Security Group a IPs específicos (se possível)
6. Habilitar SSL/TLS: `PGSSLMODE=require`
7. Monitorar uso com AWS CloudWatch
8. Configurar alertas de billing

---

## 📋 CHECKLIST DE VALIDAÇÃO

- [x] RDS Sigma PLI acessível
- [x] Schema `formulario_embarcadores` existe
- [x] 15 tabelas/views encontradas
- [x] Arquivo `.env` configurado
- [x] Arquivo `.env.production` criado
- [x] `docker-compose.yml` atualizado
- [x] Script de teste `testar_rds.py` criado
- [x] Conexão testada com sucesso
- [ ] Deploy em EC2 (aguardando credenciais AWS)
- [ ] Frontend conectado ao backend
- [ ] Testes end-to-end realizados

---

## 📚 DOCUMENTAÇÃO ADICIONAL

- `GUIA_DEPLOY_FREE_TIER.md` - Deploy EC2 Free Tier completo
- `GUIA_DEPLOY_AWS.md` - 4 opções de deploy comparadas
- `CHECKLIST_DEPLOY.md` - Checklist de validação
- `ARQUITETURA_SISTEMA.md` - Arquitetura completa
- `DOCUMENTACAO_COMPLETA.md` - Documentação técnica

---

## 🆘 TROUBLESHOOTING

### Erro: "Connection refused"
```bash
# Verificar se RDS está acessível
telnet sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com 5432
```

### Erro: "SSL connection required"
```bash
# Adicionar ao .env:
PGSSLMODE=require
```

### Erro: "Schema not found"
```bash
# Verificar schema
python testar_rds.py
```

### Erro: "Authentication failed"
```bash
# Verificar credenciais no .env
# Senha correta: Malditas131533*
```

---

## 📞 SUPORTE

**Conta AWS**: 932669655992  
**Usuário**: sigma-admin  
**Perfil**: sigma-pli  
**Região**: us-east-1  

**Banco de Dados**:
- Endpoint: sigma-pli-postgresql-db.cwlmgwc4igdh.us-east-1.rds.amazonaws.com
- Database: sigma_pli
- Schema: formulario_embarcadores

---

✅ **SISTEMA CONFIGURADO E PRONTO PARA USO!** 🎉

Última atualização: 07/11/2025
