"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useToken } from "@/hooks/useToken";
import { Penjualan } from "@/types/transaksi";
import { useReactToPrint } from "react-to-print";
import ProtectedPage from "@/hoc/protectedRoutes";

export default function TransactionDetailPage() {
  const params = useParams();
  const transactionId = params?.transactionId as string;
  const [transaction, setTransaction] = useState<Penjualan>();
  const [loading, setLoading] = useState(true);
  const token = useToken();
  const router = useRouter();
  const hasCheckedAuth = useRef(false);
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasCheckedAuth.current) {
      if (token === null) {
        return;
      }
      if (!token) {
        toast.error("Session berakhir, silakan login lagi");
        router.push("/sign-in");
        return;
      }
      hasCheckedAuth.current = true;
    }

    const fetchTransaction = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_BE}/penjualan/${transactionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setTransaction(response.data.data.penjualan);
      } catch (error) {
        toast.error("Gagal memuat detail transaksi");
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [transactionId, token, router]);

  const handleSendEmail = async (transactionId: number) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL_BE}/penjualan/email/${transactionId}`);
      toast.success("Struk berhasil dikirim ke email!");
    } catch (error) {
      toast.error("Gagal mengirim email.");
    }
  };

  // const handlePrint = useReactToPrint({
  //   content: () => {
  //     if (!componentRef.current) {
  //       toast.error("Konten struk belum siap untuk dicetak");
  //       return null;
  //     }
  //     return componentRef.current;
  //   },
  //   documentTitle: `Struk-${transactionId}`,
  //   removeAfterPrint: true,
  //   onAfterPrint: () => toast.success("Berhasil dicetak"),
  //   pageStyle: `
  //   @page { size: 80mm auto; margin: 0; }
  //   @media print {
  //     body { font-size: 12px; padding: 5mm; }
  //     button { display: none !important; }
  //   }
  // `,
  // });

  const groupedDetails = transaction?.PenjualanDetail.reduce((acc: any, item: any) => {
    const produkId = item.produk?.id;
    if (!produkId) return acc;

    if (!acc[produkId]) {
      acc[produkId] = {
        namaProduk: item.produk.nama,
        qty: 0,
        harga: item.harga,
      };
    }
    acc[produkId].qty += item.qty;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500 text-lg animate-pulse">Loading transaksi...</div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-lg">Transaksi tidak ditemukan</div>
      </div>
    );
  }

  return (
    <ProtectedPage allowedRoles={["Kasir"]}>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
        {/* <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"> */}
        <div ref={componentRef} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">Struk Pembelian</h1>

          <div className="space-y-2 mb-6 text-sm text-gray-700">
            <div className="flex justify-between">
              <strong>ID Transaksi:</strong> TRX-{transaction.id.toString().padStart(3, "0")}
            </div>
            <div className="flex justify-between">
              <strong>Kasir:</strong> {transaction.kasir?.nama || "Kasir"}
            </div>
            <div className="flex justify-between">
              <strong>Tanggal:</strong> {new Date(transaction.createdAt).toLocaleString()}
            </div>
            <div className="flex justify-between">
              <strong>Metode Bayar:</strong> {transaction.metodeBayar?.nama || "Tidak diketahui"}
            </div>
          </div>
          <div className="border-t pt-4 space-y-2">
            {Object.values(groupedDetails).map((item: any, index: number) => (
              <div key={index} className="flex justify-between">
                <div>
                  {item.namaProduk} x {item.qty}
                </div>
                <div>Rp {(item.harga * item.qty).toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-right text-xl font-bold text-blue-600">Total: Rp {(transaction?.total ?? 0).toLocaleString()}</div>
        </div>

        <div className="flex gap-4 mt-8">
          {/* <button onClick={handlePrint} className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition-all">
          Cetak Struk
        </button> */}
          <button onClick={() => handleSendEmail(transaction.id)} className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md transition-all">
            Kirim ke Email
          </button>
        </div>
        <button onClick={() => router.push("/transaksi")} className="mt-2 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md transition-all">
          Kembali ke laman transaksi
        </button>
      </div>
    </ProtectedPage>
  );
}
