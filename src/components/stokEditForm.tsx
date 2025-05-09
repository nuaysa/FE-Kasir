"use client";
import { format } from "date-fns";
import { useToken } from "@/hooks/useToken";
import { validationStokSchema } from "@/libs/schema";
import axios from "axios";
import { ErrorMessage, Field, Form, Formik } from "formik";
import toast from "react-hot-toast";

export default function StokEditForm() {
    const token = useToken()
    const initialValues = {
        serialNumber: "",
        expiredDate: "",
        status: "",
      };
      
      const onSubmit = async (values: typeof initialValues, { resetForm }: any) => {
        try {
          await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL_BE}/stok`,values, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
          toast.success("Stok berhasil diperbarui");
          resetForm();
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Gagal menyimpan perubahan");
        }
      };
      
      const onCancel = () => {
        // Reset form atau redirect, tergantung kebutuhan
        // resetForm() hanya bisa di dalam `onSubmit`, jadi kamu bisa atur state lokal jika perlu
        window.location.reload(); // atau navigasi ke halaman lain
      };
    return (  
         <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Data Stok</h2>
        
        <Formik
          initialValues={initialValues}
          validationSchema={validationStokSchema}
          onSubmit={onSubmit}
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form className="space-y-4">
              {/* Serial Number Field */}
              <div>
                <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700">
                  Serial Number
                </label>
                <Field
                  type="text"
                  id="serialNumber"
                  name="serialNumber"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  placeholder="Masukkan serial number"
                />
                <ErrorMessage
                  name="serialNumber"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
  
              {/* Expired Date Field */}
              <div>
                <label htmlFor="expiredDate" className="block text-sm font-medium text-gray-700">
                  Expired Date
                </label>
                <Field
                  type="date"
                  id="expiredDate"
                  name="expiredDate"
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                />
                <ErrorMessage
                  name="expiredDate"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
  
              {/* Status Field */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <Field
                  as="select"
                  id="status"
                  name="status"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                >
                  <option value="">Pilih Status</option>
                  <option value="Retur">Retur</option>
                  <option value="Rusak">Rusak</option>
                  <option value="Kadaluarsa">Kadaluarsa</option>
                </Field>
                <ErrorMessage
                  name="status"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
  
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    );
  };