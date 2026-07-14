-- =============================================================
-- BASE DE DATOS: Taller de Sabores — Pastelería de Bodas
-- Motor: MySQL / MariaDB
-- Importar en phpMyAdmin o consola:
--   mysql -u usuario -p < basededatos.sql
-- =============================================================

CREATE DATABASE IF NOT EXISTS taller_de_sabores
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE taller_de_sabores;

-- =============================================================
-- 1. USUARIOS
-- =============================================================
CREATE TABLE usuarios (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(120)    NOT NULL,
    email       VARCHAR(255)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    rol         ENUM('cliente','admin') NOT NULL DEFAULT 'cliente',
    creado_en   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =============================================================
-- 2. CATEGORÍAS (estilo)
-- =============================================================
CREATE TABLE categorias (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    nombre  VARCHAR(60) NOT NULL UNIQUE,
    slug    VARCHAR(60) NOT NULL UNIQUE
) ENGINE=InnoDB;

INSERT INTO categorias (nombre, slug) VALUES
    ('Clásico',  'clasico'),
    ('Rústico',  'rustico'),
    ('Moderno',  'moderno');

-- =============================================================
-- 3. PASTELES (catálogo)
-- =============================================================
CREATE TABLE pasteles (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(120)    NOT NULL,
    descripcion     TEXT            NOT NULL,
    precio          DECIMAL(10,2)   NOT NULL,
    estilo          VARCHAR(60)     NOT NULL,
    tamaño          ENUM('pequeno','mediano','grande') NOT NULL DEFAULT 'mediano',
    imagen_url      VARCHAR(500)    NOT NULL,
    categoria_id    INT             NULL,
    creado_en       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO pasteles (nombre, descripcion, precio, estilo, tamaño, imagen_url, categoria_id) VALUES
    ('Elegancia Blanca',     'Clásico pastel de vainilla con relleno de frutos rojos y cobertura de fondant suizo. Tres pisos impecables con detalles en encaje comestible.',                                 450.00,  'clasico', 'mediano', 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&q=80&w=600', 1),
    ('Romance Rústico',      'Naked cake de zanahoria con frosting de queso crema y detalles florales naturales. Ideal para bodas al aire libre o estilo boho.',                                         380.00,  'rustico', 'pequeno', 'https://images.unsplash.com/photo-1559553156-2e97137af16f?auto=format&fit=crop&q=80&w=600', 2),
    ('Encanto Botánico',     'Elegante combinación de bizcocho al desnudo y crema texturizada, coronada con un arreglo floral silvestre de temporada.',                                                 850.00,  'rustico', 'grande',  'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&q=80&w=600', 2),
    ('Cascada de Rosas',     'Majestuoso pastel de 4 pisos con cascada de rosas de azúcar hechas a mano. Acabado en fondant satinado con detalles en pan de oro.',                                     1200.00, 'clasico', 'grande',  'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?auto=format&fit=crop&q=80&w=600', 1),
    ('Boho Dulzura',         'Diseño rústico de cuatro pisos con acabado semi-naked y drip cake de caramelo. Decorado con mini donas espolvoreadas y eucalipto fresco.',                                720.00,  'rustico', 'grande',  'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&q=80&w=600', 2),
    ('Ilusión Floral',       'Diseño de vanguardia con efecto flotante. Cámara central transparente que encapsula lirios blancos con acabado liso y bordes de perlas.',                                 650.00,  'moderno', 'mediano', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600', 3),
    ('Delicia de Chocolate', 'Pastel de chocolate belga con relleno de ganache oscuro y frambuesas frescas. Cobertura de espejo brillante con decoración en oro comestible.',                          890.00,  'moderno', 'mediano', 'https://images.unsplash.com/photo-1562777717-dc6984f65a63?auto=format&fit=crop&q=80&w=600', 3),
    ('Primavera Floral',     'Pastel primaveral de 3 pisos con buttercream de vainilla y flores frescas de estación. Toques sutiles de limón y arándanos.',                                             560.00,  'rustico', 'mediano', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=600', 2),
    ('Lujo Dorado',          'Espectacular pastel de 5 pisos con aplicaciones de pan de oro 24k, perlas comestibles y flores de azúcar hiperrealistas. Máxima elegancia.',                             2500.00, 'clasico', 'grande',  'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&q=80&w=600', 1),
    ('Mini Aventura',        'Pastel pequeño de 2 pisos con diseño geométrico moderno. Relleno de crema de maracuyá y mango. Perfecto para bodas íntimas.',                                             290.00,  'moderno', 'pequeno', 'https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&q=80&w=600', 3),
    ('Bosque Encantado',     'Pastel temático con aspecto de tronco de árbol, decorado con hongos de merengue, musgo comestible y flores del bosque.',                                                 1100.00, 'rustico', 'grande',  'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=600', 2),
    ('Marfil Atemporal',     'Diseño clásico de 4 pisos con encaje real comestible, perlas y delicadas flores en pasta de goma. El epítome de la elegancia tradicional.',                              1800.00, 'clasico', 'grande',  'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&q=80&w=600', 1);

-- =============================================================
-- 4. PEDIDOS
-- =============================================================
CREATE TABLE pedidos (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id      INT             NULL,
    total           DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    estado          ENUM('pendiente','confirmado','en_proceso','enviado','entregado','cancelado') NOT NULL DEFAULT 'pendiente',
    fecha_creacion  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =============================================================
-- 5. DETALLE DEL PEDIDO (ítems individuales)
-- =============================================================
CREATE TABLE detalle_pedido (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id   INT             NOT NULL,
    pastel_id   INT             NULL,
    nombre      VARCHAR(255)    NOT NULL,
    precio      DECIMAL(10,2)   NOT NULL,
    cantidad    INT             NOT NULL DEFAULT 1,
    opciones    JSON            NULL COMMENT 'Sabores, relleno, decoración, etc.',
    creado_en   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (pastel_id) REFERENCES pasteles(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =============================================================
-- 6. RESEÑAS
-- =============================================================
CREATE TABLE resenas (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id      INT             NULL,
    nombre          VARCHAR(120)    NOT NULL,
    texto           TEXT            NOT NULL,
    calificacion    TINYINT UNSIGNED NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    creado_en       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =============================================================
-- 7. CONTACTOS (formulario de contacto)
-- =============================================================
CREATE TABLE contactos (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(120)    NOT NULL,
    email       VARCHAR(255)    NOT NULL,
    mensaje     TEXT            NOT NULL,
    leido       BOOLEAN         NOT NULL DEFAULT FALSE,
    creado_en   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =============================================================
-- 8. PERSONALIZACIONES (sesiones guardadas)
-- =============================================================
CREATE TABLE personalizaciones (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    sesion_id       VARCHAR(64)     NOT NULL,
    usuario_id      INT             NULL,
    datos_json      JSON            NOT NULL COMMENT 'Pasos de personalización',
    total           DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    creado_en       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =============================================================
-- 9. USUARIO ADMIN POR DEFECTO
--    Email:    admin@tallerdesabores.pe
--    Contraseña: admin123
-- =============================================================
INSERT INTO usuarios (nombre, email, password, rol) VALUES
    ('Administrador', 'admin@tallerdesabores.pe', '$2y$10$EjemploDeHash', 'admin');
-- ⚠ CAMBIA el hash por uno real generado con password_hash() en PHP
-- o usa:  SELECT SHA2('admin123', 256);  y reemplaza el hash manualmente.

-- =============================================================
-- 10. ÍNDICES ADICIONALES
-- =============================================================
CREATE INDEX idx_pedidos_usuario    ON pedidos(usuario_id);
CREATE INDEX idx_pasteles_estilo    ON pasteles(estilo);
CREATE INDEX idx_pasteles_tamano    ON pasteles(tamaño);
CREATE INDEX idx_resenas_usuario    ON resenas(usuario_id);
CREATE INDEX idx_contactos_leido    ON contactos(leido);
CREATE INDEX idx_personalizaciones_sesion ON personalizaciones(sesion_id);
