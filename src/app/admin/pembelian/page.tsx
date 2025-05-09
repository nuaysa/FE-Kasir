import PembelianPage from "@/components/adminPembelian";
import SidebarAdmin from "@/components/adminSidebar";
import ProtectedPage from "../../../hoc/protectedRoutes";

export default function Pembelian() {
  return (
    <ProtectedPage allowedRoles={["Admin"]}>
      <div>
        <SidebarAdmin />
        <PembelianPage />
      </div>
    </ProtectedPage>
  );
}
