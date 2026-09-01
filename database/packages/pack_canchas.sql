-- ============================================================
-- Gestión de canchas
-- ============================================================

CREATE OR REPLACE PACKAGE PACK_CANCHAS AS

    FUNCTION FUNC_CANCHAS_ACTIVAS(
        V_ID_CANCHA NUMBER
    ) RETURN BOOLEAN;

    PROCEDURE INGRESAR_CANCHA(
        V_NOMBRE        VARCHAR2,
        V_TIPO          VARCHAR2,
        V_VALOR_HORA    NUMBER,
        V_DESCRIPCION   VARCHAR2,
        V_ESTADO        OUT VARCHAR2,
        V_MENSAJE       OUT VARCHAR2
    );

    PROCEDURE MODIFICAR_CANCHA(
        V_ID_CANCHA          IN NUMBER,
        V_RUT_USUARIO        IN VARCHAR2,
        V_NUEVO_NOMBRE       IN VARCHAR2,
        V_NUEVO_VALOR_HORA   IN NUMBER,
        V_NUEVA_DESCRIPCION  IN VARCHAR2,
        V_MOTIVO             IN VARCHAR2,
        V_ESTADO             OUT VARCHAR2,
        V_MENSAJE            OUT VARCHAR2
    );

    PROCEDURE ELIMINAR_CANCHA(
        V_ID_CANCHA      IN NUMBER,
        V_RUT_USUARIO    IN VARCHAR2,
        V_MOTIVO         IN VARCHAR2,
        V_ESTADO         OUT VARCHAR2,
        V_MENSAJE        OUT VARCHAR2
    );

END PACK_CANCHAS;
/

