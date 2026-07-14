const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/productos — list with filters
router.get('/', async (req, res) => {
  try {
    const { search, estilo, tamaño, precio_min, precio_max, limit = 50, offset = 0 } = req.query;

    let sql = `
      SELECT p.*, c.nombre AS categoria_nombre
      FROM pasteles p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ' AND (p.nombre LIKE ? OR p.descripcion LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (estilo) {
      sql += ' AND p.estilo = ?';
      params.push(estilo);
    }
    if (tamaño) {
      sql += ' AND p.tamaño = ?';
      params.push(tamaño);
    }
    if (precio_min) {
      sql += ' AND p.precio >= ?';
      params.push(parseFloat(precio_min));
    }
    if (precio_max) {
      sql += ' AND p.precio <= ?';
      params.push(parseFloat(precio_max));
    }

    sql += ' ORDER BY p.id ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(sql, params);

    return res.json({ ok: true, productos: rows });
  } catch (err) {
    console.error('Error al listar pasteles:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
});

// GET /api/productos/featured
router.get('/featured', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, c.nombre AS categoria_nombre
      FROM pasteles p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.id ASC
      LIMIT 3
    `);

    return res.json({ ok: true, productos: rows });
  } catch (err) {
    console.error('Error al obtener destacados:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
});

// GET /api/productos/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT p.*, c.nombre AS categoria_nombre
       FROM pasteles p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Pastel no encontrado' });
    }

    return res.json({ ok: true, producto: rows[0] });
  } catch (err) {
    console.error('Error al obtener pastel:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
});

// POST /api/productos — admin: create product
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  [
    body('nombre').trim().notEmpty().withMessage('Nombre es obligatorio'),
    body('descripcion').trim().notEmpty().withMessage('Descripción es obligatoria'),
    body('precio').isFloat({ min: 0 }).withMessage('Precio inválido'),
    body('estilo').trim().notEmpty().withMessage('Estilo es obligatorio'),
    body('tamaño').isIn(['pequeno', 'mediano', 'grande']).withMessage('Tamaño inválido'),
    body('imagen_url').trim().notEmpty().withMessage('URL de imagen es obligatoria'),
    body('stock').isInt({ min: 0 }).withMessage('Stock debe ser un número entero no negativo'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ ok: false, error: errors.array()[0].msg });
      }

      const { nombre, descripcion, precio, estilo, tamaño, imagen_url, stock, categoria_id } = req.body;

      const [result] = await pool.query(
        'INSERT INTO pasteles (nombre, descripcion, precio, estilo, tamaño, imagen_url, stock, categoria_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [nombre, descripcion, precio, estilo, tamaño, imagen_url, stock || 0, categoria_id || null]
      );

      return res.status(201).json({
        ok: true,
        producto: { id: result.insertId, nombre, descripcion, precio, estilo, tamaño, imagen_url, stock: stock || 0, categoria_id },
      });
    } catch (err) {
      console.error('Error al crear pastel:', err);
      return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  }
);

// PUT /api/productos/:id — admin: update product
router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  [
    body('nombre').optional().trim().notEmpty().withMessage('Nombre no puede estar vacío'),
    body('precio').optional().isFloat({ min: 0 }).withMessage('Precio inválido'),
    body('tamaño').optional().isIn(['pequeno', 'mediano', 'grande']).withMessage('Tamaño inválido'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock debe ser un número entero no negativo'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ ok: false, error: errors.array()[0].msg });
      }

      const { id } = req.params;
      const { nombre, descripcion, precio, estilo, tamaño, imagen_url, stock, categoria_id } = req.body;

      const [existing] = await pool.query('SELECT id FROM pasteles WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ ok: false, error: 'Pastel no encontrado' });
      }

      const updates = [];
      const params = [];

      if (nombre !== undefined) { updates.push('nombre = ?'); params.push(nombre); }
      if (descripcion !== undefined) { updates.push('descripcion = ?'); params.push(descripcion); }
      if (precio !== undefined) { updates.push('precio = ?'); params.push(precio); }
      if (estilo !== undefined) { updates.push('estilo = ?'); params.push(estilo); }
      if (tamaño !== undefined) { updates.push('tamaño = ?'); params.push(tamaño); }
      if (imagen_url !== undefined) { updates.push('imagen_url = ?'); params.push(imagen_url); }
      if (stock !== undefined) { updates.push('stock = ?'); params.push(stock); }
      if (categoria_id !== undefined) { updates.push('categoria_id = ?'); params.push(categoria_id); }

      if (updates.length === 0) {
        return res.status(400).json({ ok: false, error: 'No hay campos para actualizar' });
      }

      params.push(id);
      await pool.query(`UPDATE pasteles SET ${updates.join(', ')} WHERE id = ?`, params);

      return res.json({ ok: true, message: 'Pastel actualizado' });
    } catch (err) {
      console.error('Error al actualizar pastel:', err);
      return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  }
);

// DELETE /api/productos/:id — admin: delete product
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM pasteles WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ ok: false, error: 'Pastel no encontrado' });
    }

    await pool.query('DELETE FROM pasteles WHERE id = ?', [id]);
    return res.json({ ok: true, message: 'Pastel eliminado' });
  } catch (err) {
    console.error('Error al eliminar pastel:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
});

module.exports = router;
