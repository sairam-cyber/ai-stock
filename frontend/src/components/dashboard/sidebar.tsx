"use client";

import { useState, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  LayoutDashboard,
  LineChart,
  Briefcase,
  Star,
  Bot,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  PieChart,
  Newspaper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// ─── Context ──────────────────────────────────
interface SidebarContextType {
  collapsed: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  toggle: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

// ─── Nav Items ────────────────────────────────
const mainNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Markets", href: "/dashboard/markets", icon: TrendingUp },
  { label: "Stocks", href: "/dashboard/stocks", icon: LineChart },
  { label: "Portfolio", href: "/dashboard/portfolio", icon: Briefcase },
  { label: "Watchlist", href: "/dashboard/watchlist", icon: Star },
];

const toolsNav = [
  { label: "AI Assistant", href: "/dashboard/ai", icon: Bot },
  { label: "Analytics", href: "/dashboard/analytics", icon: PieChart },
  { label: "News", href: "/dashboard/news", icon: Newspaper },
];

const bottomNav = [
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

// ─── Nav Link Component ───────────────────────
function NavLink({
  item,
  collapsed,
}: {
  item: { label: string; href: string; icon: React.ComponentType<{ className?: string }> };
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const isActive =
    item.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(item.href);

  const content = (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary/10 text-primary shadow-sm"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
        collapsed && "justify-center px-2"
      )}
    >
      <item.icon
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="truncate"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-primary"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div className="relative">{content}</div>
        </TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return <div className="relative">{content}</div>;
}

// ─── Sidebar Component ────────────────────────
export function Sidebar({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarContext.Provider
      value={{ collapsed, toggle: () => setCollapsed(!collapsed) }}
    >
      <TooltipProvider>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <motion.aside
            initial={false}
            animate={{ width: collapsed ? 72 : 260 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-col border-r border-sidebar-border bg-sidebar shrink-0 h-screen"
          >
            {/* Logo */}
            <div className="flex h-16 items-center gap-2.5 px-4 shrink-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-lg font-bold tracking-tight whitespace-nowrap"
                  >
                    AI <span className="gradient-text">Stock</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <Separator className="mx-3 w-auto" />

            {/* Nav */}
            <ScrollArea className="flex-1 px-3 py-4">
              <div className="space-y-1">
                {mainNav.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    collapsed={collapsed}
                  />
                ))}
              </div>

              <div className="my-4">
                <Separator className="mb-3" />
                {!collapsed && (
                  <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Tools
                  </p>
                )}
                <div className="space-y-1">
                  {toolsNav.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      collapsed={collapsed}
                    />
                  ))}
                </div>
              </div>
            </ScrollArea>

            {/* Bottom Nav */}
            <div className="px-3 pb-3 space-y-1 shrink-0">
              <Separator className="mb-3" />
              {bottomNav.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                />
              ))}
            </div>

            {/* Collapse Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-3.5 top-20 z-10 h-7 w-7 rounded-full border border-border bg-background shadow-md hover:bg-accent"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronLeft className="h-3.5 w-3.5" />
              )}
            </Button>
          </motion.aside>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}
