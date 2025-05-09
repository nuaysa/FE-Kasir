"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useToken } from "@/hooks/useToken";
import { Kasir } from "@/types/transaksi";
import CashierModal from "./cashierModal";
import { KasirDetail } from "@/types/kasir";

export default function AdminCashierList() {
  const token = useToken();
  const [cashiers, setCashiers] = useState<KasirDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCashier, setEditingCashier] = useState<KasirDetail | null>(null);

  const fetchCashiers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_BE}/kasir`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const filtered = res.data.data.filter((Kasir: Kasir) => Kasir.role === "Kasir");
      setCashiers(filtered);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal memuat data kasir");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirm = window.confirm("Yakin ingin menghapus kasir ini?");
    if (!confirm) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL_BE}/kasir/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Kasir berhasil dihapus");
      fetchCashiers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus kasir");
    }
  };

  const handleEdit = (cashier: KasirDetail) => {
    setEditingCashier(cashier);
    setShowModal(true);
  };

  useEffect(() => {
    if (token) fetchCashiers();
  }, [token]);

  return (
    <div className="flex-1 p-4 ml-24">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Daftar Kasir</h1>
        <button onClick={() => setShowModal(true)} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded">
          + Tambah Kasir
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Memuat data...</div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-green-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">userrname</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">komisi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cashiers.map((cashier) => (
                <tr key={cashier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{cashier.nama}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{cashier.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{cashier.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{cashier.Komisi.reduce((total, k) => total + k.jumlah!, 0)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button onClick={() => handleEdit(cashier)} className="text-blue-600 hover:underline mr-2">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(cashier.id)} className="text-red-600 hover:underline">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && <CashierModal
      cashier={editingCashier}
      onClose={() => {
        setShowModal(false);
        setEditingCashier(null);
        fetchCashiers();
      }} />}
    </div>
  );
}
