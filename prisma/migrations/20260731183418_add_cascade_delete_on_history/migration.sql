-- DropForeignKey
ALTER TABLE "History" DROP CONSTRAINT "History_requestId_fkey";

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;
