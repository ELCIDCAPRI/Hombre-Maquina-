const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('nombre').trim().notEmpty().withMessage('Nombre es obligatorio'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ ok: false, error: errors.array()[0].msg });
      }

      const { nombre, email, password } = req.body;

      const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(400).json({ ok: false, error: 'El email ya está registrado' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await pool.query(
        'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
        [nombre, email, hashedPassword, 'cliente']
      );

      return res.status(201).json({ ok: true });
    } catch (err) {
      console.error('Error en register:', err);
      return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Contraseña requerida'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ ok: false, error: errors.array()[0].msg });
      }

      const { email, password } = req.body;

      const [rows] = await pool.query(
        'SELECT id, nombre, email, password, rol FROM usuarios WHERE email = ?',
        [email]
      );

      if (rows.length === 0) {
        return res.status(401).json({ ok: false, error: 'Credenciales incorrectas' });
      }

      const user = rows[0];
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ ok: false, error: 'Credenciales incorrectas' });
      }

      const token = jwt.sign(
        { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return res.json({
        ok: true,
        user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
        token,
      });
    } catch (err) {
      console.error('Error en login:', err);
      return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  }
);

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, email, rol, creado_en FROM usuarios WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    }

    return res.json({ ok: true, user: rows[0] });
  } catch (err) {
    console.error('Error en /me:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
});

// GET /api/auth/users — admin only
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, email, rol, creado_en FROM usuarios ORDER BY creado_en DESC'
    );

    return res.json({ ok: true, users: rows });
  } catch (err) {
    console.error('Error en /users:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
});

module.exports = router;
