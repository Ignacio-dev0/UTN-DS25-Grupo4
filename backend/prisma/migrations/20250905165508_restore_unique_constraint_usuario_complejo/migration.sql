/*
  Warnings:

  - A unique constraint covering the columns `[usuarioId]` on the table `Complejo` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Complejo_usuarioId_key" ON "public"."Complejo"("usuarioId");
