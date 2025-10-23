/*
  Warnings:

  - You are about to drop the column `solicitudId` on the `Complejo` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Complejo_solicitudId_key";

-- AlterTable
ALTER TABLE "public"."Complejo" DROP COLUMN "solicitudId";
