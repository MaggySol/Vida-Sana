-- ============================================================
-- Gestión de reservas
-- ============================================================

CREATE OR REPLACE PACKAGE PACK_RESERVAS AS

    PROCEDURE INGRESAR_RESERVA (
        V_ID_CANCHA       NUMBER,
        V_RUT_USUARIO     VARCHAR2,
        V_FECHA           DATE,
        V_HORA_INICIO     VARCHAR2,
        V_HORA_FIN        VARCHAR2,
        V_ESTADO          OUT VARCHAR2,
        V_MENSAJE         OUT VARCHAR2,
        V_ID_RESERVA_OUT  OUT NUMBER
    );

    PROCEDURE CANCELAR_RESERVA (
        V_ID_RESERVA  IN NUMBER,
        V_MOTIVO      IN VARCHAR2,
        V_ESTADO      OUT VARCHAR2,
        V_MENSAJE     OUT VARCHAR2
    );

    PROCEDURE CONFIRMAR_RESERVA_UTILIZADA (
        V_ID_RESERVA IN NUMBER,
        V_ESTADO     OUT VARCHAR2,
        V_MENSAJE    OUT VARCHAR2
    );

    PROCEDURE MARCAR_INASISTENCIA (
        V_ID_RESERVA IN NUMBER,
        V_ESTADO     OUT VARCHAR2,
        V_MENSAJE    OUT VARCHAR2
    );

END PACK_RESERVAS;
/
 
 

