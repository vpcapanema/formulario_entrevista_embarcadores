"""
Script para inserir 10 pesquisas COMPLETAS no banco de dados
TODOS os campos preenchidos com valores variados
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import random
from decimal import Decimal

# Configuração do banco
from app.database import DATABASE_URL, SCHEMA_NAME

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dados para variação
# Valores válidos para tipo_empresa: 'embarcador', 'transportador', 'operador', 'outro'
empresas_mock = [
    ("Transportadora São Paulo Ltda", "transportador", "12345678000190", "São Paulo", "SP"),
    ("Logística Brasil S.A.", "embarcador", "98765432000110", "Campinas", "SP"),
    ("Cargas Pesadas Express", "transportador", "11223344000155", "Santos", "SP"),
    ("Alimentos Del Rey", "embarcador", "55667788000199", "Ribeirão Preto", "SP"),
    ("Mineradora Vale do Sul", "embarcador", "99887766000133", "Sorocaba", "SP"),
    ("Transporte Rápido", "transportador", "44332211000177", "São José dos Campos", "SP"),
    ("Açúcar e Álcool Unidos", "embarcador", "33221100000188", "Piracicaba", "SP"),
    ("Distribuidora Nordeste", "operador", "22110099000166", "Bauru", "SP"),
    ("Siderúrgica Paulista", "embarcador", "66554433000122", "Jundiaí", "SP"),
    ("Grãos do Interior", "embarcador", "77889900000144", "Franca", "SP")
]

entrevistados_mock = [
    ("João Silva", "Gerente de Logística", "(11) 98765-4321", "joao.silva@empresa1.com"),
    ("Maria Santos", "Diretor de Operações", "(19) 97654-3210", "maria.santos@empresa2.com"),
    ("Pedro Oliveira", "Coordenador de Transportes", "(13) 96543-2109", "pedro.oliveira@empresa3.com"),
    ("Ana Costa", "Gerente de Supply Chain", "(16) 95432-1098", "ana.costa@empresa4.com"),
    ("Carlos Souza", "Diretor Comercial", "(15) 94321-0987", "carlos.souza@empresa5.com"),
    ("Juliana Lima", "Analista de Logística", "(12) 93210-9876", "juliana.lima@empresa6.com"),
    ("Roberto Alves", "Gerente de Expedição", "(19) 92109-8765", "roberto.alves@empresa7.com"),
    ("Fernanda Rocha", "Coordenadora de Frota", "(17) 91098-7654", "fernanda.rocha@empresa8.com"),
    ("Paulo Martins", "Diretor Industrial", "(11) 90987-6543", "paulo.martins@empresa9.com"),
    ("Luciana Dias", "Gerente de Distribuição", "(14) 89876-5432", "luciana.dias@empresa10.com")
]

produtos_principais = ["Soja", "Açúcar", "Minério de Ferro", "Cimento", "Álcool", "Milho", "Papel", "Aço", "Fertilizantes", "Café"]
agrupamentos = ["graos", "acucar-etanol", "minerios", "construcao", "acucar-etanol", "graos", "celulose-papel", "siderurgia", "quimicos", "cafe"]
tipos_transporte = ["exportacao", "local", "importacao", "local", "exportacao", "local", "exportacao", "local", "importacao", "exportacao"]

modos_options = [
    ["rodoviario"],
    ["rodoviario", "ferroviario"],
    ["rodoviario", "maritimo"],
    ["rodoviario"],
    ["rodoviario", "ferroviario", "maritimo"],
    ["rodoviario", "ferroviario"],
    ["rodoviario"],
    ["rodoviario", "maritimo"],
    ["ferroviario"],
    ["rodoviario", "ferroviario"]
]

config_veiculos = ["carreta", "bitrem", "rodotrem", "carreta", "bitrem", "rodotrem", "carreta", "bitrem", "rodotrem", "carreta"]

origens = [
    ("Brasil", "SP", "Ribeirão Preto"),
    ("Brasil", "SP", "Campinas"),
    ("Brasil", "MG", "Belo Horizonte"),
    ("Brasil", "SP", "São Paulo"),
    ("Brasil", "SP", "Santos"),
    ("Brasil", "SP", "Piracicaba"),
    ("Brasil", "PR", "Curitiba"),
    ("Brasil", "SP", "Sorocaba"),
    ("Brasil", "SP", "São José dos Campos"),
    ("Brasil", "RS", "Porto Alegre")
]

destinos = [
    ("China", None, None),  # Internacional - estado/município NULL
    ("Brasil", "RJ", "Rio de Janeiro"),
    ("Japão", None, None),
    ("Brasil", "SP", "Santos"),
    ("Estados Unidos", None, None),
    ("Brasil", "SP", "São Paulo"),
    ("Argentina", None, None),
    ("Brasil", "SP", "Campinas"),
    ("Alemanha", None, None),
    ("Brasil", "SP", "Santos")
]

distancias = [450, 320, 580, 120, 650, 280, 890, 410, 520, 380]
frequencias = ["diaria", "semanal", "mensal", "diaria", "quinzenal", "semanal", "diaria", "mensal", "semanal", "diaria"]
dificuldades_options = [
    ["infraestrutura-precaria", "custos-elevados"],
    ["burocracia", "falta-informacao"],
    ["infraestrutura-precaria", "seguranca"],
    ["custos-elevados"],
    ["infraestrutura-precaria", "burocracia", "custos-elevados"],
    ["falta-informacao"],
    ["seguranca", "custos-elevados"],
    ["burocracia"],
    ["infraestrutura-precaria", "falta-informacao"],
    ["custos-elevados", "seguranca"]
]

def inserir_pesquisas_completas():
    """Insere 10 pesquisas com TODOS os campos preenchidos"""
    
    db = SessionLocal()
    
    try:
        for i in range(10):
            print(f"\n{'='*60}")
            print(f"📝 Inserindo pesquisa {i+1}/10...")
            
            # Dados da empresa
            emp_nome, emp_tipo, emp_cnpj, emp_municipio, emp_estado = empresas_mock[i]
            
            # Dados do entrevistado
            ent_nome, ent_funcao, ent_telefone, ent_email = entrevistados_mock[i]
            
            # Produto
            produto = produtos_principais[i]
            agrupamento = agrupamentos[i]
            tipo_transp = tipos_transporte[i]
            
            # Origem e destino
            orig_pais, orig_estado, orig_municipio = origens[i]
            dest_pais, dest_estado, dest_municipio = destinos[i]
            
            # Modalidades
            modos = modos_options[i]
            config_veiculo = config_veiculos[i] if "rodoviario" in modos else None
            
            # Valores
            distancia = distancias[i]
            peso_carga = random.randint(20, 40) * 1000  # 20-40 toneladas
            custo = random.randint(5000, 15000)
            valor_carga = random.randint(50000, 200000)
            capacidade = str(random.randint(70, 95))  # VARCHAR - percentual como string
            
            # Tempo de viagem
            tempo_dias = random.randint(1, 5)
            tempo_horas = random.randint(0, 23)
            tempo_minutos = random.randint(0, 59)
            
            # Frequência
            freq = frequencias[i]
            freq_diaria = random.randint(1, 5) if freq == "diaria" else None
            
            # Importâncias (muito-importante, importante, pouco-importante, nao-importante)
            importancias = ["muito-importante", "importante", "muito-importante", "importante", "muito-importante"]
            variacoes = [random.randint(5, 20) for _ in range(5)]
            
            # Dificuldades
            dificuldades = dificuldades_options[i]
            
            # Data da entrevista (últimos 30 dias)
            data_entrevista = datetime.now() - timedelta(days=random.randint(0, 30))
            
            # ============================================================
            # 1. INSERIR EMPRESA
            # ============================================================
            sql_empresa = text(f"""
                INSERT INTO {SCHEMA_NAME}.empresas 
                (nome_empresa, tipo_empresa, cnpj, municipio, estado)
                VALUES (:nome, :tipo, :cnpj, :municipio, :estado)
                ON CONFLICT (cnpj) DO UPDATE 
                SET nome_empresa = EXCLUDED.nome_empresa
                RETURNING id_empresa
            """)
            
            result = db.execute(sql_empresa, {
                "nome": emp_nome,
                "tipo": emp_tipo,
                "cnpj": emp_cnpj,
                "municipio": emp_municipio,
                "estado": emp_estado
            })
            id_empresa = result.fetchone()[0]
            print(f"✅ Empresa inserida: ID {id_empresa}")
            
            # ============================================================
            # 2. INSERIR ENTREVISTADO
            # ============================================================
            sql_entrevistado = text(f"""
                INSERT INTO {SCHEMA_NAME}.entrevistados 
                (id_empresa, nome, funcao, telefone, email, principal)
                VALUES (:id_empresa, :nome, :funcao, :telefone, :email, true)
                RETURNING id_entrevistado
            """)
            
            result = db.execute(sql_entrevistado, {
                "id_empresa": id_empresa,
                "nome": ent_nome,
                "funcao": ent_funcao,
                "telefone": ent_telefone,
                "email": ent_email
            })
            id_entrevistado = result.fetchone()[0]
            print(f"✅ Entrevistado inserido: ID {id_entrevistado}")
            
            # ============================================================
            # 3. INSERIR PESQUISA COM TODOS OS CAMPOS
            # ============================================================
            sql_pesquisa = text(f"""
                INSERT INTO {SCHEMA_NAME}.pesquisas (
                    id_empresa, id_entrevistado, tipo_responsavel, id_responsavel,
                    data_entrevista, status,
                    produto_principal, agrupamento_produto,
                    tipo_transporte,
                    origem_pais, origem_estado, origem_municipio,
                    destino_pais, destino_estado, destino_municipio,
                    distancia,
                    tem_paradas, num_paradas,
                    modos, config_veiculo,
                    peso_carga, unidade_peso,
                    custo_transporte, valor_carga,
                    tipo_embalagem, carga_perigosa,
                    capacidade_utilizada,
                    tempo_dias, tempo_horas, tempo_minutos,
                    frequencia, frequencia_diaria,
                    importancia_custo, variacao_custo,
                    importancia_tempo, variacao_tempo,
                    importancia_confiabilidade, variacao_confiabilidade,
                    importancia_seguranca, variacao_seguranca,
                    importancia_capacidade, variacao_capacidade,
                    tipo_cadeia,
                    modais_alternativos,
                    fator_adicional,
                    dificuldades,
                    detalhe_dificuldade,
                    observacoes
                ) VALUES (
                    :id_empresa, :id_entrevistado, 'entrevistado', :id_entrevistado,
                    :data_entrevista, 'finalizada',
                    :produto, :agrupamento,
                    :tipo_transporte,
                    :orig_pais, :orig_estado, :orig_municipio,
                    :dest_pais, :dest_estado, :dest_municipio,
                    :distancia,
                    :tem_paradas, :num_paradas,
                    :modos, :config_veiculo,
                    :peso_carga, 'toneladas',
                    :custo, :valor_carga,
                    :tipo_embalagem, :carga_perigosa,
                    :capacidade,
                    :tempo_dias, :tempo_horas, :tempo_minutos,
                    :frequencia, :freq_diaria,
                    :imp_custo, :var_custo,
                    :imp_tempo, :var_tempo,
                    :imp_conf, :var_conf,
                    :imp_seg, :var_seg,
                    :imp_cap, :var_cap,
                    :tipo_cadeia,
                    :modais_alt,
                    :fator_adicional,
                    :dificuldades,
                    :detalhe_dificuldade,
                    :observacoes
                ) RETURNING id_pesquisa
            """)
            
            result = db.execute(sql_pesquisa, {
                "id_empresa": id_empresa,
                "id_entrevistado": id_entrevistado,
                "data_entrevista": data_entrevista,
                "produto": produto,
                "agrupamento": agrupamento,
                "tipo_transporte": tipo_transp,
                "orig_pais": orig_pais,
                "orig_estado": orig_estado,
                "orig_municipio": orig_municipio,
                "dest_pais": dest_pais,
                "dest_estado": dest_estado,
                "dest_municipio": dest_municipio,
                "distancia": Decimal(str(distancia)),
                "tem_paradas": "sim" if random.random() > 0.5 else "nao",
                "num_paradas": random.randint(1, 3) if random.random() > 0.5 else None,
                "modos": modos,
                "config_veiculo": config_veiculo,
                "peso_carga": Decimal(str(peso_carga)),
                "custo": Decimal(str(custo)),
                "valor_carga": Decimal(str(valor_carga)),
                "tipo_embalagem": random.choice(["granel", "big-bag", "container", "sacaria"]),
                "carga_perigosa": random.choice(["sim", "nao"]),
                "capacidade": capacidade,  # STRING
                "tempo_dias": tempo_dias,
                "tempo_horas": tempo_horas,
                "tempo_minutos": tempo_minutos,
                "frequencia": freq,
                "freq_diaria": freq_diaria,
                "imp_custo": importancias[0],
                "var_custo": Decimal(str(variacoes[0])),
                "imp_tempo": importancias[1],
                "var_tempo": Decimal(str(variacoes[1])),
                "imp_conf": importancias[2],
                "var_conf": Decimal(str(variacoes[2])),
                "imp_seg": importancias[3],
                "var_seg": Decimal(str(variacoes[3])),
                "imp_cap": importancias[4],
                "var_cap": Decimal(str(variacoes[4])),
                "tipo_cadeia": random.choice(["just-in-time", "estoque", "hibrida"]),
                "modais_alt": ["ferroviario", "maritimo"] if random.random() > 0.5 else None,
                "fator_adicional": random.choice(["prazo-entrega", "flexibilidade", "sustentabilidade"]) if random.random() > 0.7 else None,
                "dificuldades": dificuldades,
                "detalhe_dificuldade": f"Dificuldades específicas da rota {orig_municipio} - {dest_municipio or dest_pais}",
                "observacoes": f"Pesquisa {i+1} - Dados completos para teste do sistema PLI 2050"
            })
            id_pesquisa = result.fetchone()[0]
            print(f"✅ Pesquisa inserida: ID {id_pesquisa}")
            
            # ============================================================
            # 4. INSERIR 3-5 PRODUTOS TRANSPORTADOS
            # ============================================================
            num_produtos = random.randint(3, 5)
            produtos_lista = ["Soja", "Milho", "Açúcar", "Álcool", "Farelo", "Óleo", "Fertilizantes"]
            
            for j in range(num_produtos):
                sql_produto = text(f"""
                    INSERT INTO {SCHEMA_NAME}.produtos_transportados (
                        id_pesquisa, id_empresa, carga, movimentacao, origem, destino,
                        distancia, modalidade, acondicionamento, ordem
                    ) VALUES (
                        :id_pesquisa, :id_empresa, :carga, :movimentacao, :origem, :destino,
                        :distancia, :modalidade, :acondicionamento, :ordem
                    )
                """)
                
                db.execute(sql_produto, {
                    "id_pesquisa": id_pesquisa,
                    "id_empresa": id_empresa,
                    "carga": random.choice(produtos_lista),
                    "movimentacao": Decimal(str(random.randint(10000, 50000))),
                    "origem": orig_municipio or orig_pais,
                    "destino": dest_municipio or dest_pais,
                    "distancia": Decimal(str(distancia + random.randint(-50, 50))),
                    "modalidade": random.choice(modos),
                    "acondicionamento": random.choice(["granel", "big-bag", "container", "sacaria"]),
                    "ordem": j + 1
                })
            
            print(f"✅ {num_produtos} produtos transportados inseridos")
            
            # Commit após cada pesquisa
            db.commit()
            print(f"✅ Pesquisa {i+1}/10 COMPLETA salva no banco!")
        
        print(f"\n{'='*60}")
        print("🎉 SUCESSO! 10 pesquisas COMPLETAS inseridas no banco de dados!")
        print(f"{'='*60}\n")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ ERRO ao inserir pesquisas: {str(e)}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 INSERÇÃO DE 10 PESQUISAS COMPLETAS")
    print("📊 TODOS os campos serão preenchidos")
    print("="*60 + "\n")
    
    inserir_pesquisas_completas()
