-- CreateTable
CREATE TABLE "conversation" (
    "id" SERIAL NOT NULL,
    "ownerId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "lastMessage" TEXT,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scyllaChatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "conversation_ownerId_lastMessageAt_idx" ON "conversation"("ownerId", "lastMessageAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "conversation_ownerId_participantId_key" ON "conversation"("ownerId", "participantId");

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
