export interface PenjualanResponse {
  success: boolean;
  data: Penjualan[];
}

export interface Penjualan {
  id: number; // ISO date string
  total: number;
  kasirId: number;
  metodeBayarId: number;
  PenjualanDetail: PenjualanDetail[];
  kasir: Kasir;
  metodeBayar: MetodeBayar;
  createdAt: string;
}

export interface PenjualanDetail {
  id: number;
  produkId: number;
  penjualanId: number;
  stokId: number;
  harga: number;
  qty: number;
  tipe: "Eceran" | "Grosir";
  produk: Produk;
  Komisi: Komisi[];
}

export interface Produk {
  id: number;
  nama: string;
  kategoriId: number;
  hargaBeli: number;
  hargaJualRetail: number;
  hargaJualGrosir: number;
  qtyMinGrosir: number;
  isDeleted: boolean;
  deletedAt: string | null;
}

export interface Kasir {
  id: number;
  nama: string;
  username: string;
  password: string;
  email: string;
  role: "Admin" | "Kasir";
  verifikasi: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
}

export interface MetodeBayar {
  id: number;
  nama: string;
}

export interface Komisi {
  id?: number; // Kosong di data kamu, jadi opsional
  penjualanDetailId?: number;
  kasirId?: number;
  jumlah?: number;
  createdAt?: string;
}

export interface metodeBayarResponse {
  suxcess: boolean;
  data: MetodeBayar[];
}

export interface MetodeBayar {
  id: number;
  nama: string;
}
