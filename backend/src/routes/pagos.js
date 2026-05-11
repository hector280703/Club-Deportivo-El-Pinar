const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/pagos/resumen-anual?anio=2026&serieId=1
router.get('/resumen-anual', authMiddleware, async (req, res) => {
  try {
    const anio = parseInt(req.query.anio) || new Date().getFullYear();
    const serieId = req.query.serieId ? parseInt(req.query.serieId) : undefined;

    // Obtener todas las combinaciones (socio, serie) activas
    const socioSeries = await prisma.socioSerie.findMany({
      where: {
        ...(serieId && { serieId }),
        socio: { activo: true },
      },
      include: {
        socio: true,
        serie: true,
      },
      orderBy: [{ serie: { nombre: 'asc' } }, { socio: { apellido: 'asc' } }],
    });

    const data = await Promise.all(socioSeries.map(async (ss) => {
      const pagos = await prisma.pago.findMany({
        where: { socioId: ss.socioId, serieId: ss.serieId, anio },
      });
      const pagosPorMes = {};
      for (const p of pagos) pagosPorMes[p.mes] = p;
      return {
        socioId: ss.socioId,
        serieId: ss.serieId,
        nombre: ss.socio.nombre,
        apellido: ss.socio.apellido,
        rut: ss.socio.rut,
        serie: ss.serie,
        pagos: pagosPorMes,
      };
    }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener resumen anual.' });
  }
});

// GET /api/pagos
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { socioId, mes, anio, serieId, estado } = req.query;
    const where = {};
    if (socioId) where.socioId = parseInt(socioId);
    if (mes) where.mes = parseInt(mes);
    if (anio) where.anio = parseInt(anio);
    if (estado) where.estado = estado;
    if (serieId) where.serieId = parseInt(serieId);

    const pagos = await prisma.pago.findMany({
      where,
      include: { socio: true, serie: true },
      orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
    });
    res.json(pagos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pagos.' });
  }
});

// POST /api/pagos
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { socioId, serieId, mes, anio, monto, estado, fechaPago, notas } = req.body;
    if (!socioId || !serieId || !mes || !anio || !monto) {
      return res.status(400).json({ error: 'Socio, serie, mes, año y monto son requeridos.' });
    }

    const pago = await prisma.pago.upsert({
      where: { socioId_serieId_mes_anio: { socioId: parseInt(socioId), serieId: parseInt(serieId), mes: parseInt(mes), anio: parseInt(anio) } },
      update: { monto: parseFloat(monto), estado: estado || 'pendiente', fechaPago: fechaPago ? new Date(fechaPago) : null, notas },
      create: {
        socioId: parseInt(socioId), serieId: parseInt(serieId),
        mes: parseInt(mes), anio: parseInt(anio),
        monto: parseFloat(monto), estado: estado || 'pendiente',
        fechaPago: fechaPago ? new Date(fechaPago) : null, notas,
      },
      include: { socio: true, serie: true },
    });
    res.status(201).json(pago);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar pago.' });
  }
});

// PUT /api/pagos/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { estado, fechaPago, monto, notas } = req.body;
    const pago = await prisma.pago.update({
      where: { id: parseInt(req.params.id) },
      data: {
        estado,
        monto: monto ? parseFloat(monto) : undefined,
        fechaPago: fechaPago ? new Date(fechaPago) : estado === 'pagado' ? new Date() : null,
        notas,
      },
      include: { socio: true, serie: true },
    });
    res.json(pago);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar pago.' });
  }
});

// POST /api/pagos/generar-mes
router.post('/generar-mes', authMiddleware, async (req, res) => {
  try {
    const { mes, anio, monto } = req.body;
    if (!mes || !anio || !monto) {
      return res.status(400).json({ error: 'Mes, año y monto son requeridos.' });
    }

    // Generar para todas las combinaciones (socio, serie) activas
    const socioSeries = await prisma.socioSerie.findMany({
      where: { socio: { activo: true } },
    });

    const creados = [];
    for (const ss of socioSeries) {
      const pago = await prisma.pago.upsert({
        where: { socioId_serieId_mes_anio: { socioId: ss.socioId, serieId: ss.serieId, mes: parseInt(mes), anio: parseInt(anio) } },
        update: {},
        create: { socioId: ss.socioId, serieId: ss.serieId, mes: parseInt(mes), anio: parseInt(anio), monto: parseFloat(monto), estado: 'pendiente' },
      });
      creados.push(pago);
    }

    res.json({ message: `${creados.length} cuotas generadas para ${mes}/${anio}`, pagos: creados });
  } catch (err) {
    res.status(500).json({ error: 'Error al generar cuotas.' });
  }
});

module.exports = router;
