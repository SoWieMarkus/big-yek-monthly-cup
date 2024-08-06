-- CreateTable
CREATE TABLE "Player" (
    "name" TEXT NOT NULL,
    "id" TEXT NOT NULL PRIMARY KEY,
    "zone" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Cup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "public" BOOLEAN NOT NULL,
    "current" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "QualifierResult" (
    "playerId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "qualifierId" INTEGER NOT NULL,

    PRIMARY KEY ("playerId", "qualifierId"),
    CONSTRAINT "QualifierResult_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "QualifierResult_qualifierId_fkey" FOREIGN KEY ("qualifierId") REFERENCES "Qualifier" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Qualifier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "version" INTEGER NOT NULL,
    "cupId" INTEGER NOT NULL,
    CONSTRAINT "Qualifier_cupId_fkey" FOREIGN KEY ("cupId") REFERENCES "Cup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Final" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cupId" INTEGER NOT NULL,
    CONSTRAINT "Final_cupId_fkey" FOREIGN KEY ("cupId") REFERENCES "Cup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FinalResult" (
    "playerId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "finalId" INTEGER NOT NULL,

    PRIMARY KEY ("playerId", "finalId"),
    CONSTRAINT "FinalResult_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FinalResult_finalId_fkey" FOREIGN KEY ("finalId") REFERENCES "Final" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Leaderboard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cupId" INTEGER NOT NULL,
    CONSTRAINT "Leaderboard_cupId_fkey" FOREIGN KEY ("cupId") REFERENCES "Cup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeaderboardEntry" (
    "points" INTEGER NOT NULL,
    "qualified" BOOLEAN NOT NULL,
    "leaderboardId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "playerId" TEXT NOT NULL,

    PRIMARY KEY ("playerId", "leaderboardId"),
    CONSTRAINT "LeaderboardEntry_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LeaderboardEntry_leaderboardId_fkey" FOREIGN KEY ("leaderboardId") REFERENCES "Leaderboard" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Cup_year_month_key" ON "Cup"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "Qualifier_version_cupId_key" ON "Qualifier"("version", "cupId");

-- CreateIndex
CREATE UNIQUE INDEX "Final_cupId_key" ON "Final"("cupId");

-- CreateIndex
CREATE UNIQUE INDEX "Leaderboard_cupId_key" ON "Leaderboard"("cupId");
