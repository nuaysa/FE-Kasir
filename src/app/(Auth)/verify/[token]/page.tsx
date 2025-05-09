"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { verifyEmail } from "@/utils/api";

const ChangeEmailPage = ({ params }: { params: { token: string } }) => {
  const router = useRouter();
  const [isSubmitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await verifyEmail(params.token);
      toast.success(response.message || "Email verified successfully!");
      router.push("/sign-in");
    } catch (error : any) {
      toast.error(error.message || "Failed to verify email");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          Verify Email
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Click the button below to verify your email.
        </p>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Verifying..." : "Verify Email"}
        </button>
      </div>
    </div>
  );
};

export default ChangeEmailPage;