const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SENIORS = [
  { rut: '15.197.131-8', nombre: 'José Sebastián', apellido: 'Romero Fredes' },
  { rut: '15.990.536-5', nombre: 'Salvador Antonio', apellido: 'Zapata Arévalos' },
  { rut: '15.196.191-6', nombre: 'Ariel Esteban', apellido: 'Rivas Peña' },
  { rut: '15.196.636-9', nombre: 'Jorge Andrés', apellido: 'Hidalgo Muñoz' },
  { rut: '15.520.522-9', nombre: 'Carlos Humberto', apellido: 'Urra Sáez' },
  { rut: '15.990.582-9', nombre: 'Patricio Oscar', apellido: 'Peña Calderon' },
  { rut: '15.990.502-0', nombre: 'Salvador Omar', apellido: 'Zapata Arévalos' },
  { rut: '16.013.333-3', nombre: 'Damian Alfredo', apellido: 'Zapata Arévalos' },
  { rut: '15.963.056-0', nombre: 'Elvis Jonathan', apellido: 'García Palma' },
  { rut: '15.834.481-5', nombre: 'Cristian Gerardo', apellido: 'Romero Fredes' },
  { rut: '17.131.568-9', nombre: 'Cesar Antonio', apellido: 'Rivera Sanzana' },
  { rut: '16.304.504-4', nombre: 'Alejandro Andrés', apellido: 'Urra Sáez' },
  { rut: '16.567.004-3', nombre: 'Domingo Hipolito', apellido: 'Hidalgo Carrasco' },
  { rut: '16.266.185-9', nombre: 'Javier Exequiel', apellido: 'Laurie Mora' },
  { rut: '15.927.713-5', nombre: 'Patricio', apellido: 'Maldonado Romero' },
  { rut: '16.916.400-2', nombre: 'Maykol Stives', apellido: 'Fernandez Hidalgo' },
  { rut: '16.916.700-1', nombre: 'Cristian', apellido: 'Sandoval Aguilera' },
  { rut: '17.453.687-2', nombre: 'Ruben Adrián', apellido: 'Jara Parra' },
  { rut: '15.474.388-k', nombre: 'José Manuel', apellido: 'López Alfaro' },
  { rut: '16.566.940-1', nombre: 'Bernardo', apellido: 'Placencia Garrido' },
  { rut: '17.453.554-k', nombre: 'José Luis', apellido: 'Roa Monsalve' },
  { rut: '17.165.736-9', nombre: 'Cristian', apellido: 'Palma Araneda' },
  { rut: '17.648.005-k', nombre: 'Rodrigo Alejandro', apellido: 'Mora Mora' },
  { rut: '20.232.440-1', nombre: 'Francisco Javier', apellido: 'Rodríguez Friz' },
  { rut: '15.196.316-1', nombre: 'Gabriel', apellido: 'Ibarra Salas' },
  { rut: '17.165.448-3', nombre: 'Juan', apellido: 'Silva Jara' },
  { rut: '15.196.657-8', nombre: 'Luis', apellido: 'Cartes Teran' },
  { rut: '16.916.485-1', nombre: 'Miguel', apellido: 'Cifuentes Carrillo' },
  { rut: '15.756.016-6', nombre: 'José Antonio', apellido: 'Elgueta San Martin' },
  { rut: '15.197.238-1', nombre: 'Rolando Eugenio', apellido: 'González Alarcón' },
  { rut: '15.196.340-4', nombre: 'Juan', apellido: 'Cuevas Cuevas' },
  { rut: '15.855.320-1', nombre: 'Felipe', apellido: 'Celedon Celedon' },
  { rut: '19.036.719-3', nombre: 'Emerson Enrique', apellido: 'Hevia' },
  { rut: '15.990.504-7', nombre: 'Damián Nolasco', apellido: 'Aburto Vidal' },
  { rut: '16.157.193-8', nombre: 'Miguel Ricardo', apellido: 'Elgueta Fuentealba' },
];

async function upsertSocio(s) {
  return prisma.socio.upsert({
    where: { rut: s.rut },
    update: { nombre: s.nombre, apellido: s.apellido, activo: true },
    create: { nombre: s.nombre, apellido: s.apellido, rut: s.rut, activo: true },
  });
}

async function linkSerie(socioId, serieId) {
  await prisma.socioSerie.upsert({
    where: { socioId_serieId: { socioId, serieId } },
    update: {},
    create: { socioId, serieId },
  });
}

async function main() {
  console.log('🌱 Iniciando seed de serie Seniors...');

  // Crear serie Seniors
  const serieSeniors = await prisma.serie.upsert({
    where: { nombre: 'Seniors' },
    update: {},
    create: { nombre: 'Seniors' },
  });
  console.log('✅ Serie "Seniors" creada');

  // Agregar socios a la serie Seniors
  let agregados = 0;
  let asignados = 0;

  for (const s of SENIORS) {
    const socio = await upsertSocio(s);
    await linkSerie(socio.id, serieSeniors.id);

    // Verificar si el socio ya estaba en otra serie
    const seriesDelSocio = await prisma.socioSerie.findMany({
      where: { socioId: socio.id },
      include: { serie: true },
    });

    if (seriesDelSocio.length === 1) {
      agregados++;
      console.log(`➕ Agregado: ${s.nombre} ${s.apellido} (${s.rut})`);
    } else {
      asignados++;
      const otrasSeries = seriesDelSocio
        .filter((ss) => ss.serieId !== serieSeniors.id)
        .map((ss) => ss.serie.nombre)
        .join(', ');
      console.log(
        `🔄 ${s.nombre} ${s.apellido} (${s.rut}) - Asignado a Seniors + ${otrasSeries}`
      );
    }
  }

  console.log('');
  console.log('🎉 Seed completado!');
  console.log(`   ➕ Nuevos socios agregados: ${agregados}`);
  console.log(`   🔄 Socios con múltiples series: ${asignados}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
