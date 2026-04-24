require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const { sequelize } = require('./models');
const { apiLimiter, sanitizeInput } = require('./middleware/security');
const { loginLimiter } = require('./middleware/security');

const app = express();

// ─── Xavfsizlik middlewarelari ────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Tezlik ───────────────────────────────────────────────────
app.use(compression());

// ─── Logging ──────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Body parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// ─── Input sanitizatsiya ──────────────────────────────────────
app.use(sanitizeInput);

// ─── Statik fayllar ───────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), { maxAge: '7d' }));

// ─── Rate limiting ────────────────────────────────────────────
app.use('/api/', apiLimiter);

// ─── Routelar ─────────────────────────────────────────────────
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', require('./routes/auth/authRoutes'));
app.use('/api/superadmin', require('./routes/superadmin/index'));
app.use('/api/admin', require('./routes/admin/index'));
app.use('/api/erp', require('./routes/erp/index'));

// ─── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Fastfoot ERP API ishlamoqda',
    version: '1.0.0',
    time: new Date().toISOString(),
    uptime: Math.floor(process.uptime()) + 's',
  });
});

// ─── 404 handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `${req.method} ${req.path} — topilmadi` });
});

// ─── Global error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Server xatosi yuz berdi'
    : err.message;
  if (status === 500) console.error('❌ Server error:', err.stack);
  res.status(status).json({ success: false, message });
});

// ─── Ishga tushirish ──────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const dbType = (process.env.DATABASE_URL || process.env.DATABASE_PRIVATE_URL || process.env.PGHOST)
  ? 'PostgreSQL'
  : 'SQLite';

sequelize.sync({ alter: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🚀 Fastfoot ERP API: http://localhost:${PORT}`);
      console.log(`📦 Database: ${dbType}`);
      console.log(`🔐 Xavfsizlik: Helmet + Rate Limit + Sanitize\n`);
    });
  })
  .catch(err => {
    console.error('❌ Database ulanmadi:', err.message);
    process.exit(1);
  });
