#!/usr/bin/env python3
"""
Script para criar tabela produtos_principais e popular entrevistadores
Executa no banco PostgreSQL do Render usando string de conexão
"""

import psycopg2
from datetime import datetime

# String de conexão do Render
DATABASE_URL = "postgresql://sigma_user:pzRszi7xZ4IzjehPVNdCR73DNCJ9jiq5@dpg-d5rc90pr0fns73e2q4n0-a.oregon-postgres.render.com:5432/sigma_pli_qr53"
SCHEMA = "formulario_embarcadores"

# ============================================
# DADOS: Produtos Principais (agrupamentos)
# ============================================
PRODUTOS_PRINCIPAIS = [
    ("acucar", "Açúcar"),
    ("adubos", "Adubos e fertilizantes"),
    ("alimentos-industrializados", "Alimentos industrializados"),
    ("suco-laranja", "Suco de laranja"),
    ("animais-vivos", "Animais vivos"),
    ("arroz", "Arroz"),
    ("bebidas", "Bebidas"),
    ("biocombustiveis", "Biocombustíveis"),
    ("cafe", "Café"),
    ("cha-mate", "Chá, mate e especiarias"),
    ("cargas-especiais", "Cargas especiais"),
    ("carnes", "Carnes"),
    ("carvao-mineral", "Carvão mineral"),
    ("cimento", "Cimento"),
    ("combustiveis", "Combustíveis derivados do petróleo"),
    ("eletronicos", "Eletrônicos"),
    ("embalagens", "Embalagens plásticas, botijões para gás, pallets de madeira e garrafas de vidro"),
    ("farelo-soja", "Farelo de soja"),
    ("hortifruti", "Hortifruti"),
    ("glp", "GLP"),
    ("defensivos", "Defensivos agrícolas"),
    ("laticinios", "Laticínios e outros alimentos de origem animal"),
    ("madeira-carvao", "Madeira e carvão"),
    ("maquinas-eletricas", "Máquinas, aparelhos e materiais elétricos"),
    ("medicamentos", "Medicamentos"),
    ("milho", "Milho"),
    ("minerio-ferro", "Minério de ferro"),
    ("obras-ferro-aco", "Obras de ferro ou aço"),
    ("oleo-bruto", "Óleo bruto"),
    ("algodao", "Algodão"),
    ("cana-acucar", "Cana-de-açúcar"),
    ("cereais", "Cereais"),
    ("oleos-vegetais", "Óleos vegetais e animais"),
    ("oleos-vegetais-bruto", "Óleos vegetais em bruto"),
    ("outras-cgc", "Outras CGC"),
    ("outros-gl", "Outros GL"),
    ("madeira-bruto", "Madeira em bruto"),
    ("materiais-construcao", "Materiais de Construção"),
    ("outras-cgnc", "Outras CGNC"),
    ("calcario", "Calcário"),
    ("enxofre", "Enxofre"),
    ("minerais-contenteirizaveis", "Minerais Conteneirizáveis"),
    ("minerais-metalicos", "Minerais metálicos não ferrosos"),
    ("minerio-aluminio", "Minério de alumínio"),
    ("outros-gsm", "Outros GSM"),
    ("produtos-quimicos-gs", "Produtos químicos em GS"),
    ("celulose", "Celulose"),
    ("papel", "Papel"),
    ("petroquimicos-solidos", "Petroquímicos sólidos"),
    ("plasticos", "Plásticos e suas obras"),
    ("pneus-componentes", "Pneus, componentes e acessórios de automóveis"),
    ("higiene-limpeza", "Produtos de higiene e limpeza"),
    ("produtos-quimicos", "Produtos químicos"),
    ("produtos-quimicos-gl", "Produtos químicos em GL"),
    ("soda-caustica", "Soda cáustica"),
    ("produtos-metalurgicos", "Produtos metalúrgicos"),
    ("racao-animal", "Ração animal e desperdícios das indústrias alimentares"),
    ("sal", "Sal"),
    ("soja", "Soja"),
    ("trigo", "Trigo"),
    ("veiculos", "Veículos automotivos"),
    ("vestuario", "Vestuário"),
    ("outro-produto", "Outro"),
]

# ============================================
# DADOS: Entrevistadores
# ============================================
ENTREVISTADORES = [
    (1, "SILVIO MASSARU ICHIHARA", "silvio.ichihara@concremat.com.br", 1),
    (2, "RAQUEL CHAVES COSTA LIMA", "raquel.lima@concremat.com.br", 1),
    (3, "MARIA INES GARCIA LIPPE", "maria.lippe@concremat.com.br", 1),
    (4, "CAMILA ALVES MAIA", "camilaxxxxx@concremat.com.br", 1),
]


