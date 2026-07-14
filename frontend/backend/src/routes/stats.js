const express = require('express');
const pool = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/stats/dashboard — admin: general dashboard stats
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [usuarios] = await pool.query('SELECT COUNT(*) AS total FROM usuarios');
    const [productos] = await pool.query('SELECT COUNT(*) AS total FROM pasteles');
    const [pedidos] = await pool.query('SELECT COUNT(*) AS total FROM pedidos');
    const [resenas] = await pool.query('SELECT COUNT(*) AS total, COALESCE(AVG(calificacion), 0) AS promedio FROM resenas');
    const [contactos] = await pool.query('SELECT COUNT(*) AS total FROM contactos WHERE leido = FALSE');
    const [ingresos] = await pool.query('SELECT COALESCE(SUM(total), 0) AS total FROM pedidos WHERE estado != ?', ['cancelado']);
    const [pedidosPendientes] = await pool.query("SELECT COUNT(*) AS total FROM pedidos WHERE estado = 'pendiente'");
    const [stockBajo] = await pool.query('SELECT COUNT(*) AS total FROM pasteles WHERE stock <= 3');
    const [pedidosMes] = await pool.query(
      'SELECT COUNT(*) AS total FROM pedidos WHERE fecha_creacion >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );
    const [ingresosMes] = await pool.query(
      "SELECT COALESCE(SUM(total), 0) AS total FROM pedidos WHERE estado != 'cancelado' AND fecha_creacion >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
    );

    return res.json({
      ok: true,
      dashboard: {
        usuarios: usuarios[0].total,
        productos: productos[0].total,
        pedidos: pedidos[0].total,
        resenasTotal: resenas[0].total,
        resenasPromedio: Number(Number(resenas[0].promedio).toFixed(1)),
        contactosNoLeidos: contactos[0].total,
        ingresosTotales: Number(ingresos[0].total),
        pedidosPendientes: pedidosPendientes[0].total,
        stockBajo: stockBajo[0].total,
        pedidosMes: pedidosMes[0].total,
        ingresosMes: Number(ingresosMes[0].total),
      },
    });
  } catch (err) {
    console.error('Error en dashboard stats:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
});

module.exports = router;
