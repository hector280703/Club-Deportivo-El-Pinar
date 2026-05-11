const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de base de datos...');

  // Crear series
  const series = ['Honor', 'Segunda', 'Años Dorados', 'Super Seniors'];
  for (const nombre of series) {
    await prisma.serie.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }
  console.log('✅ Series creadas');

  // Crear usuario administrador
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@elpinar.com' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@elpinar.com',
      password: passwordHash,
      rol: 'admin',
    },
  });
  console.log('✅ Usuario admin creado (admin@elpinar.com / admin123)');

  // Socios de ejemplo
  const serieHonor = await prisma.serie.findUnique({ where: { nombre: 'Honor' } });
  const serieSegunda = await prisma.serie.findUnique({ where: { nombre: 'Segunda' } });
  const serieDorados = await prisma.serie.findUnique({ where: { nombre: 'Años Dorados' } });
  const serieSeniors = await prisma.serie.findUnique({ where: { nombre: 'Super Seniors' } });

  const sociosEjemplo = [
    { nombre: 'Carlos', apellido: 'Méndez', rut: '12.345.678-9', telefono: '8888-1111', serieId: serieHonor.id },
    { nombre: 'Luis', apellido: 'Vargas', rut: '11.234.567-8', telefono: '8888-2222', serieId: serieHonor.id },
    { nombre: 'Andrés', apellido: 'Rojas', rut: '10.123.456-7', telefono: '8888-3333', serieId: serieSegunda.id },
    { nombre: 'Mario', apellido: 'Quirós', rut: '9.012.345-6', telefono: '8888-4444', serieId: serieSegunda.id },
    { nombre: 'Roberto', apellido: 'Jiménez', rut: '8.901.234-5', telefono: '8888-5555', serieId: serieDorados.id },
    { nombre: 'Álvaro', apellido: 'Castro', rut: '7.890.123-4', telefono: '8888-6666', serieId: serieDorados.id },
    { nombre: 'Jorge', apellido: 'Solís', rut: '6.789.012-3', telefono: '8888-7777', serieId: serieSeniors.id },
    { nombre: 'Manuel', apellido: 'Ureña', rut: '5.678.901-2', telefono: '8888-8888', serieId: serieSeniors.id },
  ];

  for (const socio of sociosEjemplo) {
    const s = await prisma.socio.upsert({
      where: { rut: socio.rut },
      update: {},
      create: {
        nombre: socio.nombre,
        apellido: socio.apellido,
        rut: socio.rut,
        telefono: socio.telefono,
        series: {
          create: [{
            serie: { connect: { id: socio.serieId } }
          }]
        }
      },
    });

    // Crear pagos de ejemplo para los últimos 3 meses
    const ahora = new Date();
    for (let i = 0; i < 3; i++) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const mes = fecha.getMonth() + 1;
      const anio = fecha.getFullYear();
      const pagado = Math.random() > 0.3;

      await prisma.pago.upsert({
        where: { socioId_serieId_mes_anio: { socioId: s.id, serieId: socio.serieId, mes, anio } },
        update: {},
        create: {
          socioId: s.id,
          serieId: socio.serieId,
          mes,
          anio,
          monto: 15000,
          estado: pagado ? 'pagado' : 'pendiente',
          fechaPago: pagado ? new Date() : null,
        },
      });
    }
  }

  console.log('✅ Socios y pagos de ejemplo creados');
  console.log('🎉 Seed completado!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
