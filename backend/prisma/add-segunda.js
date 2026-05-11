const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const socios = [
  // ── Imagen 1 ─────────────────────────────────────────
  { rut: '19.491.024-K', nombre: 'Franco',     apellido: 'Rojas'       },
  { rut: '18.745.837-4', nombre: 'Alfredo',    apellido: 'Sepúlveda'   },
  { rut: '19.826.506-3', nombre: 'Claudio',    apellido: 'Elgueta'     },
  { rut: '20.197.242-6', nombre: 'Sergio',     apellido: 'Pávez'       },
  { rut: '20.256.070-9', nombre: 'Marcos',     apellido: 'Alarcón'     },
  { rut: '17.873.912-3', nombre: 'Francisco',  apellido: 'Flores'      },
  { rut: '19.907.082-7', nombre: 'Alejandro',  apellido: 'Contreras'   },
  { rut: '19.521.152-3', nombre: 'Deny',       apellido: 'Duran'       },
  { rut: '20.149.631-4', nombre: 'Claudio',    apellido: 'Hernández'   },
  { rut: '20.441.198-0', nombre: 'Luis',       apellido: 'Olate'       },
  { rut: '17.873.856-9', nombre: 'Alejandro',  apellido: 'Inostroza'   },
  { rut: '21.083.013-8', nombre: 'Gonzalo',    apellido: 'Fernandez'   },
  { rut: '22.148.805-9', nombre: 'José',       apellido: 'Martínez'    },
  { rut: '18.855.480-6', nombre: 'Damian',     apellido: 'Carrillo'    },
  { rut: '21.480.526-K', nombre: 'Darwin',     apellido: 'Friz'        },
  { rut: '18.150.360-2', nombre: 'Aníbal',     apellido: 'Rivas'       },
  { rut: '19.906.209-3', nombre: 'Jaime',      apellido: 'Placencia'   },
  { rut: '15.990.577-2', nombre: 'Sergio',     apellido: 'Obreque'     },
  { rut: '20.210.150-K', nombre: 'Christian',  apellido: 'Bezamat'     },
  { rut: '21.473.695-0', nombre: 'Mel',        apellido: 'Garrido'     },
  { rut: '19.509.991-K', nombre: 'Juan',       apellido: 'Sáez'        },
  { rut: '18.150.006-9', nombre: 'Franco',     apellido: 'Sáez'        },
  { rut: '19.434.722-7', nombre: 'Marcelo',    apellido: 'Silva'       },
  { rut: '18.150.272-K', nombre: 'Matías',     apellido: 'Vásquez'     },
  { rut: '18.686.365-8', nombre: 'Felipe',     apellido: 'Cisterna'    },
  { rut: '20.019.921-9', nombre: 'Héctor',     apellido: 'Rodríguez'   },
  { rut: '19.767.769-4', nombre: 'Esteban',    apellido: 'Salas'       },
  { rut: '21.082.896-6', nombre: 'Patricio',   apellido: 'Placencia'   },
  { rut: '20.232.440-1', nombre: 'Francisco',  apellido: 'Rodríguez'   },
  { rut: '20.721.001-3', nombre: 'Bernardo',   apellido: 'Solis'       },
  { rut: '21.861.133-8', nombre: 'Cristobal',  apellido: 'Muñoz'       },
  // ── Imagen 2 ─────────────────────────────────────────
  { rut: '21.353.846-2', nombre: 'Hector',     apellido: 'Diaz'        },
  { rut: '21.801.494-1', nombre: 'Moises',     apellido: 'Ortega'      },
  { rut: '20.550.723-K', nombre: 'Axel',       apellido: 'Fernández'   },
  { rut: '20.256.761-4', nombre: 'Axel',       apellido: 'Soto'        },
  { rut: '22.713.868-8', nombre: 'Matias',     apellido: 'Lozano'      },
  { rut: '22.626.358-6', nombre: 'Eliseo',     apellido: 'Rivas'       },
  { rut: '22.756.113-0', nombre: 'Luis',       apellido: 'Cruz'        },
  { rut: '22.804.162-9', nombre: 'Benjamín',   apellido: 'Hermosilla'  },
  { rut: '22.878.558-K', nombre: 'Cristopher', apellido: 'Chamblas'    },
  { rut: '15.990.504-7', nombre: 'Damián',     apellido: 'Aburto'      },
  { rut: '17.131.568-9', nombre: 'Cesar',      apellido: 'Rivera'      },
  { rut: '16.304.504-4', nombre: 'Alejandro',  apellido: 'Urra'        },
  { rut: '16.916.400-2', nombre: 'Maykol',     apellido: 'Fernandez'   },
  { rut: '17.165.736-9', nombre: 'Cristian',   apellido: 'Palma'       },
];

async function main() {
  const serie = await prisma.serie.findUnique({ where: { nombre: 'Segunda' } });
  if (!serie) { console.error('❌ Serie "Segunda" no encontrada.'); return; }

  let ok = 0;
  for (const s of socios) {
    await prisma.socio.upsert({
      where: { rut: s.rut },
      update: { nombre: s.nombre, apellido: s.apellido, activo: true, serieId: serie.id },
      create: { nombre: s.nombre, apellido: s.apellido, rut: s.rut, serieId: serie.id, activo: true },
    });
    console.log(`✅ ${s.apellido}, ${s.nombre} (${s.rut})`);
    ok++;
  }
  console.log(`\n🎉 ${ok}/${socios.length} socios procesados en serie Segunda.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
