PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "executor" TEXT NOT NULL,
    "creator" TEXT NOT NULL,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_Task" ("id", "name", "fileUrl", "status", "executor", "creator", "startedAt", "completedAt", "createdAt", "updatedAt")
SELECT "id", "name", CAST("fileId" AS TEXT), "status", "executor", "creator", "startedAt", "completedAt", "createdAt", "updatedAt"
FROM "Task";

DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";

CREATE INDEX "Task_executor_status_createdAt_idx" ON "Task"("executor", "status", "createdAt");
CREATE INDEX "Task_status_createdAt_idx" ON "Task"("status", "createdAt");
CREATE INDEX "Task_creator_createdAt_idx" ON "Task"("creator", "createdAt");

PRAGMA foreign_keys=ON;
