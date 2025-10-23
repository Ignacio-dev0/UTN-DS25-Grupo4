/*
  Warnings:

  - The values [APROBADA,RECHAZADA] on the enum `EstadoComplejo` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."EstadoComplejo_new" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'OCULTO');
ALTER TABLE "public"."Complejo" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "public"."Complejo" ALTER COLUMN "estado" TYPE "public"."EstadoComplejo_new" USING ("estado"::text::"public"."EstadoComplejo_new");
ALTER TYPE "public"."EstadoComplejo" RENAME TO "EstadoComplejo_old";
ALTER TYPE "public"."EstadoComplejo_new" RENAME TO "EstadoComplejo";
DROP TYPE "public"."EstadoComplejo_old";
ALTER TABLE "public"."Complejo" ALTER COLUMN "estado" SET DEFAULT 'APROBADO';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Complejo" ALTER COLUMN "estado" SET DEFAULT 'APROBADO';
