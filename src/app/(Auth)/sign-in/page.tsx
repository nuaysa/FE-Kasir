"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { validationLoginSchema } from "@/libs/schema";

export default function CustomerSignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  interface FormValues {
    data: string; 
    password: string;
  }

  const initialValues: FormValues = {
    data: "",
    password: "",
  };
  const handleSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL_BE}/auth/login`,
        {
          data: values.data.trim(),
          password: values.password,
        },
        { withCredentials: true }
      );

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
      
      toast.success(res.data.message || "Login berhasil!");
      console.log(res.data.pengguna.role)
      if (res.data.pengguna.role === "Admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.response?.data?.error || "Login gagal. Coba lagi.";
        toast.error(errorMessage);
      } else {
        toast.error("Terjadi kesalahan tak terduga");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-7xl flex flex-col md:flex-row shadow-xl rounded-lg overflow-hidden bg-white">
        {/* Image Section */}
        <div className="w-full md:w-1/2 relative h-64 md:h-auto">
          <Image src="/kasir.jpg" alt="Kasir" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center p-8 text-white">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
              Kasir made easier,
              <br />
            </h1>
            <p className="text-lg lg:text-xl">Lorem ipsum, dolor sit amet consectetur adipisicing elit.</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900">Login</h2>
            <p className="mt-2 text-sm text-gray-600">
            </p>
          </div>

          <Formik initialValues={initialValues} validationSchema={validationLoginSchema} onSubmit={handleSubmit}>
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <div>
                  <label htmlFor="data" className="block text-sm font-medium text-gray-700">
                    Email / Username
                  </label>
                  <Field id="data" type="text" name="data" placeholder="you@example.com or username" className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                  <ErrorMessage name="data" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Field id="password" type="password" name="password" placeholder="••••••••" className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                  <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={isSubmitting || isLoading}
                  >
                    {isSubmitting || isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
