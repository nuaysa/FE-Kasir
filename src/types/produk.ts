// types/produk.ts

// Interface untuk Stok
export interface Stok {
    id: number;
    produkId: number;
    serialNumber: string | null;
    expiredDate: string | null;
    qty: number;
    status: "Tersedia" | "Terjual" | string; // Tambahkan status lain jika ada
    createdAt: string;
}

export interface Komisi {
    id: number;
    kategoriId: number;
    persen: number;
}
// Interface untuk Kategori
export interface Kategori {
    id: number;
    nama: string;
    isDeleted: boolean;
    deletedAt: string | null;
    komisi : Komisi[]
  }
  
  // Interface untuk Produk
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
    Stok: Stok[];
    kategori: Kategori;
    totalStok: number
  }
  
  // Interface untuk Metadata Pagination
  export interface PaginationMeta {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }
  
  // Interface untuk Response Produk
  export interface ProdukResponse {
    data: Produk[];
    meta: PaginationMeta;
  }