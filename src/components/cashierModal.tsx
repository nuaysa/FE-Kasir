"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { validationRegisterSchema } from "@/libs/schema";
import { KasirDetail } from "@/types/kasir";
import { useToken } from "@/hooks/useToken";

type Props = {
  onClose: () => void;
  cashier: KasirDetail | null; // null = mode tambah
};

export default function CashierModal({ onClose, cashier }: Props) {
  const [isLoading, setIsLoading] = useState(false);
    const token = useToken()

  const initialValues = {
    fullName: cashier?.nama || "",
    username: cashier?.username || "",
    email: cashier?.email || "",
    password: "",
    confirmPassword: "",
  };

  const handleSubmit = async (values: typeof initialValues, { resetForm }: { resetForm: () => void }) => {
    try {
      setIsLoading(true);
      const payload = {
        nama: values.fullName,
        username: values.username,
        email: values.email,
        password: values.password,
      };

      const editPayload: any = {
        nama: values.fullName,
        username: values.username,
      };
      
      if (values.password.trim() !== "") {
        payload.password = values.password;
      }
      
      if (cashier) {
        // edit mode
        await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL_BE}/kasir/edit/${cashier.id}`, payload, {headers: { Authorization: `Bearer ${token}` }});
        toast.success("Kasir berhasil diperbarui");
      } else {
        // add mode
        await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL_BE}/auth/register`, payload);
        toast.success("Kasir berhasil ditambahkan");
      }

      resetForm();
      onClose(); // Tutup modal & refresh
    } catch (err: any) {
      const msg =
        Array.isArray(err.response?.data?.message)
          ? err.response.data.message[0]
          : err.response?.data?.message || "Terjadi kesalahan.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-lg font-bold"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">{cashier ? "Edit Kasir" : "Tambah Kasir"}</h2>
        <Formik
          initialValues={initialValues}
          validationSchema={validationRegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                <Field name="fullName" type="text" className="w-full mt-1 px-3 py-2 border rounded-md" />
                <ErrorMessage name="fullName" component="div" className="text-red-600 text-sm mt-1" />
              </div>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                <Field name="username" type="text" className="w-full mt-1 px-3 py-2 border rounded-md" />
                <ErrorMessage name="username" component="div" className="text-red-600 text-sm mt-1" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <Field name="email" type="email" className="w-full mt-1 px-3 py-2 border rounded-md" />
                <ErrorMessage name="email" component="div" className="text-red-600 text-sm mt-1" />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <Field name="password" type="password" className="w-full mt-1 px-3 py-2 border rounded-md" />
                <ErrorMessage name="password" component="div" className="text-red-600 text-sm mt-1" />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Konfirmasi Password</label>
                <Field name="confirmPassword" type="password" className="w-full mt-1 px-3 py-2 border rounded-md" />
                <ErrorMessage name="confirmPassword" component="div" className="text-red-600 text-sm mt-1" />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {cashier ? "Simpan Perubahan" : "Tambah Kasir"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
