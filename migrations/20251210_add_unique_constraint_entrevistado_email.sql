-- Adicionar UNIQUE constraint em (id_empresa, email_lower) para evitar duplicatas
-- Isso permite que o mesmo email seja usado em empresas diferentes, mas não na mesma empresa

-- Primeiro, remover registros duplicados se existirem (manter apenas o primeiro)
DELETE FROM formulario_embarcadores.entrevistados t1
WHERE id_entrevistado > (
    SELECT MIN(id_entrevistado)
    FROM formulario_embarcadores.entrevistados t2
    WHERE t1.id_empresa = t2.id_empresa
    AND t1.email_lower IS NOT NULL
    AND t1.email_lower = t2.email_lower
);

-- Adicionar a constraint UNIQUE
ALTER TABLE formulario_embarcadores.entrevistados
    ADD CONSTRAINT uq_entrevistado_empresa_email 
    UNIQUE (id_empresa, email_lower) 
    DEFERRABLE INITIALLY DEFERRED;

-- Comentário explicativo
COMMENT ON CONSTRAINT uq_entrevistado_empresa_email 
ON formulario_embarcadores.entrevistados 
IS 'Um email pode existir em empresas diferentes, mas não pode haver duplicatas dentro da mesma empresa';
