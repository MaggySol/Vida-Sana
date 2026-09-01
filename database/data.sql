-- *****************************************************************************
-- 1. Inserción de datos en la tabla USUARIOS
-- *****************************************************************************
INSERT INTO USUARIOS (RUT, NOMBRE, APELLIDO_PATERNO, APELLIDO_MATERNO, EMAIL, CONTRASENIA, TELEFONO, ROL, ESTADO_USUARIO)
VALUES ('11.111.111-1', 'Juan', 'Gomez', 'Gonzalez', 'juan.gomez@example.com', 'hash_pass_juan123', '911111111', 'cliente', 'activo');

INSERT INTO USUARIOS (RUT, NOMBRE, APELLIDO_PATERNO, APELLIDO_MATERNO, EMAIL, CONTRASENIA, TELEFONO, ROL, ESTADO_USUARIO)
VALUES ('22.222.222-2', 'Maria', 'Lopez', 'Diaz', 'maria.lopez@example.com', 'hash_pass_maria456', '922222222', 'cliente', 'activo');

INSERT INTO USUARIOS (RUT, NOMBRE, APELLIDO_PATERNO, APELLIDO_MATERNO, EMAIL, CONTRASENIA, TELEFONO, ROL, ESTADO_USUARIO)
VALUES ('33.333.333-3', 'Carlos', 'Garcia', 'Sanchez', 'carlos.garcia@example.com', 'hash_pass_carlos789', '933333333', 'administrador', 'activo');

INSERT INTO USUARIOS (RUT, NOMBRE, APELLIDO_PATERNO, APELLIDO_MATERNO, EMAIL, CONTRASENIA, TELEFONO, ROL, ESTADO_USUARIO)
VALUES ('44.444.444-4', 'Ana', 'Rodriguez', 'Muñoz', 'ana.rodriguez@example.com', 'hash_pass_ana012', '944444444', 'cliente', 'inactivo');

INSERT INTO USUARIOS (RUT, NOMBRE, APELLIDO_PATERNO, APELLIDO_MATERNO, EMAIL, CONTRASENIA, TELEFONO, ROL, ESTADO_USUARIO)
VALUES ('55.555.555-5', 'Pedro', 'Martinez', 'Silva', 'pedro.martinez@example.com', 'hash_pass_pedro345', '955555555', 'colaborador', 'activo');

INSERT INTO USUARIOS (RUT, NOMBRE, APELLIDO_PATERNO, APELLIDO_MATERNO, EMAIL, CONTRASENIA, TELEFONO, ROL, ESTADO_USUARIO)
VALUES ('66.666.666-6', 'Laura', 'Gomez', 'Fernandez', 'laura.gomez@example.com', 'hash_pass_laura678', '966666666', 'cliente', 'activo');

COMMIT;

-- *****************************************************************************
-- 2. Inserción de datos en la tabla CANCHAS
-- *****************************************************************************
-- ID_CANCHA se autogenera
INSERT INTO CANCHAS (NOMBRE, TIPO, VALOR_HORA, DESCRIPCION, ESTADO_CANCHA)
VALUES ('Cancha Futbol 1', 'futbol', 25000, 'Cancha de pasto sintético, iluminación LED.','activa');

INSERT INTO CANCHAS (NOMBRE, TIPO, VALOR_HORA, DESCRIPCION, ESTADO_CANCHA)
VALUES ('Cancha Tenis A', 'tenis', 15000, 'Cancha de arcilla, con graderías.','activa');

INSERT INTO CANCHAS (NOMBRE, TIPO, VALOR_HORA, DESCRIPCION, ESTADO_CANCHA)
VALUES ('Cancha Padel 1', 'padel', 20000, 'Cancha de pádel con muro de cristal.','activa');

INSERT INTO CANCHAS (NOMBRE, TIPO, VALOR_HORA, DESCRIPCION, ESTADO_CANCHA)
VALUES ('Cancha Futbol 2', 'futbol', 28000, 'Cancha de pasto natural, actualmente en resiembra.','inactiva');

INSERT INTO CANCHAS (NOMBRE, TIPO, VALOR_HORA, DESCRIPCION, ESTADO_CANCHA)
VALUES ('Cancha Tenis B', 'tenis', 16000, 'Cancha de cemento, requiere reparaciones mayores.','activa');
