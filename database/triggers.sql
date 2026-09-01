--=====================================--
-- Liberar disponibilidad al cancelar --
--=====================================--
CREATE OR REPLACE TRIGGER TRG_LIBERAR_BLOQUES_POR_CANCELACION
AFTER UPDATE OF ESTADO_RESERVA ON RESERVAS
FOR EACH ROW
WHEN (OLD.ESTADO_RESERVA = 'activa' AND NEW.ESTADO_RESERVA = 'cancelada')
BEGIN
    -- Liberar los bloques horarios vinculados a esta reserva
    UPDATE DISPONIBILIDAD
    SET ESTADO = 'disponible',
        ID_RESERVA = NULL
    WHERE ID_RESERVA = :NEW.ID_RESERVA;
END;
/

--=============================--
-- Auditar cambios en CANCHAS --
--=============================--
CREATE OR REPLACE TRIGGER TR_AUD_CANCHAS
BEFORE UPDATE OR DELETE ON CANCHAS
FOR EACH ROW
DECLARE
    V_RUT_USUARIO VARCHAR2(12);
BEGIN
    -- Obtener el usuario actual desde la sesión (simulado por variable global si aplica)
    V_RUT_USUARIO := SYS_CONTEXT('USERENV', 'CLIENT_IDENTIFIER');

    IF UPDATING THEN
        INSERT INTO AUD_CANCHAS (
            ID_CANCHA, NOMBRE_ANTERIOR, NOMBRE_NUEVO,
            VALOR_ANTERIOR, VALOR_NUEVO, OPERACION, FECHA_OPERACION, RUT_ADMIN
        ) VALUES (
            :OLD.ID_CANCHA, :OLD.NOMBRE, :NEW.NOMBRE,
            :OLD.VALOR_HORA, :NEW.VALOR_HORA, 'UPDATE', SYSDATE, V_RUT_USUARIO
        );
    ELSIF DELETING THEN
        INSERT INTO AUD_CANCHAS (
            ID_CANCHA, NOMBRE_ANTERIOR, NOMBRE_NUEVO,
            VALOR_ANTERIOR, VALOR_NUEVO, OPERACION, FECHA_OPERACION, RUT_ADMIN
        ) VALUES (
            :OLD.ID_CANCHA, :OLD.NOMBRE, NULL,
            :OLD.VALOR_HORA, NULL, 'DELETE', SYSDATE, V_RUT_USUARIO
        );
    END IF;
END;
/