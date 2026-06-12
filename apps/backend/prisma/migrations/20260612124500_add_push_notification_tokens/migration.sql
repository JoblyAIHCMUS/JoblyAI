-- CreateTable
CREATE TABLE "push_notification_token" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT,
    "deviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_notification_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "push_notification_token_token_key" ON "push_notification_token"("token");

-- CreateIndex
CREATE INDEX "push_notification_token_userId_idx" ON "push_notification_token"("userId");

-- AddForeignKey
ALTER TABLE "push_notification_token" ADD CONSTRAINT "push_notification_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
