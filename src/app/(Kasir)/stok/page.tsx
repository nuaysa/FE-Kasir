import SidebarKasir from "@/components/kasirSidebar";
import StokEditForm from "@/components/stokEditForm";
import ProtectedPage from "@/hoc/protectedRoutes";

export default function StokPage() {
  return (
    <ProtectedPage allowedRoles={["Kasir"]}>
      <div className="container mx-auto">
        <SidebarKasir />
        <div className="py-32">
          <StokEditForm />
        </div>
      </div>
    </ProtectedPage>
  );
}
