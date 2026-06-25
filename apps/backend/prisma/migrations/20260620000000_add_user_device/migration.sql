CREATE TABLE "user_device" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "pushToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_device_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_device_pushToken_key" ON "user_device"("pushToken");
CREATE INDEX "user_device_userId_idx" ON "user_device"("userId");

ALTER TABLE "user_device"
ADD CONSTRAINT "user_device_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "user"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
