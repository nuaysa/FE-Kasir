"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useToken } from "@/hooks/useToken";
import Pagination from "./pagination";
import Modal from "./modal";

type Produk = {
  id: number;
  nama: string;
  hargaBeli: number;
};

type Supplier = {
  id: number;
  nama: string;
  kontak: string;
};

type PembelianDetail = {
  id: number;
  produkId: number;
  qty: number;
  harga: number;
  produk: Produk;
};

type Pembelian = {
  id: number;
  suplierId: number;
  tanggal: string;
  total: number;
  status: string;
  PembelianDetail: PembelianDetail[];
  suplier: Supplier;
};

export default function PembelianPage() {
  const token = useToken();
  const [pembelians, setPembelians] = useState<Pembelian[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [produks, setProduks] = useState<Produk[]>([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ page: 1, pageSize: 10 });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    nama: "",
    kontak: "",
  });
  const [newPembelian, setNewPembelian] = useState({
    suplierId: 0,
    status: "Lunas", // default
    tanggalJatuhTempo: "", // kosong dulu
    items: [] as Array<{ produkId: number; qty: number; harga: number }>,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const pembelianRes = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_BE}/pembelian`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPembelians(pembelianRes.data.data.data);
      setMeta(pembelianRes.data.data.meta);

      // Fetch suppliers
      const supplierRes = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_BE}/suplier`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuppliers(supplierRes.data.data);

      // Fetch produks
      const produkRes = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_BE}/product`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProduks(produkRes.data.data);
    } catch (error) {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, filters.page, filters.pageSize]);

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };
  const handleCreateSupplier = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL_BE}/suplier`, newSupplier, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Supplier berhasil ditambahkan");
      setShowSupplierModal(false);
      setNewSupplier({ nama: "", kontak: "" });
      fetchData();
    } catch (error) {
      toast.error("Gagal menambahkan supplier");
    }
  };

  // Handle create pembelian
  const handleCreatePembelian = async () => {
    if (newPembelian.items.length === 0) {
      toast.error("Minimal tambahkan 1 produk");
      return;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL_BE}/pembelian`,
        {
          suplierId: newPembelian.suplierId,
          status: newPembelian.status,
          tanggalJatuhTempo: newPembelian.status === "Kredit" ? newPembelian.tanggalJatuhTempo : undefined,
          items: newPembelian.items,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Pembelian berhasil dibuat");
      setShowCreateModal(false);
      setNewPembelian({
        suplierId: 0,
        status: "Lunas",
        tanggalJatuhTempo: "",
        items: [],
      });
      fetchData();
    } catch (error) {
      toast.error("Gagal membuat pembelian");
    }
  };

  // Add produk to pembelian
  const handleAddProduk = () => {
    setNewPembelian((prev) => ({
      ...prev,
      items: [...prev.items, { produkId: 0, qty: 1, harga: 0 }],
    }));
  };

  // Update produk in pembelian
  const handleUpdateProduk = (index: number, field: string, value: any) => {
    setNewPembelian((prev) => {
      const newitems = [...prev.items];
      newitems[index] = { ...newitems[index], [field]: value };

      // Auto update harga if produk changed
      if (field === "produkId") {
        const selectedProduk = produks.find((p) => p.id === Number(value));
        if (selectedProduk) {
          newitems[index].harga = selectedProduk.hargaBeli;
        }
      }

      return { ...prev, items: newitems };
    });
  };

  // Remove produk from pembelian
  const handleRemoveProduk = (index: number) => {
    setNewPembelian((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleMarkAsLunas = async (pembelianId: number) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL_BE}/pembelian/${pembelianId}`,
        { statusPembelian: "Lunas" }, // bisa juga kirim statusPiutang kalau perlu
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Status pembelian berhasil diubah menjadi Lunas");
      fetchData(); // refresh data
    } catch (err) {
      toast.error("Gagal mengubah status");
    }
  };
  return (
    <div className="p-4 ml-24">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Data Pembelian</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowSupplierModal(true)} className="bg-blue-500 text-white px-4 py-2 rounded">
            Tambah Supplier
          </button>
          <button onClick={() => setShowCreateModal(true)} className="bg-green-500 text-white px-4 py-2 rounded">
            Buat Pembelian Baru
          </button>
        </div>
      </div>

      {/* Supplier Modal */}
      <Modal isOpen={showSupplierModal} onClose={() => setShowSupplierModal(false)} title="Tambah Supplier Baru">
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Nama Supplier</label>
            <input type="text" className="w-full p-2 border rounded" value={newSupplier.nama} onChange={(e) => setNewSupplier({ ...newSupplier, nama: e.target.value })} />
          </div>
          <div>
            <label className="block mb-1">Kontak</label>
            <input type="text" className="w-full p-2 border rounded" value={newSupplier.kontak} onChange={(e) => setNewSupplier({ ...newSupplier, kontak: e.target.value })} />
          </div>
          <button onClick={handleCreateSupplier} className="bg-blue-500 text-white px-4 py-2 rounded">
            Simpan
          </button>
        </div>
      </Modal>

      {/* Pembelian Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Buat Pembelian Baru" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Supplier</label>
            <select
              className="w-full p-2 border rounded"
              value={newPembelian.suplierId}
              onChange={(e) =>
                setNewPembelian({
                  ...newPembelian,
                  suplierId: Number(e.target.value),
                })
              }
            >
              <option value="0">Pilih Supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Produk</h3>
              <button onClick={handleAddProduk} className="bg-blue-500 text-white px-3 py-2 rounded text-sm m-3">
                Tambah Produk
              </button>
            </div>

            {newPembelian.items.map((detail, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                <div className="col-span-5">
                  <select className="w-full p-2 border rounded" value={detail.produkId} onChange={(e) => handleUpdateProduk(index, "produkId", Number(e.target.value))}>
                    <option value="0">Pilih Produk</option>
                    {produks.map((produk) => (
                      <option key={produk.id} value={produk.id}>
                        {produk.nama}
                      </option>
                    ))}
                  </select>
                  <div>
                    <label className="block mb-1">Status</label>
                    <select className="w-full p-2 border rounded" value={newPembelian.status} onChange={(e) => setNewPembelian({ ...newPembelian, status: e.target.value })}>
                      <option value="Lunas">Lunas</option>
                      <option value="Kredit">Kredit</option>
                    </select>
                  </div>{" "}
                  {newPembelian.status === "Kredit" && (
                    <div>
                      <label className="block mb-1">Tanggal Jatuh Tempo</label>
                      <input type="date" className="w-full p-2 border rounded" value={newPembelian.tanggalJatuhTempo} onChange={(e) => setNewPembelian({ ...newPembelian, tanggalJatuhTempo: e.target.value })} />
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <input type="number" className="w-full p-2 border rounded" min="1" value={detail.qty} onChange={(e) => handleUpdateProduk(index, "qty", Number(e.target.value))} />
                </div>
                <div className="col-span-3">
                  <input type="number" className="w-full p-2 border rounded" min="0" value={detail.harga} onChange={(e) => handleUpdateProduk(index, "harga", Number(e.target.value))} />
                </div>
                <div className="col-span-2">
                  <button onClick={() => handleRemoveProduk(index)} className="w-full bg-red-500 text-white p-2 rounded">
                    Hapus
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-4">
              <p className="font-medium">Total: Rp {newPembelian.items.reduce((sum, item) => sum + item.qty * item.harga, 0).toLocaleString()}</p>
            </div>
          </div>

          <button onClick={handleCreatePembelian} className="bg-green-500 text-white px-4 py-2 rounded" disabled={newPembelian.suplierId === 0}>
            Simpan Pembelian
          </button>
        </div>
      </Modal>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-auto">
        {loading ? (
          <div className="p-6 text-center">Memuat data...</div>
        ) : pembelians.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Tidak ada data pembelian</div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pembelians.map((pembelian) =>
                  pembelian.PembelianDetail.map((detail, index) => (
                    <tr key={`${pembelian.id}-${index}`}>
                      {index === 0 && (
                        <>
                          <td rowSpan={pembelian.PembelianDetail.length} className="px-6 py-4 whitespace-nowrap">
                            {new Date(pembelian.tanggal).toLocaleDateString()}
                          </td>
                          <td rowSpan={pembelian.PembelianDetail.length} className="px-6 py-4 whitespace-nowrap">
                            {pembelian.suplier.nama}
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">{detail.produk.nama}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{detail.qty}</td>
                      <td className="px-6 py-4 whitespace-nowrap">Rp {detail.harga.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">Rp {(detail.qty * detail.harga).toLocaleString()}</td>
                      {index === 0 && (
                        <td rowSpan={pembelian.PembelianDetail.length} className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${pembelian.status === "Lunas" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{pembelian.status}</span>
                          {pembelian.status === "Kredit" && (
                            <button onClick={() => handleMarkAsLunas(pembelian.id)} className="ml-2 text-sm text-blue-500 underline">
                              Tandai Lunas
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination filters={filters} meta={meta} handlePageChange={handlePageChange} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
