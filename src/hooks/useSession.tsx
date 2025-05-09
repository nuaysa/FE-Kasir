"use client";
import { KasirDetail } from "@/types/kasir";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";

const base_url = process.env.NEXT_PUBLIC_BASE_URL_BE;

type SessionState = {
  user: KasirDetail | null;
  isAuth: boolean;
  isLoading: boolean;
  error: string | null;
};

const useSession = () => {
  const [state, setState] = useState<SessionState>({
    user: null,
    isAuth: false,
    isLoading: true,
    error: null,
  });

  const getCurrentUser = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get<{ data: KasirDetail }>(
        `${base_url}/kasir/profile`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 8000
        }
      );

      if (!response.data?.data) {
        throw new Error("Invalid user data structure");
      }

      setState({
        user: response.data.data,
        isAuth: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const error = err as AxiosError | Error;
      console.error("Authentication error:", error);

      // Clear invalid token
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("token");
      }

      setState({
        user: null,
        isAuth: false,
        isLoading: false,
        error: error.message || "Authentication failed",
      });
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  return state;
};

export default useSession;