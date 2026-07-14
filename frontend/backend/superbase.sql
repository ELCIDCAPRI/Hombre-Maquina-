CREATE DATABASE IF NOT EXISTS taller_de_sabores CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE taller_de_sabores;

DROP TABLE IF EXISTS personalizaciones;
DROP TABLE IF EXISTS detalle_pedido;
DROP TABLE IF EXISTS resenas;
DROP TABLE IF EXISTS contactos;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS pasteles;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;

-- 1. USUARIOS
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('cliente','admin') NOT NULL DEFAULT 'cliente',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO usuarios (nombre, email, password, rol, creado_en) VALUES
('Administrador', 'admin@gmail.com', '$2a$10$hZiqU1tCjZKRFxaKLHZnRe6IjBM83xPT6WW8hCumDfdt8qjb.MpZm', 'admin', '2026-01-10 08:00:00'),
('Maria Lopez', 'maria@gmail.com', '$2a$10$YBwK5vK7EDcs1OFwSUButu3XocrbhFL9NqTDHo9C69Snkm5Z.aYcC', 'cliente', '2026-02-14 10:30:00'),
('Carlos Rodriguez', 'carlos@gmail.com', '$2a$10$6l4.Low76iNjRh16Un1z9OWb3duXNCOHXZ7fg.MVA9g1/1x5K95KG', 'cliente', '2026-03-01 15:45:00'),
('Ana Garcia', 'ana@gmail.com', '$2a$10$YBwK5vK7EDcs1OFwSUButu3XocrbhFL9NqTDHo9C69Snkm5Z.aYcC', 'cliente', '2026-03-20 09:15:00'),
('Pedro Sanchez', 'pedro@gmail.com', '$2a$10$6l4.Low76iNjRh16Un1z9OWb3duXNCOHXZ7fg.MVA9g1/1x5K95KG', 'cliente', '2026-04-05 11:20:00'),
('Lucia Fernandez', 'lucia@gmail.com', '$2a$10$YBwK5vK7EDcs1OFwSUButu3XocrbhFL9NqTDHo9C69Snkm5Z.aYcC', 'cliente', '2026-04-18 14:00:00'),
('Miguel Torres', 'miguel@gmail.com', '$2a$10$6l4.Low76iNjRh16Un1z9OWb3duXNCOHXZ7fg.MVA9g1/1x5K95KG', 'cliente', '2026-05-02 16:30:00'),
('Sofia Ramirez', 'sofia@gmail.com', '$2a$10$YBwK5vK7EDcs1OFwSUButu3XocrbhFL9NqTDHo9C69Snkm5Z.aYcC', 'cliente', '2026-05-15 08:45:00');

-- 2. CATEGORIAS
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL UNIQUE,
    slug VARCHAR(60) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO categorias (nombre, slug) VALUES
('Clasico', 'clasico'),
('Rustico', 'rustico'),
('Moderno', 'moderno');

-- 3. PASTELES
CREATE TABLE pasteles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    estilo VARCHAR(60) NOT NULL,
    tamano ENUM('pequeno','mediano','grande') NOT NULL DEFAULT 'mediano',
    imagen_url VARCHAR(500) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    categoria_id INT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO pasteles (id, nombre, descripcion, precio, estilo, tamano, imagen_url, stock, categoria_id) VALUES