CREATE OR REPLACE PACKAGE BODY PACK_CANCHAS AS
    ------------------------------------------------------------------
    -- FUNCION: verificar si una cancha está activa
    ------------------------------------------------------------------
    FUNCTION FUNC_CANCHAS_ACTIVAS(
        V_ID_CANCHA NUMBER
    ) RETURN BOOLEAN
    IS
        V_EXISTE NUMBER;
    BEGIN
        SELECT COUNT(*)
        INTO V_EXISTE
        FROM CANCHAS
        WHERE ID_CANCHA = V_ID_CANCHA
          AND ESTADO_CANCHA = 'activa';

        RETURN V_EXISTE > 0;

    EXCEPTION
        WHEN OTHERS THEN
            RETURN FALSE;

    END FUNC_CANCHAS_ACTIVAS;


    ------------------------------------------------------------------
    -- PROCEDIMIENTO: ingresar cancha
    ------------------------------------------------------------------
    PROCEDURE INGRESAR_CANCHA(
        V_NOMBRE        VARCHAR2,
        V_TIPO          VARCHAR2,
        V_VALOR_HORA    NUMBER,
        V_DESCRIPCION   VARCHAR2,
        V_ESTADO        OUT VARCHAR2,
        V_MENSAJE       OUT VARCHAR2
    )
    IS
        ERROR_NOMBRE         EXCEPTION;
        ERROR_TIPO           EXCEPTION;
        ERROR_VALOR_HORA     EXCEPTION;
        ERROR_DESCRIPCION    EXCEPTION;
        ERROR_DATOS_NULOS    EXCEPTION;

    BEGIN
        -- Validar campos obligatorios
        IF V_NOMBRE IS NULL OR V_TIPO IS NULL OR V_VALOR_HORA IS NULL THEN
            RAISE ERROR_DATOS_NULOS;
        END IF;

        -- Validar largo del nombre
        IF LENGTH(V_NOMBRE) > 100 THEN
            RAISE ERROR_NOMBRE;
        END IF;

        -- Validar largo de descripción
        IF LENGTH(V_DESCRIPCION) > 500 THEN
            RAISE ERROR_DESCRIPCION;
        END IF;

        -- Validar valor
        IF V_VALOR_HORA <= 0 THEN
            RAISE ERROR_VALOR_HORA;
        END IF;

        -- Validar tipo
        IF LOWER(V_TIPO) NOT IN ('futbol', 'tenis', 'padel') THEN
            RAISE ERROR_TIPO;
        END IF;

        INSERT INTO CANCHAS(
            NOMBRE,
            TIPO,
            VALOR_HORA,
            DESCRIPCION
        )
        VALUES(
            V_NOMBRE,
            LOWER(V_TIPO),
            V_VALOR_HORA,
            V_DESCRIPCION
        );

        COMMIT;
        V_ESTADO := 'TRUE';
        V_MENSAJE := 'Cancha registrada exitosamente.';

    EXCEPTION
        WHEN ERROR_DATOS_NULOS THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'Nombre, tipo y valor de hora son obligatorios.';

        WHEN ERROR_NOMBRE THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'El nombre no debe superar los 100 caracteres.';

        WHEN ERROR_TIPO THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'El tipo no es válido. Debe ser "futbol", "tenis" o "padel".';

        WHEN ERROR_DESCRIPCION THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'La descripción no debe superar los 500 caracteres.';

        WHEN ERROR_VALOR_HORA THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'El valor de la hora debe ser mayor a 0.';

        WHEN OTHERS THEN
            ROLLBACK;
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'Se produjo un error inesperado: ' || SQLERRM;

    END INGRESAR_CANCHA;


    ------------------------------------------------------------------
    -- PROCEDIMIENTO: modificar cancha
    ------------------------------------------------------------------
    PROCEDURE MODIFICAR_CANCHA(
        V_ID_CANCHA          IN NUMBER,
        V_RUT_USUARIO        IN VARCHAR2,
        V_NUEVO_NOMBRE       IN VARCHAR2,
        V_NUEVO_VALOR_HORA   IN NUMBER,
        V_NUEVA_DESCRIPCION  IN VARCHAR2,
        V_MOTIVO             IN VARCHAR2,
        V_ESTADO             OUT VARCHAR2,
        V_MENSAJE            OUT VARCHAR2
    )
    IS
        V_ROL VARCHAR2(20);

        ERROR_NOMBRE         EXCEPTION;
        ERROR_VALOR_HORA     EXCEPTION;
        ERROR_DESCRIPCION    EXCEPTION;

    BEGIN
        -- Obtener rol del usuario
        SELECT ROL
        INTO V_ROL
        FROM USUARIOS
        WHERE RUT = V_RUT_USUARIO;

        -- Verificar administrador
        IF V_ROL != 'administrador' THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'Solo administradores pueden modificar canchas.';
            RETURN;
        END IF;

        -- Validar nombre
        IF V_NUEVO_NOMBRE IS NULL OR LENGTH(V_NUEVO_NOMBRE) > 100 THEN
            RAISE ERROR_NOMBRE;
        END IF;

        -- Validar valor
        IF V_NUEVO_VALOR_HORA IS NULL OR V_NUEVO_VALOR_HORA <= 0 THEN
            RAISE ERROR_VALOR_HORA;
        END IF;

        -- Validar descripción
        IF LENGTH(V_NUEVA_DESCRIPCION) > 500 THEN
            RAISE ERROR_DESCRIPCION;
        END IF;

        -- Verificar que la cancha exista
        UPDATE CANCHAS
        SET NOMBRE = V_NUEVO_NOMBRE,
            VALOR_HORA = V_NUEVO_VALOR_HORA,
            DESCRIPCION = V_NUEVA_DESCRIPCION
        WHERE ID_CANCHA = V_ID_CANCHA;

        IF SQL%ROWCOUNT = 0 THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'La cancha no existe.';
            ROLLBACK;
            RETURN;
        END IF;

        COMMIT;
        V_ESTADO := 'TRUE';
        V_MENSAJE := 'Cancha modificada correctamente.';

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'El usuario no existe.';

        WHEN ERROR_NOMBRE THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'El nombre es obligatorio y no debe superar los 100 caracteres.';

        WHEN ERROR_VALOR_HORA THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'El valor de la hora debe ser mayor a 0.';

        WHEN ERROR_DESCRIPCION THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'La descripción no debe superar los 500 caracteres.';

        WHEN OTHERS THEN
            ROLLBACK;
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'Error inesperado: ' || SQLERRM;

    END MODIFICAR_CANCHA;


    ------------------------------------------------------------------
    -- PROCEDIMIENTO: eliminar cancha
    ------------------------------------------------------------------
    PROCEDURE ELIMINAR_CANCHA    (
        V_ID_CANCHA      IN NUMBER,
        V_RUT_USUARIO    IN VARCHAR2,
        V_MOTIVO         IN VARCHAR2,
        V_ESTADO         OUT VARCHAR2,
        V_MENSAJE        OUT VARCHAR2
    )
    IS
        V_ROL VARCHAR2(20);

    BEGIN
        -- Obtener rol del usuario
        SELECT ROL
        INTO V_ROL
        FROM USUARIOS
        WHERE RUT = V_RUT_USUARIO;

        -- Verificar administrador
        IF V_ROL != 'administrador' THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'Solo administradores pueden eliminar canchas.';
            RETURN;
        END IF;

        -- Eliminación lógica
        UPDATE CANCHAS
        SET ESTADO_CANCHA = 'inactiva'
        WHERE ID_CANCHA = V_ID_CANCHA;

        IF SQL%ROWCOUNT = 0 THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'La cancha no existe.';
            ROLLBACK;
            RETURN;
        END IF;

        COMMIT;
        V_ESTADO := 'TRUE';
        V_MENSAJE := 'Cancha desactivada correctamente.';

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'El usuario no existe.';

        WHEN OTHERS THEN
            ROLLBACK;
            V_ESTADO := 'FALSE';
            V_MENSAJE := 'Error inesperado: ' || SQLERRM;

    END ELIMINAR_CANCHA;

END PACK_CANCHAS;
/