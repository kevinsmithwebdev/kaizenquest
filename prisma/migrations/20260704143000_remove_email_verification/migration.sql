-- DropTable
DROP TABLE IF EXISTS "VerificationToken";

-- AlterTable
ALTER TABLE "User" DROP COLUMN IF EXISTS "emailVerifiedAt";
