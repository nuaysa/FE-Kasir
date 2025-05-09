"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Formik, Form, Field } from "formik";
import toast from "react-hot-toast";
import { useToken } from "@/hooks/useToken";

interface Supplier {
  id: number;
  nama: string;
  kontak: string;
}

export default function SupplierManager() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formValues, setFormValues] = useState({ nama: "", kontak: "" });
  const token = useToken();

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_BE}/suplier`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuppliers(response.data.data);
    } catch (err) {
      toast.error("Gagal memuat supplier");
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [token]);

  useEffect(() => {
    if (editingId) {
      const toEdit = suppliers.find((s) => s.id === editingId);
      if (toEdit) {
        setFormValues({ nama: toEdit.nama, kontak: toEdit.kontak || "" });
      }
    } else {
      setFormValues({ nama: "", kontak: "" });
    }
  }, [editingId, suppliers]);

  const handleSubmit = async (values: { nama: string; kontak: string }) => {
    try {
      if (editingId) {
        await axios.patch(
          `${process.env.NEXT_PUBLIC_BASE_URL_BE}/suplier/${editingId}`,
          values,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        toast.success("Supplier diperbarui");
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL_BE}/suplier`,
          values,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        toast.success("Supplier ditambahkan");
      }
      setEditingId(null);
      fetchSuppliers();
    } catch (err) {
      toast.error("Gagal menyimpan supplier");
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingId(supplier.id);
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-md my-4">
      <h2 className="text-xl font-bold mb-4">Manajemen Supplier</h2>
      <div>
        <Formik
          initialValues={formValues}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          <Form className="flex gap-2 items-center mb-4">
            <Field name="nama" placeholder="Nama supplier" className="border px-3 py-2 rounded w-full" />
            <Field name="kontak" placeholder="Kontak" className="border px-3 py-2 rounded w-full" />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full sm:w-auto">
              {editingId ? "Update" : "Tambah"}
            </button>
          </Form>
        </Formik>
      </div>

      <div>
        <table className="min-w-full">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Suplier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kontak Suplier</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {suppliers.map((sup) => (
              <tr key={sup.id}>
                <td className="px-6 py-4">{sup.nama}</td>
                <td className="px-6 py-4">{sup.kontak}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => handleEdit(sup)} className="text-blue-600 hover:underline mr-2">
                    Edit
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
