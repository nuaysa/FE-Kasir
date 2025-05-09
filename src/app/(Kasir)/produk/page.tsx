"use client";
import SidebarKasir from "@/components/kasirSidebar";
import ProductList from "@/components/productList";
import ProtectedPage from "@/hoc/protectedRoutes";

export default function Product() {
  return (
    <ProtectedPage allowedRoles={["Kasir"]}>
    <div className="container mx-auto">
      <SidebarKasir />
      <ProductList />
    </div>
    </ProtectedPage>
  );
}
