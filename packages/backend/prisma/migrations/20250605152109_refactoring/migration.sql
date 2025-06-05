/*
  Warnings:

  - The primary key for the `Leaderboard` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `LeaderboardEntry` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Leaderboard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cupId" TEXT NOT NULL,
    CONSTRAINT "Leaderboard_cupId_fkey" FOREIGN KEY ("cupId") REFERENCES "Cup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Leaderboard" ("cupId", "id") SELECT "cupId", "id" FROM "Leaderboard";
DROP TABLE "Leaderboard";
ALTER TABLE "new_Leaderboard" RENAME TO "Leaderboard";
CREATE UNIQUE INDEX "Leaderboard_cupId_key" ON "Leaderboard"("cupId");
CREATE TABLE "new_LeaderboardEntry" (
    "points" INTEGER NOT NULL,
    "qualified" BOOLEAN NOT NULL,
    "leaderboardId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "playerId" TEXT NOT NULL,

    PRIMARY KEY ("playerId", "leaderboardId"),
    CONSTRAINT "LeaderboardEntry_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LeaderboardEntry_leaderboardId_fkey" FOREIGN KEY ("leaderboardId") REFERENCES "Leaderboard" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LeaderboardEntry" ("leaderboardId", "playerId", "points", "position", "qualified") SELECT "leaderboardId", "playerId", "points", "position", "qualified" FROM "LeaderboardEntry";
DROP TABLE "LeaderboardEntry";
ALTER TABLE "new_LeaderboardEntry" RENAME TO "LeaderboardEntry";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
