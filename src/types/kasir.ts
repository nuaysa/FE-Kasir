export interface KasirDetailResponse {
    message: string;
    data: KasirDetail;
  }
  
  export interface KasirDetail {
    id: number;
    nama: string;
    username: string;
    password: string;
    email: string;
    role: "Kasir" | "Admin"; // asumsi hanya 2 role ini
    verifikasi: boolean;
    isDeleted: boolean;
    deletedAt: string | null;
    Komisi: KomisiKasir[];
    Penjualan: PenjualanSummary[];
  }
  
  export interface KomisiKasir {
    id?: number;
    penjualanDetailId?: number;
    kasirId?: number;
    jumlah?: number;
    createdAt?: string;
  }
  
  export interface PenjualanSummary {
    id: number;
    tanggal: string;
    total: number;
    kasirId: number;
    metodeBayarId: number;
  }
  
export interface StatKasir {
  todaySales: number;
  transactionCount: number;
  popularProduct: string;
}
