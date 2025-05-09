import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface PaginationProps {
    filters: {
      page: number;
      pageSize: number;
    };
    meta: {
      total: number;
      totalPages: number;
    };
    handlePageChange: (page: number) => void;
  }

export default function Pagination ({ filters, meta, handlePageChange }: PaginationProps) {
  if (!meta || typeof meta.total !== "number" || !filters) {
    return null; // atau loading skeleton
  }
    return (
        <div className="px-6 py-4 border-t flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Menampilkan <span className="font-medium">{(filters.page - 1) * filters.pageSize + 1}</span> - <span className="font-medium">{Math.min(filters.page * filters.pageSize, meta.total)}</span> dari{" "}
          <span className="font-medium">{meta.total}</span> produk
        </div>
        <div className="flex space-x-2">
          <button onClick={() => handlePageChange(filters.page - 1)} disabled={filters.page === 1} className="px-3 py-1 border rounded-md disabled:opacity-50">
            <FiChevronLeft />
          </button>
          {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
            let pageNum;
            if (meta.totalPages <= 5) {
              pageNum = i + 1;
            } else if (filters.page <= 3) {
              pageNum = i + 1;
            } else if (filters.page >= meta.totalPages - 2) {
              pageNum = meta.totalPages - 4 + i;
            } else {
              pageNum = filters.page - 2 + i;
            }
            return (
              <button key={pageNum} onClick={() => handlePageChange(pageNum)} className={`px-3 py-1 border rounded-md ${filters.page === pageNum ? "bg-blue-500 text-white" : ""}`}>
                {pageNum}
              </button>
            );
          })}
          <button onClick={() => handlePageChange(filters.page + 1)} disabled={filters.page === meta.totalPages} className="px-3 py-1 border rounded-md disabled:opacity-50">
            <FiChevronRight />
          </button>
        </div>
      </div>
    )
}