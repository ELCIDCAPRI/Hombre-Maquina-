require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const productosRoutes = require('./routes/productos');
const pedidosRoutes = require('./routes/pedidos');
const resenasRoutes = require('./routes/resenas');
const contactosRoutes = require('./routes/contactos');
const personalizacionesRoutes = require('./routes/personalizaciones');
const categoriasRoutes = require('./routes/categorias');
const statsRoutes = require('./routes/stats');

const app = express();

// ─── Seguridad y middlewares base ────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

// ─── Rate limiting ───────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Demasiadas peticiones, intenta más tarde.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Demasiados intentos de autenticación, intenta más tarde.' },
});

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

// ─── Rutas ───────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/resenas', resenasRoutes);
app.use('/api/contactos', contactosRoutes);
app.use('/api/personalizaciones', personalizacionesRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/stats', statsRoutes);

// ─── Health check ────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Taller de Sabores API funcionando 🎂' });
});

// ─── 404 ─────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ ok: false, error: 'Ruta no encontrada' });
});

// ─── Error handler ───────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('❌ Error no controlado:', err);
  res.status(err.status || 500).json({
    ok: false,
    error: process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message,
  });
});

// ─── Arrancar servidor ───────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀  Taller de Sabores API escuchando en http://localhost:${PORT}`);
  console.log(`📌  Entorno: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
