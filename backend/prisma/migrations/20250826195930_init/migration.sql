-- CreateEnum
CREATE TYPE "public"."MetodoPago" AS ENUM ('DEBITO', 'CREDITO', 'TRANSFERENCIA');

-- CreateEnum
CREATE TYPE "public"."EstadoAlquiler" AS ENUM ('PROGRAMADO', 'PAGADO', 'CANCELADO', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "public"."DiaSemana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- CreateEnum
CREATE TYPE "public"."EstadoSolicitud" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "public"."Rol" AS ENUM ('CLIENTE', 'DUENIO');

-- CreateTable
CREATE TABLE "public"."Usuario" (
    "id" SERIAL NOT NULL,
    "apellido" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "dni" INTEGER NOT NULL,
    "correo" TEXT NOT NULL,
    "contraseña" TEXT NOT NULL,
    "fechaNacimiento" DATE NOT NULL,
    "rol" "public"."Rol" NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Administrador" (
    "id" SERIAL NOT NULL,
    "dni" INTEGER NOT NULL,
    "legajo" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasenia" TEXT NOT NULL,
    "fechaNacimiento" DATE NOT NULL,

    CONSTRAINT "Administrador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Solicitud" (
    "id" SERIAL NOT NULL,
    "cuit" INTEGER NOT NULL,
    "estado" "public"."EstadoSolicitud" NOT NULL,
    "evaluadorId" INTEGER NOT NULL,
    "emisorId" INTEGER NOT NULL,

    CONSTRAINT "Solicitud_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Documentacion" (
    "id" SERIAL NOT NULL,
    "imagen" TEXT NOT NULL,
    "solicitudId" INTEGER NOT NULL,

    CONSTRAINT "Documentacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Complejo" (
    "id" SERIAL NOT NULL,
    "calle" TEXT NOT NULL,
    "altura" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "porcentajeReembolso" DOUBLE PRECISION NOT NULL,
    "puntaje" DOUBLE PRECISION NOT NULL,
    "solicitudId" INTEGER NOT NULL,
    "localidadId" INTEGER NOT NULL,

    CONSTRAINT "Complejo_pkey" PRIMARY KEY ("id")
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
    "descripcion" TEXT NOT NULL,
    "puntaje" DOUBLE PRECISION NOT NULL,
    "deporteId" INTEGER NOT NULL,

    CONSTRAINT "Cancha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HorarioCronograma" (
    "id" SERIAL NOT NULL,
    "hora" DATE NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "diaSemana" "public"."DiaSemana" NOT NULL,
    "canchaId" INTEGER NOT NULL,

    CONSTRAINT "HorarioCronograma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Turno" (
    "id" SERIAL NOT NULL,
    "fecha" DATE NOT NULL,
    "hora" TIME NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "reservado" BOOLEAN NOT NULL,
    "alquilerId" INTEGER NOT NULL,
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
    "canchaId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "Resenia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Alquiler" (
    "id" SERIAL NOT NULL,
    "estado" "public"."EstadoAlquiler" NOT NULL,
    "fecha" DATE NOT NULL,
    "clienteId" INTEGER NOT NULL,

    CONSTRAINT "Alquiler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pago" (
    "id" SERIAL NOT NULL,
    "alquilerId" INTEGER NOT NULL,
    "codigoTransaccion" TEXT NOT NULL,
    "metodoPago" "public"."MetodoPago" NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "reembolso" BOOLEAN NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_ComplejoToUsuario" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ComplejoToUsuario_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_CanchaToComplejo" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CanchaToComplejo_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_dni_key" ON "public"."Usuario"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "public"."Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_dni_key" ON "public"."Administrador"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_legajo_key" ON "public"."Administrador"("legajo");

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_correo_key" ON "public"."Administrador"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Solicitud_cuit_key" ON "public"."Solicitud"("cuit");

-- CreateIndex
CREATE UNIQUE INDEX "Complejo_solicitudId_key" ON "public"."Complejo"("solicitudId");

-- CreateIndex
CREATE UNIQUE INDEX "Cancha_nroCancha_key" ON "public"."Cancha"("nroCancha");

-- CreateIndex
CREATE UNIQUE INDEX "Deporte_nombre_key" ON "public"."Deporte"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_alquilerId_key" ON "public"."Pago"("alquilerId");

-- CreateIndex
CREATE INDEX "_ComplejoToUsuario_B_index" ON "public"."_ComplejoToUsuario"("B");

-- CreateIndex
CREATE INDEX "_CanchaToComplejo_B_index" ON "public"."_CanchaToComplejo"("B");

-- AddForeignKey
ALTER TABLE "public"."Solicitud" ADD CONSTRAINT "Solicitud_evaluadorId_fkey" FOREIGN KEY ("evaluadorId") REFERENCES "public"."Administrador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Solicitud" ADD CONSTRAINT "Solicitud_emisorId_fkey" FOREIGN KEY ("emisorId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Documentacion" ADD CONSTRAINT "Documentacion_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "public"."Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Complejo" ADD CONSTRAINT "Complejo_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "public"."Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Complejo" ADD CONSTRAINT "Complejo_localidadId_fkey" FOREIGN KEY ("localidadId") REFERENCES "public"."Localidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cancha" ADD CONSTRAINT "Cancha_deporteId_fkey" FOREIGN KEY ("deporteId") REFERENCES "public"."Deporte"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HorarioCronograma" ADD CONSTRAINT "HorarioCronograma_canchaId_fkey" FOREIGN KEY ("canchaId") REFERENCES "public"."Cancha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Turno" ADD CONSTRAINT "Turno_canchaId_fkey" FOREIGN KEY ("canchaId") REFERENCES "public"."Cancha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Turno" ADD CONSTRAINT "Turno_alquilerId_fkey" FOREIGN KEY ("alquilerId") REFERENCES "public"."Alquiler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Resenia" ADD CONSTRAINT "Resenia_canchaId_fkey" FOREIGN KEY ("canchaId") REFERENCES "public"."Cancha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Resenia" ADD CONSTRAINT "Resenia_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Alquiler" ADD CONSTRAINT "Alquiler_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pago" ADD CONSTRAINT "Pago_alquilerId_fkey" FOREIGN KEY ("alquilerId") REFERENCES "public"."Alquiler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ComplejoToUsuario" ADD CONSTRAINT "_ComplejoToUsuario_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Complejo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ComplejoToUsuario" ADD CONSTRAINT "_ComplejoToUsuario_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CanchaToComplejo" ADD CONSTRAINT "_CanchaToComplejo_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Cancha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CanchaToComplejo" ADD CONSTRAINT "_CanchaToComplejo_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Complejo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
