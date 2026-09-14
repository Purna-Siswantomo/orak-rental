-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "deadline" DATETIME NOT NULL,
    "usagePolicyAccepted" BOOLEAN NOT NULL DEFAULT false,
    "isAcademicRequirement" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "flagReasoning" TEXT,
    "estimatedHours" REAL,
    "urgencyMultiplier" REAL,
    "complexityTierLabel" TEXT,
    "complexityMultiplier" REAL,
    "baseRate" REAL,
    "additionalCost" REAL NOT NULL DEFAULT 0,
    "totalPrice" REAL,
    "complexityChecklist" TEXT,
    "feasibilityWarning" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID'
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "storedPath" TEXT NOT NULL,
    "rescreened" BOOLEAN NOT NULL DEFAULT false,
    "flaggedAfterUpload" BOOLEAN NOT NULL DEFAULT false,
    "flagReasoning" TEXT,
    CONSTRAINT "Attachment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DisclosureVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "orderId" TEXT NOT NULL,
    "supervisorName" TEXT NOT NULL,
    "supervisorContact" TEXT NOT NULL,
    "evidenceDescription" TEXT NOT NULL,
    "verifiedByAdmin" BOOLEAN NOT NULL DEFAULT false,
    "verificationNotes" TEXT,
    "verifiedAt" DATETIME,
    CONSTRAINT "DisclosureVerification_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLogEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "decidedBy" TEXT NOT NULL DEFAULT 'admin',
    "promptVersion" TEXT,
    CONSTRAINT "AuditLogEntry_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JobTypeBaseline" (
    "jobType" TEXT NOT NULL PRIMARY KEY,
    "minHours" REAL NOT NULL,
    "maxHours" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "UrgencyTier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "minDays" INTEGER,
    "maxDays" INTEGER,
    "multiplier" REAL NOT NULL,
    "notLayak" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "ComplexityTier" (
    "label" TEXT NOT NULL PRIMARY KEY,
    "minMultiplier" REAL NOT NULL,
    "maxMultiplier" REAL NOT NULL
);

-- CreateIndex
CREATE INDEX "Order_clientEmail_idx" ON "Order"("clientEmail");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DisclosureVerification_orderId_key" ON "DisclosureVerification"("orderId");

-- CreateIndex
CREATE INDEX "AuditLogEntry_orderId_idx" ON "AuditLogEntry"("orderId");
