-- CreateTable
CREATE TABLE "friends" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "friend_id" INTEGER NOT NULL,
    CONSTRAINT "friends_friend_id_fkey" FOREIGN KEY ("friend_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "friends_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "guests" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "user_id" INTEGER NOT NULL,
    "pseudo" TEXT NOT NULL,
    CONSTRAINT "guests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "guests_id_fkey" FOREIGN KEY ("id") REFERENCES "identities" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "identities" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);

-- CreateTable
CREATE TABLE "matchHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "player1_id" INTEGER NOT NULL,
    "player2_id" INTEGER NOT NULL,
    "player1_score" INTEGER NOT NULL,
    "player2_score" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ballSize" INTEGER NOT NULL,
    "ballSpeed" INTEGER NOT NULL,
    "paddleSize" INTEGER NOT NULL,
    "paddleSpeed" INTEGER NOT NULL,
    "gameMode" TEXT NOT NULL,
    "totalHits" INTEGER NOT NULL,
    "longestRallyHits" INTEGER NOT NULL,
    "longestRallyTime" INTEGER NOT NULL,
    "timeDuration" INTEGER NOT NULL,
    "pointsOrder" TEXT NOT NULL,
    "timeOrder" TEXT NOT NULL,
    "wallBounce1" INTEGER NOT NULL,
    "wallBounce2" INTEGER NOT NULL,
    "totalInputs1" INTEGER NOT NULL,
    "totalInputs2" INTEGER NOT NULL,
    CONSTRAINT "matchHistory_player2_id_fkey" FOREIGN KEY ("player2_id") REFERENCES "identities" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "matchHistory_player1_id_fkey" FOREIGN KEY ("player1_id") REFERENCES "identities" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "stats" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "wins" INTEGER DEFAULT 0,
    "losses" INTEGER DEFAULT 0,
    CONSTRAINT "stats_id_fkey" FOREIGN KEY ("id") REFERENCES "identities" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pseudo" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "game_username" TEXT NOT NULL,
    "avatar" TEXT NOT NULL DEFAULT 'default_avatar.png',
    "status" BOOLEAN DEFAULT false,
    CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "identities" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "twoFactorAuth" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "secret" TEXT,
    CONSTRAINT "twoFactorAuth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_friends_1" ON "friends"("user_id", "friend_id");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_users_1" ON "users"("pseudo");
Pragma writable_schema=0;

-- CreateIndex
CREATE UNIQUE INDEX "twoFactorAuth_user_id_key" ON "twoFactorAuth"("user_id");
