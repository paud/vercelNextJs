/*
  Warnings:

  - Made the column `sellerId` on table `Item` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Item" DROP CONSTRAINT "Item_sellerId_fkey";

-- AlterTable
ALTER TABLE "Item" ALTER COLUMN "sellerId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
