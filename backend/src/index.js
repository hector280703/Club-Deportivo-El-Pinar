const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - Allow all Vercel domains and common origins
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3001',
      'http://localhost:3000',
      'https://club-deportivo-el-pinar.vercel.app',
      'https://hector-diaz-5-projects.vercel.app',
      'https://club-deportivo-el-pinar.onrender.com',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    // Allow any *.vercel.app domain in production
    if (origin && (origin.includes('vercel.app') || allowedOrigins.includes(origin))) {
      callback(null, true);
    } else if (!origin) {
      // Allow requests with no origin (like mobile apps or Curl requests)
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now - will restrict in production
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/series', require('./routes/series'));
app.use('/api/socios', require('./routes/socios'));
app.use('/api/pagos', require('./routes/pagos'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'El Pinar API funcionando ✅' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
