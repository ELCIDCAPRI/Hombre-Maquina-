const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// POST /api/personalizaciones — save customization
router.post('/', async (req, res) => {
  try {
    const { sesion_id, datos_json, total } = req.body;

    if (!sesion_id || !datos_json) {
      return res.status(400).json({ ok: false, error: 'sesion_id y datos_json son obligatorios' });
    }

    const usuario_id = req.headers['authorization']
      ? (() => {
          try {
            const jwt = require('jsonwebtoken');
            const token = req.headers['authorization'].split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return decoded.id;
          } catch {
            return null;
          }
        })()
      : null;

    await pool.query(
      'INSERT INTO personalizaciones (sesion_id, usuario_id, datos_json, total) VALUES (?, ?, ?, ?)',
      [sesion_id, usuario_id, JSON.stringify(datos_json), total || 0]
    );

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('Error al guardar personalización:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
});

// GET /api/personalizaciones/:sesion_id
router.get('/:sesion_id', async (req, res) => {
  try {
    const { sesion_id } = req.params;

    const [rows] = await pool.query(
      'SELECT * FROM personalizaciones WHERE sesion_id = ? ORDER BY creado_en DESC LIMIT 1',
      [sesion_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Personalización no encontrada' });
    }

    return res.json({ ok: true, personalizacion: rows[0] });
  } catch (err) {
    console.error('Error al obtener personalización:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
});

module.exports = router;
