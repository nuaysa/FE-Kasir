"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useSession from "@/hooks/useSession";
import { useRole } from "@/hooks/useRole";
type Props = {
  children: React.ReactNode;
  allowedRoles?: string[];
};

const ProtectedPage = ({ children, allowedRoles }: Props) => {
  const { user, isAuth, isLoading } = useSession();
  const role = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuth || !user) {
        router.push("/sign-in");
      } else if (allowedRoles && !allowedRoles.includes(role!)) {
        router.push("/redirect");
      }
    }
  }, [isAuth, user, isLoading, role, allowedRoles, router]);

  if (isLoading) return <div>Loading...</div>;

  return <>{children}</>;
};

export default ProtectedPage;
