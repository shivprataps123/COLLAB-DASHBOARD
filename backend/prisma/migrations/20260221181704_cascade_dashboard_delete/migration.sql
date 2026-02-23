-- DropForeignKey
ALTER TABLE "DashboardMember" DROP CONSTRAINT "DashboardMember_dashboardId_fkey";

-- AddForeignKey
ALTER TABLE "DashboardMember" ADD CONSTRAINT "DashboardMember_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
