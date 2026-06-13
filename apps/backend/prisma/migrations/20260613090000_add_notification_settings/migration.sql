-- CreateTable
CREATE TABLE "notification_settings" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "jobsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "recommendationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_userId_key" ON "notification_settings"("userId");

-- AddForeignKey
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
