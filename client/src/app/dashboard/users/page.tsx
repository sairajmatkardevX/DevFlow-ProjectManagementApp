"use client";

import { 
  useGetUsersQuery, 
  useCreateUserMutation, 
  useUpdateUserMutation, 
  useDeleteUserMutation,
  useGetTeamsQuery
} from "@/state/api";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Edit, 
  Trash2, 
  Plus, 
  Mail, 
  Users as UsersIcon,
  Shield,
  Loader2,
  Image,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from "lucide-react";

// Available images from public folder
const AVAILABLE_IMAGES = [
  'p1.jpeg',
  'p2.jpeg', 
  'p3.jpeg',
  'p4.jpeg',
  'p5.jpeg',
  'p6.jpeg',
  'p7.jpeg',
  'p8.jpeg',
  'p9.jpeg',
  'p10.jpeg',
  'p11.jpeg',
  'p12.jpeg',
  'p13.jpeg'
];

// User Form Component
const UserForm = ({ 
  user, 
  teams,
  onSubmit, 
  onCancel,
  loading 
}: { 
  user?: any; 
  teams: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading: boolean;
}) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '', // Add password field
    role: user?.role || 'user', 
    profilePictureUrl: user?.profilePictureUrl || 'p1.jpeg',
    teamId: user?.teamId ? user.teamId.toString() : 'no-team',
  });

  const [errors, setErrors] = useState({ username: '', email: '', password: '' });

  const validateForm = () => {
    const newErrors = { username: '', email: '', password: '' };
    let isValid = true;

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }
    // Password required only for new users
    if (!user && !formData.password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        profilePictureUrl: formData.profilePictureUrl,
        teamId: formData.teamId === 'no-team' ? null : Number(formData.teamId),
      };

      // Only include password if provided (for new users or password change)
      if (formData.password.trim()) {
        submitData.password = formData.password;
      }

      onSubmit(submitData);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username *</Label>
        <Input
          id="username"
          value={formData.username}
          onChange={(e) => handleChange('username', e.target.value)}
          placeholder="Enter username"
        />
        {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="Enter email"
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          Password {!user && '*'}
        </Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          placeholder={user ? "Leave blank to keep current password" : "Enter password"}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        {user && (
          <p className="text-xs text-muted-foreground">
            Leave blank to keep current password
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem> 
            <SelectItem value="admin">Admin</SelectItem> 
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="team">Team</Label>
        <Select value={formData.teamId} onValueChange={(value) => handleChange('teamId', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no-team">No team</SelectItem>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id.toString()}>
                {team.teamName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label>Profile Picture</Label>
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-16 w-16 border-2 border-border">
              <AvatarImage 
                src={`/${formData.profilePictureUrl}`}
                alt={formData.username}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                {formData.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <p className="text-xs text-muted-foreground text-center">
              Preview
            </p>
          </div>
          
          <div className="flex-1">
            <Select 
              value={formData.profilePictureUrl} 
              onValueChange={(value) => handleChange('profilePictureUrl', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select profile picture" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_IMAGES.map((image) => (
                  <SelectItem key={image} value={image}>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`/${image}`} alt={image} />
                        <AvatarFallback className="text-xs">
                          <Image className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{image}</div>
                        <div className="text-xs text-muted-foreground">From public folder</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-2">
              Choose from available profile pictures in /public/ folder
            </p>
          </div>
        </div>
      </div>

      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {user ? 'Update User' : 'Create User'}
        </Button>
      </DialogFooter>
    </form>
  );
};

// Enhanced canDeleteUser function with detailed info
const canDeleteUser = (user: any) => {
  if (!user) return { canDelete: false, authoredTasks: 0, assignedTasks: 0 };
  
  const authoredTasks = user._count?.authoredTasks || 0;
  const assignedTasks = user._count?.assignedTasks || 0;
  
  return {
    canDelete: authoredTasks === 0 && assignedTasks === 0,
    authoredTasks,
    assignedTasks
  };
};

// Main Users Component
const Users = () => {
  const { data: session } = useSession();
  const { data: users, isLoading, isError, refetch } = useGetUsersQuery();
  const { data: teams } = useGetTeamsQuery();
  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const { toast } = useToast();

  const isAdmin = session?.user?.role === 'admin';

  const showSuccessToast = (title: string, description: string) => {
    toast({
      title: (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span>{title}</span>
        </div>
      ),
      description,
      className: "border-green-200 bg-green-50 text-green-900",
    });
  };

  const showErrorToast = (title: string, description: string) => {
    toast({
      title: (
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-600" />
          <span>{title}</span>
        </div>
      ),
      description,
      variant: "destructive",
    });
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (selectedUser) {
        // For updates, only include password if provided
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await updateUser({ id: selectedUser.userId, data: updateData }).unwrap();
        showSuccessToast(
          "User Updated", 
          `${formData.username} has been updated successfully.`
        );
      } else {
        // For new users, password is required
        await createUser(formData).unwrap();
        showSuccessToast(
          "User Created", 
          `${formData.username} has been added to the system.`
        );
      }
      setShowForm(false);
      setSelectedUser(null);
      refetch();
    } catch (error: any) {
      console.error('User operation error:', error);
      showErrorToast(
        "Operation Failed",
        error?.data?.message || `Failed to ${selectedUser ? 'update' : 'create'} user. Please try again.`
      );
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await deleteUser(selectedUser.userId).unwrap();
      showSuccessToast(
        "User Deleted",
        `${selectedUser.username} has been removed from the system.`
      );
      setDeleteConfirm(false);
      setSelectedUser(null);
      refetch();
    } catch (error: any) {
      console.error('Delete error:', error);
      showErrorToast(
        "Delete Failed",
        error?.data?.message || 'Failed to delete user. Please try again.'
      );
    }
  };

  const getRoleVariant = (role: string) => {
    return role === 'admin' ? 'destructive' : 'secondary'; 
  };

  const getUserImagePath = (user: any) => {
    if (!user.profilePictureUrl) return '/p1.jpeg';
    
    if (user.profilePictureUrl.startsWith('/')) {
      return user.profilePictureUrl;
    }
    
    return `/${user.profilePictureUrl}`;
  };

  if (isLoading) return <UsersSkeleton />;

  if (isError) {
    return (
      <div className="p-6">
        <Header name="Users Management" />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading users. Please check your connection and try again.
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()} variant="outline" className="mt-4">
          <Loader2 className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Header 
        name="Users Management" 
        description="Manage system users and their permissions" 
        className="mb-8" 
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              {isAdmin 
                ? "Manage system users and their permissions." 
                : "View team members and their basic information."
              } 
              {users?.length || 0} user(s) found.
            </CardDescription>
          </div>
          {isAdmin && (
            <Button onClick={() => {
              setSelectedUser(null);
              setShowForm(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                {isAdmin && <TableHead>Role</TableHead>}
                <TableHead>Team</TableHead>
                {isAdmin && <TableHead>Tasks</TableHead>}
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => {
                const deleteInfo = canDeleteUser(user);
                
                return (
                  <TableRow key={user.userId} className="group hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-border">
                          <AvatarImage 
                            src={getUserImagePath(user)}
                            alt={user.username}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {user.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-sm text-muted-foreground">ID: #{user.userId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm">{user.email}</span>
                      </div>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Badge variant={getRoleVariant(user.role)} className="capitalize">
                          {user.role === 'admin' && <Shield className="mr-1 h-3 w-3" />}
                          {user.role.toLowerCase()}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell>
                      {user.team ? (
                        <div className="flex items-center gap-2">
                          <UsersIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{user.team.teamName}</span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          No team
                        </Badge>
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Badge variant="outline" title="Authored tasks" className="text-xs">
                            Authored: {user._count?.authoredTasks || 0}
                          </Badge>
                          <Badge variant="secondary" title="Assigned tasks" className="text-xs">
                            Assigned: {user._count?.assignedTasks || 0}
                          </Badge>
                        </div>
                      </TableCell>
                    )}
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowForm(true);
                            }}
                            title="Edit user"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setDeleteConfirm(true);
                            }}
                            disabled={!deleteInfo.canDelete}
                            title={
                              deleteInfo.canDelete 
                                ? "Delete user" 
                                : `Cannot delete user with ${deleteInfo.authoredTasks} authored tasks and ${deleteInfo.assignedTasks} assigned tasks`
                            }
                            className={!deleteInfo.canDelete ? "opacity-50 cursor-not-allowed" : ""}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {users?.length === 0 && (
            <div className="text-center py-8">
              <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">No users found</h3>
              <p className="text-muted-foreground mt-2">Get started by creating your first user.</p>
              {isAdmin && (
                <Button 
                  onClick={() => setShowForm(true)} 
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create First User
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedUser ? 'Edit User' : 'Create New User'}</DialogTitle>
              <DialogDescription>
                {selectedUser ? 'Update user information and permissions' : 'Add a new user to the system'}
              </DialogDescription>
            </DialogHeader>
            <UserForm
              user={selectedUser}
              teams={teams || []}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setSelectedUser(null);
              }}
              loading={creating || updating}
            />
          </DialogContent>
        </Dialog>
      )}

      {isAdmin && (
        <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>{selectedUser?.username}</strong>? 
                {(() => {
                  const deleteInfo = canDeleteUser(selectedUser);
                  if (!deleteInfo.canDelete) {
                    return (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium">Cannot Delete User</span>
                        </div>
                        <p className="text-yellow-700 text-sm mt-1">
                          This user has <strong>{deleteInfo.authoredTasks} authored tasks</strong> and{" "}
                          <strong>{deleteInfo.assignedTasks} assigned tasks</strong>. 
                          You must reassign or delete these tasks before deleting the user.
                        </p>
                      </div>
                    );
                  }
                  return " This action cannot be undone and will remove all associated data.";
                })()}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete} 
                disabled={deleting || !canDeleteUser(selectedUser).canDelete}
              >
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {canDeleteUser(selectedUser).canDelete ? "Delete User" : "Cannot Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Skeleton Loader
const UsersSkeleton = () => (
  <div className="p-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default Users;