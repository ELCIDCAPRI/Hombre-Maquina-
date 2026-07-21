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

// GET /api/contactos/stats — admin: contact statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [total] = await pool.query('SELECT COUNT(*) AS total FROM contactos');
    const [leidos] = await pool.query('SELECT COUNT(*) AS total FROM contactos WHERE leido = TRUE');
    const [noLeidos] = await pool.query('SELECT COUNT(*) AS total FROM contactos WHERE leido = FALSE');

    return res.json({
      ok: true,
      stats: {
        total: total[0].total,
        leidos: leidos[0].total,
        noLeidos: noLeidos[0].total,
      },
    });
  } catch (err) {
    console.error('Error en stats de contactos:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
});

// PATCH /api/contactos/:id/leido — admin: toggle read status
router.patch('/:id/leido', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id, leido FROM contactos WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ ok: false, error: 'Contacto no encontrado' });
    }

    const nuevoEstado = !existing[0].leido;
    await pool.query('UPDATE contactos SET leido = ? WHERE id = ?', [nuevoEstado, id]);

    return res.json({ ok: true, leido: nuevoEstado });
  } catch (err) {
    console.error('Error al actualizar contacto:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
});

// DELETE /api/contactos/:id — admin: delete contact
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM contactos WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ ok: false, error: 'Contacto no encontrado' });
    }

    await pool.query('DELETE FROM contactos WHERE id = ?', [id]);
    return res.json({ ok: true, message: 'Contacto eliminado' });
  } catch (err) {
    console.error('Error al eliminar contacto:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
});

module.exports = router;
