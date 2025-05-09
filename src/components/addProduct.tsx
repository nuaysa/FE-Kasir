"use client";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import axios from "axios";
import toast from "react-hot-toast";
import { Kategori, Produk } from "@/types/produk";
import { useToken } from "@/hooks/useToken";
import { useEffect, useState } from "react";

interface ProductModalProps {
  product?: Produk | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ProductSchema = Yup.object().shape({
  nama: Yup.string().required("Nama produk wajib diisi"),
  kategoriId: Yup.number().required("Kategori wajib diisi").min(1),
  hargaBeli: Yup.number().required("Harga beli wajib diisi").min(0),
  hargaJualGrosir: Yup.number().required("Harga grosir wajib diisi").min(0),
  hargaJualRetail: Yup.number().required("Harga retail wajib diisi").min(0),
  qtyMinGrosir: Yup.number().required("Minimal qty grosir wajib diisi").min(0),
  totalStok: Yup.number().required("Stok wajib diisi").min(0),
});

export default function ProductModal({ product, onClose, onSuccess }: ProductModalProps) {
  const token = useToken();
  const isEdit = !!product;
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);

  useEffect(() => {
    if (!token) return;

    const fetchKategori = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_BE}/category`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setKategoriList(res.data.data);
      } catch (err) {
        toast.error("Gagal memuat kategori");
      }
    };

    fetchKategori();
  }, [token]);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">{isEdit ? "Edit Produk" : "Tambah Produk"}</h1>

        <Formik
          initialValues={{
            nama: product?.nama || "",
            kategoriId: product?.kategoriId || 0,
            hargaBeli: product?.hargaBeli || 0,
            hargaJualGrosir: product?.hargaJualGrosir || 0,
            hargaJualRetail: product?.hargaJualRetail || 0,
            qtyMinGrosir: product?.qtyMinGrosir || 0,
            totalStok: product?.totalStok || 0,
          }}
          validationSchema={ProductSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              if (!token) throw new Error("Unauthorized");

              if (isEdit) {
                const changedFields: Record<string, any> = {};

                // Loop semua field
                Object.entries(values).forEach(([key, val]) => {
                  if (val !== (product as any)?.[key]) {
                    changedFields[key] = val;
                  }
                });

                if (Object.keys(changedFields).length === 0) {
                  toast.error("Tidak ada perubahan data");
                  return;
                }

                await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL_BE}/product/${product!.id}`, changedFields, {
                  headers: { Authorization: `Bearer ${token}` },
                });

                toast.success("Produk berhasil diperbarui");
              } else {
                await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL_BE}/product`, values, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Produk berhasil ditambahkan");
              }

              onSuccess();
            } catch (err: any) {
              toast.error(err.response?.data?.message || err.message || "Terjadi kesalahan");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="space-y-4">
              <FormField name="nama" label="Nama Produk" errors={errors} touched={touched} />
              <div>
                <Field as="select" name="kategoriId" className="w-full border px-3 py-2 rounded-lg bg-white">
                  <option value="">Pilih Kategori</option>
                  {kategoriList.map((kat) => (
                    <option key={kat.id} value={kat.id}>
                      {kat.nama}
                    </option>
                  ))}
                </Field>
                {touched.kategoriId && errors.kategoriId && <div className="text-red-500 text-sm mt-1">{errors.kategoriId}</div>}
              </div>
              <FormField name="hargaBeli" label="Harga Beli" type="number" errors={errors} touched={touched} />
              <FormField name="hargaJualGrosir" label="Harga Jual Grosir" type="number" errors={errors} touched={touched} />
              <FormField name="hargaJualRetail" label="Harga Jual Retail" type="number" errors={errors} touched={touched} />
              <FormField name="qtyMinGrosir" label="Qty Minimum Grosir" type="number" errors={errors} touched={touched} />
              <FormField name="totalStok" label="Stok Produk" type="number" errors={errors} touched={touched} />

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
                  {isEdit ? "Simpan Perubahan" : "Tambah Produk"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

// Reusable form field component
function FormField({ name, label, type = "text", errors, touched }: { name: string; label: string; type?: string; errors: any; touched: any }) {
  return (
    <div>
      <label className="block text-gray-700 text-sm font-bold mb-1">{label}</label>
      <Field type={type} name={name} className="w-full border px-3 py-2 rounded-lg" placeholder={`Masukkan ${label.toLowerCase()}`} />
      {touched[name] && errors[name] && <div className="text-red-500 text-sm mt-1">{errors[name]}</div>}
    </div>
  );
}
