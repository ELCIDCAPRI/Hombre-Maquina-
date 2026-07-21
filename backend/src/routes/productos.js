const express = require('express');
const pool = require('../config/db');

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

module.exports = router;
