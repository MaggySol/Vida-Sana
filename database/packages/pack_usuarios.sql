-- ============================================================
-- Gestión de usuarios 
-- ============================================================

CREATE OR REPLACE PACKAGE PACK_USUARIOS AS

    FUNCTION INICIO_SESION
    (
        V_EMAIL        VARCHAR2,
        V_CONTRASENIA  VARCHAR2
    ) RETURN BOOLEAN;

    FUNCTION FUNC_USUARIO_ACTIVO
    (
        V_RUT_USUARIO VARCHAR2
    ) RETURN BOOLEAN;

    PROCEDURE INGRESAR_USUARIO
    (
        V_RUT               VARCHAR2,
        V_NOMBRE            VARCHAR2,
        V_APELLIDO_PATERNO  VARCHAR2,
        V_APELLIDO_MATERNO  VARCHAR2,
        V_EMAIL             VARCHAR2,
        V_CONTRASENIA       VARCHAR2,
        V_TELEFONO          VARCHAR2,
        V_ROL               VARCHAR2,
        V_ESTADO            OUT VARCHAR2,
        V_MENSAJE           OUT VARCHAR2
    );

END PACK_USUARIOS;
/

CREATE OR REPLACE PACKAGE BODY PACK_USUARIOS AS

    FUNCTION INICIO_SESION
    (
        V_EMAIL       VARCHAR2,
        V_CONTRASENIA VARCHAR2
    ) RETURN BOOLEAN
    AS
        V_EXISTE NUMBER;
    BEGIN
        SELECT COUNT(*)
        INTO V_EXISTE
        FROM USUARIOS
        WHERE EMAIL = V_EMAIL
          AND CONTRASENIA = V_CONTRASENIA
          AND ESTADO_USUARIO = 'activo';

        RETURN V_EXISTE > 0;

    EXCEPTION
        WHEN OTHERS THEN
            RETURN FALSE;
    END INICIO_SESION;


    FUNCTION FUNC_USUARIO_ACTIVO
    (
        V_RUT_USUARIO VARCHAR2
    ) RETURN BOOLEAN
    AS
        V_ESTADO_USUARIO VARCHAR2(20);
    BEGIN
        SELECT ESTADO_USUARIO
        INTO V_ESTADO_USUARIO
        FROM USUARIOS
        WHERE RUT = V_RUT_USUARIO;

        RETURN V_ESTADO_USUARIO = 'activo';

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;

        WHEN OTHERS THEN
            RETURN FALSE;
    END FUNC_USUARIO_ACTIVO;


    PROCEDURE INGRESAR_USUARIO
    (
        V_RUT               VARCHAR2,
        V_NOMBRE            VARCHAR2,
        V_APELLIDO_PATERNO  VARCHAR2,
        V_APELLIDO_MATERNO  VARCHAR2,
        V_EMAIL             VARCHAR2,
        V_CONTRASENIA       VARCHAR2,
        V_TELEFONO          VARCHAR2,
        V_ROL               VARCHAR2,
        V_ESTADO            OUT VARCHAR2,
        V_MENSAJE           OUT VARCHAR2
    )
    AS
        ERROR_LARGO_NOMBRE          EXCEPTION;
        ERROR_LARGO_APELLIDO_PATERNO EXCEPTION;
        ERROR_LARGO_APELLIDO_MATERNO EXCEPTION;
        ERROR_LARGO_EMAIL            EXCEPTION;
        ERROR_FORMATO_RUT            EXCEPTION;
        ERROR_FORMATO_EMAIL          EXCEPTION;
        ERROR_ROL                    EXCEPTION;
    BEGIN

        -- Validación de longitudes
        IF LENGTH(V_NOMBRE) > 100 THEN
            RAISE ERROR_LARGO_NOMBRE;
        END IF;

        IF LENGTH(V_APELLIDO_PATERNO) > 100 THEN
            RAISE ERROR_LARGO_APELLIDO_PATERNO;
        END IF;

        IF LENGTH(V_APELLIDO_MATERNO) > 100 THEN
            RAISE ERROR_LARGO_APELLIDO_MATERNO;
        END IF;

        IF LENGTH(V_EMAIL) > 100 THEN
            RAISE ERROR_LARGO_EMAIL;
        END IF;


        -- Validación del formato del RUT
        IF NOT REGEXP_LIKE(
            V_RUT,
            '^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9Kk]$'
        ) THEN
            RAISE ERROR_FORMATO_RUT;
        END IF;


        -- Validación del formato del email
        IF NOT REGEXP_LIKE(
            V_EMAIL,
            '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
        ) THEN
            RAISE ERROR_FORMATO_EMAIL;
        END IF;


        -- Validación del rol
        IF LOWER(V_ROL) NOT IN (
            'cliente',
            'colaborador',
            'administrador'
        ) THEN
            RAISE ERROR_ROL;
        END IF;


        -- Inserción
        INSERT INTO USUARIOS
        (
            RUT,
            NOMBRE,
            APELLIDO_PATERNO,
            APELLIDO_MATERNO,
            EMAIL,
            CONTRASENIA,
            TELEFONO,
            ROL
        )
        VALUES
        (
            V_RUT,
            V_NOMBRE,
            V_APELLIDO_PATERNO,
            V_APELLIDO_MATERNO,
            V_EMAIL,
            V_CONTRASENIA,
            V_TELEFONO,
            LOWER(V_ROL)
        );

        COMMIT;

        V_ESTADO := 'TRUE';
        V_MENSAJE := 'Usuario registrado exitosamente.';


    EXCEPTION

        WHEN ERROR_LARGO_NOMBRE THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE :=
                'El nombre no debe superar los 100 caracteres.';

        WHEN ERROR_LARGO_APELLIDO_PATERNO THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE :=
                'El apellido paterno no debe superar los 100 caracteres.';

        WHEN ERROR_LARGO_APELLIDO_MATERNO THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE :=
                'El apellido materno no debe superar los 100 caracteres.';

        WHEN ERROR_LARGO_EMAIL THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE :=
                'El email no debe superar los 100 caracteres.';

        WHEN ERROR_FORMATO_RUT THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE :=
                'El formato del RUT no es válido. Ej: 12.345.678-K';

        WHEN ERROR_FORMATO_EMAIL THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE :=
                'El formato del email no es válido. Ej: usuario@email.com';

        WHEN ERROR_ROL THEN
            V_ESTADO := 'FALSE';
            V_MENSAJE :=
                'El rol no es válido. Debe ser "cliente", "colaborador" o "administrador".';

        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;

            V_ESTADO := 'FALSE';

            IF INSTR(SQLERRM, 'PK_USUARIOS_RUT') > 0 THEN
                V_MENSAJE :=
                    'El RUT ya está registrado. Por favor, use otro.';

            ELSIF INSTR(SQLERRM, 'UQ_USUARIOS_EMAIL') > 0 THEN
                V_MENSAJE :=
                    'El email ya está registrado. Por favor, use otro.';

            ELSE
                V_MENSAJE :=
                    'El RUT o email ya están registrados.';
            END IF;

        WHEN OTHERS THEN
            ROLLBACK;

            V_ESTADO := 'FALSE';

            IF SQLCODE = -1400 THEN
                V_MENSAJE :=
                    'Falta un campo obligatorio.';
            ELSE
                V_MENSAJE :=
                    'Se produjo un error inesperado: ' || SQLERRM;
            END IF;

    END INGRESAR_USUARIO;

END PACK_USUARIOS;
/