"use client";
import { useToken } from "@/hooks/useToken";
import { Kategori, Produk } from "@/types/produk";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiSearch } from "react-icons/fi";
import Pagination from "./pagination";

interface ProductListProps {
  onlyAvailable?: boolean;
  onSelectProduct?: (product: Produk) => void;
}

export default function ProductList({ onlyAvailable = false, onSelectProduct }: ProductListProps) {
  const [products, setProducts] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    sortBy: "nama",
    order: "asc",
    page: 1,
    pageSize: 10,
  });
  const [categories, setCategories] = useState<Kategori[]>([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const token = useToken();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Convert all values to string explicitly
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value)); // Convert semua value ke string
        }
      });

      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_BE}/product`, {
        params, // Gunakan params object langsung (axios akan handle conversion)
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setProducts(response.data.data);
      setMeta(response.data.meta);
    } catch (err: any) {
      console.error("Failed to fetch products:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_BE}/category`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });

      setCategories(response.data.data || []);
    } catch (err: any) {
      console.error("Failed to fetch categories:", err);
      setCategories([]); // Set ke array kosong jika error
    }
  };

  useEffect(() => {
    if (token === null) return;
    if (!token) {
      toast.error("Unauthorized!");
    }
    if (token) {
      fetchProducts();
      fetchCategories();
    }
  }, [token, filters.page, filters.search, filters.category, filters.sortBy, filters.order]);

  const handleFilterChange = (key: keyof typeof filters, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "category" && { page: 1 }), // Reset to page 1 when category changes
    }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= meta.totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };
  const displayedProducts = onlyAvailable ? products.filter((p) => p.totalStok > 0) : products;

  return (
    <div className="flex-1 p-4 ml-24">
      <h1 className="text-2xl font-bold mb-6">Daftar Produk</h1>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Cari Produk</label>
            <div className="relative">
              <input type="text" value={filters.search} onChange={(e) => handleFilterChange("search", e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" placeholder="Nama produk..." />
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div className="min-w-[150px]">
            <label className="block text-sm font-medium mb-1">Kategori</label>
            <select value={filters.category} onChange={(e) => handleFilterChange("category", e.target.value)} className="w-full p-2 border rounded-lg">
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.nama}>
                  {cat.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[150px]">
            <label className="block text-sm font-medium mb-1">Urutkan</label>
            <select value={filters.sortBy} onChange={(e) => handleFilterChange("sortBy", e.target.value)} className="w-full p-2 border rounded-lg">
              <option value="nama">Nama</option>
              <option value="hargaJualRetail">Harga</option>
            </select>
          </div>

          <div className="min-w-[100px]">
            <label className="block text-sm font-medium mb-1">Arah</label>
            <select value={filters.order} onChange={(e) => handleFilterChange("order", e.target.value)} className="w-full p-2 border rounded-lg">
              <option value="asc">A-Z</option>
              <option value="desc">Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Memuat data...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <>
            <table className="min-w-full">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Produk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty min grosir</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Harga Retail</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Harga Grosir</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stok</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {onlyAvailable
                  ? displayedProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelectProduct?.(product)}>
                        <td className="px-6 py-4 whitespace-nowrap">{product.nama}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{product.kategori?.nama || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{product.qtyMinGrosir}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">Rp {product.hargaJualRetail.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">Rp {product.hargaJualGrosir.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">{product.totalStok}</td>
                      </tr>
                    ))
                  : products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{product.nama}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{product.kategori?.nama || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{product.qtyMinGrosir}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">Rp {product.hargaJualRetail.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">Rp {product.hargaJualGrosir.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">{product.totalStok}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
            {/* Pagination */}
            <Pagination filters={filters} meta={meta} handlePageChange={handlePageChange} />
          </>
        )}
      </div>
    </div>
  );
}
