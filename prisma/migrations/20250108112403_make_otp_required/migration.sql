/*
  Warnings:

  - Made the column `otp` on table `passwordreset` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `passwordreset` MODIFY `otp` VARCHAR(191) NOT NULL;
