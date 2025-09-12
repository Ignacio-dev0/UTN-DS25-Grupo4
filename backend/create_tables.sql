-- Crear tabla Usuario
CREATE TABLE IF NOT EXISTS "Usuario" (
    "id" SERIAL NOT NULL,
    "apellido" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "cuit" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'CLIENTE',
    "direccion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- Crear tabla Deporte
CREATE TABLE IF NOT EXISTS "Deporte" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL UNIQUE,
    "icono" TEXT,
    CONSTRAINT "Deporte_pkey" PRIMARY KEY ("id")
);

-- Crear tabla Complejo
CREATE TABLE IF NOT EXISTS "Complejo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "descripcion" TEXT,
    "image" TEXT,
    "duenioId" INTEGER NOT NULL,
    "localidadId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Complejo_pkey" PRIMARY KEY ("id")
);

-- Crear tabla Cancha
CREATE TABLE IF NOT EXISTS "Cancha" (
    "id" SERIAL NOT NULL,
    "nroCancha" INTEGER NOT NULL,
    "descripcion" TEXT,
    "puntaje" DOUBLE PRECISION,
    "image" TEXT,
    "complejoId" INTEGER NOT NULL,
    "deporteId" INTEGER NOT NULL,
    CONSTRAINT "Cancha_pkey" PRIMARY KEY ("id")
);

-- Crear tabla Turno
CREATE TABLE IF NOT EXISTS "Turno" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "horaInicio" TIMESTAMP(3) NOT NULL,
    "horaFin" TIMESTAMP(3) NOT NULL,
    "reservado" BOOLEAN NOT NULL DEFAULT false,
    "alquilerId" INTEGER,
    "canchaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Turno_pkey" PRIMARY KEY ("id")
);

-- Crear índices básicos
CREATE INDEX IF NOT EXISTS "Usuario_email_idx" ON "Usuario"("email");
CREATE INDEX IF NOT EXISTS "Cancha_complejoId_idx" ON "Cancha"("complejoId");
CREATE INDEX IF NOT EXISTS "Turno_canchaId_idx" ON "Turno"("canchaId");