'use client';

import { Project } from "@/state/api";
import { useDeleteProjectMutation, useUpdateProjectMutation } from '@/state/api';
import React, { useState } from 'react';
import { Edit, Trash2, Calendar, FileText } from 'lucide-react';
import { useSession } from 'next-auth/react';

type Props = {
  project: Project;
  onProjectDeleted?: () => void;
  onProjectUpdated?: () => void;
  userRole?: string; 
};

const ProjectCard = ({ project, onProjectDeleted, onProjectUpdated, userRole }: Props) => {
  const { data: session } = useSession();
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: project.name,
    description: project.description || '',
    startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
    endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
  });


  const currentUserRole = userRole || session?.user?.role;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteProject(project.id).unwrap();
      onProjectDeleted?.();
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. It may have tasks assigned to it.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProject({ 
        id: project.id, 
        data: {
          ...editData,
          description: editData.description || undefined,
          startDate: editData.startDate || undefined,
          endDate: editData.endDate || undefined,
        }
      }).unwrap();
      setIsEditing(false);
      onProjectUpdated?.();
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isEditing) {
    
    if (currentUserRole !== 'admin') {
      setIsEditing(false);
      return null;
    }

    return (
      <div className="rounded-lg border-2 border-primary bg-card p-4 shadow-md">
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="w-full rounded border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isUpdating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">
              Description
            </label>
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              rows={2}
              className="w-full rounded border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isUpdating}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-foreground">
                Start Date
              </label>
              <input
                type="date"
                value={editData.startDate}
                onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                className="w-full rounded border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isUpdating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                End Date
              </label>
              <input
                type="date"
                value={editData.endDate}
                onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
                className="w-full rounded border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isUpdating}
              />
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 rounded bg-muted px-3 py-2 text-muted-foreground hover:bg-muted/80 transition-colors"
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 rounded bg-primary px-3 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-md transition-all hover:shadow-lg">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-lg font-bold text-card-foreground">
          {project.name}
        </h3>
        
        {/* Inline role check for header action buttons */}
        {currentUserRole === 'admin' && (
          <div className="flex space-x-1">
            <button
              onClick={() => setIsEditing(true)}
              className="rounded p-1 text-primary hover:bg-accent transition-colors"
              title="Edit project"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-50 transition-colors"
              title="Delete project"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      {project.description && (
        <p className="mb-3 text-muted-foreground">
          <FileText size={14} className="mr-1 inline" />
          {project.description}
        </p>
      )}

      {/* Dates */}
      <div className="space-y-1 text-sm text-muted-foreground">
        <div className="flex items-center">
          <Calendar size={14} className="mr-2" />
          <span className="font-medium">Start:</span>
          <span className="ml-1">{formatDate(project.startDate)}</span>
        </div>
        <div className="flex items-center">
          <Calendar size={14} className="mr-2" />
          <span className="font-medium">End:</span>
          <span className="ml-1">{formatDate(project.endDate)}</span>
        </div>
      </div>

      {/* Inline role check for action buttons - Only show for admins */}
      {currentUserRole === 'admin' && (
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => setIsEditing(true)}
            className="flex-1 rounded bg-primary px-3 py-2 text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 rounded bg-destructive px-3 py-2 text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 transition-colors"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;