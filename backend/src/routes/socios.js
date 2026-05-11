const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/socios?serieId=1&activo=true
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { serieId, activo } = req.query;
    const where = {};
    if (activo !== undefined) where.activo = activo === 'true';
    if (serieId) where.series = { some: { serieId: parseInt(serieId) } };

    const socios = await prisma.socio.findMany({
      where,
      include: { series: { include: { serie: true } } },
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    });
    res.json(socios);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener socios.' });
  }
});

// GET /api/socios/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const socio = await prisma.socio.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        series: { include: { serie: true } },
        pagos: { orderBy: [{ anio: 'desc' }, { mes: 'desc' }] },
      },
    });
    if (!socio) return res.status(404).json({ error: 'Socio no encontrado.' });
    res.json(socio);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener socio.' });
  }
});

// POST /api/socios
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nombre, apellido, rut, telefono, email, seriesIds } = req.body;
    if (!nombre || !apellido || !rut || !seriesIds?.length) {
      return res.status(400).json({ error: 'Nombre, apellido, RUT y al menos una serie son requeridos.' });
    }

    const socio = await prisma.socio.create({
      data: {
        nombre, apellido, rut, telefono, email,
        series: { create: seriesIds.map((id) => ({ serieId: parseInt(id) })) },
      },
      include: { series: { include: { serie: true } } },
    });
    res.status(201).json(socio);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe un socio con ese RUT.' });
    }
    res.status(500).json({ error: 'Error al crear socio.' });
  }
});

// PUT /api/socios/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { nombre, apellido, rut, telefono, email, activo, seriesIds } = req.body;
    const id = parseInt(req.params.id);

    // Update basic fields
    await prisma.socio.update({
      where: { id },
      data: { nombre, apellido, rut, telefono, email, activo },
    });

    // Replace series if provided
    if (seriesIds) {
      await prisma.socioSerie.deleteMany({ where: { socioId: id } });
      await prisma.socioSerie.createMany({
        data: seriesIds.map((sid) => ({ socioId: id, serieId: parseInt(sid) })),
      });
    }

    const socio = await prisma.socio.findUnique({
      where: { id },
      include: { series: { include: { serie: true } } },
    });
    res.json(socio);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar socio.' });
  }
});

// DELETE /api/socios/:id  (soft delete)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.socio.update({
      where: { id: parseInt(req.params.id) },
      data: { activo: false },
    });
    res.json({ message: 'Socio desactivado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar socio.' });
  }
});

module.exports = router;
