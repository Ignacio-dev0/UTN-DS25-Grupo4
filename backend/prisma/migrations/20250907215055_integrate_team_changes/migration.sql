/*
  Warnings:

  - You are about to drop the column `correo` on the `Administrador` table. All the data in the column will be lost.
  - You are about to drop the column `horaFin` on the `Alquiler` table. All the data in the column will be lost.
  - You are about to drop the column `horaInicio` on the `Alquiler` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Administrador` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cuit]` on the table `Complejo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[usuarioId]` on the table `Solicitud` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Administrador` table without a default value. This is not possible if the table is not empty.
  - Made the column `puntaje` on table `Cancha` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `cuit` to the `Complejo` table without a default value. This is not possible if the table is not empty.
  - Made the column `puntaje` on table `Complejo` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "public"."Administrador_correo_key";

-- AlterTable
ALTER TABLE "public"."Administrador" DROP COLUMN "correo",
ADD COLUMN     "email" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Alquiler" DROP COLUMN "horaFin",
DROP COLUMN "horaInicio";

-- AlterTable
ALTER TABLE "public"."Cancha" ALTER COLUMN "puntaje" SET NOT NULL,
ALTER COLUMN "puntaje" SET DEFAULT 0.0;

-- AlterTable
ALTER TABLE "public"."Complejo" ADD COLUMN     "cuit" TEXT NOT NULL,
ALTER COLUMN "puntaje" SET NOT NULL,
ALTER COLUMN "puntaje" SET DEFAULT 0.0;

-- AlterTable
ALTER TABLE "public"."Solicitud" ALTER COLUMN "cuit" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."Usuario" ALTER COLUMN "dni" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_email_key" ON "public"."Administrador"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Complejo_cuit_key" ON "public"."Complejo"("cuit");

-- CreateIndex
CREATE UNIQUE INDEX "Solicitud_usuarioId_key" ON "public"."Solicitud"("usuarioId");
