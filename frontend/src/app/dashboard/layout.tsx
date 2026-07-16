"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { useAuthStore } from "@/stores/auth-store";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <LoadingScreen message="Authenticating..." submessage="Verifying your session and loading your portfolio" />;
  }

  if (!isAuthenticated) return null;

  return (
    <Sidebar>
      <div className="flex flex-col h-screen">
        <Topbar />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </Sidebar>
  );
}
