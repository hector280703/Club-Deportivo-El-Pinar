const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
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
app.use('/api/auth', require('../backend/src/routes/auth'));
app.use('/api/series', require('../backend/src/routes/series'));
app.use('/api/socios', require('../backend/src/routes/socios'));
app.use('/api/pagos', require('../backend/src/routes/pagos'));
app.use('/api/dashboard', require('../backend/src/routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

module.exports = app;
