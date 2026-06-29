const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - CORS dinámico para permitir localhost y Vercel
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.startsWith('http://localhost') || origin.endsWith('.vercel.app') || origin === process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/series', require('./routes/series'));
app.use('/api/socios', require('./routes/socios'));
app.use('/api/pagos', require('./routes/pagos'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/finanzas', require('./routes/finanzas'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'El Pinar API funcionando ✅' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
