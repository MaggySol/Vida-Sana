-- ============================================================
-- Gestión de disponibilidad de canchas
-- ============================================================

CREATE OR REPLACE PACKAGE PACK_DISPONIBILIDAD AS

    -- Genera los bloques horarios para las canchas activas
    PROCEDURE GENERAR_BLOQUES_DISPONIBILIDAD;

    -- Consulta si existe disponibilidad para una cancha, fecha y rango horario determinado
    FUNCTION DISPONIBILIDAD_CANCHA (
        V_ID_CANCHA     NUMBER,
        V_FECHA         DATE,
        V_HORA_INICIO   VARCHAR2,
        V_HORA_FIN      VARCHAR2
    ) RETURN BOOLEAN;

END PACK_DISPONIBILIDAD;
/

CREATE OR REPLACE PACKAGE BODY PACK_DISPONIBILIDAD AS

----------------------------------------------------------------
-- Genera los bloques horarios disponibles para los próximos
-- 14 días y las canchas que se encuentren activas.
----------------------------------------------------------------
    PROCEDURE GENERAR_BLOQUES_DISPONIBILIDAD
    IS
        V_FECHA DATE := TRUNC(SYSDATE);
        V_EXISTE NUMBER;
    BEGIN
        -- 1. Eliminar bloques anteriores a hoy
        DELETE FROM DISPONIBILIDAD
        WHERE FECHA < TRUNC(SYSDATE);

        -- 2. Eliminar bloques disponibles de canchas inactivas que no estén asociados a una reserva
        DELETE FROM DISPONIBILIDAD D
        WHERE ID_RESERVA IS NULL
          AND EXISTS (
              SELECT 1
              FROM CANCHAS C
              WHERE C.ID_CANCHA = D.ID_CANCHA
                AND C.ESTADO_CANCHA = 'inactiva');

        -- 3. Generar bloques para los próximos 14 días y solamente para canchas activas
        FOR DIA IN 0 .. 13 LOOP
            -- Horarios de 08:00 a 14:00
            -- Se generan 6 bloques:
            -- 08-09, 09-10, 10-11, 11-12, 12-13, 13-14
            FOR HORA IN 8 .. 13 LOOP
                FOR C IN (
                    SELECT ID_CANCHA
                    FROM CANCHAS
                    WHERE ESTADO_CANCHA = 'activa'
                ) LOOP
                    -- Verificar si el bloque ya existe
                    SELECT COUNT(*)
                    INTO V_EXISTE
                    FROM DISPONIBILIDAD
                    WHERE FECHA = V_FECHA + DIA
                      AND ID_CANCHA = C.ID_CANCHA
                      AND INICIO_BLOQUE =
                          TO_CHAR(HORA, 'FM00') || ':00';

                    -- Si no existe, crear el bloque
                    IF V_EXISTE = 0 THEN
                        INSERT INTO DISPONIBILIDAD (
                            FECHA,
                            ID_CANCHA,
                            INICIO_BLOQUE,
                            FIN_BLOQUE,
                            ESTADO)
                        VALUES (
                            V_FECHA + DIA,
                            C.ID_CANCHA,
                            TO_CHAR(HORA, 'FM00') || ':00',
                            TO_CHAR(HORA + 1, 'FM00') || ':00',
                            'disponible');
                    END IF;
                END LOOP;
            END LOOP;
        END LOOP;
        COMMIT;

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(
                -20001, 'Error al generar disponibilidad: ' || SQLERRM);

    END GENERAR_BLOQUES_DISPONIBILIDAD;


    ----------------------------------------------------------------
    -- FUNCIÓN: DISPONIBILIDAD_CANCHA
    --
    -- Determina si todos los bloques necesarios para una reserva
    -- se encuentran disponibles.
    ----------------------------------------------------------------
    FUNCTION DISPONIBILIDAD_CANCHA (
        V_ID_CANCHA     NUMBER,
        V_FECHA         DATE,
        V_HORA_INICIO   VARCHAR2,
        V_HORA_FIN      VARCHAR2
    ) RETURN BOOLEAN
    IS
        V_BLOQUES_NECESARIOS   NUMBER;
        V_BLOQUES_DISPONIBLES  NUMBER;
    BEGIN
        -- Calcular cuántos bloques de una hora necesita la reserva
        V_BLOQUES_NECESARIOS :=
            (TO_DATE(V_HORA_FIN, 'HH24:MI') - TO_DATE(V_HORA_INICIO, 'HH24:MI')) * 24;

        -- Contar cuántos bloques están disponibles
        SELECT COUNT(*)
        INTO V_BLOQUES_DISPONIBLES
        FROM DISPONIBILIDAD
        WHERE FECHA = TRUNC(V_FECHA)
          AND ID_CANCHA = V_ID_CANCHA
          AND INICIO_BLOQUE >= V_HORA_INICIO
          AND FIN_BLOQUE <= V_HORA_FIN
          AND ESTADO = 'disponible';

        -- Si la cantidad de bloques disponibles coincide con la cantidad 
        -- de bloques necesarios, la cancha está disponible.
        RETURN V_BLOQUES_DISPONIBLES = V_BLOQUES_NECESARIOS;

    EXCEPTION
        WHEN OTHERS THEN
            RETURN FALSE;

    END DISPONIBILIDAD_CANCHA;

END PACK_DISPONIBILIDAD;
/