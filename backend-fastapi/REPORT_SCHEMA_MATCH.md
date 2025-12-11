# Relatório de Correspondência de Campos — backend-fastapi

Resumo: comparei `backend-fastapi/schemas_corretos.py` (fonte canônica do banco) com os schemas Pydantic em `backend-fastapi/app/schemas/*.py` e com os models SQLAlchemy em `backend-fastapi/app/models/__init__.py`, além do router de envio (`app/routers/submit/routes.py`).

Resultados:

- `schemas_corretos.py` — Fonte canônica (snake_case).
- `app/schemas/*.py` (`empresa.py`, `entrevistado.py`, `pesquisa.py`, `produto.py`) — CORRESPONDEM ao `schemas_corretos.py` (mesmos nomes de campos em snake_case).
- `app/models/__init__.py` — CORRESPONDE aos schemas (colunas usam os mesmos nomes snake_case e tipos coerentes).
- `app/routers/submit/routes.py` — Contém duas rotas:
  - `POST /api/submit-form` (legado): usa o schema legad0 `SubmitFormData` com aliases em camelCase (ex.: `nomeEmpresa`, `tipoEmpresa`, `produtoPrincipal`). Este é intencional para compatibilidade com o frontend legado.
  - `POST /api/submit-form-divided` (novo): usa `DividedSubmitPayload` e trabalha com nomes em snake_case (`data.empresa.tipo_empresa`, `data.pesquisa.produto_principal`, `produto.carga`), compatível com os schemas canônicos.

Observações e divergências encontradas (não bloqueantes):

- Código de testes, docs e scripts de exemplo (ex.: `INICIO_RAPIDO.md`, `run_submit_test_client.py`, `INICIO_RAPIDO.md`) ainda usam o payload legado em camelCase — isso é esperado enquanto o frontend legado existir.
- Não detectei uso de nomes de colunas incorretos nos models ou nas inserções (bulk insert usa as chaves corretas para `db.bulk_insert_mappings`).

Recomendações:

- Manter ambos os formatos (legado camelCase e novo snake_case) enquanto houver frontend legado; os Pydantic schemas já fazem a tradução.
- Se desejar eliminar o suporte legado, posso:
  - Remover `SubmitFormData` e a rota `/api/submit-form` (ou torná-la um wrapper que converte camelCase → snake_case), OU
  - Atualizar scripts e docs para o novo formato.

Próximo passo (preciso da sua confirmação):

- (A) Gerar PR com relatório e pequenas alterações nos docs para indicar o schema canônico; OU
- (B) Aplicar mudanças no código para remover suporte legado (risco de ruptura do frontend); OU
- (C) Não alterar nada — apenas manter a correspondência atual e documentar (já feito).

Arquivo gerado automaticamente pelo assistente para revisão.
