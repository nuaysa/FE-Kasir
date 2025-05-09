"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { KasirDetail } from "@/types/kasir";
import { useToken } from "@/hooks/useToken";

const base_url = process.env.NEXT_PUBLIC_BASE_URL_BE;

export default function HomePage() {
  const [userData, setUserData] = useState<KasirDetail>();
  const [isLoading, setIsLoading] = useState(true);
  const token = useToken();
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get(`${base_url}/kasir`, {
          headers: {
            Authorization: `Bearer ${token}` // Tambahkan header Authorization
          },
          withCredentials: true
        });

        console.log(response)
        if (response.data) {
          setUserData(response.data.data)
        } else {
          throw new Error("No data received");
        }
      } catch (error : any) {
        console.error("Failed to fetch user data:", error.message);
        toast.error("Failed to load user data", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router, token]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      {userData ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">User Information</h2>
            <p className="mt-2">
              <span className="font-medium">Name:</span> {userData.nama}
            </p>
            <p className="mt-1">
              <span className="font-medium">Email:</span> {userData.email}
            </p>
            <p className="mt-1">
              <span className="font-medium">Username:</span> {userData.username}
            </p>
          </div>
          <button
            onClick={async () => {
              await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL_BE}/auth/logout`, {}, { withCredentials: true });
              router.push("/login");
            }}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-lg">No user data available</p>
          <button onClick={() => router.push("/sign-in")} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Go to Login
          </button>
        </div>
      )}
    </div>
  );
}
