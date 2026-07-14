require('dotenv').config();

const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function seed() {
  try {
    console.log('🌱  Iniciando seed de la base de datos...');

    // 1. Admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol)
       SELECT ?, ?, ?, ?
       WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = ?)`,
      ['Administrador', 'admin@gmail.com', hashedPassword, 'admin', 'admin@gmail.com']
    );
    console.log('✅  Admin insertado (o ya existía)');

    // 2. Categories
    const categories = [
      ['Clásico', 'clasico'],
      ['Rústico', 'rustico'],
      ['Moderno', 'moderno'],
    ];
    for (const [nombre, slug] of categories) {
      await pool.query(
        'INSERT IGNORE INTO categorias (nombre, slug) VALUES (?, ?)',
        [nombre, slug]
      );
    }
    console.log('✅  Categorías insertadas');

    // 3. Pasteles (12 cakes from basededatos.sql)
    const pasteles = [
      ['Elegancia Blanca', 'Clásico pastel de vainilla con relleno de frutos rojos y cobertura de fondant suizo. Tres pisos impecables con detalles en encaje comestible.', 450.00, 'clasico', 'mediano', 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&q=80&w=600', 10, 1],
      ['Romance Rústico', 'Naked cake de zanahoria con frosting de queso crema y detalles florales naturales. Ideal para bodas al aire libre o estilo boho.', 380.00, 'rustico', 'pequeno', 'https://images.unsplash.com/photo-1559553156-2e97137af16f?auto=format&fit=crop&q=80&w=600', 15, 2],
      ['Encanto Botánico', 'Elegante combinación de bizcocho al desnudo y crema texturizada, coronada con un arreglo floral silvestre de temporada.', 850.00, 'rustico', 'grande', 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&q=80&w=600', 8, 2],
      ['Cascada de Rosas', 'Majestuoso pastel de 4 pisos con cascada de rosas de azúcar hechas a mano. Acabado en fondant satinado con detalles en pan de oro.', 1200.00, 'clasico', 'grande', 'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?auto=format&fit=crop&q=80&w=600', 5, 1],
      ['Boho Dulzura', 'Diseño rústico de cuatro pisos con acabado semi-naked y drip cake de caramelo. Decorado con mini donas espolvoreadas y eucalipto fresco.', 720.00, 'rustico', 'grande', 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&q=80&w=600', 7, 2],
      ['Ilusión Floral', 'Diseño de vanguardia con efecto flotante. Cámara central transparente que encapsula lirios blancos con acabado liso y bordes de perlas.', 650.00, 'moderno', 'mediano', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600', 12, 3],
      ['Delicia de Chocolate', 'Pastel de chocolate belga con relleno de ganache oscuro y frambuesas frescas. Cobertura de espejo brillante con decoración en oro comestible.', 890.00, 'moderno', 'mediano', 'https://images.unsplash.com/photo-1562777717-dc6984f65a63?auto=format&fit=crop&q=80&w=600', 9, 3],
      ['Primavera Floral', 'Pastel primaveral de 3 pisos con buttercream de vainilla y flores frescas de estación. Toques sutiles de limón y arándanos.', 560.00, 'rustico', 'mediano', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=600', 11, 2],
      ['Lujo Dorado', 'Espectacular pastel de 5 pisos con aplicaciones de pan de oro 24k, perlas comestibles y flores de azúcar hiperrealistas. Máxima elegancia.', 2500.00, 'clasico', 'grande', 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&q=80&w=600', 3, 1],
      ['Mini Aventura', 'Pastel pequeño de 2 pisos con diseño geométrico moderno. Relleno de crema de maracuyá y mango. Perfecto para bodas íntimas.', 290.00, 'moderno', 'pequeno', 'https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&q=80&w=600', 20, 3],
      ['Bosque Encantado', 'Pastel temático con aspecto de tronco de árbol, decorado con hongos de merengue, musgo comestible y flores del bosque.', 1100.00, 'rustico', 'grande', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=600', 6, 2],
      ['Marfil Atemporal', 'Diseño clásico de 4 pisos con encaje real comestible, perlas y delicadas flores en pasta de goma. El epítome de la elegancia tradicional.', 1800.00, 'clasico', 'grande', 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&q=80&w=600', 4, 1],
    ];

    for (const [nombre, descripcion, precio, estilo, tamaño, imagen_url, stock, categoria_id] of pasteles) {
      await pool.query(
        'INSERT IGNORE INTO pasteles (nombre, descripcion, precio, estilo, tamaño, imagen_url, stock, categoria_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [nombre, descripcion, precio, estilo, tamaño, imagen_url, stock, categoria_id]
      );
    }
    console.log('✅  12 pasteles insertados');

    console.log('🎉  Seed completado exitosamente');
    process.exit(0);
  } catch (err) {
    console.error('❌  Error durante el seed:', err);
    process.exit(1);
  }
}

seed();
