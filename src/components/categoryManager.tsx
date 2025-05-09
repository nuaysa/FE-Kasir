"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Formik, Form, Field } from "formik";
import toast from "react-hot-toast";
import { useToken } from "@/hooks/useToken";
import { Kategori } from "@/types/produk";

export default function CategoryManager() {
  const [categories, setCategories] = useState<Kategori[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formValues, setFormValues] = useState({ nama: "", komisi: "" });
  const token = useToken();

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_BE}/category`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data.data || []);
    } catch (err) {
      toast.error("Gagal memuat kategori");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [token]);

  const getKomisiValue = (category: Kategori) => {
    return category.komisi.length > 0 ? category.komisi[0].persen.toString() : "";
  };

  useEffect(() => {
    if (editingId) {
      const toEdit = categories.find((c) => c.id === editingId);
      if (toEdit) {
        setFormValues({
          nama: toEdit.nama,
          komisi: getKomisiValue(toEdit),
        });
      }
    } else {
      setFormValues({ nama: "", komisi: "" });
    }
  }, [editingId, categories]);

  const handleSubmit = async (values: { nama: string; komisi: string }) => {
    try {
      let categoryId = editingId;

      if (editingId) {
        await axios.patch(
          `${process.env.NEXT_PUBLIC_BASE_URL_BE}/category/${editingId}`,
          { nama: values.nama, komisi: Number(values.komisi) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL_BE}/category`,
          { nama: values.nama, komisi: Number(values.komisi) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        categoryId = res.data.data.id;
      }

      toast.success(editingId ? "Kategori diperbarui" : "Kategori ditambahkan");
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      toast.error("Gagal menyimpan kategori atau komisi");
    }
  };

  const handleEdit = (category: Kategori) => {
    setEditingId(category.id);
  };

  const handleDelete = async (id: number) => {
    const confirm = window.confirm("Yakin ingin menghapus kategori ini?");
    if (!confirm) return;

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL_BE}/category/delete/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Kategori berhasil dihapus");
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menghapus kategori");
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-md my-4">
      <h2 className="text-xl font-bold mb-4">Manajemen Kategori</h2>
      <div>
        <Formik
          initialValues={formValues}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          <Form className="flex gap-2 items-center mb-4">
            <Field
              name="nama"
              placeholder="Nama kategori"
              className="border px-3 py-2 rounded w-full"
            />
            <Field
              name="komisi"
              placeholder="Komisi (%)"
              type="number"
              className="border px-3 py-2 rounded w-32"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              {editingId ? "Update" : "Tambah"}
            </button>
          </Form>
        </Formik>
      </div>
      <div>
        <table className="min-w-full">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Kategori</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Komisi (%)</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td className="px-6 py-4">{cat.nama}</td>
                <td className="px-6 py-4">{getKomisiValue(cat) || "-"}</td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="text-blue-600 hover:underline mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
