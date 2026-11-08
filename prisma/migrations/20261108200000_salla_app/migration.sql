-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "sallaProductId" TEXT;

-- CreateTable
CREATE TABLE "SallaStore" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "salonId" TEXT,
    "name" TEXT,
    "domain" TEXT,
    "accessTokenEnc" TEXT,
    "refreshTokenEnc" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "lastEventAt" TIMESTAMP(3),
    "installedAt" TIMESTAMP(3),
    "uninstalledAt" TIMESTAMP(3),
    "linkedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SallaStore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SallaStore_merchantId_key" ON "SallaStore"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "SallaStore_salonId_key" ON "SallaStore"("salonId");

-- CreateIndex
CREATE UNIQUE INDEX "Service_salonId_sallaProductId_key" ON "Service"("salonId", "sallaProductId");

-- AddForeignKey
ALTER TABLE "SallaStore" ADD CONSTRAINT "SallaStore_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
