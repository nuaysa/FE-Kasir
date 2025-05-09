"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, FileText, FolderClock } from "lucide-react";
import Link from "next/link";
import useSession from "@/hooks/useSession";
import { Kasir } from "@/types/transaksi";
import LogoutButton from "./logoutButton";
import { RiDashboardLine } from "react-icons/ri";
import { BiCart } from "react-icons/bi";
import { BsPeople } from "react-icons/bs";
import { MdManageHistory } from "react-icons/md";

export default function SidebarAdmin() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useSession();

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <RiDashboardLine size={24} /> },
    { name: "Laporan", path: "/admin/laporan", icon: <FileText size={24} /> },
    { name: "Management", path: "/admin/management", icon: <MdManageHistory size={24} /> },
    { name: "Pembelian", path: "/admin/pembelian", icon: <BiCart size={24} /> },
    { name: "Kasir", path: "/admin/kasir", icon: <BsPeople size={24} /> },
  ];

  const worker = user as Kasir;

  return (
    <div>
      <aside className={`${isCollapsed ? "w-20" : "w-56"} fixed min-h-screen flex flex-col justify-between items-center bg-white shadow-lg transition-all duration-300 z-50`}>
        <div className="flex flex-col w-full px-3 gap-4 justify-between h-[100px]">
          <div className="flex items-center p-4 border-b">
            {!isCollapsed && (
              <Link href="/" className="ml-3 text-xl text-center font-bold text-gray-800">
                KasirApp
              </Link>
            )}
          </div>
          {navItems.map((item) => (
            <div
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`p-2 rounded-xl flex gap-3 items-center ${isCollapsed ? "justify-center" : "justify-start"} ${
                pathname === item.path ? "text-[#1678F0] hover:text-blue-300" : "text-neutral-500 hover:text-blue-500 hover:bg-neutral-200 cursor-pointer"
              }`}
            >
              {item.icon}
              {!isCollapsed && <span className="text-sm">{item.name}</span>}
            </div>
          ))}
        </div>

        <div className="flex w-full flex-col items-center justify-center font-bold">
          <div className="border-t w-full">
            <div className="p-4">
              {isCollapsed ? (
                <div className="flex items-center justify-center gap-3 max-w-[200px]">
                  <div className="flex bg-blue-300 border-2 border-blue-700 rounded-full h-10 w-10 items-center justify-center">
                    <p className="text-center font-bold text-white"> {worker?.username?.charAt(0) ?? "A"} </p>
                  </div>
                </div>
              ) : (
                <span className="w-full text-center">
                  <div className="font-semibold">{worker?.username ? worker.username : "kasir"}</div>
                  <div className="text-sm text-gray-500">{worker?.email ? worker.email : "email"}</div>
                </span>
              )}
            </div>
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="w-full p-4 text-gray-500 hover:bg-gray-100 transition-colors flex justify-center">
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
          <div className="flex gap-2 items-center text-red-500 mb-5 border-t p-4">{isCollapsed ? <LogoutButton /> : <LogoutButton text="Log out" />}</div>
        </div>
      </aside>
    </div>
  );
}
