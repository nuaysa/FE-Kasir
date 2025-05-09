"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useToken } from "@/hooks/useToken";
import { KasirDetail } from "@/types/kasir";
import { FiDollarSign, FiPieChart, FiShoppingCart } from "react-icons/fi";
import { Penjualan } from "@/types/transaksi";
import toast from "react-hot-toast";
import useSession from "@/hooks/useSession";
import Pagination from "@/components/pagination";
import StatCard from "@/components/statCard";
import ActionButton from "@/components/actionButton";
import SidebarKasir from "@/components/kasirSidebar";
import ProtectedPage from "@/hoc/protectedRoutes";

export default function KasirDashboard() {
  const [kasir, setKasir] = useState<KasirDetail | null>(null);
  const [transactions, setTransactions] = useState<Penjualan[]>([]);
  const [todaySales, setTodaySales] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [popularProduct, setPopularProduct] = useState("");
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
  });
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading } = useSession();
  const token = useToken();
  const router = useRouter();
  useEffect(() => {
    if (isLoading) return;
    console.log("Current user:", user);
    console.log("Current token:", token);

    if (!user) {
      toast.error("User tidak ditemukan atau sesi tidak valid");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setKasir(user);

        const transactionsRes = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_BE}/penjualan/kasir/?page=${filters.page}&pageSize=${filters.pageSize}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMeta(transactionsRes.data.meta);
        setTransactions(transactionsRes.data.data.penjualan || []);

        // Fetch Stats
        const statsRes = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_BE}/laporan/stat`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTodaySales(statsRes.data.todaySales || 0);
        setTransactionCount(statsRes.data.transactionCount || 0);
        setPopularProduct(statsRes.data.popularProduct || "-");
      } catch (err: any) {
        console.error("Failed to fetch data:", err);
        setError("Gagal memuat data. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user, isLoading, router, filters.page]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= meta.totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  return (
    <ProtectedPage allowedRoles={["Kasir"]}>
    <div className="min-h-screen bg-gray-100">
      <SidebarKasir />
      <div className="flex-1 p-4 ml-24">
        <main className="container mx-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard icon={<FiDollarSign className="text-blue-600 text-2xl" />} label="Penjualan Hari Ini" value={`Rp ${todaySales.toLocaleString()}`} />
            <StatCard icon={<FiShoppingCart className="text-green-600 text-2xl" />} label="Transaksi Hari Ini" value={transactionCount} />
            <StatCard icon={<FiPieChart className="text-yellow-600 text-2xl" />} label="Produk Terlaris Hari ini" value={popularProduct || "-"} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <ActionButton icon={<FiShoppingCart className="text-3xl mr-3" />} label="Buat Transaksi Baru" onClick={() => router.push("/transaksi")} color="blue" />
            <ActionButton icon={<FiPieChart className="text-3xl mr-3" />} label="Lihat Daftar Produk" onClick={() => router.push("/produk")} color="green" />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Transaksi Terakhir</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left">ID Transaksi</th>
                    <th className="py-3 px-4 text-left">Kasir</th>
                    <th className="py-3 px-4 text-left">Tanggal</th>
                    <th className="py-3 px-4 text-left">Waktu</th>
                    <th className="py-3 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="text-center py-4">
                        Loading...
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-4">
                        Tidak ada transaksi
                      </td>
                    </tr>
                  ) : (
                    transactions.map((penjualan) => (
                      <tr key={penjualan.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">TRX-{penjualan.id.toString().padStart(3, "0")}</td>
                        <td className="py-3 px-4">{penjualan.kasir.nama}</td>
                        <td className="py-3 px-4">
                          {new Date(penjualan.createdAt).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-4">
                          {new Date(penjualan.createdAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-4 text-right">Rp {penjualan.total.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <Pagination filters={filters} meta={meta} handlePageChange={handlePageChange} />
            </div>
          </div>
        </main>
      </div>
    </div>
    </ProtectedPage>
  );
}
