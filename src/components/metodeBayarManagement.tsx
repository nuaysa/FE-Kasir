"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Formik, Form, Field } from "formik";
import toast from "react-hot-toast";
import { useToken } from "@/hooks/useToken";

interface PaymentMethod {
  id: number;
  nama: string;
}

export default function PaymentMethodManager() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const token = useToken();

  const fetchMethods = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_BE}/bayar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMethods(res.data.data);
    } catch (err) {
      toast.error("Gagal memuat metode bayar");
    }
  };

  useEffect(() => {
    if (token) {
      fetchMethods();
    }
  }, [token]);

  const handleSubmit = async (values: { namaMetode: string }, { resetForm }: any) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL_BE}/bayar`, values, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      toast.success("Metode bayar ditambahkan");
      fetchMethods();
      resetForm();
    } catch (err) {
      toast.error("Gagal menambahkan metode bayar");
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-md my-4">
      <h2 className="text-xl font-bold mb-4">Manajemen Metode Pembayaran</h2>

      {/* Form tambah metode */}
      <Formik initialValues={{ namaMetode: "" }} onSubmit={handleSubmit}>
        <Form className="flex gap-2 items-center mb-4">
          <Field name="namaMetode" placeholder="Nama metode bayar" className="border px-3 py-2 rounded w-full" />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Tambah
          </button>
        </Form>
      </Formik>

      {/* List metode bayar */}
      <div>
        <table className="min-w-full">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Metode</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {methods.map((method) => (
              <tr key={method.id}>
                <td className="px-6 py-4">{method.nama}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
