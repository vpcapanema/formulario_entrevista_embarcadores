"""
============================================================
ROUTER: SUBMIT FORM - FastAPI PLI 2050
============================================================
Endpoint crítico para salvar pesquisa completa (4 tabelas)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import func
from app.database import get_db
from app.schemas import SubmitFormData, SubmitFormResponse
from app.models import (
    Empresa, Entrevistado, Pesquisa, ProdutoTransportado
)
from app.utils.timezone import now_brasilia
import logging

router = APIRouter(prefix="/api", tags=["submit"])
logger = logging.getLogger(__name__)


@router.post("/submit-form", response_model=SubmitFormResponse, status_code=status.HTTP_201_CREATED)
async def submit_form(data: SubmitFormData, db: Session = Depends(get_db)):
    """
    ### Endpoint CRÍTICO: Salva pesquisa completa

    **Fluxo transacional (ACID):**
    1. INSERT ou UPDATE `empresas` (se CNPJ existe → UPDATE, senão → INSERT)
    2. INSERT `entrevistados` (valida email único por empresa)
    3. INSERT `pesquisas` (47 campos obrigatórios)
    4. INSERT múltiplos `produtos_transportados` (array)

    **Rollback automático** em caso de erro em qualquer etapa.

    **Returns:**
    - 201: Sucesso com IDs das entidades criadas
    - 400: Erro de validação
    - 409: Conflito (CNPJ/email duplicado)
    - 500: Erro interno do banco
    """

    try:
        # ====================================================
        # ETAPA 1: EMPRESA (UPSERT NATIVO - PostgreSQL)
        # ====================================================

        # Preparar CNPJ (remover formatação) - após migration, cnpj já é VARCHAR(14)
        cnpj_clean = None
        if data.cnpj:
            cnpj_clean = data.cnpj.replace('.', '').replace('/', '').replace('-', '')

        # Preparar CEP (remover formatação) - banco aceita VARCHAR(8) apenas dígitos
        cep_clean = None
        if data.cep:
            cep_clean = data.cep.replace('-', '').replace('.', '')

        # ✅ OTIMIZAÇÃO: UPSERT nativo PostgreSQL (1 query ao invés de 2)
        # INSERT ... ON CONFLICT DO UPDATE
        stmt = insert(Empresa).values(
            razao_social=data.nomeEmpresa,  # Backend recebe nomeEmpresa, mas salva em razao_social
            tipo_empresa=data.tipoEmpresa,
            outro_tipo=data.outroTipo,
            municipio=data.municipio,
            cnpj=cnpj_clean,  # Agora cnpj é VARCHAR(14) sem formatação
            nome_fantasia=data.nomeFantasia,
            logradouro=data.logradouro,
            numero=data.numero,
            complemento=data.complemento,
            bairro=data.bairro,
            cep=cep_clean,  # CEP sem formatação (apenas 8 dígitos)
            data_cadastro=func.now()
        )

        # Se CNPJ já existe, atualiza os dados
        if cnpj_clean:
            stmt = stmt.on_conflict_do_update(
                index_elements=['cnpj'],  # Após migration, unique constraint está em cnpj
                set_={
                    'razao_social': data.nomeEmpresa,
                    'tipo_empresa': data.tipoEmpresa,
                    'outro_tipo': data.outroTipo,
                    'municipio': data.municipio,
                    'nome_fantasia': data.nomeFantasia,
                    'logradouro': data.logradouro,
                    'numero': data.numero,
                    'complemento': data.complemento,
                    'bairro': data.bairro,
                    'cep': cep_clean,
                    'data_atualizacao': func.now()
                }
            )

        # Executa UPSERT e retorna id_empresa
        stmt = stmt.returning(Empresa.id_empresa, Empresa.razao_social)
        result = db.execute(stmt)
        empresa_row = result.fetchone()
        id_empresa = empresa_row[0]
        razao_social = empresa_row[1]

        logger.info(f"✅ Empresa UPSERT: {id_empresa} - {razao_social} (CNPJ: {cnpj_clean or 'N/A'})")

        # ====================================================
        # ETAPA 2: ENTREVISTADO (UPSERT se email existe)
        # ====================================================
        
        email_lower = data.email.lower() if data.email else None
        
        # Verificar se entrevistado com este email já existe nesta empresa
        entrevistado_existente = None
        if email_lower:
            entrevistado_existente = db.query(Entrevistado).filter(
                Entrevistado.id_empresa == id_empresa,
                Entrevistado.email_lower == email_lower
            ).first()
        
        if entrevistado_existente:
            # UPDATE: Atualizar dados do entrevistado existente
            entrevistado_existente.nome = data.nome
            entrevistado_existente.funcao = data.funcao
            entrevistado_existente.telefone = data.telefone if data.telefone else None
            entrevistado_existente.estado_civil = data.estadoCivil if hasattr(data, 'estadoCivil') else None
            entrevistado_existente.nacionalidade = data.nacionalidade if hasattr(data, 'nacionalidade') else None
            entrevistado_existente.uf_naturalidade = data.ufNaturalidade if hasattr(data, 'ufNaturalidade') else None
            entrevistado_existente.municipio_naturalidade = data.municipioNaturalidade if hasattr(data, 'municipioNaturalidade') else None
            entrevistado_existente.data_atualizacao = func.now()
            db.add(entrevistado_existente)
            db.flush()
            entrevistado = entrevistado_existente
            logger.info(f"✅ Entrevistado ATUALIZADO: {entrevistado.id_entrevistado} - {entrevistado.nome} (email: {email_lower})")

        # ====================================================
        # CÁLCULO DO id_responsavel (LÓGICA DE NEGÓCIO)
        # ====================================================
        # - Se tipo_responsavel = 'entrevistado' → usa id_entrevistado recém criado
        # - Se tipo_responsavel = 'entrevistador' → usa id enviado ou default 1
        if data.tipoResponsavel == 'entrevistado':
            id_responsavel = entrevistado.id_entrevistado
        else:  # 'entrevistador'
            id_responsavel = data.idResponsavel if data.idResponsavel else 1  # Default ID 1

        logger.info(f"✅ id_responsavel calculado: {id_responsavel} (tipo: {data.tipoResponsavel})")

        # ====================================================
        # ETAPA 3: PESQUISA
        # ====================================================

        pesquisa = Pesquisa(
            id_empresa=id_empresa,
            id_entrevistado=entrevistado.id_entrevistado,
            tipo_responsavel=data.tipoResponsavel,
            id_responsavel=id_responsavel,  # Usando valor calculado
            data_entrevista=now_brasilia(),  # Timestamp com timezone de Brasília (UTC-3)

            # Produto
            produto_principal=data.produtoPrincipal,
            agrupamento_produto=data.agrupamentoProduto,
            outro_produto=data.outroProduto,
            observacoes_produto_principal=data.observacoesProdutoPrincipal,

            # Transporte
            tipo_transporte=data.tipoTransporte,

            # Origem
            origem_pais=data.origemPais,
            origem_estado=data.origemEstado,
            origem_municipio=data.origemMunicipio,

            # Destino
            destino_pais=data.destinoPais,
            destino_estado=data.destinoEstado,
            destino_municipio=data.destinoMunicipio,

            # Distância e paradas
            distancia=data.distancia,
            tem_paradas=data.temParadas,
            num_paradas=data.numParadas,

            # Modais
            modos=data.modos,
            config_veiculo=data.configVeiculo,

            # Capacidade e peso
            capacidade_utilizada=data.capacidadeUtilizada,
            peso_carga=data.pesoCarga,
            unidade_peso=data.unidadePeso,

            # Custos
            custo_transporte=data.custoTransporte,
            valor_carga=data.valorCarga,

            # Embalagem
            tipo_embalagem=data.tipoEmbalagem,
            carga_perigosa=data.cargaPerigosa,

            # Tempo
            tempo_dias=data.tempoDias,
            tempo_horas=data.tempoHoras,
            tempo_minutos=data.tempoMinutos,

            # Frequência
            frequencia=data.frequencia,
            frequencia_diaria=data.frequenciaDiaria,
            frequencia_outra=data.frequenciaOutra,
            observacoes_sazonalidade=data.observacoesSazonalidade,

            # Importâncias
            importancia_custo=data.importanciaCusto,
            variacao_custo=data.variacaoCusto,
            importancia_tempo=data.importanciaTempo,
            variacao_tempo=data.variacaoTempo,
            importancia_confiabilidade=data.importanciaConfiabilidade,
            variacao_confiabilidade=data.variacaoConfiabilidade,
            importancia_seguranca=data.importanciaSeguranca,
            variacao_seguranca=data.variacaoSeguranca,
            importancia_capacidade=data.importanciaCapacidade,
            variacao_capacidade=data.variacaoCapacidade,

            # Estratégia
            tipo_cadeia=data.tipoCadeia,
            modais_alternativos=data.modaisAlternativos,
            fator_adicional=data.fatorAdicional,

            # Dificuldades
            dificuldades=data.dificuldades,
            detalhe_dificuldade=data.detalheDificuldade,

            # Outros
            observacoes=data.observacoes,
            consentimento=data.consentimento,
            transporta_carga=data.transportaCarga,
            status="finalizada"
        )
        db.add(pesquisa)
        db.flush()
        logger.info(f"Pesquisa criada: {pesquisa.id_pesquisa}")

        # ====================================================
        # ETAPA 4: PRODUTOS TRANSPORTADOS (BULK INSERT)
        # ====================================================

        produtos_count = 0
        if data.produtos:
            # ✅ OTIMIZAÇÃO: Bulk insert em 1 query ao invés de N queries
            produtos_list = [
                {
                    "id_pesquisa": pesquisa.id_pesquisa,
                    "id_empresa": id_empresa,
                    "carga": produto_data.carga,
                    "movimentacao": produto_data.movimentacao,
                    "origem": produto_data.origem,
                    "destino": produto_data.destino,
                    "distancia": produto_data.distancia,
                    "modalidade": produto_data.modalidade,
                    "acondicionamento": produto_data.acondicionamento,
                    "observacoes": produto_data.observacoes,
                    "ordem": idx
                }
                for idx, produto_data in enumerate(data.produtos, start=1)
            ]

            # Bulk insert: 1 query para todos os produtos
            db.bulk_insert_mappings(ProdutoTransportado, produtos_list)
            produtos_count = len(produtos_list)
            logger.info(f"✅ {produtos_count} produtos transportados inseridos (bulk insert)")

        # ====================================================
        # COMMIT TRANSAÇÃO
        # ====================================================

        db.commit()
        logger.info("✅ Transação completa com sucesso!")

        return SubmitFormResponse(
            success=True,
            message="Pesquisa salva com sucesso!",
            data={
                "empresa": razao_social,
                "entrevistado": entrevistado.nome,
                "produto_principal": pesquisa.produto_principal,
                "origem": f"{pesquisa.origem_municipio}/{pesquisa.origem_estado}",
                "destino": f"{pesquisa.destino_municipio}/{pesquisa.destino_estado}"
            },
            id_pesquisa=pesquisa.id_pesquisa,
            id_empresa=id_empresa,
            id_entrevistado=entrevistado.id_entrevistado,
            produtos_inseridos=produtos_count
        )

    except IntegrityError as e:
        db.rollback()
        error_str = str(e)
        logger.error(f"❌ Erro de integridade: {error_str}")

        # Debug: Log detalhado do erro
        if hasattr(e, 'orig'):
            logger.error(f"   Erro original: {str(e.orig)}")

        # Identificar tipo de erro
        if "cnpj" in error_str.lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="CNPJ já cadastrado no sistema"
            )
        elif "email" in error_str.lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email já cadastrado para esta empresa"
            )
        elif "id_responsavel" in error_str.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"ID do responsável inválido: {data.idResponsavel}"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro de validação: {error_str[:200]}"
            )

    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"❌ Erro de banco de dados: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao salvar no banco de dados: {str(e)}"
        )

    except Exception as e:
        db.rollback()
        logger.error(f"❌ Erro inesperado: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        )
