const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  // Patricio Olivero nunca fue insertado (RUT duplicado fue omitido),
  // pero intentamos eliminar por si acaso con apellido Olivero
  const r = await prisma.socio.deleteMany({ where: { apellido: 'Olivero' } });
  console.log('Socios con apellido Olivero eliminados:', r.count);
}
main().catch(console.error).finally(() => prisma.$disconnect());
