/*
  Warnings:

  - You are about to drop the column `created_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "flightSeatStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'HELD');

-- CreateEnum
CREATE TYPE "flightClassType" AS ENUM ('ECONOMY', 'PREMIUM', 'BUSINESS', 'FIRST_CLASS');

-- CreateEnum
CREATE TYPE "passengerType" AS ENUM ('USER', 'ADULT', 'CHILD', 'INFANT');

-- CreateEnum
CREATE TYPE "identityType" AS ENUM ('KTP', 'PASSPORT');

-- CreateEnum
CREATE TYPE "paymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "paymentMethod" AS ENUM ('CREDIT_CARD', 'BANK_TRANSFER');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "created_at",
DROP COLUMN "updated_at";

-- CreateTable
CREATE TABLE "airline" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "airline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airplane" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "max_row" INTEGER NOT NULL,
    "max_column" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "airplane_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airport" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "airport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking" (
    "id" UUID NOT NULL,
    "transaction_id" UUID NOT NULL,
    "departure_flight_seat_id" UUID NOT NULL,
    "return_flight_seat_id" UUID,
    "passenger_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flight_seat" (
    "id" UUID NOT NULL,
    "row" INTEGER NOT NULL,
    "column" INTEGER NOT NULL,
    "status" "flightSeatStatus" NOT NULL DEFAULT 'AVAILABLE',
    "flight_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "flight_seat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flight" (
    "id" UUID NOT NULL,
    "price" INTEGER NOT NULL,
    "type" "flightClassType" NOT NULL,
    "departure_timestamp" TIMESTAMPTZ NOT NULL,
    "arrival_timestamp" TIMESTAMPTZ NOT NULL,
    "airline_id" UUID NOT NULL,
    "airplane_id" UUID NOT NULL,
    "departure_airport_id" UUID,
    "destination_airport_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "flight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passenger" (
    "id" UUID NOT NULL,
    "type" "passengerType" NOT NULL,
    "name" TEXT NOT NULL,
    "family_name" TEXT,
    "email" TEXT,
    "birth_date" TIMESTAMP(3),
    "phone_number" TEXT,
    "identity_type" "identityType" NOT NULL,
    "identity_number" TEXT NOT NULL,
    "identity_nationality" TEXT,
    "identity_expiry_date" TIMESTAMP(3),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "passenger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "paymentStatus" NOT NULL,
    "method" "paymentMethod" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "departure_flight_id" UUID NOT NULL,
    "return_flight_id" UUID,
    "payment_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transaction_code_key" ON "transaction"("code");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_payment_id_key" ON "transaction"("payment_id");

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_departure_flight_seat_id_fkey" FOREIGN KEY ("departure_flight_seat_id") REFERENCES "flight_seat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_return_flight_seat_id_fkey" FOREIGN KEY ("return_flight_seat_id") REFERENCES "flight_seat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_passenger_id_fkey" FOREIGN KEY ("passenger_id") REFERENCES "passenger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_seat" ADD CONSTRAINT "flight_seat_flight_id_fkey" FOREIGN KEY ("flight_id") REFERENCES "flight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_airline_id_fkey" FOREIGN KEY ("airline_id") REFERENCES "airline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_airplane_id_fkey" FOREIGN KEY ("airplane_id") REFERENCES "airplane"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_departure_airport_id_fkey" FOREIGN KEY ("departure_airport_id") REFERENCES "airport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_destination_airport_id_fkey" FOREIGN KEY ("destination_airport_id") REFERENCES "airport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_departure_flight_id_fkey" FOREIGN KEY ("departure_flight_id") REFERENCES "flight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_return_flight_id_fkey" FOREIGN KEY ("return_flight_id") REFERENCES "flight"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
