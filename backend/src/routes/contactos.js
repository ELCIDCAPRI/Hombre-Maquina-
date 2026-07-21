const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/contactos — submit contact form
router.post(
  '/',
  [
    body('nombre').trim().notEmpty().withMessage('Nombre es obligatorio'),
    body('email').isEmail().withMessage('Email inválido'),
    body('mensaje').trim().notEmpty().withMessage('Mensaje es obligatorio'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ ok: false, error: errors.array()[0].msg });
      }

      const { nombre, email, mensaje } = req.body;

      await pool.query(
        'INSERT INTO contactos (nombre, email, mensaje) VALUES (?, ?, ?)',
        [nombre, email, mensaje]
      );

      return res.status(201).json({ ok: true });
    } catch (err) {
      console.error('Error al crear contacto:', err);
      return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  }
);

// GET /api/contactos — admin: list all contacts
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM contactos ORDER BY creado_en DESC');

    return res.json({ ok: true, contactos: rows });
  } catch (err) {
    console.error('Error al listar contactos:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
});

module.exports = router;
