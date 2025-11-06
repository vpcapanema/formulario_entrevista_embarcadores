"""
============================================================
ROUTER: SUBMIT FORM - FastAPI PLI 2050
============================================================
Endpoint crítico para salvar pesquisa completa (4 tabelas)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from app.database import get_db
from app.schemas import SubmitFormData, SubmitFormResponse
from app.models import Empresa, Entrevistado, Pesquisa, ProdutoTransportado
from datetime import datetime
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
        # ETAPA 1: EMPRESA (INSERT ou UPDATE se CNPJ existe)
        # ====================================================
        
        empresa_existente = None
        if data.cnpj:
            # Limpar CNPJ (remover pontos, traços, barras)
            cnpj_digits = data.cnpj.replace('.', '').replace('/', '').replace('-', '')
            empresa_existente = db.query(Empresa).filter(
                Empresa.cnpj_digits == cnpj_digits
            ).first()
        
        if empresa_existente:
            # UPDATE empresa existente
            empresa_existente.nome_empresa = data.nomeEmpresa
            empresa_existente.tipo_empresa = data.tipoEmpresa
            empresa_existente.outro_tipo = data.outroTipo
            empresa_existente.municipio = data.municipio
            empresa_existente.razao_social = data.razaoSocial
            empresa_existente.nome_fantasia = data.nomeFantasia
            empresa_existente.logradouro = data.logradouro
            empresa_existente.numero = data.numero
            empresa_existente.complemento = data.complemento
            empresa_existente.bairro = data.bairro
            empresa_existente.cep = data.cep
            empresa_existente.data_atualizacao = datetime.now()
            empresa = empresa_existente
            logger.info(f"Empresa atualizada: {empresa.id_empresa} - {empresa.nome_empresa}")
        else:
            # INSERT nova empresa
            empresa = Empresa(
                nome_empresa=data.nomeEmpresa,
                tipo_empresa=data.tipoEmpresa,
                outro_tipo=data.outroTipo,
                municipio=data.municipio,
                cnpj=data.cnpj,
                cnpj_digits=cnpj_digits if data.cnpj else None,
                razao_social=data.razaoSocial,
                nome_fantasia=data.nomeFantasia,
                logradouro=data.logradouro,
                numero=data.numero,
                complemento=data.complemento,
                bairro=data.bairro,
                cep=data.cep
            )
            db.add(empresa)
            db.flush()  # Garante que id_empresa seja gerado
            logger.info(f"Nova empresa criada: {empresa.id_empresa} - {empresa.nome_empresa}")
        
        # ====================================================
        # ETAPA 2: ENTREVISTADO
        # ====================================================
        
        entrevistado = Entrevistado(
            id_empresa=empresa.id_empresa,
            nome=data.nome,
            funcao=data.funcao,
            telefone=data.telefone,
            email=data.email,
            email_lower=data.email.lower(),
            principal=True  # Primeiro entrevistado é sempre principal
        )
        db.add(entrevistado)
        db.flush()
        logger.info(f"Entrevistado criado: {entrevistado.id_entrevistado} - {entrevistado.nome}")
        
        # ====================================================
        # ETAPA 3: PESQUISA
        # ====================================================
        
        pesquisa = Pesquisa(
            id_empresa=empresa.id_empresa,
            id_entrevistado=entrevistado.id_entrevistado,
            tipo_responsavel=data.tipoResponsavel,
            id_responsavel=data.idResponsavel,
            
            # Produto
            produto_principal=data.produtoPrincipal,
            agrupamento_produto=data.agrupamentoProduto,
            outro_produto=data.outroProduto,
            
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
        # ETAPA 4: PRODUTOS TRANSPORTADOS (ARRAY)
        # ====================================================
        
        produtos_count = 0
        for idx, produto_data in enumerate(data.produtos, start=1):
            produto = ProdutoTransportado(
                id_pesquisa=pesquisa.id_pesquisa,
                id_empresa=empresa.id_empresa,
                carga=produto_data.carga,
                movimentacao=produto_data.movimentacao,
                origem=produto_data.origem,
                destino=produto_data.destino,
                distancia=produto_data.distancia,
                modalidade=produto_data.modalidade,
                acondicionamento=produto_data.acondicionamento,
                ordem=idx
            )
            db.add(produto)
            produtos_count += 1
        
        if produtos_count > 0:
            db.flush()
            logger.info(f"{produtos_count} produtos transportados inseridos")
        
        # ====================================================
        # COMMIT TRANSAÇÃO
        # ====================================================
        
        db.commit()
        logger.info("✅ Transação completa com sucesso!")
        
        return SubmitFormResponse(
            success=True,
            message="Pesquisa salva com sucesso!",
            data={
                "empresa": empresa.nome_empresa,
                "entrevistado": entrevistado.nome,
                "produto_principal": pesquisa.produto_principal,
                "origem": f"{pesquisa.origem_municipio}/{pesquisa.origem_estado}",
                "destino": f"{pesquisa.destino_municipio}/{pesquisa.destino_estado}"
            },
            id_pesquisa=pesquisa.id_pesquisa,
            id_empresa=empresa.id_empresa,
            id_entrevistado=entrevistado.id_entrevistado,
            produtos_inseridos=produtos_count
        )
    
    except IntegrityError as e:
        db.rollback()
        logger.error(f"❌ Erro de integridade: {str(e)}")
        
        # Identificar tipo de erro
        if "cnpj" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="CNPJ já cadastrado no sistema"
            )
        elif "email" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email já cadastrado para esta empresa"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro de validação: {str(e)}"
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

