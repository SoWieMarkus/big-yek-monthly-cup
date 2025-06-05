/*
  Warnings:

  - The primary key for the `Cup` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Final` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `FinalResult` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Qualifier` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `QualifierResult` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "public" BOOLEAN NOT NULL,
    "current" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL
);
INSERT INTO "new_Cup" ("current", "id", "month", "name", "public", "year") SELECT "current", "id", "month", "name", "public", "year" FROM "Cup";
DROP TABLE "Cup";
ALTER TABLE "new_Cup" RENAME TO "Cup";
CREATE UNIQUE INDEX "Cup_year_month_key" ON "Cup"("year", "month");
CREATE TABLE "new_Final" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cupId" TEXT NOT NULL,
    CONSTRAINT "Final_cupId_fkey" FOREIGN KEY ("cupId") REFERENCES "Cup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Final" ("cupId", "id") SELECT "cupId", "id" FROM "Final";
DROP TABLE "Final";
ALTER TABLE "new_Final" RENAME TO "Final";
CREATE UNIQUE INDEX "Final_cupId_key" ON "Final"("cupId");
CREATE TABLE "new_FinalResult" (
    "playerId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "finalId" TEXT NOT NULL,

    PRIMARY KEY ("playerId", "finalId"),
    CONSTRAINT "FinalResult_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FinalResult_finalId_fkey" FOREIGN KEY ("finalId") REFERENCES "Final" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FinalResult" ("finalId", "playerId", "points", "position") SELECT "finalId", "playerId", "points", "position" FROM "FinalResult";
DROP TABLE "FinalResult";
ALTER TABLE "new_FinalResult" RENAME TO "FinalResult";
CREATE TABLE "new_Leaderboard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cupId" TEXT NOT NULL,
    CONSTRAINT "Leaderboard_cupId_fkey" FOREIGN KEY ("cupId") REFERENCES "Cup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Leaderboard" ("cupId", "id") SELECT "cupId", "id" FROM "Leaderboard";
DROP TABLE "Leaderboard";
ALTER TABLE "new_Leaderboard" RENAME TO "Leaderboard";
CREATE UNIQUE INDEX "Leaderboard_cupId_key" ON "Leaderboard"("cupId");
CREATE TABLE "new_Qualifier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "version" INTEGER NOT NULL,
    "cupId" TEXT NOT NULL,
    CONSTRAINT "Qualifier_cupId_fkey" FOREIGN KEY ("cupId") REFERENCES "Cup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Qualifier" ("cupId", "id", "version") SELECT "cupId", "id", "version" FROM "Qualifier";
DROP TABLE "Qualifier";
ALTER TABLE "new_Qualifier" RENAME TO "Qualifier";
CREATE UNIQUE INDEX "Qualifier_version_cupId_key" ON "Qualifier"("version", "cupId");
CREATE TABLE "new_QualifierResult" (
    "playerId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "qualifierId" TEXT NOT NULL,
    "server" INTEGER NOT NULL,

    PRIMARY KEY ("playerId", "qualifierId", "server"),
    CONSTRAINT "QualifierResult_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "QualifierResult_qualifierId_fkey" FOREIGN KEY ("qualifierId") REFERENCES "Qualifier" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_QualifierResult" ("playerId", "points", "position", "qualifierId", "server") SELECT "playerId", "points", "position", "qualifierId", "server" FROM "QualifierResult";
DROP TABLE "QualifierResult";
ALTER TABLE "new_QualifierResult" RENAME TO "QualifierResult";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
