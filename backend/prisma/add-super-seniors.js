const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const socios = [
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
  { rut: 'CC9958485',    nombre: 'Jhon',      apellido: 'Jiménez'    }, // Extranjero
  { rut: '13.801.138-0', nombre: 'Juan',      apellido: 'Urra'       },
  { rut: '11.685.150-4', nombre: 'Omar',      apellido: 'Vera'       },
];

async function main() {
  const serie = await prisma.serie.findUnique({ where: { nombre: 'Super Seniors' } });
  if (!serie) { console.error('❌ Serie "Super Seniors" no encontrada.'); return; }

  let ok = 0;
  for (const s of socios) {
    await prisma.socio.upsert({
      where: { rut: s.rut },
      update: { nombre: s.nombre, apellido: s.apellido, activo: true, serieId: serie.id },
      create: { nombre: s.nombre, apellido: s.apellido, rut: s.rut, serieId: serie.id, activo: true },
    });
    const tag = s.rut === 'CC9958485' ? ' 🌍 extranjero' : '';
    console.log(`✅ ${s.apellido}, ${s.nombre} (${s.rut})${tag}`);
    ok++;
  }
  console.log(`\n🎉 ${ok}/${socios.length} socios procesados en serie Super Seniors.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
