// app/dashboard/DashboardLayoutClient.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BarChart3,
  Megaphone,
  CreditCard,
  Settings,
  Menu,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useUser } from "@/app/contexts/UserContext"; 
import { Skeleton } from "@/components/ui/skeleton";
import { logoutUser } from "@/actions/auth";

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Exams", href: "/dashboard/exams", icon: GraduationCap },
  { name: "Students", href: "/dashboard/students", icon: Users },
  { name: "Results", href: "/dashboard/results", icon: BarChart3 },
  { name: "Articles", href: "/dashboard/articles", icon: BookOpen },
  { name: "Announcements", href: "/dashboard/announcements", icon: Megaphone },
  { name: "Subscription", href: "/dashboard/subscription", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, error } = useUser();

  const userInitials = useMemo(() => {
    if (!user) return "U";
    const first = user.fname?.charAt(0) || "";
    const last = user.lname?.charAt(0) || "";
    return `${first}${last}`.toUpperCase() || "U";
  }, [user]);

  const userFullName = useMemo(() => {
    if (!user) return "User";
    const fname = user.fname || "";
    const lname = user.lname || "";
    return `${fname} ${lname}`.trim() || user.email.split("@")[0];
  }, [user]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = async () => {
    await logoutUser();
  };

  const filteredNavItems = useMemo(() => {
    if (!searchQuery) return navigationItems;
    return navigationItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="flex h-screen bg-zinc-50 dark:bg-zinc-900">
        <div className="w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800">
          <div className="flex h-16 items-center px-4 border-b">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="ml-2 h-4 w-32" />
          </div>
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className="flex-1">
          <div className="h-16 border-b bg-white dark:bg-zinc-950">
            <div className="flex h-full items-center justify-between px-6">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
          <div className="p-6">
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="text-center space-y-4">
          <p className="text-red-500">Error loading user data: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-900">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed left-0 top-0 z-40 h-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 ease-in-out",
            sidebarOpen ? "w-64" : "w-20",
            isMobile && !sidebarOpen && "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center justify-between px-4 border-b">
              {sidebarOpen ? (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">EM</span>
                  </div>
                  <span className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                    ExaminerMax
                  </span>
                </div>
              ) : (
                <div className="mx-auto h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EM</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="hidden md:flex h-8 w-8"
              >
                {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>

            

            <ScrollArea className="flex-1 px-3 py-4">
              <nav className="space-y-2">
                {filteredNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Tooltip key={item.name} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Link href={item.href}>
                          <div
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 cursor-pointer",
                              isActive
                                ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
                                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900",
                              !sidebarOpen && "justify-center"
                            )}
                          >
                            <Icon className={cn("h-5 w-5", !sidebarOpen && "h-5 w-5")} />
                            {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                          </div>
                        </Link>
                      </TooltipTrigger>
                      {!sidebarOpen && (
                        <TooltipContent side="right" className="ml-2">
                          {item.name}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </nav>
            </ScrollArea>

            <div className="border-t p-4">
              {sidebarOpen ? (
                <div className="space-y-2">
                  {user?.company && (
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {user.company.name}
                    </div>
                  )}
                  <div className="text-xs text-zinc-400">v1.0.0</div>
                </div>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-center text-xs text-zinc-400 cursor-default">v1.0</div>
                  </TooltipTrigger>
                  <TooltipContent side="right">{user?.company?.name || "ExaminerMax"}</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </aside>

        {isMobile && sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/50" onClick={() => setSidebarOpen(false)} />
        )}

        <div className={cn("flex-1 flex flex-col overflow-hidden", sidebarOpen ? "md:ml-64" : "md:ml-20")}>
          <header className="sticky top-0 z-30 bg-white dark:bg-zinc-950 border-b">
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
                  {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
                <h1 className="text-xl font-semibold">
                  {navigationItems.find((item) => item.href === pathname)?.name || "Dashboard"}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden md:block">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 w-64 pl-9 pr-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg"
                    />
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.company?.logoUrl || "/avatars/01.png"} alt={userFullName} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userFullName}</p>
                        <p className="text-xs leading-none text-zinc-500">{user?.email}</p>
                        {user?.company && (
                          <p className="text-xs leading-none text-zinc-400 mt-1">{user.company.name}</p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-4 md:p-6">{children}</div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}