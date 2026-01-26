"""
============================================================
ROUTER: SUBMIT FORM - FastAPI PLI 2050
============================================================
Endpoint crítico para salvar pesquisa completa (4 tabelas)
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import func
from app.database import get_db
from app.schemas import SubmitFormData, SubmitFormResponse, DividedSubmitPayload
from app.models import (
    Empresa, Entrevistado, Pesquisa, ProdutoTransportado
)
from app.utils.convert_payload import legacy_to_divided

router = APIRouter(prefix="/api", tags=["submit"])
logger = logging.getLogger(__name__)


@router.post("/submit-form", response_model=SubmitFormResponse, status_code=status.HTTP_201_CREATED)
async def submit_form(data: SubmitFormData, db: Session = Depends(get_db)):
    """Compat layer: converte payload legado (camelCase) para o formato dividido
    e delega para o mesmo fluxo de `submit_form_divided` (mantém compatibilidade).
    """
    try:
        divided = legacy_to_divided(data)

        # Delegar ao fluxo existente do endpoint dividido
        return await submit_form_divided(divided, db)

    except Exception as e:
        logger.error("❌ Erro ao converter/encaminhar payload legado: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao processar payload legado: " + str(e)
        ) from e


@router.post("/submit-form-divided", response_model=SubmitFormResponse, status_code=status.HTTP_201_CREATED)
async def submit_form_divided(data: DividedSubmitPayload, db: Session = Depends(get_db)):
    """
    ### Endpoint NOVO: Salva pesquisa completa com payload dividido

    **Novo formato granular:** 4 subpayloads separados (empresa, entrevistado, pesquisa, produtos)

    **Fluxo transacional (ACID):**
    1. INSERT ou UPDATE `empresas` (campos manuais apenas)
    2. INSERT `entrevistados` (campos manuais apenas)
    3. INSERT `pesquisas` (campos manuais apenas)
    4. INSERT múltiplos `produtos_transportados` (array de payloads manuais)

    **Rollback automático** em caso de erro em qualquer etapa.

    **Returns:**
    - 201: Sucesso com IDs das entidades criadas
    - 400: Erro de validação
    - 409: Conflito (CNPJ/email duplicado)
    - 500: Erro interno do banco
    """

    try:
        # ====================================================
        # ETAPA 1: EMPRESA (UPSERT com campos manuais)
        # ====================================================

        # Preparar CNPJ (remover formatação)
        cnpj_clean = None
        if data.empresa.cnpj:
            cnpj_clean = data.empresa.cnpj.replace('.', '').replace('/', '').replace('-', '')

        # Preparar CEP (remover formatação)
        cep_clean = None
        if data.empresa.cep:
            cep_clean = data.empresa.cep.replace('-', '').replace('.', '')

        # ✅ UPSERT nativo PostgreSQL - TODOS os campos do schema
        stmt = insert(Empresa).values(
            # NOT NULL
            tipo_empresa=data.empresa.tipo_empresa,
            municipio=data.empresa.municipio,
            razao_social=data.empresa.razao_social,
            # Opcionais
            outro_tipo=data.empresa.outro_tipo,
            estado=data.empresa.estado,
            nome_fantasia=data.empresa.nome_fantasia,
            telefone=data.empresa.telefone,
            email=data.empresa.email,
            id_municipio=data.empresa.id_municipio,
            logradouro=data.empresa.logradouro,
            numero=data.empresa.numero,
            complemento=data.empresa.complemento,
            bairro=data.empresa.bairro,
            cep=cep_clean,
            cnpj=cnpj_clean,
            endereco=data.empresa.endereco,
            uf=data.empresa.uf,
            site=data.empresa.site,
            porte_empresa=data.empresa.porte_empresa,
            setor_atividade=data.empresa.setor_atividade,
            cnae=data.empresa.cnae,
            faturamento_anual=data.empresa.faturamento_anual,
            numero_funcionarios=data.empresa.numero_funcionarios,
            ano_fundacao=data.empresa.ano_fundacao,
            inscricao_estadual=data.empresa.inscricao_estadual,
            inscricao_municipal=data.empresa.inscricao_municipal,
            natureza_juridica=data.empresa.natureza_juridica,
            situacao_cadastral=data.empresa.situacao_cadastral,
            data_situacao_cadastral=data.empresa.data_situacao_cadastral,
            motivo_situacao_cadastral=data.empresa.motivo_situacao_cadastral,
            situacao_especial=data.empresa.situacao_especial,
            data_situacao_especial=data.empresa.data_situacao_especial,
            # timestamps handled by DB/defaults
        )

        # Se CNPJ já existe, atualiza os dados
        if cnpj_clean:
            stmt = stmt.on_conflict_do_update(
                index_elements=['cnpj'],
                set_={
                    'razao_social': data.empresa.razao_social,
                    'nome_fantasia': data.empresa.nome_fantasia,
                    'endereco': data.empresa.endereco,
                    'numero': data.empresa.numero,
                    'complemento': data.empresa.complemento,
                    'bairro': data.empresa.bairro,
                    'cep': cep_clean,
                    'municipio': data.empresa.municipio,
                    'uf': data.empresa.uf,
                    'telefone': data.empresa.telefone,
                    'email': data.empresa.email,
                    'site': data.empresa.site,
                    'porte_empresa': data.empresa.porte_empresa,
                    'setor_atividade': data.empresa.setor_atividade,
                    'cnae': data.empresa.cnae,
                    'faturamento_anual': data.empresa.faturamento_anual,
                    'numero_funcionarios': data.empresa.numero_funcionarios,
                    'ano_fundacao': data.empresa.ano_fundacao,
                    'inscricao_estadual': data.empresa.inscricao_estadual,
                    'inscricao_municipal': data.empresa.inscricao_municipal,
                    'natureza_juridica': data.empresa.natureza_juridica,
                    'situacao_cadastral': data.empresa.situacao_cadastral,
                    'data_situacao_cadastral': data.empresa.data_situacao_cadastral,
                    'motivo_situacao_cadastral': data.empresa.motivo_situacao_cadastral,
                    'situacao_especial': data.empresa.situacao_especial,
                    'data_situacao_especial': data.empresa.data_situacao_especial,
                    # data_atualizacao removed from model
                }
            )

        # Executa UPSERT e retorna id_empresa
        stmt = stmt.returning(Empresa.id_empresa, Empresa.razao_social)
        result = db.execute(stmt)
        empresa_row = result.fetchone()
        id_empresa = empresa_row[0]
        razao_social = empresa_row[1]

        logger.info("✅ Empresa UPSERT: %s - %s (CNPJ: %s)", id_empresa, razao_social, cnpj_clean or 'N/A')

        # ====================================================
        # ETAPA 2: ENTREVISTADO (INSERT com campos manuais)
        # ====================================================

        email_lower = data.entrevistado.email.lower() if data.entrevistado.email else None

        # Verificar se entrevistado com este email já existe nesta empresa
        entrevistado_existente = None
        if email_lower:
            entrevistado_existente = db.query(Entrevistado).filter(
                Entrevistado.id_empresa == id_empresa,
                func.lower(Entrevistado.email) == email_lower
            ).first()

        if entrevistado_existente:
            # UPDATE: Atualizar dados do entrevistado existente usando campos do schema
            entrevistado_existente.nome = data.entrevistado.nome
            entrevistado_existente.funcao = data.entrevistado.funcao
            entrevistado_existente.telefone = data.entrevistado.telefone if getattr(
                data.entrevistado, 'telefone', None) else None
            entrevistado_existente.email = data.entrevistado.email if getattr(
                data.entrevistado, 'email', None) else None
            entrevistado_existente.principal = data.entrevistado.principal if getattr(
                data.entrevistado, 'principal', None) is not None else entrevistado_existente.principal
            entrevistado_existente.estado_civil = getattr(data.entrevistado, 'estado_civil', None)
            entrevistado_existente.nacionalidade = getattr(data.entrevistado, 'nacionalidade', None)
            entrevistado_existente.uf_naturalidade = getattr(data.entrevistado, 'uf_naturalidade', None)
            entrevistado_existente.municipio_naturalidade = getattr(
                data.entrevistado, 'municipio_naturalidade', None)
            # data_atualizacao removed from model
            db.add(entrevistado_existente)
            db.flush()
            entrevistado = entrevistado_existente
            logger.info("✅ Entrevistado ATUALIZADO: %s - %s (email: %s)", entrevistado.id_entrevistado, entrevistado.nome, email_lower)
        else:
            # CREATE: Cria novo entrevistado com os campos esperados pelo schema
            entrevistado = Entrevistado(
                id_empresa=id_empresa,
                nome=data.entrevistado.nome,
                funcao=data.entrevistado.funcao,
                telefone=data.entrevistado.telefone if getattr(
                    data.entrevistado, 'telefone', None) else None,
                email=data.entrevistado.email if getattr(
                    data.entrevistado, 'email', None) else None,
                principal=getattr(data.entrevistado, 'principal', False),
                estado_civil=getattr(data.entrevistado, 'estado_civil', None),
                nacionalidade=getattr(data.entrevistado, 'nacionalidade', None),
                uf_naturalidade=getattr(data.entrevistado, 'uf_naturalidade', None),
                municipio_naturalidade=getattr(data.entrevistado, 'municipio_naturalidade', None),
                # data_cadastro removed from model
            )
            db.add(entrevistado)
            db.flush()
            logger.info("✅ Entrevistado CRIADO: %s - %s (email: %s)", entrevistado.id_entrevistado, entrevistado.nome, email_lower or 'N/A')

        # ====================================================
        # ETAPA 3: PESQUISA (INSERT com campos manuais)
        # ====================================================

        # ⭐ LÓGICA: id_responsavel OBRIGATÓRIO
        # - Se tipo_responsavel = 'entrevistador': usa data.pesquisa.id_responsavel
        #   (deve vir do frontend)
        # - Se tipo_responsavel = 'entrevistado': usa id_entrevistado recém-criado
        #   (ignora frontend)
        id_responsavel_final = None
        if data.pesquisa.tipo_responsavel == 'entrevistador':
            # ENTREVISTADOR: frontend DEVE ter enviado id_responsavel
            if data.pesquisa.id_responsavel is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="tipo_responsavel='entrevistador' requer id_responsavel "
                           "preenchido no frontend"
                )
            id_responsavel_final = data.pesquisa.id_responsavel
        else:
            # ENTREVISTADO: usa id do entrevistado recém-criado
            id_responsavel_final = entrevistado.id_entrevistado
        
        logger.info("✅ id_responsavel calculado: %s (tipo: %s)", id_responsavel_final, data.pesquisa.tipo_responsavel)

        pesquisa = Pesquisa(
            id_empresa=id_empresa,
            id_entrevistado=entrevistado.id_entrevistado,
            # Campos obrigatórios conforme PesquisaPayload
            tipo_responsavel=data.pesquisa.tipo_responsavel,
            id_responsavel=id_responsavel_final,  # ⭐ CALCULADO acima
            produto_principal=data.pesquisa.produto_principal,
            agrupamento_produto=data.pesquisa.agrupamento_produto,
            tipo_transporte=data.pesquisa.tipo_transporte,
            origem_pais=data.pesquisa.origem_pais,
            origem_estado=getattr(data.pesquisa, 'origem_estado', None),
            origem_municipio=getattr(data.pesquisa, 'origem_municipio', None),
            destino_pais=data.pesquisa.destino_pais,
            destino_estado=getattr(data.pesquisa, 'destino_estado', None),
            destino_municipio=getattr(data.pesquisa, 'destino_municipio', None),
            distancia=data.pesquisa.distancia,
            tem_paradas=data.pesquisa.tem_paradas,
            num_paradas=getattr(data.pesquisa, 'num_paradas', None),
            modos=data.pesquisa.modos,
            config_veiculo=getattr(data.pesquisa, 'config_veiculo', None),
            capacidade_utilizada=getattr(data.pesquisa, 'capacidade_utilizada', None),
            peso_carga=data.pesquisa.peso_carga,
            unidade_peso=data.pesquisa.unidade_peso,
            custo_transporte=data.pesquisa.custo_transporte,
            valor_carga=data.pesquisa.valor_carga,
            tipo_embalagem=data.pesquisa.tipo_embalagem,
            carga_perigosa=data.pesquisa.carga_perigosa,
            tempo_dias=data.pesquisa.tempo_dias,
            tempo_horas=data.pesquisa.tempo_horas,
            tempo_minutos=data.pesquisa.tempo_minutos,
            tempo_transporte=getattr(data.pesquisa, 'tempo_transporte', None),
            frequencia=data.pesquisa.frequencia,
            frequencia_diaria=getattr(data.pesquisa, 'frequencia_diaria', None),
            frequencia_outra=getattr(data.pesquisa, 'frequencia_outra', None),
            observacoes_sazonalidade=getattr(data.pesquisa, 'observacoes_sazonalidade', None),

            importancia_custo=data.pesquisa.importancia_custo,
            variacao_custo=data.pesquisa.variacao_custo,
            importancia_tempo=data.pesquisa.importancia_tempo,
            variacao_tempo=data.pesquisa.variacao_tempo,
            importancia_confiabilidade=data.pesquisa.importancia_confiabilidade,
            variacao_confiabilidade=data.pesquisa.variacao_confiabilidade,
            importancia_seguranca=data.pesquisa.importancia_seguranca,
            variacao_seguranca=data.pesquisa.variacao_seguranca,
            importancia_capacidade=data.pesquisa.importancia_capacidade,
            variacao_capacidade=data.pesquisa.variacao_capacidade,

            tipo_cadeia=data.pesquisa.tipo_cadeia,
            modais_alternativos=getattr(data.pesquisa, 'modais_alternativos', None),
            fator_adicional=getattr(data.pesquisa, 'fator_adicional', None),
            dificuldades=getattr(data.pesquisa, 'dificuldades', None),
            detalhe_dificuldade=getattr(data.pesquisa, 'detalhe_dificuldade', None),

            observacoes=getattr(data.pesquisa, 'observacoes', None),
            consentimento=getattr(data.pesquisa, 'consentimento', None),
            transporta_carga=getattr(data.pesquisa, 'transporta_carga', None),
            origem_instalacao=getattr(data.pesquisa, 'origem_instalacao', None),
            destino_instalacao=getattr(data.pesquisa, 'destino_instalacao', None),
            volume_anual_toneladas=getattr(data.pesquisa, 'volume_anual_toneladas', None),
            tipo_produto=getattr(data.pesquisa, 'tipo_produto', None),
            classe_produto=getattr(data.pesquisa, 'classe_produto', None),
            produtos_especificos=getattr(data.pesquisa, 'produtos_especificos', None),

            modal_predominante=getattr(data.pesquisa, 'modal_predominante', None),
            modal_secundario=getattr(data.pesquisa, 'modal_secundario', None),
            modal_terciario=getattr(data.pesquisa, 'modal_terciario', None),
            proprio_terceirizado=getattr(data.pesquisa, 'proprio_terceirizado', None),
            qtd_caminhoes_proprios=getattr(data.pesquisa, 'qtd_caminhoes_proprios', None),
            qtd_caminhoes_terceirizados=getattr(data.pesquisa, 'qtd_caminhoes_terceirizados', None),

            custo_medio_tonelada=getattr(data.pesquisa, 'custo_medio_tonelada', None),
            pedagio_custo=getattr(data.pesquisa, 'pedagio_custo', None),
            frete_custo=getattr(data.pesquisa, 'frete_custo', None),
            manutencao_custo=getattr(data.pesquisa, 'manutencao_custo', None),
            outros_custos=getattr(data.pesquisa, 'outros_custos', None),

            principais_desafios=getattr(data.pesquisa, 'principais_desafios', None),
            investimento_sustentavel=getattr(data.pesquisa, 'investimento_sustentavel', None),
            reducao_emissoes=getattr(data.pesquisa, 'reducao_emissoes', None),
            tecnologias_interesse=getattr(data.pesquisa, 'tecnologias_interesse', None),

            uso_tecnologia=getattr(data.pesquisa, 'uso_tecnologia', None),
            grau_automacao=getattr(data.pesquisa, 'grau_automacao', None),
            rastreamento_carga=getattr(data.pesquisa, 'rastreamento_carga', None),
            uso_dados=getattr(data.pesquisa, 'uso_dados', None),

            conhecimento_hidrovias=getattr(data.pesquisa, 'conhecimento_hidrovias', None),
            viabilidade_hidrovia=getattr(data.pesquisa, 'viabilidade_hidrovia', None),
            pontos_melhoria=getattr(data.pesquisa, 'pontos_melhoria', None),
            interesse_parcerias=getattr(data.pesquisa, 'interesse_parcerias', None),
            feedback_formulario=getattr(data.pesquisa, 'feedback_formulario', None),
            id_instalacao_origem=getattr(data.pesquisa, 'id_instalacao_origem', None),
            observacoes_produto_principal=getattr(data.pesquisa, 'observacoes_produto_principal', None),

            status=getattr(data.pesquisa, 'status', 'finalizada')
        )
        db.add(pesquisa)
        db.flush()
        logger.info("✅ Pesquisa criada: %s", pesquisa.id_pesquisa)

        # ====================================================
        # ETAPA 4: PRODUTOS TRANSPORTADOS (BULK INSERT)
        # ====================================================

        produtos_count = 0
        if data.produtos:
            # Bulk insert: usar campos conforme ProdutoTransportadoPayload
            produtos_list = [
                {
                    "id_pesquisa": pesquisa.id_pesquisa,
                    "id_empresa": id_empresa,
                    "carga": produto.carga,
                    "movimentacao": getattr(produto, 'movimentacao', None),
                    "distancia": getattr(produto, 'distancia', None),
                    "modalidade": getattr(produto, 'modalidade', None),
                    "acondicionamento": getattr(produto, 'acondicionamento', None),
                    "ordem": idx,
                    "observacoes": getattr(produto, 'observacoes', None),
                    "origem_pais": getattr(produto, 'origem_pais', None),
                    "destino_pais": getattr(produto, 'destino_pais', None),
                    "origem_estado": getattr(produto, 'origem_estado', None),
                    "origem_municipio": getattr(produto, 'origem_municipio', None),
                    "destino_estado": getattr(produto, 'destino_estado', None),
                    "destino_municipio": getattr(produto, 'destino_municipio', None)
                }
                for idx, produto in enumerate(data.produtos, start=1)
            ]

            # Bulk insert: 1 query para todos os produtos
            db.bulk_insert_mappings(ProdutoTransportado, produtos_list)
            produtos_count = len(produtos_list)
            logger.info("✅ %s produtos transportados inseridos (bulk insert)", produtos_count)

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
                "entrevistado": data.entrevistado.nome,
                "produto_principal": data.pesquisa.produto_principal,
                "origem": f"{data.pesquisa.origem_municipio or 'N/A'}/"
                        f"{data.pesquisa.origem_estado or 'N/A'}",
                "destino": f"{data.pesquisa.destino_municipio or 'N/A'}/"
                         f"{data.pesquisa.destino_estado or 'N/A'}"
            },
            id_pesquisa=pesquisa.id_pesquisa,
            id_empresa=id_empresa,
            id_entrevistado=entrevistado.id_entrevistado,
            produtos_inseridos=produtos_count
        )

    except IntegrityError as e:
        db.rollback()
        error_str = str(e)
        logger.error("❌ Erro de integridade: %s", error_str)

        # Identificar tipo de erro
        if "cnpj" in error_str.lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="CNPJ já cadastrado no sistema"
            ) from e
        elif "email" in error_str.lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email já cadastrado para esta empresa"
            ) from e
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro de validação: {error_str[:200]}"
            ) from e

    except SQLAlchemyError as e:
        db.rollback()
        logger.error("❌ Erro de banco de dados: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao salvar no banco de dados: {str(e)}"
        ) from e

    except Exception as e:
        db.rollback()
        logger.error("❌ Erro inesperado: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno: {str(e)}"
        ) from e
