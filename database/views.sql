-------------------------------------------
-- Vista 1: Disponibilidad de Canchas
CREATE OR REPLACE VIEW VISTA_DISPONIBILIDAD_CANCHAS AS
SELECT  C.ID_CANCHA,
        C.NOMBRE,
        C.TIPO,
        C.VALOR_HORA,
        D.FECHA,
        D.INICIO_BLOQUE,
        D.FIN_BLOQUE
FROM CANCHAS C
JOIN DISPONIBILIDAD D
    ON C.ID_CANCHA = D.ID_CANCHA
WHERE D.ESTADO = 'disponible';

-------------------------------------------
-- Vista 2: Visualizar Reservas Canceladas
CREATE OR REPLACE VIEW vista_reservas_canceladas AS
SELECT R.ID_RESERVA,
       U.RUT,
       U.NOMBRE,
       U.APELLIDO_PATERNO,
       C.NOMBRE AS CANCHA,
       R.FECHA_RESERVA,
       R.HORA_INICIO,
       R.HORA_FIN,
       R.VALOR_TOTAL,
       R.FECHA_CREACION,
       R.FECHA_CANCELACION,
       R.MOTIVO_CANCELACION
FROM USUARIOS U
JOIN RESERVAS R
    ON U.RUT = R.RUT_USUARIO
JOIN CANCHAS C
    ON R.ID_CANCHA = C.ID_CANCHA
WHERE R.ESTADO_RESERVA = 'cancelada';
/

-----------------------------------
-- Vista 3: Reservas No Canceladas
CREATE OR REPLACE VIEW vista_reservas_no_canceladas AS
SELECT  R.ID_RESERVA,
        U.RUT, 
        U.NOMBRE, 
        U.APELLIDO_PATERNO, 
        C.NOMBRE AS CANCHA, 
        R.FECHA_RESERVA, 
        R.HORA_INICIO, 
        R.HORA_FIN,
        R.VALOR_TOTAL, 
        R.FECHA_CREACION
FROM    USUARIOS U
JOIN    RESERVAS R 
    ON U.RUT = R.RUT_USUARIO
JOIN    CANCHAS C 
    ON R.ID_CANCHA = C.ID_CANCHA
WHERE   R.ESTADO_RESERVA <> 'cancelada';
/

-----------------------------------
-- Vista 4: Penalizaciones detalladas
CREATE OR REPLACE VIEW VISTA_PENALIZACIONES AS
SELECT
    P.ID_PENALIZACION,
    P.RUT_USUARIO,
    U.NOMBRE,
    U.APELLIDO_PATERNO,
    U.APELLIDO_MATERNO,
    P.ID_RESERVA,
    P.FECHA_PENALIZACION,
    P.TIPO_PENALIZACION,
    P.MOTIVO,
    P.ESTADO_PENALIZACION,
    P.COMENTARIOS_ADMIN
FROM PENALIZACIONES P
JOIN USUARIOS U
    ON P.RUT_USUARIO = U.RUT;
/