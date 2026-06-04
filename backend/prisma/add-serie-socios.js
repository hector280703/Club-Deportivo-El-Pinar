const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Crear o verificar que existe la serie "Socios"
  const serie = await prisma.serie.upsert({
    where: { nombre: 'Socios' },
    update: {},
    create: { nombre: 'Socios' },
  });

  console.log(`✅ Serie "${serie.nombre}" lista (ID: ${serie.id})`);
  console.log('\n🎉 La categoría "Socios" ya está disponible en el sistema.');
  console.log('   Ahora puedes asignar socios a esta serie desde la interfaz web.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
