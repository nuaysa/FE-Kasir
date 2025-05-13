"use client";

import { useState, useEffect } from "react";
import { Produk } from "@/types/produk";
import ProductList from "@/components/productList";
import { TrashIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { MetodeBayar } from "@/types/transaksi";
import axios from "axios";
import { useToken } from "@/hooks/useToken";
import SidebarKasir from "@/components/kasirSidebar";
import ProtectedPage from "@/hoc/protectedRoutes";

export default function TransaksiPage() {
  const router = useRouter();
  const [cart, setCart] = useState<{ product: Produk; qty: number; total: number }[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<MetodeBayar[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const token = useToken();

  useEffect(() => {
    if (token) {
      fetchMetodeBayar();
    }
  }, [token]);

  const fetchMetodeBayar = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_BE}/bayar`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setPaymentMethods(response.data.data);

      if (response.data.data.length > 0) {
        setPaymentMethod(response.data.data[0].id.toString());
      }
    } catch (err) {
      console.error("Failed to fetch payment methods:", err);
      toast.error("Gagal memuat metode pembayaran");
    }
  };

  const handleAddToCart = (product: Produk) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);

      if (existing) {
        if (existing.qty >= product.totalStok) {
          toast.error(`Stok ${product.nama} hanya tersedia ${product.totalStok}`);
          return prev;
        }

        return prev.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                qty: item.qty + 1,
                total: item.qty + 1 >= product.qtyMinGrosir ? product.hargaJualGrosir * (item.qty + 1) : product.hargaJualRetail * (item.qty + 1),
              }
            : item
        );
      } else {
        if (product.totalStok < 1) {
          toast.error(`Stok ${product.nama} habis`);
          return prev;
        }

        return [
          ...prev,
          {
            product,
            qty: 1,
            total: 1 >= product.qtyMinGrosir ? product.hargaJualGrosir : product.hargaJualRetail,
          },
        ];
      }
    });
  };

  const handleDecreaseQty = (productId: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.qty - 1;
            return {
              ...item,
              qty: newQty,
              total: newQty >= item.product.qtyMinGrosir ? item.product.hargaJualGrosir * newQty : item.product.hargaJualRetail * newQty,
            };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.qty >= item.product.qtyMinGrosir ? item.product.hargaJualGrosir : item.product.hargaJualRetail;
      return total + price * item.qty;
    }, 0);
  };

  const getItemPrice = (item: { product: Produk; qty: number }) => {
    return item.qty >= item.product.qtyMinGrosir ? item.product.hargaJualGrosir : item.product.hargaJualRetail;
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL_BE}/penjualan`,
        {
          metodeBayarId: parseInt(paymentMethod),
          items: cart.map((item) => ({
            produkId: item.product.id,
            qty: item.qty,
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const transaksiId = response.data?.penjualanId;

      router.push(`/transaksi/${transaksiId}`);
    } catch (error: any) {
      console.error("Payment error:", error.message);
      toast.error("Gagal memproses pembayaran");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ProtectedPage allowedRoles={["Kasir"]}>
      <div className="flex">
        <SidebarKasir />
        <div className="w-2/3 p-4 overflow-y-auto">
          <ProductList onlyAvailable onSelectProduct={handleAddToCart} />
        </div>

        <div className="w-1/3 p-4 border-l overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Keranjang</h2>
          {cart.length === 0 ? (
            <p className="text-gray-500">Keranjang kosong</p>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center mb-2 p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="font-medium">{item.product.nama}</div>
                    <div className="text-sm text-gray-500">
                      Stok: {item.product.totalStok} | Qty: {item.qty}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleDecreaseQty(item.product.id)} className="px-2 py-1 h-7 w-7 text-center items-center flex bg-yellow-400 rounded text-white">
                      -
                    </button>
                    <button onClick={() => handleRemoveFromCart(item.product.id)} className="px-2 py-1 h-7 w-7 text-center items-center flex bg-red-400 text-white rounded">
                      <TrashIcon size={16} />
                    </button>
                    <div className="w-24 text-right">Rp {(item.qty >= item.product.qtyMinGrosir ? item.product.hargaJualGrosir * item.qty : item.product.hargaJualRetail * item.qty).toLocaleString()}</div>
                  </div>
                </div>
              ))}
              <div className="mt-4 p-4 bg-blue-50 rounded">
                <div className="font-bold text-lg">Total: Rp {calculateTotal().toLocaleString()}</div>
              </div>
            </>
          )}
          <div>
            <button
              className={`mt-4 w-full bg-blue-500 px-4 py-2 rounded-lg text-white cursor-pointer hover:bg-blue-600 disabled:bg-neutral-500 disabled:cursor-not-allowed`}
              disabled={cart.length === 0 || isProcessing}
              onClick={() => setShowPaymentModal(true)}
            >
              {isProcessing ? "Memproses..." : "Konfirmasi Pembayaran"}
            </button>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Konfirmasi Pembayaran</h3>

              <div className="mb-6">
                <h4 className="font-medium mb-2">Detail Pesanan:</h4>
                <div className="max-h-60 overflow-y-auto mb-4 border rounded p-2">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex justify-between py-2 border-b last:border-b-0">
                      <span>
                        {item.product.nama} x {item.qty}
                      </span>
                      <span>Rp {(item.qty >= item.product.qtyMinGrosir ? item.product.hargaJualGrosir * item.qty : item.product.hargaJualRetail * item.qty).toLocaleString("id-ID")}</span>
                    </div>
                  ))}
                </div>
                <div className="font-bold text-lg text-right">Total: Rp {calculateTotal().toLocaleString("id-ID")}</div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-2">Metode Pembayaran:</h4>
                <div className="flex flex-wrap gap-2 justify-between">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id.toString())}
                      className={`px-4 py-2 rounded border ${paymentMethod === method.id.toString() ? "bg-blue-400 text-white" : "bg-white text-black hover:bg-gray-100"}`}
                      disabled={isProcessing}
                    >
                      {method.nama}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => setShowPaymentModal(false)} className="px-4 py-2 border rounded hover:bg-gray-100" disabled={isProcessing}>
                  Batal
                </button>
                <button onClick={handleConfirmPayment} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300" disabled={isProcessing || !paymentMethod}>
                  {isProcessing ? "Memproses..." : "Konfirmasi"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}
