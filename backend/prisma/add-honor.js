const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const socios = [
  { rut: '19.909.066-6', nombre: 'Pedro',      apellido: 'Oliveros'  },
  { rut: '22.358.581-7', nombre: 'Jorge',      apellido: 'Astorga'   },
  { rut: '18.855.592-6', nombre: 'Felipe',     apellido: 'Palma'     },
  { rut: '20.739.981-1', nombre: 'Sebastián',  apellido: 'Romero'    },
  { rut: '22.023.511-4', nombre: 'Yonathan',   apellido: 'Placencia' },
  { rut: '19.767.746-5', nombre: 'José',       apellido: 'Araneda'   },
  { rut: '19.909.392-4', nombre: 'Brayan',     apellido: 'Pávez'     },
  { rut: '22.417.475-6', nombre: 'Benjamín',   apellido: 'González'  },
  { rut: '20.923.432-7', nombre: 'Byron',      apellido: 'Rivera'    },
  { rut: '18.505.570-1', nombre: 'Frank',      apellido: 'Jara'      },
  { rut: '21.118.410-8', nombre: 'José',       apellido: 'García'    },
  { rut: '21.965.681-5', nombre: 'Matias',     apellido: 'Placencia' },
  { rut: '22.222.462-4', nombre: 'Matias',     apellido: 'Villa'     },
  { rut: '19.836.724-4', nombre: 'Fabián',     apellido: 'Jara'      },
  { rut: '19.140.198-0', nombre: 'Chistopher', apellido: 'Aburto'    },
  { rut: '20.550.908-9', nombre: 'Moises',     apellido: 'Vera'      },
  { rut: '17.453.687-2', nombre: 'Ruben',      apellido: 'Jara'      },
  { rut: '18.414.862-5', nombre: 'Sebastián',  apellido: 'Placencia' },
  { rut: '19.509.236-2', nombre: 'Cristian',   apellido: 'Pezo'      },
  { rut: '21.082.911-3', nombre: 'Francisco',  apellido: 'Diaz'      },
];

async function main() {
  const serie = await prisma.serie.findUnique({ where: { nombre: 'Honor' } });
  if (!serie) { console.error('❌ Serie "Honor" no encontrada.'); return; }

  let creados = 0, reactivados = 0;
  for (const s of socios) {
    const resultado = await prisma.socio.upsert({
      where: { rut: s.rut },
      update: { nombre: s.nombre, apellido: s.apellido, activo: true, serieId: serie.id },
      create: { nombre: s.nombre, apellido: s.apellido, rut: s.rut, serieId: serie.id, activo: true },
    });
    const accion = resultado.createdAt.getTime() === resultado.updatedAt?.getTime?.() ? 'creado' : 'reactivado';
    console.log(`✅ ${s.apellido}, ${s.nombre} (${s.rut})`);
    creados++;
  }
  console.log(`\n🎉 ${creados}/20 socios procesados correctamente.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
