"use client";
import { useRouter } from "next/navigation";
import { deleteCookie } from "@/libs/action";
import { LogOut } from "lucide-react";

interface buttonProps {
  text?: string;
}

export default function LogoutButton({ text }: buttonProps) {
  const router = useRouter();

  const onLogout = () => {
    deleteCookie("token");
    localStorage.removeItem("token");
    router.push("/sign-in");
  };

  return (
    <button onClick={onLogout} className="text-red-500  hover:text-red-500 transition flex gap-2 justify-center items-center">
      <LogOut size={20} /> {text}
    </button>
  );
}
