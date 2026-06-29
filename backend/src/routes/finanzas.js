const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();

// ─── GET /api/finanzas/estadisticas ───────────────────────────────────────────
// Must be before GET / to avoid route conflict
router.get('/estadisticas', authMiddleware, async (req, res) => {
  try {
    const anio = parseInt(req.query.anio) || new Date().getFullYear();

    // Totales generales del año
    const [ingresos, egresos] = await Promise.all([
      prisma.transaccion.aggregate({
        where: { tipo: 'ingreso', fecha: { gte: new Date(`${anio}-01-01`), lt: new Date(`${anio + 1}-01-01`) } },
        _sum: { monto: true },
      }),
      prisma.transaccion.aggregate({
        where: { tipo: 'egreso', fecha: { gte: new Date(`${anio}-01-01`), lt: new Date(`${anio + 1}-01-01`) } },
        _sum: { monto: true },
      }),
    ]);

    const totalIngresos = ingresos._sum.monto || 0;
    const totalEgresos = egresos._sum.monto || 0;
    const balanceNeto = totalIngresos - totalEgresos;

    // Historial mensual (12 meses del año seleccionado)
    const historialMensual = [];
    for (let mes = 1; mes <= 12; mes++) {
      const desde = new Date(`${anio}-${String(mes).padStart(2, '0')}-01`);
      const hasta = new Date(anio, mes, 1); // primer día del mes siguiente

      const [ing, egr] = await Promise.all([
        prisma.transaccion.aggregate({
          where: { tipo: 'ingreso', fecha: { gte: desde, lt: hasta } },
          _sum: { monto: true },
        }),
        prisma.transaccion.aggregate({
          where: { tipo: 'egreso', fecha: { gte: desde, lt: hasta } },
          _sum: { monto: true },
        }),
      ]);

      historialMensual.push({
        mes,
        ingresos: ing._sum.monto || 0,
        egresos: egr._sum.monto || 0,
        balance: (ing._sum.monto || 0) - (egr._sum.monto || 0),
      });
    }

    // Desglose por categoría
    const transaccionesPorCategoria = await prisma.transaccion.groupBy({
      by: ['categoria', 'tipo'],
      where: { fecha: { gte: new Date(`${anio}-01-01`), lt: new Date(`${anio + 1}-01-01`) } },
      _sum: { monto: true },
    });

    // Contar total de transacciones
    const totalTransacciones = await prisma.transaccion.count({
      where: { fecha: { gte: new Date(`${anio}-01-01`), lt: new Date(`${anio + 1}-01-01`) } },
    });

    res.json({
      anio,
      totales: { totalIngresos, totalEgresos, balanceNeto, totalTransacciones },
      historialMensual,
      porCategoria: transaccionesPorCategoria.map((t) => ({
        categoria: t.categoria,
        tipo: t.tipo,
        monto: t._sum.monto || 0,
      })),
    });
  } catch (err) {
    console.error('Finanzas estadisticas error:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas.' });
  }
});

// ─── GET /api/finanzas ────────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { tipo, categoria, mes, anio, page = 1, limit = 50 } = req.query;

    const where = {};
    if (tipo) where.tipo = tipo;
    if (categoria) where.categoria = categoria;
    if (mes || anio) {
      const a = parseInt(anio) || new Date().getFullYear();
      if (mes) {
        const m = parseInt(mes);
        const desde = new Date(a, m - 1, 1);
        const hasta = new Date(a, m, 1);
        where.fecha = { gte: desde, lt: hasta };
      } else {
        where.fecha = { gte: new Date(`${a}-01-01`), lt: new Date(`${a + 1}-01-01`) };
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transacciones, total] = await Promise.all([
      prisma.transaccion.findMany({
        where,
        orderBy: { fecha: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.transaccion.count({ where }),
    ]);

    res.json({ transacciones, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Finanzas GET error:', err);
    res.status(500).json({ error: 'Error al obtener transacciones.' });
  }
});

// ─── POST /api/finanzas ───────────────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tipo, categoria, descripcion, monto, fecha, notas } = req.body;

    if (!tipo || !categoria || !descripcion || !monto || !fecha) {
      return res.status(400).json({ error: 'Tipo, categoría, descripción, monto y fecha son requeridos.' });
    }

    if (!['ingreso', 'egreso'].includes(tipo)) {
      return res.status(400).json({ error: 'El tipo debe ser "ingreso" o "egreso".' });
    }

    const transaccion = await prisma.transaccion.create({
      data: {
        tipo,
        categoria,
        descripcion,
        monto: parseFloat(monto),
        fecha: new Date(fecha),
        notas: notas || null,
      },
    });

    res.status(201).json(transaccion);
  } catch (err) {
    console.error('Finanzas POST error:', err);
    res.status(500).json({ error: 'Error al crear transacción.' });
  }
});

// ─── PUT /api/finanzas/:id ────────────────────────────────────────────────────
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { tipo, categoria, descripcion, monto, fecha, notas } = req.body;

    const transaccion = await prisma.transaccion.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(tipo && { tipo }),
        ...(categoria && { categoria }),
        ...(descripcion && { descripcion }),
        ...(monto && { monto: parseFloat(monto) }),
        ...(fecha && { fecha: new Date(fecha) }),
        notas: notas !== undefined ? notas : undefined,
      },
    });

    res.json(transaccion);
  } catch (err) {
    console.error('Finanzas PUT error:', err);
    res.status(500).json({ error: 'Error al actualizar transacción.' });
  }
});

// ─── DELETE /api/finanzas/:id ─────────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.transaccion.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: 'Transacción eliminada.' });
  } catch (err) {
    console.error('Finanzas DELETE error:', err);
    res.status(500).json({ error: 'Error al eliminar transacción.' });
  }
});

module.exports = router;
