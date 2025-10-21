"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const Settings = () => {
  const { data: session, status } = useSession();

  // Redirect if not authenticated
  if (status === "loading") {
    return <SettingsSkeleton />;
  }

  if (!session) {
    redirect("/auth/login");
  }

  const userSettings = {
    username: session.user?.name || "Not set",
    email: session.user?.email || "Not set",
    roleName: session.user?.role || "USER",
  };

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'destructive';
      case 'MANAGER': return 'default';
      case 'USER': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="p-6">
      <Header name="Settings" />
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your account details and role information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {userSettings.username}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {userSettings.email}
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <div className="flex items-center gap-2">
                <Badge variant={getRoleVariant(userSettings.roleName)}>
                  {userSettings.roleName}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {userSettings.roleName === 'ADMIN' && 'Full system access'}
                  {userSettings.roleName === 'MANAGER' && 'Team and project management'}
                  {userSettings.roleName === 'USER' && 'Basic user permissions'}
                </span>
              </div>
            </div>

            {/* User ID */}
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono text-muted-foreground">
                {session.user?.id}
              </div>
            </div>
          </CardContent>
        </Card>

       
        
      </div>
    </div>
  );
};

// Skeleton loader
const SettingsSkeleton = () => (
  <div className="p-6">
    <Skeleton className="h-8 w-48 mb-6" />
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </div>
);

export default Settings;