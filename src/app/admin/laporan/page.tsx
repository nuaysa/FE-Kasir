import SidebarAdmin from "@/components/adminSidebar";
import DailyReportTable from "@/components/dailyReport";
import ProtectedPage from "@/hoc/protectedRoutes";

export default function Laporan() {
  return (
    <ProtectedPage allowedRoles={["Admin"]}>
      <div>
        <SidebarAdmin />
        <DailyReportTable />
      </div>
    </ProtectedPage>
  );
}
