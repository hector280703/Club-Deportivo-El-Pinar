/*
  Warnings:

  - You are about to drop the column `serieId` on the `Socio` table. All the data in the column will be lost.
  - Added the required column `serieId` to the `Pago` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "SocioSerie" (
    "socioId" INTEGER NOT NULL,
    "serieId" INTEGER NOT NULL,

    PRIMARY KEY ("socioId", "serieId"),
    CONSTRAINT "SocioSerie_socioId_fkey" FOREIGN KEY ("socioId") REFERENCES "Socio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SocioSerie_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "Serie" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pago" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "socioId" INTEGER NOT NULL,
    "serieId" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "monto" REAL NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "fechaPago" DATETIME,
    "notas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Pago_socioId_fkey" FOREIGN KEY ("socioId") REFERENCES "Socio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pago_serieId_fkey" FOREIGN KEY ("serieId") REFERENCES "Serie" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Pago" ("anio", "createdAt", "estado", "fechaPago", "id", "mes", "monto", "notas", "socioId") SELECT "anio", "createdAt", "estado", "fechaPago", "id", "mes", "monto", "notas", "socioId" FROM "Pago";
DROP TABLE "Pago";
ALTER TABLE "new_Pago" RENAME TO "Pago";
CREATE UNIQUE INDEX "Pago_socioId_serieId_mes_anio_key" ON "Pago"("socioId", "serieId", "mes", "anio");
CREATE TABLE "new_Socio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Socio" ("activo", "apellido", "createdAt", "email", "id", "nombre", "rut", "telefono") SELECT "activo", "apellido", "createdAt", "email", "id", "nombre", "rut", "telefono" FROM "Socio";
DROP TABLE "Socio";
ALTER TABLE "new_Socio" RENAME TO "Socio";
CREATE UNIQUE INDEX "Socio_rut_key" ON "Socio"("rut");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
