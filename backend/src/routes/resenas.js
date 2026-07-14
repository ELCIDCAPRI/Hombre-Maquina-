const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/resenas — list all reviews
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, u.nombre AS usuario_nombre
      FROM resenas r
      LEFT JOIN usuarios u ON r.usuario_id = u.id
      ORDER BY r.creado_en DESC
    `);

    return res.json({ ok: true, resenas: rows });
  } catch (err) {
    console.error('Error al listar reseñas:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
});

// POST /api/resenas — create review
router.post(
  '/',
  authenticateToken,
  [
    body('texto').trim().notEmpty().withMessage('El texto de la reseña es obligatorio'),
    body('calificacion').isInt({ min: 1, max: 5 }).withMessage('La calificación debe ser entre 1 y 5'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ ok: false, error: errors.array()[0].msg });
      }

      const { texto, calificacion } = req.body;
      const nombre = req.user.nombre;

      const [result] = await pool.query(
        'INSERT INTO resenas (usuario_id, nombre, texto, calificacion) VALUES (?, ?, ?, ?)',
        [req.user.id, nombre, texto, calificacion]
      );

      return res.status(201).json({
        ok: true,
        resena: { id: result.insertId, usuario_id: req.user.id, nombre, texto, calificacion },
      });
    } catch (err) {
      console.error('Error al crear reseña:', err);
      return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  }
);

module.exports = router;
