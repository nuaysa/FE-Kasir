import axios from "axios";
import { toast } from "react-hot-toast";

const base_url = process.env.NEXT_PUBLIC_BASE_URL_BE;

// Helper untuk mendapatkan token dari localStorage
function getToken() {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.error("No token found. Please log in again.");
    throw new Error("No token found.");
  }
  return token;
}

// Get User Profile
export async function getUserProfile() {
  try {
    const token = getToken();
    const response = await axios.get(`${base_url}/kasir`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

export async function verifyEmail(token: string) {
  try {
    const response = await axios.patch(`${base_url}/auth/verify/${token}`, {
      token,
    });

    toast.success("Email has been change successfully!");
    return response.data;
  } catch (error) {
    toast.error("Failed to change email. Please try again.");
    console.error("Error confirming change email:", error);
    throw error;
  }
}