(1, 'Elegancia Blanca', 'Clasico pastel de vainilla con relleno de frutos rojos y cobertura de fondant suizo.', 450.00, 'clasico', 'mediano', 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&q=80&w=600', 10, 1),
(2, 'Romance Rustico', 'Naked cake de zanahoria con frosting de queso crema y detalles florales naturales.', 380.00, 'rustico', 'pequeno', 'https://images.unsplash.com/photo-1559553156-2e97137af16f?auto=format&fit=crop&q=80&w=600', 15, 2),
(3, 'Encanto Botanico', 'Elegante combinacion de bizcocho al desnudo y crema texturizada con arreglo floral.', 850.00, 'rustico', 'grande', 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&q=80&w=600', 8, 2),
(4, 'Cascada de Rosas', 'Majestuoso pastel de 4 pisos con cascada de rosas de azucar y pan de oro.', 1200.00, 'clasico', 'grande', 'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?auto=format&fit=crop&q=80&w=600', 5, 1),
(5, 'Boho Dulzura', 'Diseno rustico de cuatro pisos con drip cake de caramelo y eucalipto fresco.', 720.00, 'rustico', 'grande', 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&q=80&w=600', 7, 2),
(6, 'Ilusion Floral', 'Diseno de vanguardia con efecto flotante y bordes de perlas.', 650.00, 'moderno', 'mediano', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600', 12, 3),
(7, 'Delicia de Chocolate', 'Pastel de chocolate belga con ganache oscuro y decoracion en oro comestible.', 890.00, 'moderno', 'mediano', 'https://images.unsplash.com/photo-1562777717-dc6984f65a63?auto=format&fit=crop&q=80&w=600', 9, 3),
(8, 'Primavera Floral', 'Pastel primaveral de 3 pisos con buttercream de vainilla y flores frescas.', 560.00, 'rustico', 'mediano', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=600', 11, 2),
(9, 'Lujo Dorado', 'Espectacular pastel de 5 pisos con pan de oro 24k y flores de azucar.', 2500.00, 'clasico', 'grande', 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&q=80&w=600', 3, 1),
(10, 'Mini Aventura', 'Pastel pequeno de 2 pisos con diseno geometrico moderno.', 290.00, 'moderno', 'pequeno', 'https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&q=80&w=600', 20, 3),
(11, 'Bosque Encantado', 'Pastel tematico con aspecto de tronco de arbol y musgo comestible.', 1100.00, 'rustico', 'grande', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=600', 6, 2),
(12, 'Marfil Atemporal', 'Diseno clasico de 4 pisos con encaje real y flores en pasta de goma.', 1800.00, 'clasico', 'grande', 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&q=80&w=600', 4, 1);

-- 4. PEDIDOS
CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    estado ENUM('pendiente','confirmado','en_proceso','enviado','entregado','cancelado') NOT NULL DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO pedidos (id, usuario_id, total, estado, fecha_creacion) VALUES
(1, 2, 850.00, 'entregado', '2026-02-20 10:00:00'),
(2, 3, 1200.00, 'entregado', '2026-03-10 14:30:00'),
(3, 4, 450.00, 'entregado', '2026-03-28 09:00:00'),
(4, 5, 1570.00, 'en_proceso', '2026-04-15 11:45:00'),
(5, 2, 380.00, 'confirmado', '2026-05-01 16:20:00'),
(6, 6, 2500.00, 'en_proceso', '2026-05-10 08:30:00'),
(7, 7, 650.00, 'pendiente', '2026-05-20 13:15:00'),
(8, 8, 890.00, 'confirmado', '2026-06-01 10:00:00'),
(9, 3, 560.00, 'pendiente', '2026-06-10 15:45:00'),
(10, 4, 1800.00, 'enviado', '2026-06-15 09:30:00');

-- 5. DETALLE DEL PEDIDO
CREATE TABLE detalle_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    pastel_id INT NULL,
    nombre VARCHAR(255) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    opciones JSON NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (pastel_id) REFERENCES pasteles(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO detalle_pedido (pedido_id, pastel_id, nombre, precio, cantidad, opciones) VALUES
(1, 3, 'Encanto Botanico', 850.00, 1, '{"sabor": "vainilla", "relleno": "frambuesa"}'),
(2, 4, 'Cascada de Rosas', 1200.00, 1, '{"sabor": "chocolate", "relleno": "ganache"}'),
(3, 1, 'Elegancia Blanca', 450.00, 1, '{"sabor": "vainilla", "relleno": "frutos rojos"}'),
(4, 9, 'Lujo Dorado', 2500.00, 1, '{"sabor": "red velvet", "relleno": "crema queso"}'),
(4, 10, 'Mini Aventura', 290.00, 1, '{"sabor": "maracuya", "relleno": "mango"}'),
(5, 2, 'Romance Rustico', 380.00, 1, '{"sabor": "zanahoria", "relleno": "queso crema"}'),
(6, 9, 'Lujo Dorado', 2500.00, 1, '{"sabor": "chocolate", "relleno": "ganache"}'),
(7, 6, 'Ilusion Floral', 650.00, 1, '{"sabor": "vainilla", "relleno": "durazno"}'),
(8, 7, 'Delicia de Chocolate', 890.00, 1, '{"sabor": "chocolate belga", "relleno": "ganache oscuro"}'),
(9, 8, 'Primavera Floral', 560.00, 1, '{"sabor": "vainilla limon", "relleno": "arandanos"}'),
(10, 12, 'Marfil Atemporal', 1800.00, 1, '{"sabor": "almendra", "relleno": "crema pastelera"}');

-- 6. RESENAS
CREATE TABLE resenas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,
    nombre VARCHAR(120) NOT NULL,
    texto TEXT NOT NULL,
    calificacion TINYINT UNSIGNED NOT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO resenas (usuario_id, nombre, texto, calificacion, creado_en) VALUES
(2, 'Maria Lopez', 'El pastel Encanto Botanico fue ESPECTACULAR. Todos los invitados quedaron encantados con el diseno y el sabor. 100% recomendado!', 5, '2026-03-01 14:00:00'),
(3, 'Carlos Rodriguez', 'La Cascada de Rosas supero todas nuestras expectativas. El pan de oro le dio un toque de elegancia impresionante.', 5, '2026-03-20 10:30:00'),
(4, 'Ana Garcia', 'Pedimos la Elegancia Blanca para nuestro aniversario y fue perfecta. El fondant suizo estaba delicioso.', 5, '2026-04-05 16:45:00'),
(5, 'Pedro Sanchez', 'El Lujo Dorado fue la estrella de la noche. El pan de oro 24k y las flores de azucar dejaron a todos boquiabiertos.', 5, '2026-04-25 11:20:00'),
(6, 'Lucia Fernandez', 'Muy buen servicio y el pastel bonito, pero el tiempo de entrega fue un poco largo. El sabor estaba delicioso.', 4, '2026-05-15 09:00:00'),
(7, 'Miguel Torres', 'La Ilusion Floral es una obra de arte. El efecto flotante quedo exactamente como en las fotos. Servicio excepcional.', 5, '2026-06-05 13:30:00'),
(8, 'Sofia Ramirez', 'La Delicia de Chocolate es simplemente DIVINA. El chocolate belga con ganache oscuro es una combinacion ganadora.', 5, '2026-06-20 15:15:00'),
(3, 'Carlos Rodriguez', 'Segundo pedido y no me arrepiento. La Primavera Floral fue espectacular. Definitivamente volveremos.', 5, '2026-07-01 10:00:00'),
(2, 'Maria Lopez', 'El Romance Rustico para mi baby shower fue perfecto. El estilo boho quedo exactamente como lo habiamos imaginado.', 5, '2026-07-05 11:45:00'),
(4, 'Ana Garcia', 'Buen pastel pero la decoracion no fue exactamente como la foto. El sabor fue excelente though.', 4, '2026-07-08 14:30:00');

-- 7. CONTACTOS
CREATE TABLE contactos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    leido BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO contactos (nombre, email, mensaje, leido, creado_en) VALUES
('Andrea Morales', 'andrea@gmail.com', 'Hola, me gustaria hacer un pedido para mi boda en septiembre. Tienen disponibilidad?', 1, '2026-06-01 09:00:00'),
('Roberto Diaz', 'roberto@gmail.com', 'Necesito informacion sobre precios para un pastel de 3 pisos para 150 personas.', 1, '2026-06-05 14:20:00'),
('Camila Vargas', 'camila@gmail.com', 'Vi sus pasteles en Instagram y me encantaron. Es posible hacer un pastel personalizado?', 0, '2026-06-10 11:30:00'),
('Jorge Castillo', 'jorge@gmail.com', 'Quisiera hacer un pedido urgente para este fin de semana. El evento es para 50 personas.', 0, '2026-06-15 08:15:00'),
('Valeria Ramos', 'valeria@gmail.com', 'Hola, me encantaria saber si ofrecen degustaciones antes de cerrar el pedido. Mi boda es en octubre.', 1, '2026-06-20 16:45:00'),
('Fernando Reyes', 'fernando@gmail.com', 'Tienen opciones sin gluten? Mi novia es celaca y queremos que todos puedan disfrutar del pastel.', 0, '2026-06-25 10:00:00'),
('Isabella Guerrero', 'isabella@gmail.com', 'Queria felicitarlos por el trabajo increible. El pastel que pedimos fue perfecto. Ya los recomende!', 1, '2026-07-01 12:30:00'),
('Daniel Munoz', 'daniel@gmail.com', 'Tienen estacionamiento? Quiero ir a ver los modelos de pasteles en persona.', 1, '2026-07-05 15:00:00'),
('Paula Guerrero', 'paula@gmail.com', 'Me gustaria hacer un pedido para 200 personas. Que precios manejan para eventos de esa cantidad?', 0, '2026-07-08 09:45:00'),
('Mateo Silva', 'mateo@gmail.com', 'Hola, estamos buscando pasteleria para nuestra boda en noviembre. Que tan anticipado debemos hacer el pedido?', 0, '2026-07-10 11:00:00');

-- 8. PERSONALIZACIONES
CREATE TABLE personalizaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sesion_id VARCHAR(64) NOT NULL,
    usuario_id INT NULL,
    datos_json JSON NOT NULL,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO personalizaciones (sesion_id, usuario_id, datos_json, total, creado_en) VALUES
('sess_abc123', 2, '{"paso1": {"estilo": "rustico", "pisos": 3}, "paso2": {"sabor": "zanahoria"}, "paso3": {"decoracion": "flores naturales"}}', 950.00, '2026-02-18 10:00:00'),
('sess_def456', 3, '{"paso1": {"estilo": "clasico", "pisos": 4}, "paso2": {"sabor": "chocolate"}, "paso3": {"decoracion": "rosas de azucar"}}', 1350.00, '2026-03-08 14:00:00'),
('sess_ghi789', 5, '{"paso1": {"estilo": "moderno", "pisos": 2}, "paso2": {"sabor": "vainilla"}, "paso3": {"decoracion": "perlas"}}', 520.00, '2026-04-12 09:30:00');

-- 9. INDICES
CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX idx_pasteles_estilo ON pasteles(estilo);
CREATE INDEX idx_pasteles_tamano ON pasteles(tamano);
CREATE INDEX idx_resenas_usuario ON resenas(usuario_id);
CREATE INDEX idx_contactos_leido ON contactos(leido);
CREATE INDEX idx_personalizaciones_sesion ON personalizaciones(sesion_id);
