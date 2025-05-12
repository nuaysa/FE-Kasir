"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Selamat Datang di Aplikasi Kasir</h1>
        <p className="text-gray-600 mb-6">
          Kelola penjualan dan laporan bisnismu dengan mudah dan cepat.
        </p>
        <button
          onClick={() => router.push("/sign-in")}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition duration-200"
        >
          Masuk ke Aplikasi
        </button>
      </div>
    </main>
  );
}
