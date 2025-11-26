-- Tornar telefone e email opcionais em formulario_embarcadores.entrevistados
ALTER TABLE formulario_embarcadores.entrevistados
    ALTER COLUMN telefone DROP NOT NULL,
    ALTER COLUMN email DROP NOT NULL;