def criar_tabela_produtos_principais(cur):
    """Cria a tabela produtos_principais se não existir"""
    print("\n📦 Criando tabela produtos_principais...")
    
    sql_create = f"""
    CREATE TABLE IF NOT EXISTS {SCHEMA}.produtos_principais (
        id_produto SERIAL PRIMARY KEY,
        codigo VARCHAR(50) UNIQUE NOT NULL,
        nome VARCHAR(255) NOT NULL,
        ativo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """
    cur.execute(sql_create)
    
    # Adicionar comentários
    cur.execute(f"COMMENT ON TABLE {SCHEMA}.produtos_principais IS 'Lista de produtos/agrupamentos disponíveis para seleção no formulário'")
    cur.execute(f"COMMENT ON COLUMN {SCHEMA}.produtos_principais.codigo IS 'Código slug do produto (usado no frontend)'")
    cur.execute(f"COMMENT ON COLUMN {SCHEMA}.produtos_principais.nome IS 'Nome completo do produto para exibição'")
    
    print("   ✅ Tabela produtos_principais criada/verificada")


def inserir_produtos_principais(cur):
    """Insere os produtos principais na tabela"""
    print("\n📋 Inserindo produtos principais...")
    
    inserted = 0
    
    for codigo, nome in PRODUTOS_PRINCIPAIS:
        try:
            cur.execute(f"""
                INSERT INTO {SCHEMA}.produtos_principais (codigo, nome)
                VALUES (%s, %s)
                ON CONFLICT (codigo) DO NOTHING
            """, (codigo, nome))
            inserted += 1
        except Exception as e:
            print(f"   ⚠️ Erro ao inserir {codigo}: {e}")
    
    print(f"   ✅ Produtos processados: {inserted}")
    
    # Mostrar total
    cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.produtos_principais")
    total = cur.fetchone()[0]
    print(f"   📊 Total na tabela: {total} produtos")


def inserir_entrevistadores(cur):
    """Insere os entrevistadores na tabela existente"""
    print("\n👥 Inserindo entrevistadores...")
    
    # Primeiro verificar estrutura da tabela
    cur.execute(f"""
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = '{SCHEMA}' AND table_name = 'entrevistadores'
        ORDER BY ordinal_position
    """)
    columns = cur.fetchall()
    col_names = [c[0] for c in columns]
    print(f"   📋 Colunas encontradas: {col_names}")
    
    for id_entrev, nome, email, id_inst in ENTREVISTADORES:
        try:
            cur.execute(f"""
                INSERT INTO {SCHEMA}.entrevistadores (id_entrevistador, nome_completo, email, id_instituicao)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (id_entrevistador) DO UPDATE SET
                    nome_completo = EXCLUDED.nome_completo,
                    email = EXCLUDED.email,
                    id_instituicao = EXCLUDED.id_instituicao
            """, (id_entrev, nome, email, id_inst))
            print(f"   ✅ {nome}")
        except Exception as e:
            print(f"   ❌ Erro ao inserir {nome}: {e}")
    
    # Mostrar total
    cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.entrevistadores")
    total = cur.fetchone()[0]
    print(f"\n   📊 Total na tabela entrevistadores: {total}")


def verificar_resultados(cur):
    """Verifica os dados inseridos"""
    print("\n" + "="*60)
    print("📊 VERIFICAÇÃO DOS DADOS INSERIDOS")
    print("="*60)
    
    # Produtos principais
    print("\n📦 PRODUTOS PRINCIPAIS (primeiros 10):")
    cur.execute(f"""
        SELECT id_produto, codigo, nome 
        FROM {SCHEMA}.produtos_principais 
        ORDER BY id_produto LIMIT 10
    """)
    produtos = cur.fetchall()
    for p in produtos:
        print(f"   {p[0]:3} | {p[1]:25} | {p[2]}")
    
    cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.produtos_principais")
    total_produtos = cur.fetchone()[0]
    if total_produtos > 10:
        print(f"   ... e mais {total_produtos - 10} produtos")
    
    # Entrevistadores
    print("\n👥 ENTREVISTADORES:")
    cur.execute(f"""
        SELECT id_entrevistador, nome_completo, email 
        FROM {SCHEMA}.entrevistadores 
        ORDER BY id_entrevistador
    """)
    entrevistadores = cur.fetchall()
    for e in entrevistadores:
        print(f"   {e[0]:3} | {e[1]:30} | {e[2]}")


def main():
    print("="*60)
    print("🚀 POPULAR TABELAS AUXILIARES - PLI 2050")
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    
    print(f"\n🔗 Conectando ao banco Render...")
    print(f"   Database: sigma_pli_qr53")
    print(f"   Schema: {SCHEMA}")
    
    try:
        conn = psycopg2.connect(DATABASE_URL, sslmode='require')
        conn.autocommit = False
        cur = conn.cursor()
        print("   ✅ Conectado!")
        
        # 1. Criar tabela produtos_principais
        criar_tabela_produtos_principais(cur)
        
        # 2. Inserir produtos
        inserir_produtos_principais(cur)
        
        # 3. Inserir entrevistadores
        inserir_entrevistadores(cur)
        
        # Commit
        conn.commit()
        print("\n✅ COMMIT realizado com sucesso!")
        
        # 4. Verificar resultados
        verificar_resultados(cur)
        
        cur.close()
        conn.close()
        
        print("\n" + "="*60)
        print("✅ SCRIPT FINALIZADO COM SUCESSO!")
        print("="*60)
        
    except Exception as e:
        print(f"\n❌ ERRO: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())
