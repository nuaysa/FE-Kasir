"use client"
import { useRole } from "@/hooks/useRole";
import { useRouter } from "next/navigation";

export default function RedirectPage() {
    const router = useRouter();
    const role = useRole();
    const redirectTo = role === "ADMIN" ? "/admin/dashboard" : "/dashboard";
    return (
      <div className="text-center py-10">
        <h1 className="text-xl font-semibold mb-4">Akses ditolak</h1>
        <p className="mb-6">Kamu tidak memiliki akses ke halaman ini.</p>
        <button
          onClick={() => router.push(redirectTo)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }
