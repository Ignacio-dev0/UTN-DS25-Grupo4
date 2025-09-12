-- CreateEnum
CREATE TYPE "public"."MetodoPago" AS ENUM ('DEBITO', 'CREDITO', 'TRANSFERENCIA');

-- CreateEnum
CREATE TYPE "public"."EstadoAlquiler" AS ENUM ('PROGRAMADO', 'PAGADO', 'CANCELADO', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "public"."DiaSemana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- CreateEnum
CREATE TYPE "public"."EstadoSolicitud" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "public"."Rol" AS ENUM ('CLIENTE', 'DUENIO', 'ADMINISTRADOR');

-- CreateTable
CREATE TABLE "public"."Usuario" (
    "id" SERIAL NOT NULL,
    "apellido" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "dni" INTEGER NOT NULL,
    "correo" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "telefono" TEXT,
    "rol" "public"."Rol" NOT NULL DEFAULT 'CLIENTE',
    "image" TEXT,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Administrador" (
    "id" SERIAL NOT NULL,
    "correo" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "public"."Rol" NOT NULL DEFAULT 'ADMINISTRADOR',

    CONSTRAINT "Administrador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Solicitud" (
    "id" SERIAL NOT NULL,
    "cuit" INTEGER NOT NULL,
    "estado" "public"."EstadoSolicitud" NOT NULL DEFAULT 'PENDIENTE',
    "usuarioId" INTEGER NOT NULL,
    "adminId" INTEGER,

    CONSTRAINT "Solicitud_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Complejo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "puntaje" DOUBLE PRECISION,
    "image" TEXT,
    "domicilioId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "solicitudId" INTEGER NOT NULL,

    CONSTRAINT "Complejo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Domicilio" (
    "id" SERIAL NOT NULL,
    "calle" TEXT NOT NULL,
    "altura" INTEGER NOT NULL,
    "localidadId" INTEGER NOT NULL,

    CONSTRAINT "Domicilio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Localidad" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Localidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Cancha" (
    "id" SERIAL NOT NULL,
    "nroCancha" INTEGER NOT NULL,
    "descripcion" TEXT,
    "puntaje" DOUBLE PRECISION,
    "image" TEXT[],
    "complejoId" INTEGER NOT NULL,
    "deporteId" INTEGER NOT NULL,

    CONSTRAINT "Cancha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HorarioCronograma" (
    "id" SERIAL NOT NULL,
    "horaInicio" TIME NOT NULL,
    "horaFin" TIME NOT NULL,
    "diaSemana" "public"."DiaSemana" NOT NULL,
    "canchaId" INTEGER NOT NULL,

    CONSTRAINT "HorarioCronograma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Turno" (
    "id" SERIAL NOT NULL,
    "fecha" DATE NOT NULL,
    "horaInicio" TIME NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "reservado" BOOLEAN NOT NULL DEFAULT false,
    "alquilerId" INTEGER,
    "canchaId" INTEGER NOT NULL,

    CONSTRAINT "Turno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Deporte" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Deporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Resenia" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "puntaje" INTEGER NOT NULL,
    "alquilerId" INTEGER NOT NULL,

    CONSTRAINT "Resenia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Alquiler" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "public"."EstadoAlquiler" NOT NULL DEFAULT 'PROGRAMADO',
    "horaInicio" TIME NOT NULL,
    "horaFin" TIME NOT NULL,
    "clienteId" INTEGER NOT NULL,

    CONSTRAINT "Alquiler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pago" (
    "id" SERIAL NOT NULL,
    "codigoTransaccion" TEXT,
    "metodoPago" "public"."MetodoPago" NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alquilerId" INTEGER NOT NULL,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_dni_key" ON "public"."Usuario"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "public"."Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_correo_key" ON "public"."Administrador"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Solicitud_cuit_key" ON "public"."Solicitud"("cuit");

-- CreateIndex
CREATE UNIQUE INDEX "Solicitud_usuarioId_key" ON "public"."Solicitud"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Complejo_domicilioId_key" ON "public"."Complejo"("domicilioId");

-- CreateIndex
CREATE UNIQUE INDEX "Complejo_usuarioId_key" ON "public"."Complejo"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Complejo_solicitudId_key" ON "public"."Complejo"("solicitudId");

-- CreateIndex
CREATE UNIQUE INDEX "Cancha_nroCancha_key" ON "public"."Cancha"("nroCancha");

-- CreateIndex
CREATE UNIQUE INDEX "Deporte_nombre_key" ON "public"."Deporte"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Resenia_alquilerId_key" ON "public"."Resenia"("alquilerId");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_alquilerId_key" ON "public"."Pago"("alquilerId");

-- AddForeignKey
ALTER TABLE "public"."Solicitud" ADD CONSTRAINT "Solicitud_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Solicitud" ADD CONSTRAINT "Solicitud_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."Administrador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Complejo" ADD CONSTRAINT "Complejo_domicilioId_fkey" FOREIGN KEY ("domicilioId") REFERENCES "public"."Domicilio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Complejo" ADD CONSTRAINT "Complejo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Complejo" ADD CONSTRAINT "Complejo_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "public"."Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Domicilio" ADD CONSTRAINT "Domicilio_localidadId_fkey" FOREIGN KEY ("localidadId") REFERENCES "public"."Localidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cancha" ADD CONSTRAINT "Cancha_complejoId_fkey" FOREIGN KEY ("complejoId") REFERENCES "public"."Complejo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cancha" ADD CONSTRAINT "Cancha_deporteId_fkey" FOREIGN KEY ("deporteId") REFERENCES "public"."Deporte"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HorarioCronograma" ADD CONSTRAINT "HorarioCronograma_canchaId_fkey" FOREIGN KEY ("canchaId") REFERENCES "public"."Cancha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Turno" ADD CONSTRAINT "Turno_alquilerId_fkey" FOREIGN KEY ("alquilerId") REFERENCES "public"."Alquiler"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Turno" ADD CONSTRAINT "Turno_canchaId_fkey" FOREIGN KEY ("canchaId") REFERENCES "public"."Cancha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Resenia" ADD CONSTRAINT "Resenia_alquilerId_fkey" FOREIGN KEY ("alquilerId") REFERENCES "public"."Alquiler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Alquiler" ADD CONSTRAINT "Alquiler_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pago" ADD CONSTRAINT "Pago_alquilerId_fkey" FOREIGN KEY ("alquilerId") REFERENCES "public"."Alquiler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
