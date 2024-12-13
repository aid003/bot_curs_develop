/*
  Warnings:

  - You are about to drop the column `stutus` on the `Payment` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "tgId" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_tgId_fkey" FOREIGN KEY ("tgId") REFERENCES "User" ("tgId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("createdAt", "id", "order_id", "tgId", "updatedAt") SELECT "createdAt", "id", "order_id", "tgId", "updatedAt" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE UNIQUE INDEX "Payment_order_id_key" ON "Payment"("order_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