CREATE OR REPLACE PACKAGE BODY PACK_RESERVAS AS
    
    -- ========================================================
    -- INGRESAR RESERVA
    -- ========================================================
    PROCEDURE INGRESAR_RESERVA (
        V_ID_CANCHA       NUMBER,
        V_RUT_USUARIO     VARCHAR2,
        V_FECHA           DATE,
        V_HORA_INICIO     VARCHAR2,
        V_HORA_FIN        VARCHAR2,
        V_ESTADO          OUT VARCHAR2,
        V_MENSAJE         OUT VARCHAR2,
        V_ID_RESERVA_OUT  OUT NUMBER
    )
    AS
        V_VALOR_HORA    NUMBER;
        V_VALOR_TOTAL   NUMBER;
        V_NUM_BLOQUES   NUMBER;
        V_ID_RESERVA    NUMBER;

        ERROR_ENTRE_HORAS           EXCEPTION;
        ERROR_FORMATO_HORA          EXCEPTION;
        ERROR_USUARIO_ACTIVO        EXCEPTION;
        ERROR_CANCHA_DISPONIBLE     EXCEPTION;
        ERROR_BLOQUE_NO_DISPONIBLE  EXCEPTION;
        ERROR_FECHA_RESERVA         EXCEPTION;
        ERROR_HORARIO_RESERVA       EXCEPTION;

    BEGIN
        V_ID_RESERVA_OUT := NULL;

        -- Verificar que el usuario esté activo
        IF NOT PACK_USUARIOS.FUNC_USUARIO_ACTIVO(V_RUT_USUARIO) THEN
            RAISE ERROR_USUARIO_ACTIVO;
        END IF;

        -- Verificar que la cancha esté activa
        IF NOT PACK_CANCHAS.FUNC_CANCHAS_ACTIVAS(V_ID_CANCHA) THEN
            RAISE ERROR_CANCHA_DISPONIBLE;
        END IF;

        -- Validar que la fecha esté dentro de los próximos 14 días
        IF TRUNC(V_FECHA) < TRUNC(SYSDATE)
        OR TRUNC(V_FECHA) > TRUNC(SYSDATE) + 13 THEN
            RAISE ERROR_FECHA_RESERVA;
        END IF;

        -- Validar horario de atención de las canchas
        IF V_HORA_INICIO < '08:00'
        OR V_HORA_FIN > '14:00' THEN
            RAISE ERROR_HORARIO_RESERVA;
        END IF;

        -- Validar formato de las horas
        IF NOT REGEXP_LIKE(
            V_HORA_INICIO,
            '^([01][0-9]|2[0-3]):[0-5][0-9]$'
        )
        OR NOT REGEXP_LIKE(
            V_HORA_FIN,
            '^([01][0-9]|2[0-3]):[0-5][0-9]$'
        ) THEN
            RAISE ERROR_FORMATO_HORA;
        END IF;

        -- Validar rango horario
        IF V_HORA_INICIO >= V_HORA_FIN THEN
            RAISE ERROR_ENTRE_HORAS;
        END IF;

        -- Calcular cantidad de bloques necesarios
        V_NUM_BLOQUES :=
            (TO_DATE(V_HORA_FIN, 'HH24:MI') - TO_DATE(V_HORA_INICIO, 'HH24:MI')) * 24;

        -- Verificar disponibilidad (La lógica de disponibilidad está en PACK_DISPONIBILIDAD)
        IF NOT PACK_DISPONIBILIDAD.DISPONIBILIDAD_CANCHA(
            V_ID_CANCHA,
            V_FECHA,
            V_HORA_INICIO,
            V_HORA_FIN
        ) THEN
            RAISE ERROR_BLOQUE_NO_DISPONIBLE;
        END IF;

        -- Obtener valor por hora de la cancha
        SELECT VALOR_HORA
        INTO V_VALOR_HORA
        FROM CANCHAS
        WHERE ID_CANCHA = V_ID_CANCHA;

        -- Calcular valor total de la reserva
        V_VALOR_TOTAL := V_NUM_BLOQUES * V_VALOR_HORA;

        -- Crear reserva
        INSERT INTO RESERVAS (
            ID_CANCHA,
            RUT_USUARIO,
            FECHA_RESERVA,
            HORA_INICIO,
            HORA_FIN,
            VALOR_TOTAL,
            ESTADO_RESERVA)
        VALUES (
            V_ID_CANCHA,
            V_RUT_USUARIO,
            TRUNC(V_FECHA),
            V_HORA_INICIO,
            V_HORA_FIN,
            V_VALOR_TOTAL,
            'activa')
        RETURNING ID_RESERVA INTO V_ID_RESERVA;

        -- Actualizar disponibilidad de la cancha
        UPDATE DISPONIBILIDAD
        SET ID_RESERVA = V_ID_RESERVA,
            ESTADO = 'reservado'
        WHERE FECHA = TRUNC(V_FECHA)
        AND ID_CANCHA = V_ID_CANCHA
        AND INICIO_BLOQUE >= V_HORA_INICIO
        AND FIN_BLOQUE <= V_HORA_FIN
        AND ESTADO = 'disponible';

        -- Confirmar operación
        COMMIT;
        V_ID_RESERVA_OUT := V_ID_RESERVA;
        V_ESTADO := 'TRUE';
        V_MENSAJE := 'Reserva realizada con éxito.';

    EXCEPTION
        WHEN ERROR_USUARIO_ACTIVO THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'El usuario no está activo.';

        WHEN ERROR_CANCHA_DISPONIBLE THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'La cancha no está disponible.';

        WHEN ERROR_FORMATO_HORA THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'Formato de hora incorrecto. Ej: 08:00';

        WHEN ERROR_ENTRE_HORAS THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'La hora de inicio debe ser menor que la hora de fin.';

        WHEN ERROR_BLOQUE_NO_DISPONIBLE THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'No hay bloques disponibles en ese horario.';
        
        WHEN ERROR_FECHA_RESERVA THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'La reserva solo puede realizarse para los próximos 14 días.';

        WHEN ERROR_HORARIO_RESERVA THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'El horario de reserva debe estar entre las 08:00 y las 14:00.';

        WHEN OTHERS THEN
            ROLLBACK;
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'Error inesperado: ' || SQLERRM;

    END INGRESAR_RESERVA;

    
    -- ========================================================
    -- CANCELAR RESERVA
    -- ========================================================
    PROCEDURE CANCELAR_RESERVA (
        V_ID_RESERVA  IN NUMBER,
        V_MOTIVO      IN VARCHAR2,
        V_ESTADO      OUT VARCHAR2,
        V_MENSAJE     OUT VARCHAR2
    )
    AS
        V_FECHA_RESERVA     DATE;
        V_HORA_INICIO       VARCHAR2(5);
        V_FECHA_HORA        DATE;
        V_DIFERENCIA_HORAS  NUMBER;

    BEGIN
        -- Buscar reserva activa
        SELECT FECHA_RESERVA, HORA_INICIO
        INTO V_FECHA_RESERVA, V_HORA_INICIO
        FROM RESERVAS
        WHERE ID_RESERVA = V_ID_RESERVA
        AND ESTADO_RESERVA = 'activa';

        -- Construir fecha + hora de inicio
        V_FECHA_HORA :=
            TO_DATE(
                TO_CHAR(V_FECHA_RESERVA, 'DD-MM-YYYY')
                || ' '
                || V_HORA_INICIO,
                'DD-MM-YYYY HH24:MI'
            );

        -- Calcular horas restantes
        V_DIFERENCIA_HORAS := (V_FECHA_HORA - SYSDATE) * 24;

        -- Verificar mínimo de 6 horas
        IF V_DIFERENCIA_HORAS >= 6 THEN

            -- Cancelar la reserva
            UPDATE RESERVAS
            SET ESTADO_RESERVA = 'cancelada',
                FECHA_CANCELACION = SYSDATE,
                MOTIVO_CANCELACION = V_MOTIVO
            WHERE ID_RESERVA = V_ID_RESERVA;

            -- Confirmar operación
            COMMIT;
            V_ESTADO := 'TRUE';
            V_MENSAJE := 'Reserva cancelada exitosamente.';

        ELSE
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'La cancelación debe hacerse con al menos 6 horas de anticipación.';
        END IF;

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'La reserva no existe o ya no está activa.';

        WHEN OTHERS THEN
            ROLLBACK;
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'Error inesperado: ' || SQLERRM;

    END CANCELAR_RESERVA;

    
    -- ========================================================
    -- CONFIRMAR RESERVA UTILIZADA
    -- ========================================================
    PROCEDURE CONFIRMAR_RESERVA_UTILIZADA (
        V_ID_RESERVA IN NUMBER,
        V_ESTADO     OUT VARCHAR2,
        V_MENSAJE    OUT VARCHAR2
    )
    AS
        V_EXISTE_ACTIVA NUMBER;

    BEGIN
        -- Verificar que exista y esté activa
        SELECT COUNT(*)
        INTO V_EXISTE_ACTIVA
        FROM RESERVAS
        WHERE ID_RESERVA = V_ID_RESERVA
          AND ESTADO_RESERVA = 'activa';

        IF V_EXISTE_ACTIVA = 0 THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'Reserva no válida o ya no está activa.';
            RETURN;
        END IF;

        -- Marcar reserva como utilizada
        UPDATE RESERVAS
        SET ESTADO_RESERVA = 'utilizada'
        WHERE ID_RESERVA = V_ID_RESERVA;

        COMMIT;

        V_ESTADO := 'TRUE';
        V_MENSAJE := 'Reserva marcada como utilizada.';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'Error inesperado: ' || SQLERRM;

    END CONFIRMAR_RESERVA_UTILIZADA;



    -- ========================================================
    -- MARCAR INASISTENCIA
    -- ========================================================
    PROCEDURE MARCAR_INASISTENCIA (
        V_ID_RESERVA IN NUMBER,
        V_ESTADO     OUT VARCHAR2,
        V_MENSAJE    OUT VARCHAR2
    )
    AS
        V_FECHA_RESERVA   DATE;
        V_HORA_INICIO     VARCHAR2(5);
        V_RUT_USUARIO     VARCHAR2(20);
        V_FECHA_HORA_INI  DATE;
        V_FECHA_ACTUAL    DATE := SYSDATE;

        ERROR_HORA_INICIO   EXCEPTION;

    BEGIN
        -- Buscar reserva activa
        SELECT FECHA_RESERVA,
               HORA_INICIO,
               RUT_USUARIO
        INTO V_FECHA_RESERVA,
             V_HORA_INICIO,
             V_RUT_USUARIO
        FROM RESERVAS
        WHERE ID_RESERVA = V_ID_RESERVA
          AND ESTADO_RESERVA = 'activa';

        -- Construir fecha y hora de inicio
        V_FECHA_HORA_INI :=
            TO_DATE(
                TO_CHAR(V_FECHA_RESERVA, 'DD-MM-YYYY')
                || ' '
                || V_HORA_INICIO,
                'DD-MM-YYYY HH24:MI'
            );

        -- Verificar que hayan pasado 30 minutos
        IF V_FECHA_ACTUAL >= V_FECHA_HORA_INI + (30 / 1440) THEN
            UPDATE RESERVAS
            SET ESTADO_RESERVA = 'inasistencia'
            WHERE ID_RESERVA = V_ID_RESERVA;

            INSERT INTO PENALIZACIONES (
                RUT_USUARIO,
                ID_RESERVA,
                TIPO_PENALIZACION,
                MOTIVO
            )
            VALUES (
                V_RUT_USUARIO,
                V_ID_RESERVA,
                'inasistencia',
                'No se presentó a la hora acordada'
            );
            COMMIT;

            V_ESTADO := 'TRUE';
            V_MENSAJE := 'Reserva marcada como inasistencia y penalización registrada.';

        ELSE
            RAISE ERROR_HORA_INICIO;
        END IF;

    EXCEPTION
        WHEN ERROR_HORA_INICIO THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'Aún no han pasado 30 minutos desde la hora de inicio.';

        WHEN NO_DATA_FOUND THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'Reserva no encontrada o ya no está activa.';

        WHEN OTHERS THEN
            ROLLBACK;
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'Error inesperado: ' || SQLERRM;
    END MARCAR_INASISTENCIA;

END PACK_RESERVAS;
/
