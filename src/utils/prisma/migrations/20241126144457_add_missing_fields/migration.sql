/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `airport` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `continent` to the `airport` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Continent" AS ENUM ('ASIA', 'EUROPE', 'AFRICA', 'AMERICA', 'AUSTRALIA');

-- AlterTable
ALTER TABLE "airport" ADD COLUMN     "continent" "Continent" NOT NULL;

-- AlterTable
ALTER TABLE "flight" ADD COLUMN     "discount" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "airport_code_key" ON "airport"("code");
