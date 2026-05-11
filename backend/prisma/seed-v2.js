const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// ─── Socios por serie ────────────────────────────────────────────
const HONOR = [
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

const SEGUNDA = [
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

const SUPER_SENIORS = [
  { rut: '12.305.545-4', nombre: 'Rubén',     apellido: 'Loyola'     },
  { rut: '12.532.513-0', nombre: 'Héctor',    apellido: 'Díaz'       },
  { rut: '10.797.528-4', nombre: 'Carlos',    apellido: 'Placencia'  },
  { rut: '10.506.207-9', nombre: 'Isaías',    apellido: 'de la Cruz' },
  { rut: '10.020.686-2', nombre: 'Mario',     apellido: 'Vargas'     },
  { rut: '12.531.534-8', nombre: 'Luis',      apellido: 'Mora'       },
  { rut: '11.690.004-1', nombre: 'Erwin',     apellido: 'Vargas'     },
  { rut: '12.926.379-2', nombre: 'Guillermo', apellido: 'Romero'     },
  { rut: '11.576.411-K', nombre: 'Juan',      apellido: 'Rodríguez'  },
  { rut: '11.903.402-7', nombre: 'Cesar',     apellido: 'Loyola'     },
  { rut: '11.576.421-7', nombre: 'Eugenio',   apellido: 'Hidalgo'    },
  { rut: '9.115.420-K',  nombre: 'Carlos',    apellido: 'Urra'       },
  { rut: '11.299.525-0', nombre: 'Claudio',   apellido: 'Pávez'      },
  { rut: '10.913.695-4', nombre: 'Miguel',    apellido: 'Rodríguez'  },
  { rut: '11.715.172-7', nombre: 'Juan',      apellido: 'Vargas'     },
  { rut: '14.902.727-0', nombre: 'Cristian',  apellido: 'Urra'       },
  { rut: '12.129.529-6', nombre: 'Fabián',    apellido: 'Fernández'  },
  { rut: '14.599.469-1', nombre: 'Ricardo',   apellido: 'Díaz'       },
  { rut: '14.499.906-1', nombre: 'Hector',    apellido: 'Vargas'     },
  { rut: '14.501.126-4', nombre: 'Leandro',   apellido: 'Vargas'     },
  { rut: '13.312.834-3', nombre: 'Jaime',     apellido: 'Aravena'    },
  { rut: '9.104.526-5',  nombre: 'Luis',      apellido: 'Fernandez'  },
  { rut: '13.513.549-6', nombre: 'Cesar',     apellido: 'Aravena'    },
  { rut: '15.196.850-3', nombre: 'Rene',      apellido: 'Retamal'    },
  { rut: '12.324.397-8', nombre: 'Jimmy',     apellido: 'Sáez'       },
  { rut: '5.878.758-2',  nombre: 'Rosamel',   apellido: 'Garrido'    },
  { rut: '11.961.081-8', nombre: 'Ruben',     apellido: 'Urra'       },
  { rut: 'CC9958485',    nombre: 'Jhon',      apellido: 'Jiménez'    },
  { rut: '13.801.138-0', nombre: 'Juan',      apellido: 'Urra'       },
  { rut: '11.685.150-4', nombre: 'Omar',      apellido: 'Vera'       },
];

// Socios EXCLUSIVOS de Años Dorados (los que comparten RUT con SS se agregan vía dual-serie)
const ANOS_DORADOS_EXCLUSIVOS = [
  { rut: '9.942.162-2',  nombre: 'Benito',    apellido: 'Muñoz'      },
  { rut: '8.490.260-8',  nombre: 'Segundo',   apellido: 'Pávez'      },
  { rut: '10.013.015-7', nombre: 'José',      apellido: 'Rivera'     },
  { rut: '11.538.284-5', nombre: 'Juan',      apellido: 'Placencia'  },
  { rut: '9.656.053-2',  nombre: 'Víctor',    apellido: 'Palma'      },
  { rut: '11.904.234-8', nombre: 'Luis',      apellido: 'Muñoz'      },
  { rut: '11.240.796-0', nombre: 'Hector',    apellido: 'Rodríguez'  },
  { rut: '11.699.090-3', nombre: 'Jaime',     apellido: 'Placencia'  },
  { rut: '10.913.695-4', nombre: 'Miguel',    apellido: 'Rodríguez'  },
  { rut: '11.914.332-2', nombre: 'Hector',    apellido: 'Fierro'     },
  { rut: '9.836.466-8',  nombre: 'Domingo',   apellido: 'Inostroza'  },
  { rut: '8.929.318-9',  nombre: 'Víctor',    apellido: 'Contreras'  },
];

// RUTs que pertenecen a AMBAS series: Super Seniors + Años Dorados
const DUAL_SERIES_RUTS = [
  '10.797.528-4', '10.506.207-9', '10.020.686-2', '11.690.004-1',
  '12.926.379-2', '11.576.411-K', '11.903.402-7', '11.576.421-7',
  '9.115.420-K',  '11.299.525-0', '11.715.172-7', '9.104.526-5',
  '12.305.545-4', '5.878.758-2',  '11.685.150-4',
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
  console.log('🌱 Iniciando seed completo...');

  // Series
  const seriesNombres = ['Honor', 'Segunda', 'Años Dorados', 'Super Seniors'];
  for (const nombre of seriesNombres) {
    await prisma.serie.upsert({ where: { nombre }, update: {}, create: { nombre } });
  }
  const series = {};
  for (const nombre of seriesNombres) {
    const s = await prisma.serie.findUnique({ where: { nombre } });
    series[nombre] = s.id;
  }
  console.log('✅ Series creadas');

  // Admin
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@elpinar.com' },
    update: {},
    create: { nombre: 'Administrador', email: 'admin@elpinar.com', password: hash, rol: 'admin' },
  });
  console.log('✅ Admin creado');

  // Honor
  for (const s of HONOR) {
    const socio = await upsertSocio(s);
    await linkSerie(socio.id, series['Honor']);
  }
  console.log(`✅ Honor: ${HONOR.length} socios`);

  // Segunda
  for (const s of SEGUNDA) {
    const socio = await upsertSocio(s);
    await linkSerie(socio.id, series['Segunda']);
  }
  console.log(`✅ Segunda: ${SEGUNDA.length} socios`);

  // Super Seniors
  for (const s of SUPER_SENIORS) {
    const socio = await upsertSocio(s);
    await linkSerie(socio.id, series['Super Seniors']);
  }
  console.log(`✅ Super Seniors: ${SUPER_SENIORS.length} socios`);

  // Años Dorados exclusivos
  for (const s of ANOS_DORADOS_EXCLUSIVOS) {
    const socio = await upsertSocio(s);
    await linkSerie(socio.id, series['Años Dorados']);
  }

  // Socios dual-series (SS + AD)
  for (const rut of DUAL_SERIES_RUTS) {
    const socio = await prisma.socio.findUnique({ where: { rut } });
    if (socio) {
      await linkSerie(socio.id, series['Años Dorados']);
      console.log(`  🔁 Dual serie: ${socio.apellido}, ${socio.nombre}`);
    }
  }
  console.log(`✅ Años Dorados: ${ANOS_DORADOS_EXCLUSIVOS.length} exclusivos + ${DUAL_SERIES_RUTS.length} compartidos`);

  console.log('\n🎉 Seed completo finalizado!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
