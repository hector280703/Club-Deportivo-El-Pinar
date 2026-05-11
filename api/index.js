import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('../backend/src/routes/auth'));
app.use('/api/series', require('../backend/src/routes/series'));
app.use('/api/socios', require('../backend/src/routes/socios'));
app.use('/api/pagos', require('../backend/src/routes/pagos'));
app.use('/api/dashboard', require('../backend/src/routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
