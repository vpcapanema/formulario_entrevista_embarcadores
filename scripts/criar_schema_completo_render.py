#!/usr/bin/env python3
"""
Script para criar schema formulario_embarcadores no banco Render
Executa o schema principal, dados de municípios e países
"""
import asyncio
import asyncpg
import ssl
import os
from pathlib import Path

# Configuração do banco Render
DATABASE_URL = "postgresql://sigma_user:pzRszi7xZ4IzjehPVNdCR73DNCJ9jiq5@dpg-d5rc90pr0fns73e2q4n0-a.oregon-postgres.render.com:5432/sigma_pli_qr53"

# Diretório base
BASE_DIR = Path(__file__).parent.parent


async def executar_sql(conn, sql_content: str, nome_arquivo: str):
    """Executa um script SQL dividindo por comandos"""
    print(f"\n📄 Executando: {nome_arquivo}")
    
    # Dividir por comandos (;) mas ignorar dentro de funções
    # Executar o script completo como uma transação
    try:
        await conn.execute(sql_content)
        print(f"   ✅ {nome_arquivo} executado com sucesso!")
        return True
    except Exception as e:
        print(f"   ❌ Erro em {nome_arquivo}: {e}")
        return False


async def main():
    print("=" * 60)
    print("🚀 CRIANDO SCHEMA formulario_embarcadores NO RENDER")
    print("=" * 60)
    
    print("\n🔗 Conectando ao banco Render...")
    
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE
    
    conn = await asyncpg.connect(DATABASE_URL, ssl=ssl_ctx)
    
    try:
        # 1. Criar o schema
        print("\n📦 Etapa 1: Criando schema...")
        await conn.execute("CREATE SCHEMA IF NOT EXISTS formulario_embarcadores")
        print("   ✅ Schema criado!")
        
        # 2. Ler e executar o schema principal (sem os INSERTs de países e municípios que serão feitos separadamente)
        print("\n📦 Etapa 2: Criando tabelas principais...")
        
        schema_sql = (BASE_DIR / "sql" / "database_schema_completo.sql").read_text(encoding="utf-8")
        
        # Executar em partes menores
        await conn.execute("SET search_path TO formulario_embarcadores, public")
        
        # Criar tabelas auxiliares
        print("   📋 Criando tabela instituicoes...")
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS formulario_embarcadores.instituicoes (
                id_instituicao SERIAL PRIMARY KEY,
                nome_instituicao VARCHAR(255) NOT NULL UNIQUE,
                tipo_instituicao VARCHAR(50),
                cnpj VARCHAR(18)
            )
        """)
        
        # Inserir dados iniciais de instituições
        await conn.execute("""
            INSERT INTO formulario_embarcadores.instituicoes (nome_instituicao, tipo_instituicao, cnpj) 
            VALUES
            ('Concremat', 'consultoria', '00.000.000/0001-91'),
            ('PLI 2050 - SEMIL', 'governo', '00.394.460/0058-87'),
            ('Autopreenchimento', 'sistema', NULL)
            ON CONFLICT (nome_instituicao) DO NOTHING
        """)
        print("   ✅ instituicoes OK")
        
        print("   📋 Criando tabela estados_brasil...")
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS formulario_embarcadores.estados_brasil (
                id_estado SERIAL PRIMARY KEY,
                uf CHAR(2) NOT NULL UNIQUE,
                nome_estado VARCHAR(50) NOT NULL,
                regiao VARCHAR(20) NOT NULL
            )
        """)
        
        # Inserir estados
        estados_sql = """
            INSERT INTO formulario_embarcadores.estados_brasil (uf, nome_estado, regiao) VALUES
            ('AC', 'Acre', 'Norte'),
            ('AL', 'Alagoas', 'Nordeste'),
            ('AP', 'Amapá', 'Norte'),
            ('AM', 'Amazonas', 'Norte'),
            ('BA', 'Bahia', 'Nordeste'),
            ('CE', 'Ceará', 'Nordeste'),
            ('DF', 'Distrito Federal', 'Centro-Oeste'),
            ('ES', 'Espírito Santo', 'Sudeste'),
            ('GO', 'Goiás', 'Centro-Oeste'),
            ('MA', 'Maranhão', 'Nordeste'),
            ('MT', 'Mato Grosso', 'Centro-Oeste'),
            ('MS', 'Mato Grosso do Sul', 'Centro-Oeste'),
            ('MG', 'Minas Gerais', 'Sudeste'),
            ('PA', 'Pará', 'Norte'),
            ('PB', 'Paraíba', 'Nordeste'),
            ('PR', 'Paraná', 'Sul'),
            ('PE', 'Pernambuco', 'Nordeste'),
            ('PI', 'Piauí', 'Nordeste'),
            ('RJ', 'Rio de Janeiro', 'Sudeste'),
            ('RN', 'Rio Grande do Norte', 'Nordeste'),
            ('RS', 'Rio Grande do Sul', 'Sul'),
            ('RO', 'Rondônia', 'Norte'),
            ('RR', 'Roraima', 'Norte'),
            ('SC', 'Santa Catarina', 'Sul'),
            ('SP', 'São Paulo', 'Sudeste'),
            ('SE', 'Sergipe', 'Nordeste'),
            ('TO', 'Tocantins', 'Norte')
            ON CONFLICT (uf) DO NOTHING
        """
        await conn.execute(estados_sql)
        print("   ✅ estados_brasil OK")
        
        print("   📋 Criando tabela paises...")
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS formulario_embarcadores.paises (
                id_pais SERIAL PRIMARY KEY,
                nome_pais VARCHAR(100) NOT NULL UNIQUE,
                codigo_iso2 CHAR(2),
                codigo_iso3 CHAR(3),
                relevancia INTEGER DEFAULT 0
            )
        """)
        print("   ✅ paises OK")
        
        print("   📋 Criando tabela municipios_sp...")
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS formulario_embarcadores.municipios_sp (
                id_municipio SERIAL PRIMARY KEY,
                nome_municipio VARCHAR(100) NOT NULL UNIQUE,
                codigo_ibge VARCHAR(7) UNIQUE,
                regiao VARCHAR(50)
            )
        """)
        print("   ✅ municipios_sp OK")
        
        print("   📋 Criando tabela funcoes_entrevistado...")
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS formulario_embarcadores.funcoes_entrevistado (
                id_funcao SERIAL PRIMARY KEY,
                nome_funcao VARCHAR(100) NOT NULL UNIQUE
            )
        """)
        
        # Inserir funções
        await conn.execute("""
            INSERT INTO formulario_embarcadores.funcoes_entrevistado (nome_funcao) VALUES
            ('Gerente de Logística'),
            ('Coordenador de Transportes'),
            ('Diretor de Operações'),
            ('Analista de Logística'),
            ('Supervisor de Transporte'),
            ('Gerente de Supply Chain'),
            ('Proprietário'),
            ('Sócio-Diretor'),
            ('Gerente Geral'),
            ('Diretor Comercial'),
            ('Outro'),
            ('Não sei / Não se aplica')
            ON CONFLICT (nome_funcao) DO NOTHING
        """)
        print("   ✅ funcoes_entrevistado OK")
        
        print("   📋 Criando tabela entrevistadores...")
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS formulario_embarcadores.entrevistadores (
                id_entrevistador SERIAL PRIMARY KEY,
                nome_completo VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                id_instituicao INTEGER REFERENCES formulario_embarcadores.instituicoes(id_instituicao)
            )
        """)
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_entrevistadores_email ON formulario_embarcadores.entrevistadores(email)")
        print("   ✅ entrevistadores OK")
        
        print("   📋 Criando tabela empresas...")
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS formulario_embarcadores.empresas (
                id_empresa SERIAL PRIMARY KEY,
                nome_empresa VARCHAR(255) NOT NULL,
                tipo_empresa VARCHAR(50) NOT NULL,
                outro_tipo VARCHAR(255),
                municipio VARCHAR(255) NOT NULL,
                estado VARCHAR(100),
                cnpj VARCHAR(18) UNIQUE,
                data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                data_atualizacao TIMESTAMP WITH TIME ZONE
            )
        """)
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_empresas_nome ON formulario_embarcadores.empresas(nome_empresa)")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON formulario_embarcadores.empresas(cnpj)")
        print("   ✅ empresas OK")
        
        print("   📋 Criando tabela entrevistados...")
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS formulario_embarcadores.entrevistados (
                id_entrevistado SERIAL PRIMARY KEY,
                id_empresa INTEGER NOT NULL REFERENCES formulario_embarcadores.empresas(id_empresa) ON DELETE CASCADE,
                nome VARCHAR(255) NOT NULL,
                funcao VARCHAR(255) NOT NULL,
                telefone VARCHAR(20),
                email VARCHAR(255),
                principal BOOLEAN DEFAULT FALSE,
                data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                data_atualizacao TIMESTAMP WITH TIME ZONE
            )
        """)
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_entrevistados_empresa ON formulario_embarcadores.entrevistados(id_empresa)")
        print("   ✅ entrevistados OK")
        
        print("   📋 Criando tabela pesquisas (principal)...")
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS formulario_embarcadores.pesquisas (
                id_pesquisa SERIAL PRIMARY KEY,
                id_empresa INTEGER NOT NULL REFERENCES formulario_embarcadores.empresas(id_empresa),
                id_entrevistado INTEGER NOT NULL REFERENCES formulario_embarcadores.entrevistados(id_entrevistado),
                tipo_responsavel VARCHAR(20) NOT NULL,
                id_responsavel INTEGER NOT NULL,
                
                data_entrevista TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                data_atualizacao TIMESTAMP WITH TIME ZONE,
                status VARCHAR(20) DEFAULT 'finalizada',
                
                produto_principal VARCHAR(255) NOT NULL,
                agrupamento_produto VARCHAR(100) NOT NULL,
                outro_produto VARCHAR(255),
                
                tipo_transporte VARCHAR(50) NOT NULL,
                
                origem_pais VARCHAR(100) NOT NULL,
                origem_estado VARCHAR(100) NOT NULL,
                origem_municipio VARCHAR(255) NOT NULL,
                
                destino_pais VARCHAR(100) NOT NULL,
                destino_estado VARCHAR(100) NOT NULL,
                destino_municipio VARCHAR(255) NOT NULL,
                
                distancia NUMERIC(10, 2) NOT NULL,
                tem_paradas VARCHAR(3) NOT NULL,
                num_paradas VARCHAR(20),
                
                modos TEXT[] NOT NULL,
                config_veiculo VARCHAR(100),
                
                capacidade_utilizada VARCHAR(20) NOT NULL,
                peso_carga NUMERIC(12, 2) NOT NULL,
                unidade_peso VARCHAR(20) NOT NULL,
                custo_transporte NUMERIC(12, 2) NOT NULL,
                valor_carga NUMERIC(15, 2) NOT NULL,
                tipo_embalagem VARCHAR(100) NOT NULL,
                carga_perigosa VARCHAR(3) NOT NULL,
                
                tempo_dias INTEGER NOT NULL,
                tempo_horas INTEGER NOT NULL,
                tempo_minutos INTEGER NOT NULL,
                
                frequencia VARCHAR(50) NOT NULL,
                frequencia_diaria VARCHAR(20),
                frequencia_outra VARCHAR(255),
                
                importancia_custo VARCHAR(20) NOT NULL,
                variacao_custo NUMERIC(5, 2) NOT NULL,
                importancia_tempo VARCHAR(20) NOT NULL,
                variacao_tempo NUMERIC(5, 2) NOT NULL,
                importancia_confiabilidade VARCHAR(20) NOT NULL,
                variacao_confiabilidade NUMERIC(5, 2) NOT NULL,
                importancia_seguranca VARCHAR(20) NOT NULL,
                variacao_seguranca NUMERIC(5, 2) NOT NULL,
                importancia_capacidade VARCHAR(20) NOT NULL,
                variacao_capacidade NUMERIC(5, 2) NOT NULL,
                
                tipo_cadeia VARCHAR(50) NOT NULL,
                modais_alternativos TEXT[],
                fator_adicional TEXT,
                
                dificuldades TEXT[],
                detalhe_dificuldade TEXT,
                
                observacoes TEXT
            )
        """)
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_pesquisas_empresa ON formulario_embarcadores.pesquisas(id_empresa)")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_pesquisas_data ON formulario_embarcadores.pesquisas(data_entrevista)")
        print("   ✅ pesquisas OK")
        
        print("   📋 Criando tabela produtos_transportados...")
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS formulario_embarcadores.produtos_transportados (
                id_produto SERIAL PRIMARY KEY,
                id_pesquisa INTEGER NOT NULL REFERENCES formulario_embarcadores.pesquisas(id_pesquisa) ON DELETE CASCADE,
                id_empresa INTEGER NOT NULL REFERENCES formulario_embarcadores.empresas(id_empresa),
                
                carga VARCHAR(255) NOT NULL,
                movimentacao NUMERIC(12, 2),
                origem VARCHAR(255),
                destino VARCHAR(255),
                distancia NUMERIC(10, 2),
                modalidade VARCHAR(50),
                acondicionamento VARCHAR(100),
                ordem INTEGER DEFAULT 1
            )
        """)
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_produtos_pesquisa ON formulario_embarcadores.produtos_transportados(id_pesquisa)")
        print("   ✅ produtos_transportados OK")
        
        # 3. Inserir países
        print("\n📦 Etapa 3: Inserindo países...")
        paises_sql = (BASE_DIR / "sql" / "paises.sql").read_text(encoding="utf-8")
        
        # Extrair apenas os INSERTs de países
        paises_data = [
            ('Brasil', 'BR', 100),
            ('China', 'CN', 98),
            ('Estados Unidos', 'US', 95),
            ('Holanda', 'NL', 85),
            ('Argentina', 'AR', 92),
            ('Japão', 'JP', 75),
            ('Chile', 'CL', 73),
            ('México', 'MX', 70),
            ('Alemanha', 'DE', 80),
            ('Espanha', 'ES', 68),
            ('Coreia do Sul', 'KR', 72),
            ('Paraguai', 'PY', 88),
            ('Uruguai', 'UY', 82),
            ('Bolívia', 'BO', 70),
            ('Peru', 'PE', 65),
            ('Colômbia', 'CO', 63),
            ('Venezuela', 'VE', 55),
            ('Equador', 'EC', 52),
            ('Guiana', 'GY', 45),
            ('Suriname', 'SR', 45),
            ('Canadá', 'CA', 67),
            ('Itália', 'IT', 72),
            ('França', 'FR', 70),
            ('Portugal', 'PT', 68),
            ('Reino Unido', 'GB', 67),
            ('Bélgica', 'BE', 63),
            ('Suíça', 'CH', 58),
            ('Rússia', 'RU', 60),
            ('Polônia', 'PL', 48),
            ('Suécia', 'SE', 48),
            ('Índia', 'IN', 68),
            ('Singapura', 'SG', 63),
            ('Taiwan', 'TW', 62),
            ('Tailândia', 'TH', 58),
            ('Emirados Árabes Unidos', 'AE', 60),
            ('Indonésia', 'ID', 55),
            ('Malásia', 'MY', 55),
            ('Vietnã', 'VN', 55),
            ('Hong Kong', 'HK', 58),
            ('Arábia Saudita', 'SA', 52),
            ('Panamá', 'PA', 63),
            ('Costa Rica', 'CR', 52),
            ('Cuba', 'CU', 48),
            ('República Dominicana', 'DO', 48),
            ('África do Sul', 'ZA', 63),
            ('Angola', 'AO', 58),
            ('Nigéria', 'NG', 52),
            ('Egito', 'EG', 50),
            ('Marrocos', 'MA', 48),
            ('Austrália', 'AU', 63),
            ('Nova Zelândia', 'NZ', 52),
            ('Turquia', 'TR', 55),
            ('Ucrânia', 'UA', 48),
            ('Israel', 'IL', 55),
            ('Noruega', 'NO', 50),
            ('Irlanda', 'IE', 48),
            ('Dinamarca', 'DK', 48),
            ('Finlândia', 'FI', 48),
            ('Áustria', 'AT', 48),
            ('Outro país', 'XX', 0),
        ]
        
        for nome, iso, rel in paises_data:
            await conn.execute("""
                INSERT INTO formulario_embarcadores.paises (nome_pais, codigo_iso2, relevancia) 
                VALUES ($1, $2, $3)
                ON CONFLICT (nome_pais) DO NOTHING
            """, nome, iso, rel)
        
        count = await conn.fetchval("SELECT COUNT(*) FROM formulario_embarcadores.paises")
        print(f"   ✅ {count} países inseridos")
        
        # 4. Inserir municípios
        print("\n📦 Etapa 4: Inserindo municípios de SP...")
        municipios_sql = (BASE_DIR / "sql" / "municipios_sp_completo.sql").read_text(encoding="utf-8")
        
        # Executar diretamente (o arquivo tem DELETE e INSERT)
        # Dividir e executar apenas os INSERTs
        import re
        
        # Encontrar todos os INSERTs
        inserts = re.findall(r"\('([^']+)',\s*'(\d+)',\s*'([^']+)'\)", municipios_sql)
        
        for nome, ibge, regiao in inserts:
            nome_limpo = nome.replace("''", "'")  # Tratar aspas escapadas
            await conn.execute("""
                INSERT INTO formulario_embarcadores.municipios_sp (nome_municipio, codigo_ibge, regiao) 
                VALUES ($1, $2, $3)
                ON CONFLICT (nome_municipio) DO NOTHING
            """, nome_limpo, ibge, regiao)
        
        count = await conn.fetchval("SELECT COUNT(*) FROM formulario_embarcadores.municipios_sp")
        print(f"   ✅ {count} municípios inseridos")
        
        # 5. Criar função e trigger
        print("\n📦 Etapa 5: Criando triggers...")
        await conn.execute("""
            CREATE OR REPLACE FUNCTION formulario_embarcadores.atualizar_timestamp()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.data_atualizacao = NOW();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql
        """)
        
        # Triggers
        await conn.execute("""
            DROP TRIGGER IF EXISTS trigger_atualizar_empresas ON formulario_embarcadores.empresas
        """)
        await conn.execute("""
            CREATE TRIGGER trigger_atualizar_empresas
            BEFORE UPDATE ON formulario_embarcadores.empresas
            FOR EACH ROW
            EXECUTE FUNCTION formulario_embarcadores.atualizar_timestamp()
        """)
        
        await conn.execute("""
            DROP TRIGGER IF EXISTS trigger_atualizar_entrevistados ON formulario_embarcadores.entrevistados
        """)
        await conn.execute("""
            CREATE TRIGGER trigger_atualizar_entrevistados
            BEFORE UPDATE ON formulario_embarcadores.entrevistados
            FOR EACH ROW
            EXECUTE FUNCTION formulario_embarcadores.atualizar_timestamp()
        """)
        
        await conn.execute("""
            DROP TRIGGER IF EXISTS trigger_atualizar_pesquisas ON formulario_embarcadores.pesquisas
        """)
        await conn.execute("""
            CREATE TRIGGER trigger_atualizar_pesquisas
            BEFORE UPDATE ON formulario_embarcadores.pesquisas
            FOR EACH ROW
            EXECUTE FUNCTION formulario_embarcadores.atualizar_timestamp()
        """)
        print("   ✅ Triggers criados")
        
        # 6. Resumo final
        print("\n" + "=" * 60)
        print("📊 RESUMO FINAL")
        print("=" * 60)
        
        tables = await conn.fetch("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'formulario_embarcadores'
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        """)
        
        print(f"\n✅ Schema: formulario_embarcadores")
        print(f"✅ Tabelas criadas: {len(tables)}")
        for t in tables:
            count = await conn.fetchval(f"SELECT COUNT(*) FROM formulario_embarcadores.{t['table_name']}")
            print(f"   - {t['table_name']}: {count} registros")
        
        print("\n🎉 SUCESSO! Schema criado com todas as tabelas!")
        
    except Exception as e:
        print(f"\n❌ ERRO: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await conn.close()
        print("\n🔌 Conexão fechada")


if __name__ == "__main__":
    asyncio.run(main())
