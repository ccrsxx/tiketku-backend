-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('SEED_FLIGHT');

-- CreateTable
CREATE TABLE "event" (
    "id" UUID NOT NULL,
    "type" "EventType" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);
