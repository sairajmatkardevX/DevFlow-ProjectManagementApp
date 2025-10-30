"use client";
import React, { useState, useEffect } from 'react';
import { 
  Home, Briefcase, LucideIcon, User, Users, X, 
  ChevronUp, ChevronDown, AlertCircle, ShieldAlert, 
  AlertOctagon, AlertTriangle, Layers3, FolderOpen, 
  Loader2, Workflow, BarChart3, Zap
} from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from "@/app/store"
import { usePathname } from 'next/navigation';
import { setIsSidebarCollapsed } from '@/state';
import { useGetProjectsQuery } from '@/state/api';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const [showProjects, setShowProjects] = useState(true);
  const [showPriority, setShowPriority] = useState(true);
  const [mounted, setMounted] = useState(false);

  const { data: projects, isLoading, error } = useGetProjectsQuery();
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);

  // Simplified mount effect - remove all complex logic
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const closeSidebar = () => {
    // Simple close logic
    if (window.innerWidth < 768) {
      dispatch(setIsSidebarCollapsed(true));
    }
  };

  const sidebarClassNames = cn(
    "fixed top-0 left-0 flex flex-col h-full justify-between shadow-xl",
    "transition-all duration-300 z-40 bg-background overflow-y-auto no-scrollbar",
    "border-r border-border",
    isSidebarCollapsed 
      ? "w-0 -translate-x-full md:translate-x-0 md:w-16" 
      : "w-56 md:w-56 translate-x-0",
    "md:static md:flex" 
  );

  // Overlay for mobile
  const overlayClassNames = cn(
    "fixed inset-0 bg-background/80 backdrop-blur-sm z-30 transition-opacity duration-300 md:hidden",
    isSidebarCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
  );

  // Show loading state until client-side mounted
  if (!mounted) {
    return (
      <div className={cn(
        "fixed top-0 left-0 flex flex-col h-full justify-between shadow-xl",
        "w-16 bg-background border-r border-border z-40"
      )}>
        <div className="flex flex-col items-center py-4 space-y-4">
          <div className="h-8 w-8 bg-muted rounded-lg animate-pulse"></div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 w-8 bg-muted rounded-md animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <>
      {/* Mobile Overlay */}
      {!isSidebarCollapsed && (
        <div 
          className={overlayClassNames}
          onClick={closeSidebar}
        />
      )}

      <div className={sidebarClassNames}>
        <div className="flex h-full w-full flex-col justify-start">
          {/* Logo Section */}
          <div className={cn(
            "flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-border",
            "transition-all duration-300",
            isSidebarCollapsed && "px-2 justify-center"
          )}>
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
              <Workflow className="h-4 w-4 text-white" />
            </div>
            
            {!isSidebarCollapsed && (
              <div className="flex flex-col flex-1 min-w-0">
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DevFlow
                </h1>
                <p className="text-[10px] text-muted-foreground">Project Manager</p>
              </div>
            )}
            
            {!isSidebarCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto h-6 w-6 hover:bg-background/50 flex-shrink-0"
                onClick={toggleSidebar}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Main Navigation */}
          <nav className="w-full py-2 bg-background space-y-0.5">
            <SidebarLink 
              icon={Home} 
              label="Dashboard" 
              href="/dashboard" 
              isCollapsed={isSidebarCollapsed}
              onClick={closeSidebar}
            />
            <SidebarLink 
              icon={BarChart3} 
              label="Timeline" 
              href="/dashboard/timeline" 
              isCollapsed={isSidebarCollapsed}
              onClick={closeSidebar}
            />
            <SidebarLink 
              icon={User} 
              label="Users" 
              href="/dashboard/users" 
              isCollapsed={isSidebarCollapsed}
              onClick={closeSidebar}
            />
            <SidebarLink 
              icon={Users} 
              label="Teams" 
              href="/dashboard/teams" 
              isCollapsed={isSidebarCollapsed}
              onClick={closeSidebar}
            />
          </nav>

          <Separator className="mx-3 w-auto" />

          {/* Projects Section */}
          <div className="bg-background">
            {/* Projects Header */}
            <Link href="/dashboard/projects" onClick={closeSidebar}>
              <div className={cn(
                "flex items-center transition-all duration-200 group cursor-pointer",
                "px-4 py-2 text-foreground hover:bg-accent/50",
                isSidebarCollapsed && "px-2 justify-center"
              )}>
                <div className="p-1.5 bg-blue-500/10 rounded-md group-hover:bg-blue-500/20 transition-colors flex-shrink-0">
                  <FolderOpen className="h-3.5 w-3.5 text-blue-500" />
                </div>
                
                {!isSidebarCollapsed && (
                  <div className="flex flex-col flex-1 min-w-0 ml-2">
                    <span className="text-sm font-semibold truncate">Projects</span>
                    {projects && (
                      <span className="text-[10px] text-muted-foreground">
                        {projects.length} active
                      </span>
                    )}
                  </div>
                )}
                
                {!isSidebarCollapsed && (
                  <Zap className="h-3.5 w-3.5 text-muted-foreground group-hover:text-blue-500 transition-colors flex-shrink-0" />
                )}
              </div>
            </Link>

            {/* Projects Dropdown */}
            {!isSidebarCollapsed && (
              <>
                <Button
                  variant="ghost"
                  className="flex w-full items-center justify-between px-4 py-1.5 text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all h-auto group"
                  onClick={() => setShowProjects(!showProjects)}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "p-0.5 rounded transition-transform",
                      showProjects && "rotate-90"
                    )}>
                      <ChevronDown className="h-2.5 w-2.5" />
                    </div>
                    <span className="text-xs font-medium">My Projects</span>
                  </div>
                  {showProjects ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Button>
                
                {showProjects && (
                  <div className="max-h-40 overflow-y-auto bg-background/50 no-scrollbar space-y-0.5 pb-1">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                      </div>
                    ) : error ? (
                      <div className="px-4 py-1.5">
                        <p className="text-[10px] text-destructive">Failed to load</p>
                      </div>
                    ) : projects && projects.length > 0 ? (
                      projects.map((project) => (
                        <SidebarLink
                          key={project.id}
                          icon={Briefcase}
                          label={project.name}
                          href={`/dashboard/projects/${project.id}`}
                          isProject
                          isCollapsed={isSidebarCollapsed}
                          onClick={closeSidebar}
                        />
                      ))
                    ) : (
                      <div className="px-4 py-2 text-center">
                        <div className="p-1 bg-muted rounded-md inline-flex">
                          <FolderOpen className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          No projects
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <Separator className="mx-3 w-auto" />

          {/* Priority Section */}
          <div className="bg-background">
            <Button
              variant="ghost"
              className={cn(
                "flex w-full items-center transition-all duration-200 h-auto group",
                "px-4 py-2 text-foreground hover:bg-accent/50",
                isSidebarCollapsed && "px-2 justify-center"
              )}
              onClick={() => !isSidebarCollapsed && setShowPriority(!showPriority)}
            >
              <div className="p-1.5 bg-red-500/10 rounded-md group-hover:bg-red-500/20 transition-colors flex-shrink-0">
                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
              </div>
              
              {!isSidebarCollapsed && (
                <div className="flex flex-col items-start flex-1 min-w-0 ml-2">
                  <span className="text-sm font-semibold">Priority</span>
                  <span className="text-[10px] text-muted-foreground">Task urgency</span>
                </div>
              )}
              
              {!isSidebarCollapsed && (
                showPriority ? (
                  <ChevronUp className="h-3 w-3 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-3 w-3 flex-shrink-0" />
                )
              )}
            </Button>
            
            {!isSidebarCollapsed && showPriority && (
              <div className="max-h-40 overflow-y-auto bg-background/50 no-scrollbar space-y-0.5 pb-1">
                <SidebarLink
                  icon={AlertCircle}
                  label="Urgent"
                  href="/dashboard/priority/urgent"
                  isPriority
                  priorityColor="text-red-500"
                  badgeColor="bg-red-500"
                  isCollapsed={isSidebarCollapsed}
                  onClick={closeSidebar}
                />
                <SidebarLink
                  icon={ShieldAlert}
                  label="High"
                  href="/dashboard/priority/high"
                  isPriority
                  priorityColor="text-orange-500"
                  badgeColor="bg-orange-500"
                  isCollapsed={isSidebarCollapsed}
                  onClick={closeSidebar}
                />
                <SidebarLink
                  icon={AlertTriangle}
                  label="Medium"
                  href="/dashboard/priority/medium"
                  isPriority
                  priorityColor="text-yellow-500"
                  badgeColor="bg-yellow-500"
                  isCollapsed={isSidebarCollapsed}
                  onClick={closeSidebar}
                />
                <SidebarLink 
                  icon={AlertOctagon} 
                  label="Low" 
                  href="/dashboard/priority/low"
                  isPriority
                  priorityColor="text-blue-500"
                  badgeColor="bg-blue-500"
                  isCollapsed={isSidebarCollapsed}
                  onClick={closeSidebar}
                />
                <SidebarLink
                  icon={Layers3}
                  label="Backlog"
                  href="/dashboard/priority/backlog"
                  isPriority
                  priorityColor="text-muted-foreground"
                  badgeColor="bg-muted-foreground"
                  isCollapsed={isSidebarCollapsed}
                  onClick={closeSidebar}
                />
              </div>
            )}
          </div>

          {/* Collapsed State Helper */}
          {isSidebarCollapsed && (
            <div className="p-2 text-center mt-auto">
              <p className="text-[10px] text-muted-foreground">
                Click menu to expand
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// SidebarLink component remains the same as your original
interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isProject?: boolean;
  isPriority?: boolean;
  priorityColor?: string;
  badgeColor?: string;
  isCollapsed?: boolean;
  onClick?: () => void;
}

const SidebarLink = ({
  href,
  icon: Icon,
  label,
  isProject = false,
  isPriority = false,
  priorityColor = "text-muted-foreground",
  badgeColor = "bg-muted-foreground",
  isCollapsed = false,
  onClick
}: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || 
                  (isProject && pathname.startsWith('/dashboard/projects/')) ||
                  (isPriority && pathname.startsWith('/dashboard/priority/'));

  return (
    <Link href={href} onClick={onClick}>
      <div
        className={cn(
          "relative flex items-center transition-all duration-200 group",
          "mx-2 rounded-md",
          isCollapsed ? "px-2 py-3 justify-center" : "px-4 py-2 gap-3",
          isProject && !isCollapsed && "pl-6",
          isActive 
            ? "bg-accent text-accent-foreground shadow-sm border border-border" 
            : "text-foreground hover:bg-accent/50 hover:shadow-sm"
        )}
        title={isCollapsed ? label : undefined}
      >
        {/* Icon */}
        <div className={cn(
          "p-1.5 rounded-md transition-all duration-200 flex-shrink-0",
          isActive ? "bg-background shadow-sm" : "bg-accent/50 group-hover:bg-background",
          isPriority && !isActive && "bg-transparent"
        )}>
          <Icon className={cn(
            "h-3.5 w-3.5 transition-transform", 
            isPriority ? priorityColor : 'text-foreground',
            isActive && isPriority && 'scale-110',
            isActive && 'text-primary'
          )} />
        </div>

        {!isCollapsed && (
          <div className="flex flex-col flex-1 min-w-0">
            <span className={cn(
              "text-xs font-medium truncate transition-colors",
              isActive && "font-semibold"
            )}>
              {label}
            </span>
          </div>
        )}

        {/* Priority Badge */}
        {isPriority && !isActive && !isCollapsed && (
          <div className={cn(
            "w-1.5 h-1.5 rounded-full flex-shrink-0",
            badgeColor
          )} />
        )}
      </div>
    </Link>
  );
};

export { Sidebar };