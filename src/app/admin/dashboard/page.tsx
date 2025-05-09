"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FiDollarSign, FiUsers, FiBox, FiShoppingCart } from "react-icons/fi";
import { Penjualan } from "@/types/transaksi";
import { useToken } from "@/hooks/useToken";
import useSession from "@/hooks/useSession";
import SidebarAdmin from "@/components/adminSidebar";
import StatCard from "@/components/statCard";
import Pagination from "@/components/pagination";
import ActionButton from "@/components/actionButton";
import toast from "react-hot-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import { File } from "lucide-react";
import { BsPeople } from "react-icons/bs";
import { GrReturn } from "react-icons/gr";
import ProtectedPage from "@/hoc/protectedRoutes";

export default function AdminDashboard() {
  const [transactions, setTransactions] = useState<Penjualan[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
    startDate: "",
    endDate: "",
  });
  const [stats, setStats] = useState({
    totalSales: 0,
    totalTransactions: 0,
    totalKasir: 0,
    totalProduk: 0,
    topProduct: "-",
  });
  const [salesByDay, setSalesByDay] = useState([]);
  const [salesByKasir, setSalesByKasir] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const { user, isLoading } = useSession();
  const token = useToken();
  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);

      const trxRes = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_BE}/penjualan?page=${filters.page}&pageSize=${filters.pageSize}&sortBy=tanggal&order=desc`, { headers: { Authorization: `Bearer ${token}` } });
      setTransactions(trxRes.data.data || []);
      setMeta(trxRes.data.meta);

      const statsRes = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_BE}/laporan/admin-stat`, { headers: { Authorization: `Bearer ${token}` } });
      setStats({
        totalSales: statsRes.data.summary.totalSales,
        totalTransactions: statsRes.data.summary.totalTransactions,
        totalKasir: statsRes.data.summary.totalKasir?.nama || 0,
        totalProduk: 0,
        topProduct: statsRes.data.summary.popularProduct,
      });

      const chartRes = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_BE}/laporan/chart?startDate=${filters.startDate}&endDate=${filters.endDate}`, { headers: { Authorization: `Bearer ${token}` } });
      setSalesByDay(chartRes.data.salesByDay || []);
      setSalesByKasir(chartRes.data.salesByKasir || []);
      setSalesByCategory(chartRes.data.salesByCategory || []);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= meta.totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.page, token, user, isLoading]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <ProtectedPage allowedRoles={["Admin"]}>
      <div className="min-h-screen bg-gray-100 flex">
        <SidebarAdmin />
        <div className="flex-1 p-6 ml-24">
          <h1 className="text-2xl font-bold mb-6">Dashboard Admin</h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard icon={<FiDollarSign className="text-blue-600 text-2xl" />} label="Total Penjualan" value={`Rp ${stats.totalSales.toLocaleString("id-ID")}`} />
            <StatCard icon={<FiShoppingCart className="text-green-600 text-2xl" />} label="Jumlah Transaksi" value={stats.totalTransactions} />
            <StatCard icon={<FiUsers className="text-purple-600 text-2xl" />} label="Jumlah Kasir" value={stats.totalKasir} />
            <StatCard icon={<FiBox className="text-yellow-600 text-2xl" />} label="Jumlah Produk" value={stats.totalProduk} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <ActionButton icon={<File className="text-white" />} label="Lihat Laporan" onClick={() => router.push("/admin/laporan")} color="blue" />
            <ActionButton icon={<BsPeople size={24} className="text-white" />} label="Kelola Kasir" onClick={() => router.push("/admin/kasir")} color="green" />
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-1">Dari Tanggal</label>
              <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className="border rounded px-3 py-2 w-full" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-1">Sampai Tanggal</label>
              <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className="border rounded px-3 py-2 w-full" />
            </div>
            <div className="flex items-end gap-2">
              <button onClick={fetchData} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded h-[42px]">
                Terapkan
              </button>
              <button
                onClick={() => {
                  setFilters((prev) => ({
                    ...prev,
                    startDate: "",
                    endDate: "",
                  }));
                  fetchData();
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded h-[42px]"
              >
                <GrReturn />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Penjualan Harian</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tanggal" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} name="Total Penjualan" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Transaksi per Kasir</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesByKasir}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="kasir" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="jumlah" fill="#10b981" name="Jumlah Transaksi" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-lg font-semibold mb-4">Penjualan per Kategori</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={salesByCategory} cx="50%" cy="50%" labelLine={false} outerRadius={120} fill="#8884d8" dataKey="jumlah" nameKey="kategori" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {salesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Transaksi Terbaru</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">ID</th>
                    <th className="text-left py-3 px-4">Kasir</th>
                    <th className="text-left py-3 px-4">Tanggal</th>
                    <th className="text-left py-3 px-4">Waktu</th>
                    <th className="text-right py-3 px-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        Loading...
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        Tidak ada data
                      </td>
                    </tr>
                  ) : (
                    transactions.map((trx) => (
                      <tr key={trx.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">TRX-{trx.id.toString().padStart(3, "0")}</td>
                        <td className="py-3 px-4">{trx.kasir?.nama || "-"}</td>
                        <td className="py-3 px-4">
                          {new Date(trx.createdAt).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-4">
                          {new Date(trx.createdAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-4 text-right">Rp {trx.total.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <Pagination filters={filters} meta={meta} handlePageChange={handlePageChange} />
            </div>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
