const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// NOTA: Varios de estos socios tienen el mismo RUT que socios de Super Seniors.
// El upsert los moverá a Años Dorados. Avisa si alguno debe estar en ambas series.
// NOTA 2: El RUT 9.942.162-2 aparece duplicado en la lista (Benito Muñoz y Patricio Olivero).
//         Se procesará ambos; el segundo sobreescribirá al primero en la misma celda upsert.

const socios = [
  { rut: '9.942.162-2',  nombre: 'Benito',    apellido: 'Muñoz'      },
  { rut: '8.490.260-8',  nombre: 'Segundo',   apellido: 'Pávez'      },
  { rut: '10.797.528-4', nombre: 'Carlos',    apellido: 'Placencia'  },
  { rut: '10.013.015-7', nombre: 'José',      apellido: 'Rivera'     },
  { rut: '11.685.150-4', nombre: 'Omar',      apellido: 'Vera'       },
  { rut: '10.506.207-9', nombre: 'Isaías',    apellido: 'de la Cruz' },
  { rut: '10.020.686-2', nombre: 'Mario',     apellido: 'Vargas'     },
  { rut: '9.942.162-2',  nombre: 'Patricio',  apellido: 'Olivero'    }, // ⚠️ RUT duplicado con Benito Muñoz
  { rut: '11.538.284-5', nombre: 'Juan',      apellido: 'Placencia'  },
  { rut: '9.656.053-2',  nombre: 'Víctor',    apellido: 'Palma'      },
  { rut: '11.690.004-1', nombre: 'Erwin',     apellido: 'Vargas'     },
  { rut: '12.926.379-2', nombre: 'Guillermo', apellido: 'Romero'     },
  { rut: '11.576.411-K', nombre: 'Juan',      apellido: 'Rodríguez'  },
  { rut: '11.903.402-7', nombre: 'Cesar',     apellido: 'Loyola'     },
  { rut: '11.576.421-7', nombre: 'Eugenio',   apellido: 'Hidalgo'    },
  { rut: '11.904.234-8', nombre: 'Luis',      apellido: 'Muñoz'      },
  { rut: '11.240.796-0', nombre: 'Hector',    apellido: 'Rodríguez'  },
  { rut: '11.699.090-3', nombre: 'Jaime',     apellido: 'Placencia'  },
  { rut: '9.115.420-K',  nombre: 'Carlos',    apellido: 'Urra'       },
  { rut: '11.299.525-0', nombre: 'Claudio',   apellido: 'Pávez'      },
  { rut: '11.715.172-7', nombre: 'Juan',      apellido: 'Vargas'     },
  { rut: '9.104.526-5',  nombre: 'Luis',      apellido: 'Fernandez'  },
  // 11.685.150-4 Omar Vera ya procesado arriba (fila 5)
  { rut: '11.914.332-2', nombre: 'Hector',    apellido: 'Fierro'     },
  { rut: '12.305.545-4', nombre: 'Rubén',     apellido: 'Loyola'     },
  { rut: '9.836.466-8',  nombre: 'Domingo',   apellido: 'Inostroza'  },
  { rut: '8.929.318-9',  nombre: 'Víctor',    apellido: 'Contreras'  },
  { rut: '5.878.758-2',  nombre: 'Rosamel',   apellido: 'Garrido'    },
];

async function main() {
  const serie = await prisma.serie.findUnique({ where: { nombre: 'Años Dorados' } });
  if (!serie) { console.error('❌ Serie "Años Dorados" no encontrada.'); return; }

  let ok = 0;
  const procesados = new Set();

  for (const s of socios) {
    if (procesados.has(s.rut)) {
      console.log(`⚠️  RUT duplicado en lista, omitido: ${s.rut} (${s.apellido}, ${s.nombre})`);
      continue;
    }
    await prisma.socio.upsert({
      where: { rut: s.rut },
      update: { nombre: s.nombre, apellido: s.apellido, activo: true, serieId: serie.id },
      create: { nombre: s.nombre, apellido: s.apellido, rut: s.rut, serieId: serie.id, activo: true },
    });
    console.log(`✅ ${s.apellido}, ${s.nombre} (${s.rut})`);
    procesados.add(s.rut);
    ok++;
  }
  console.log(`\n🎉 ${ok} socios procesados en serie Años Dorados.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
