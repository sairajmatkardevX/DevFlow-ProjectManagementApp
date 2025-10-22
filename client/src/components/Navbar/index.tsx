"use client";

import React, { useState, useEffect } from "react";
import { Menu, Moon, Settings, Sun, LogOut, Workflow, Search } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { setIsSidebarCollapsed } from "@/state";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { api } from "@/state/api"; // import RTK Query API

const Navbar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(state => state.global.isSidebarCollapsed);
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false }); // log out without redirect
      api.util.resetApiState();           // clear RTK Query cache
      window.location.href = "/auth/login"; // then redirect
    } catch {
      window.location.href = "/auth/login";
    }
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const toggleSidebar = () => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));

  if (!mounted) {
    return (
      <div className="flex items-center justify-between bg-background/95 backdrop-blur px-4 sm:px-6 py-3 border-b">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-muted rounded-lg animate-pulse"></div>
          <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  const userInitial = session?.user?.name?.charAt(0)?.toUpperCase() || 
                     session?.user?.email?.charAt(0)?.toUpperCase() || 
                     'U';
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'User';
  const userRole = session?.user?.role || 'Member';

  return (
    <div className={cn(
      "flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 py-3 border-b sticky top-0 z-30 transition-all duration-200",
      isScrolled && "shadow-sm border-border/50"
    )}>
      {/* Left Section */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2 sm:gap-3">
          {(isMobile || isSidebarCollapsed) && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8 sm:h-9 sm:w-9">
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          )}
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
              <Workflow className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DevFlow
              </h1>
              <p className="text-[10px] text-muted-foreground hidden sm:block">
                Project Manager
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button asChild variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" title="Search">
          <Link href="/dashboard/search"><Search className="h-4 w-4" /></Link>
        </Button>

        <div className="flex items-center gap-2">
          <div className="relative">
            {session?.user?.image && !imageError ? (
              <div className="h-8 w-8 rounded-full overflow-hidden border border-border shadow-sm">
                <img
                  src={session.user.image}
                  alt={userName}
                  className="h-full w-full object-cover"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div className="h-8 w-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                {userInitial}
              </div>
            )}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground">{userRole}</p>
          </div>
        </div>

        <Separator orientation="vertical" className="h-6 hidden sm:block" />

        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 sm:h-9 sm:w-9"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button asChild variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" title="Settings">
          <Link href="/dashboard/settings"><Settings className="h-4 w-4" /></Link>
        </Button>

        <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50" title="Logout">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export { Navbar };
