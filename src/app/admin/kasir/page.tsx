import AdminCashierList from "@/components/adminCashierLists";
import SidebarAdmin from "@/components/adminSidebar";
import ProtectedPage from "@/hoc/protectedRoutes";

export default function AdminKasir() {
  return (
    <ProtectedPage allowedRoles={["Admin"]}>
      <div className="container mx-auto">
        <SidebarAdmin />
        <AdminCashierList />
      </div>
    </ProtectedPage>
  );
}
