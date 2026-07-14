const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/categorias — list all categories
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categorias ORDER BY id ASC');
    return res.json({ ok: true, categorias: rows });
  } catch (err) {
    console.error('Error al listar categorías:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
});

// POST /api/categorias — admin: create category
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  [
    body('nombre').trim().notEmpty().withMessage('Nombre es obligatorio'),
    body('slug').trim().notEmpty().withMessage('Slug es obligatorio'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ ok: false, error: errors.array()[0].msg });
      }

      const { nombre, slug } = req.body;

      const [existing] = await pool.query('SELECT id FROM categorias WHERE nombre = ? OR slug = ?', [nombre, slug]);
      if (existing.length > 0) {
        return res.status(400).json({ ok: false, error: 'Ya existe una categoría con ese nombre o slug' });
      }

      const [result] = await pool.query(
        'INSERT INTO categorias (nombre, slug) VALUES (?, ?)',
        [nombre, slug]
      );

      return res.status(201).json({ ok: true, categoria: { id: result.insertId, nombre, slug } });
    } catch (err) {
      console.error('Error al crear categoría:', err);
      return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  }
);

// PUT /api/categorias/:id — admin: update category
router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  [
    body('nombre').optional().trim().notEmpty().withMessage('Nombre no puede estar vacío'),
    body('slug').optional().trim().notEmpty().withMessage('Slug no puede estar vacío'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ ok: false, error: errors.array()[0].msg });
      }

      const { id } = req.params;
      const { nombre, slug } = req.body;

      const [existing] = await pool.query('SELECT id FROM categorias WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ ok: false, error: 'Categoría no encontrada' });
      }

      const updates = [];
      const params = [];
      if (nombre) { updates.push('nombre = ?'); params.push(nombre); }
      if (slug) { updates.push('slug = ?'); params.push(slug); }

      if (updates.length === 0) {
        return res.status(400).json({ ok: false, error: 'No hay campos para actualizar' });
      }

      params.push(id);
      await pool.query(`UPDATE categorias SET ${updates.join(', ')} WHERE id = ?`, params);

      return res.json({ ok: true, message: 'Categoría actualizada' });
    } catch (err) {
      console.error('Error al actualizar categoría:', err);
      return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  }
);

// DELETE /api/categorias/:id — admin: delete category
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM categorias WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ ok: false, error: 'Categoría no encontrada' });
    }

    await pool.query('DELETE FROM categorias WHERE id = ?', [id]);
    return res.json({ ok: true, message: 'Categoría eliminada' });
  } catch (err) {
    console.error('Error al eliminar categoría:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
});

module.exports = router;
