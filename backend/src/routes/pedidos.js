const express = require('express');
const pool = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/pedidos — create order
router.post('/', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { items, telefono, direccion, fechaEvento, notas } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ ok: false, error: 'El pedido debe tener al menos un ítem' });
    }

    await connection.beginTransaction();

    // Check and reserve stock
    for (const item of items) {
      if (item.pastel_id) {
        const [stockRows] = await connection.query(
          'SELECT id, stock, nombre FROM pasteles WHERE id = ? FOR UPDATE',
          [item.pastel_id]
        );
        if (stockRows.length === 0) {
          await connection.rollback();
          return res.status(400).json({ ok: false, error: `Pastel ID ${item.pastel_id} no encontrado` });
        }
        if (stockRows[0].stock < item.cantidad) {
          await connection.rollback();
          return res.status(400).json({
            ok: false,
            error: `Stock insuficiente para "${stockRows[0].nombre}". Disponible: ${stockRows[0].stock}, solicitado: ${item.cantidad}`,
          });
        }
        await connection.query(
          'UPDATE pasteles SET stock = stock - ? WHERE id = ?',
          [item.cantidad, item.pastel_id]
        );
      }
    }

    const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

    const [pedidoResult] = await connection.query(
      'INSERT INTO pedidos (usuario_id, total, estado) VALUES (?, ?, ?)',
      [req.user.id, total, 'pendiente']
    );

    const pedidoId = pedidoResult.insertId;

    const detalleValues = items.map((item) => [
      pedidoId,
      item.pastel_id || null,
      item.nombre,
      item.precio,
      item.cantidad,
      item.opciones ? JSON.stringify(item.opciones) : null,
    ]);

    await connection.query(
      'INSERT INTO detalle_pedido (pedido_id, pastel_id, nombre, precio, cantidad, opciones) VALUES ?',
      [detalleValues]
    );

    await connection.commit();

    return res.status(201).json({
      ok: true,
      pedido: { id: pedidoId, total, estado: 'pendiente', items },
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error al crear pedido:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  } finally {
    connection.release();
  }
});

// GET /api/pedidos — user's orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [pedidos] = await pool.query(
      'SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY fecha_creacion DESC',
      [req.user.id]
    );

    for (const pedido of pedidos) {
      const [detalles] = await pool.query(
        'SELECT * FROM detalle_pedido WHERE pedido_id = ?',
        [pedido.id]
      );
      pedido.items = detalles;
    }

    return res.json({ ok: true, pedidos });
  } catch (err) {
    console.error('Error al obtener pedidos:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
});

// GET /api/pedidos/all — admin: all orders with user info
router.get('/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [pedidos] = await pool.query(`
      SELECT p.*, u.nombre AS usuario_nombre, u.email AS usuario_email
      FROM pedidos p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY p.fecha_creacion DESC
    `);

    for (const pedido of pedidos) {
      const [detalles] = await pool.query(
        'SELECT * FROM detalle_pedido WHERE pedido_id = ?',
        [pedido.id]
      );
      pedido.items = detalles;
    }

    return res.json({ ok: true, pedidos });
  } catch (err) {
    console.error('Error al obtener todos los pedidos:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
});

// PATCH /api/pedidos/:id/estado — admin: update status
router.patch('/:id/estado', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['pendiente', 'confirmado', 'en_proceso', 'enviado', 'entregado', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ ok: false, error: `Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}` });
    }

    const [result] = await pool.query(
      'UPDATE pedidos SET estado = ? WHERE id = ?',
      [estado, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: 'Pedido no encontrado' });
    }

    return res.json({ ok: true, message: `Pedido ${id} actualizado a "${estado}"` });
  } catch (err) {
    console.error('Error al actualizar estado:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
});

// GET /api/pedidos/stats — admin: order statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [total] = await pool.query('SELECT COUNT(*) AS total FROM pedidos');
    const [ingresos] = await pool.query('SELECT COALESCE(SUM(total), 0) AS total FROM pedidos WHERE estado != ?', ['cancelado']);
    const [porEstado] = await pool.query('SELECT estado, COUNT(*) AS cantidad FROM pedidos GROUP BY estado');
    const [recientes] = await pool.query(
      'SELECT COUNT(*) AS cantidad FROM pedidos WHERE fecha_creacion >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );

    return res.json({
      ok: true,
      stats: {
        total: total[0].total,
        ingresosTotales: Number(ingresos[0].total),
        porEstado,
        ultimos30Dias: recientes[0].cantidad,
      },
    });
  } catch (err) {
    console.error('Error en stats de pedidos:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
});

// GET /api/pedidos/:id — admin: order detail
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [pedidos] = await pool.query(
      `SELECT p.*, u.nombre AS usuario_nombre, u.email AS usuario_email
       FROM pedidos p
       LEFT JOIN usuarios u ON p.usuario_id = u.id
       WHERE p.id = ?`,
      [id]
    );

    if (pedidos.length === 0) {
      return res.status(404).json({ ok: false, error: 'Pedido no encontrado' });
    }

    const pedido = pedidos[0];
    const [detalles] = await pool.query('SELECT * FROM detalle_pedido WHERE pedido_id = ?', [id]);
    pedido.items = detalles;

    return res.json({ ok: true, pedido });
  } catch (err) {
    console.error('Error al obtener pedido:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
});

// DELETE /api/pedidos/:id — admin: delete order
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;

    const [existing] = await connection.query('SELECT id, estado FROM pedidos WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ ok: false, error: 'Pedido no encontrado' });
    }

    await connection.beginTransaction();

    // Restore stock for items with pastel_id
    const [detalles] = await connection.query(
      'SELECT pastel_id, cantidad FROM detalle_pedido WHERE pedido_id = ? AND pastel_id IS NOT NULL',
      [id]
    );
    for (const d of detalles) {
      await connection.query('UPDATE pasteles SET stock = stock + ? WHERE id = ?', [d.cantidad, d.pastel_id]);
    }

    await connection.query('DELETE FROM detalle_pedido WHERE pedido_id = ?', [id]);
    await connection.query('DELETE FROM pedidos WHERE id = ?', [id]);

    await connection.commit();
    return res.json({ ok: true, message: 'Pedido eliminado' });
  } catch (err) {
    await connection.rollback();
    console.error('Error al eliminar pedido:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  } finally {
    connection.release();
  }
});

module.exports = router;
