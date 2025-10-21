"use client";

import { 
  useGetTeamsQuery, 
  useCreateTeamMutation, 
  useUpdateTeamMutation, 
  useDeleteTeamMutation,
  useGetUsersQuery,
  useAddTeamMemberMutation,
  useRemoveTeamMemberMutation
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Edit, 
  Trash2, 
  Plus, 
  Users, 
  Loader2,
  Building,
  Briefcase,
  UserPlus,
  UserMinus,
  AlertTriangle,
  Eye
} from "lucide-react";

// Team Statistics Cards - ONLY FOR ADMINS
const TeamStatsCards = ({ teams }: { teams: any[] }) => {
  const totalMembers = teams?.reduce((sum, team) => sum + (team._count?.members || 0), 0) || 0;
  const totalProjects = teams?.reduce((sum, team) => sum + (team._count?.projects || 0), 0) || 0;

  const stats = [
    { 
      label: 'Total Teams', 
      value: teams?.length || 0, 
      icon: Building,
      color: 'bg-blue-500'
    },
    { 
      label: 'Team Members', 
      value: totalMembers, 
      icon: Users,
      color: 'bg-purple-500'
    },
    { 
      label: 'Active Projects', 
      value: totalProjects, 
      icon: Briefcase,
      color: 'bg-cyan-500'
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color} text-white`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Team Form Component
const TeamForm = ({ 
  team, 
  users, 
  usersLoading,
  onSubmit, 
  onCancel,
  loading 
}: { 
  team?: any; 
  users: any[];
  usersLoading: boolean;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading: boolean;
}) => {
  const [formData, setFormData] = useState({
    teamName: team?.teamName || '',
    description: team?.description || '',
    productOwnerUserId: team?.productOwnerUserId || 'unassigned',
  });

  const [errors, setErrors] = useState({ teamName: '' });

  const validateForm = () => {
    const newErrors = { teamName: '' };
    let isValid = true;

    if (!formData.teamName.trim()) {
      newErrors.teamName = 'Team name is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = {
        teamName: formData.teamName,
        description: formData.description,
        productOwnerUserId: formData.productOwnerUserId === 'unassigned' ? null : formData.productOwnerUserId,
      };
      onSubmit(submitData);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'teamName' && errors.teamName) {
      setErrors(prev => ({ ...prev, teamName: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="teamName">Team Name *</Label>
        <Input
          id="teamName"
          value={formData.teamName}
          onChange={(e) => handleChange('teamName', e.target.value)}
          placeholder="Enter team name"
        />
        {errors.teamName && <p className="text-sm text-destructive">{errors.teamName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Team Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter team description"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="productOwner">Product Owner</Label>
        <Select 
          value={formData.productOwnerUserId} 
          onValueChange={(value) => handleChange('productOwnerUserId', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select product owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Not assigned</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.userId} value={user.userId.toString()}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">{user.username || 'Unknown User'}</div>
                    <div className="text-xs text-muted-foreground">{user.email || 'No email'}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {usersLoading && <p className="text-sm text-muted-foreground">Loading users...</p>}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {team ? 'Update Team' : 'Create Team'}
        </Button>
      </DialogFooter>
    </form>
  );
};

// Team Members Management Component
const TeamMembersManagement = ({ 
  team, 
  users, 
  usersLoading,
  onRemoveMember,
  onAddMember,
  loading
}: { 
  team: any; 
  users: any[];
  usersLoading: boolean;
  onRemoveMember: (userId: number) => void;
  onAddMember: (userId: number) => void;
  loading: boolean;
}) => {
  const [selectedUser, setSelectedUser] = useState('');

  const teamMembers = team?.members || [];
  const availableUsers = users.filter(user => 
    !teamMembers.some((member: any) => member.userId === user.userId)
  );

  const handleAddMember = () => {
    if (selectedUser) {
      onAddMember(Number(selectedUser));
      setSelectedUser('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Members */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">
            Current Team Members ({teamMembers.length})
          </h3>
        </div>
        
        {teamMembers.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground italic">No members in this team yet</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {teamMembers.map((member: any) => (
                  <div key={member.userId} className="flex items-center justify-between p-4 hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {member.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.username || 'Unknown User'}</p>
                        <p className="text-sm text-muted-foreground">{member.email || 'No email'}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveMember(member.userId)}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4" />}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Member Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Add Member to Team</h3>
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select user to add" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.userId} value={user.userId.toString()}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>
                            {user.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{user.username || 'Unknown User'}</div>
                          <div className="text-xs text-muted-foreground">{user.email || 'No email'}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddMember}
                disabled={!selectedUser || loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Add
              </Button>
            </div>
            {usersLoading && <p className="text-sm text-muted-foreground mt-2">Loading users...</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Team View Modal for Regular Users
const TeamViewModal = ({ team, onClose }: { team: any; onClose: () => void }) => {
  const teamMembers = team?.members || [];

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Team Details - {team?.teamName}</DialogTitle>
        <DialogDescription>
          View team information and members
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Team Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Team Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Team Name</Label>
              <p className="text-base">{team?.teamName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <p className="text-base text-muted-foreground">
                {team?.description || 'No description provided'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Product Owner</Label>
              <p className="text-base">
                {team?.productOwnerUsername || 'Not assigned'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members ({teamMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teamMembers.length === 0 ? (
              <p className="text-muted-foreground italic text-center py-4">
                No members in this team
              </p>
            ) : (
              <div className="space-y-3">
                {teamMembers.map((member: any) => (
                  <div key={member.userId} className="flex items-center gap-3 p-3 rounded-lg border">
                    <Avatar>
                      <AvatarFallback>
                        {member.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{member.username || 'Unknown User'}</p>
                      <p className="text-sm text-muted-foreground">{member.email || 'No email'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DialogFooter>
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </DialogContent>
  );
};

// Main Teams Component
const Teams = () => {
  const { data: session } = useSession();
  const { data: teams, isLoading, isError, refetch: refetchTeams } = useGetTeamsQuery();
  const { data: users, isLoading: usersLoading } = useGetUsersQuery();
  const [createTeam, { isLoading: creating }] = useCreateTeamMutation();
  const [updateTeam, { isLoading: updating }] = useUpdateTeamMutation();
  const [deleteTeam, { isLoading: deleting }] = useDeleteTeamMutation();
  const [addTeamMember, { isLoading: addingMember }] = useAddTeamMemberMutation();
  const [removeTeamMember, { isLoading: removingMember }] = useRemoveTeamMemberMutation();
  
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const { toast } = useToast();

  const isAdmin = session?.user?.role === 'admin';

  const canDeleteTeam = (team: any) => {
  if (!team) return false;
  
  const memberCount = team._count?.members || 0;
  const projectCount = team._count?.projects || 0;
  
  return memberCount === 0 && projectCount === 0;
};

  // Handlers
  const handleFormSubmit = async (formData: any) => {
    try {
      if (selectedTeam) {
        await updateTeam({ id: selectedTeam.id, data: formData }).unwrap();
        toast({
          title: "Success",
          description: "Team updated successfully",
        });
      } else {
        await createTeam(formData).unwrap();
        toast({
          title: "Success",
          description: "Team created successfully",
        });
      }
      setShowForm(false);
      setSelectedTeam(null);
      refetchTeams();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || 'Error saving team',
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedTeam) return;
    try {
      await deleteTeam(selectedTeam.id).unwrap();
      toast({
        title: "Success",
        description: "Team deleted successfully",
      });
      setDeleteConfirm(false);
      setSelectedTeam(null);
      refetchTeams();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || 'Error deleting team',
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!selectedTeam) return;
    try {
      await removeTeamMember({ teamId: selectedTeam.id, userId }).unwrap();
      toast({
        title: "Success",
        description: "Member removed successfully",
      });
      refetchTeams();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || 'Error removing member',
        variant: "destructive",
      });
    }
  };

  const handleAddMember = async (userId: number) => {
    if (!selectedTeam) return;
    try {
      await addTeamMember({ teamId: selectedTeam.id, userId }).unwrap();
      toast({
        title: "Success",
        description: "Member added successfully",
      });
      refetchTeams();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || 'Error adding member',
        variant: "destructive",
      });
    }
  };

  // Loading State
  if (isLoading) return <TeamsSkeleton isAdmin={isAdmin} />;

  // Error State
  if (isError) {
    return (
      <div className="p-6">
        <Header name="Teams Management" />
        <Alert variant="destructive">
          <AlertDescription>Error loading teams</AlertDescription>
        </Alert>
        <Button onClick={() => refetchTeams()} variant="outline" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Header 
        name="Teams Management" 
        description={isAdmin ? "Create and manage project teams" : "View project teams and members"} 
        className="mb-8" 
      />

      {/* Statistics Cards - ONLY FOR ADMINS */}
      {isAdmin && <TeamStatsCards teams={teams || []} />}

      {/* Teams Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Teams</CardTitle>
            <CardDescription>
              {isAdmin 
                ? "Manage your project teams and members" 
                : "View project teams and their members"
              }
            </CardDescription>
          </div>
          {/* ONLY SHOW CREATE BUTTON FOR ADMINS - REMOVED FILTER BUTTON */}
          {isAdmin && (
            <Button onClick={() => {
              setSelectedTeam(null);
              setShowForm(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {teams?.length === 0 ? (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">
                {isAdmin ? "No teams created yet" : "No teams available"}
              </h3>
              <p className="text-muted-foreground mt-2">
                {isAdmin 
                  ? "Get started by creating your first team." 
                  : "Teams will appear here once they are created by administrators."
                }
              </p>
              {isAdmin && (
                <Button onClick={() => setShowForm(true)} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Team
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Product Owner</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Projects</TableHead>
                  {/* ONLY SHOW ACTIONS COLUMN FOR ADMINS */}
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                  
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams?.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="text-lg font-bold">
                            {team.teamName?.charAt(0).toUpperCase() || 'T'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{team.teamName}</div>
                          <div className="text-sm text-muted-foreground">
                            {team.description || 'No description'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {team.productOwnerUsername ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {team.productOwnerUsername?.charAt(0).toUpperCase() || 'P'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{team.productOwnerUsername}</div>
                            <div className="text-xs text-muted-foreground">Product Owner</div>
                          </div>
                        </div>
                      ) : (
                        <Badge variant="outline">Not assigned</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="secondary">{team._count?.members || 0}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        <Briefcase className="mr-1 h-3 w-3" />
                        {team._count?.projects || 0}
                      </Badge>
                    </TableCell>
                    {/* ACTIONS FOR ADMINS */}
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTeam(team);
                              setShowMembers(true);
                            }}
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTeam(team);
                              setShowForm(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTeam(team);
                              setDeleteConfirm(true);
                            }}
                            disabled={!canDeleteTeam(team)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Team Form Dialog - ONLY FOR ADMINS */}
      {isAdmin && (
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedTeam ? 'Edit Team' : 'Create New Team'}</DialogTitle>
              <DialogDescription>
                {selectedTeam ? 'Update team information' : 'Create a new project team'}
              </DialogDescription>
            </DialogHeader>
            <TeamForm
              team={selectedTeam}
              users={users || []}
              usersLoading={usersLoading}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setSelectedTeam(null);
              }}
              loading={creating || updating}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Manage Members Dialog - ONLY FOR ADMINS */}
      {isAdmin && (
        <Dialog open={showMembers} onOpenChange={setShowMembers}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Manage Team Members - {selectedTeam?.teamName}</DialogTitle>
              <DialogDescription>
                Add or remove members from this team
              </DialogDescription>
            </DialogHeader>
            {selectedTeam && (
              <TeamMembersManagement
                team={selectedTeam}
                users={users || []}
                usersLoading={usersLoading}
                onRemoveMember={handleRemoveMember}
                onAddMember={handleAddMember}
                loading={addingMember || removingMember}
              />
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Team View Modal - FOR REGULAR USERS */}
      {!isAdmin && (
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          {selectedTeam && (
            <TeamViewModal 
              team={selectedTeam} 
              onClose={() => {
                setShowViewModal(false);
                setSelectedTeam(null);
              }} 
            />
          )}
        </Dialog>
      )}

      {/* Delete Confirmation Dialog - ONLY FOR ADMINS */}
      {isAdmin && (
        <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Team</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>{selectedTeam?.teamName}</strong>?
                {!canDeleteTeam(selectedTeam) && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Cannot Delete Team</span>
                    </div>
                    <p className="text-yellow-700 text-sm mt-1">
                      This team has <strong>{selectedTeam?._count?.members || 0} members</strong> and{" "}
                      <strong>{selectedTeam?._count?.projects || 0} projects</strong>. 
                      You must remove all members and projects before deleting the team.
                    </p>
                  </div>
                )}
                {canDeleteTeam(selectedTeam) && " This action cannot be undone."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete} 
                disabled={deleting || !canDeleteTeam(selectedTeam)}
              >
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {canDeleteTeam(selectedTeam) ? "Delete Team" : "Cannot Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Skeleton Loader
const TeamsSkeleton = ({ isAdmin = true }: { isAdmin?: boolean }) => (
  <div className="p-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      {isAdmin && <Skeleton className="h-10 w-32" />}
    </div>
    
    {/* Stats Cards Skeleton - ONLY FOR ADMINS */}
    {isAdmin && (
      <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    )}
    
    {/* Table Skeleton */}
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default Teams;