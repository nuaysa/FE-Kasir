"use client";;
import AdminProductList from "@/components/adminProductList";
import SidebarAdmin from "@/components/adminSidebar";
import CategoryManager from "@/components/categoryManager";
import SupplierManager from "@/components/supplierManager";
import ProtectedPage from "../../../hoc/protectedRoutes";

export default function Product() {
  return (
    <ProtectedPage allowedRoles={["Admin"]}>
    <div className="container mx-auto">
      <SidebarAdmin />
      <div className=" ml-24 p-4">
      <AdminProductList />
      <CategoryManager/>
      <SupplierManager/>
      </div>
    </div>
    </ProtectedPage>
  );
}
