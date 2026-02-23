/*
  Warnings:

  - You are about to drop the column `role` on the `Dashboard` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Dashboard" DROP COLUMN "role";

-- CreateTable
CREATE TABLE "DashboardMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dashboardId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "DashboardMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DashboardMember_userId_dashboardId_key" ON "DashboardMember"("userId", "dashboardId");

-- AddForeignKey
ALTER TABLE "DashboardMember" ADD CONSTRAINT "DashboardMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardMember" ADD CONSTRAINT "DashboardMember_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
