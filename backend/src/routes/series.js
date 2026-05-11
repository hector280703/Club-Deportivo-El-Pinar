const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/series
router.get('/', authMiddleware, async (req, res) => {
  try {
    const series = await prisma.serie.findMany({
      include: {
        _count: {
          select: { socios: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });
    res.json(series);
  } catch (err) {
    console.error('Series error:', err);
    res.status(500).json({ error: 'Error al obtener series.' });
  }
});

module.exports = router;
