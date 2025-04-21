/*
  Warnings:

  - Added the required column `status` to the `Payroll` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "blockchainHash" TEXT,
ADD COLUMN     "checkInTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "checkOutTime" TIMESTAMP(3),
ADD COLUMN     "overtime" INTEGER,
ADD COLUMN     "totalBreakTime" INTEGER,
ADD COLUMN     "totalWorkTime" INTEGER,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Payroll" ADD COLUMN     "processed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "txHash" TEXT;

-- CreateIndex
CREATE INDEX "Attendance_userId_date_idx" ON "Attendance"("userId", "date");
