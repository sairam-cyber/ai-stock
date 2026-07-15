"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Settings, User as UserIcon, LogOut, Bell, Shield, Paintbrush } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure your user profile, risk tolerance, and visual settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <Card glass>
          <CardHeader className="pb-3 flex flex-row items-center gap-4 space-y-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserIcon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold">Profile Info</CardTitle>
              <CardDescription className="text-xs">Your registered personal details</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Full Name</label>
                <div className="bg-muted/50 border border-border px-3 py-2 rounded-lg text-xs font-semibold">
                  {user?.name || "N/A"}
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Email Address</label>
                <div className="bg-muted/50 border border-border px-3 py-2 rounded-lg text-xs font-semibold">
                  {user?.email || "N/A"}
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Account Role</label>
                <div className="bg-muted/50 border border-border px-3 py-2 rounded-lg text-xs font-semibold uppercase">
                  {user?.role || "user"}
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Joined</label>
                <div className="bg-muted/50 border border-border px-3 py-2 rounded-lg text-xs font-semibold">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investment Risk & Preferences */}
        <Card glass>
          <CardHeader className="pb-3 flex flex-row items-center gap-4 space-y-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold">Risk Preferences</CardTitle>
              <CardDescription className="text-xs">Configure trading and notification profiles</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1.5">Risk Tolerance</label>
                <div className="flex gap-2">
                  {["Conservative", "Moderate", "Aggressive"].map((r) => {
                    const active = user?.preferences?.riskTolerance?.toLowerCase() === r.toLowerCase() || (r === "Moderate" && !user?.preferences?.riskTolerance);
                    return (
                      <button
                        key={r}
                        type="button"
                        className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${
                          active
                            ? "bg-primary/15 text-primary border-primary"
                            : "border-border hover:bg-accent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-semibold">Push Notifications</p>
                    <p className="text-[10px] text-muted-foreground">Receive background price threshold alerts</p>
                  </div>
                </div>
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    defaultChecked={user?.preferences?.notifications ?? true}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger zone / Log out */}
        <Card glass className="border-red-500/20">
          <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-foreground">Sign Out</p>
              <p className="text-[10px] text-muted-foreground">Terminate your active session and lock workspace</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="rounded-xl flex items-center gap-1.5 text-xs px-4"
            >
              <LogOut className="h-4 w-4" />
              Logout Session
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
