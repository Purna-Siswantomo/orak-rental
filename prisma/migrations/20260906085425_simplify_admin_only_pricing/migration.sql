/*
  Warnings:

  - You are about to drop the `Attachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuditLogEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DisclosureVerification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `clientEmail` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `flagReasoning` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `flagged` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `isAcademicRequirement` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `usagePolicyAccepted` on the `Order` table. All the data in the column will be lost.
  - Made the column `baseRate` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `complexityMultiplier` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `complexityTierLabel` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `estimatedHours` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `totalPrice` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `urgencyMultiplier` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "AuditLogEntry_orderId_idx";

-- DropIndex
DROP INDEX "DisclosureVerification_orderId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Attachment";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AuditLogEntry";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "DisclosureVerification";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientContact" TEXT,
    "jobType" TEXT NOT NULL,
    "notes" TEXT,
    "deadline" DATETIME NOT NULL,
    "estimatedHours" REAL NOT NULL,
    "baseRate" REAL NOT NULL,
    "urgencyMultiplier" REAL NOT NULL,
    "complexityTierLabel" TEXT NOT NULL,
    "complexityMultiplier" REAL NOT NULL,
    "additionalCost" REAL NOT NULL DEFAULT 0,
    "totalPrice" REAL NOT NULL,
    "complexityChecklist" TEXT,
    "feasibilityWarning" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID'
);
INSERT INTO "new_Order" ("additionalCost", "baseRate", "clientName", "complexityChecklist", "complexityMultiplier", "complexityTierLabel", "createdAt", "deadline", "estimatedHours", "feasibilityWarning", "id", "jobType", "paymentStatus", "totalPrice", "updatedAt", "urgencyMultiplier") SELECT "additionalCost", "baseRate", "clientName", "complexityChecklist", "complexityMultiplier", "complexityTierLabel", "createdAt", "deadline", "estimatedHours", "feasibilityWarning", "id", "jobType", "paymentStatus", "totalPrice", "updatedAt", "urgencyMultiplier" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE INDEX "Order_clientName_idx" ON "Order"("clientName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
