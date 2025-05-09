"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useToken } from "@/hooks/useToken";
import Pagination from "./pagination";

type SortBy = "tanggal" | "totalPenjualan";
type Order = "asc" | "desc";

type DailyReport = {
  id: number;
  tanggal: string;
  stokAwal: number;
  stokAkhir: number;
  totalPenjualan: number;
  totalHPP: number;
  totalLaba: number;
  totalKomisi: number;
};

type Meta = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export default function DailyReportTable() {
  const token = useToken();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
    sortBy: "tanggal" as SortBy,
    order: "desc" as Order,
    filterDate: "",
  });
  const [meta, setMeta] = useState<Meta>({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });

  const fetchReports = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        pageSize: filters.pageSize,
        sortBy: filters.sortBy,
        order: filters.order,
        filterDate: filters.filterDate || undefined,
      };

      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_BE}/laporan`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      setReports(response.data.data);
      setMeta(response.data.meta);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal memuat laporan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [token, filters]);
 
  const handleFilterChange = <K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) => {
    if (key === "filterDate") {
      const dateWithTime = `${value}T00:00:00`;
      setFilters((prev) => ({
        ...prev,
        [key]: dateWithTime,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  const handleSortChange = (newSortBy: SortBy) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: newSortBy,
      order: prev.sortBy === newSortBy ? (prev.order === "asc" ? "desc" : "asc") : "desc",
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= meta.totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="p-4 ml-24">
      <h1 className="text-2xl font-bold mb-4">Laporan Harian</h1>

      <div className="bg-white p-4 rounded shadow mb-4 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Tanggal</label>
          <input type="date" value={filters.filterDate} onChange={(e) => handleFilterChange("filterDate", e.target.value)} className="w-full p-2 border rounded" />
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Urutkan Berdasarkan</label>
          <div className="flex gap-2">
            <select value={filters.sortBy} onChange={(e) => handleFilterChange("sortBy", e.target.value as SortBy)} className="flex-1 p-2 border rounded">
              <option value="tanggal">Tanggal</option>
              <option value="totalPenjualan">Total Penjualan</option>
            </select>
            <button onClick={() => handleFilterChange("order", filters.order === "asc" ? "desc" : "asc")} className="p-2 border rounded">
              {filters.order === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Items per Page</label>
          <select value={filters.pageSize} onChange={(e) => handleFilterChange("pageSize", Number(e.target.value))} className="w-full p-2 border rounded">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-auto">
        {loading ? (
          <div className="p-6 text-center">Memuat laporan...</div>
        ) : reports.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Tidak ada data</div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange("tanggal")}>
                    Tanggal
                    {filters.sortBy === "tanggal" && <span className="ml-1">{filters.order === "asc" ? "↑" : "↓"}</span>}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok Awal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok Akhir</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total HPP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Komisi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange("totalPenjualan")}>
                    Total Penjualan
                    {filters.sortBy === "totalPenjualan" && <span className="ml-1">{filters.order === "asc" ? "↑" : "↓"}</span>}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Laba</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(report.tanggal).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.stokAwal}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.stokAkhir}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp {report.totalHPP.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp {report.totalKomisi.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp {report.totalPenjualan.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp {report.totalLaba.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination filters={filters} meta={meta} handlePageChange={handlePageChange} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
