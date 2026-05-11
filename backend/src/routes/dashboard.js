const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const ahora = new Date();
    const mesActual = ahora.getMonth() + 1;
    const anioActual = ahora.getFullYear();

    // Series con sus socios activos y sus pagos del mes
    const series = await prisma.serie.findMany({
      include: {
        socios: {
          where: { socio: { activo: true } }, // filtra SocioSerie donde socio activo
          include: { socio: true },
        },
        pagos: {
          where: { mes: mesActual, anio: anioActual },
        },
      },
    });

    const resumenSeries = series.map((serie) => {
      const totalSocios = serie.socios.length;
      const pagosMes = serie.pagos;
      const pagados = pagosMes.filter((p) => p.estado === 'pagado').length;
      const pendientes = totalSocios - pagados;
      const recaudado = pagosMes
        .filter((p) => p.estado === 'pagado')
        .reduce((a, p) => a + p.monto, 0);

      return {
        id: serie.id,
        nombre: serie.nombre,
        totalSocios,
        pagados,
        pendientes,
        recaudado,
        porcentajePago: totalSocios > 0 ? Math.round((pagados / totalSocios) * 100) : 0,
      };
    });

    // Totales globales
    const totalSocios = await prisma.socio.count({ where: { activo: true } });

    const totalPagadosMes = await prisma.pago.count({
      where: { mes: mesActual, anio: anioActual, estado: 'pagado' },
    });

    const totalPendientesMes = await prisma.pago.count({
      where: { mes: mesActual, anio: anioActual, estado: 'pendiente' },
    });

    const recaudacionMes = await prisma.pago.aggregate({
      where: { mes: mesActual, anio: anioActual, estado: 'pagado' },
      _sum: { monto: true },
    });

    // Historial últimos 6 meses
    const historial = [];
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(anioActual, ahora.getMonth() - i, 1);
      const m = fecha.getMonth() + 1;
      const a = fecha.getFullYear();
      const resultado = await prisma.pago.aggregate({
        where: { mes: m, anio: a, estado: 'pagado' },
        _sum: { monto: true },
      });
      historial.push({ mes: m, anio: a, recaudado: resultado._sum.monto || 0 });
    }

    res.json({
      resumenSeries,
      totales: {
        totalSocios,
        totalPagadosMes,
        totalPendientesMes,
        recaudacionMes: recaudacionMes._sum.monto || 0,
        mesActual,
        anioActual,
      },
      historial,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas.' });
  }
});

module.exports = router;
