'use client';

import { Project } from "@/state/api";
import { useDeleteProjectMutation, useUpdateProjectMutation } from '@/state/api';
import React, { useState } from 'react';
import { Edit, Trash2, Calendar, FileText } from 'lucide-react';

type Props = {
  project: Project;
  onProjectDeleted?: () => void;
  onProjectUpdated?: () => void;
};

const ProjectCard = ({ project, onProjectDeleted, onProjectUpdated }: Props) => {
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: project.name,
    description: project.description || '',
    startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
    endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
  });

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
    return (
      <div className="rounded-lg border-2 border-blue-300 bg-white p-4 shadow-md dark:bg-dark-secondary">
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="w-full rounded border px-3 py-2 dark:bg-dark-primary dark:text-white"
              disabled={isUpdating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              rows={2}
              className="w-full rounded border px-3 py-2 dark:bg-dark-primary dark:text-white"
              disabled={isUpdating}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Start Date
              </label>
              <input
                type="date"
                value={editData.startDate}
                onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                className="w-full rounded border px-3 py-2 dark:bg-dark-primary dark:text-white"
                disabled={isUpdating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                End Date
              </label>
              <input
                type="date"
                value={editData.endDate}
                onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
                className="w-full rounded border px-3 py-2 dark:bg-dark-primary dark:text-white"
                disabled={isUpdating}
              />
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 rounded bg-gray-300 px-3 py-2 text-gray-700 hover:bg-gray-400"
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 rounded bg-blue-500 px-3 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-4 shadow-md transition-all hover:shadow-lg dark:border-gray-700 dark:bg-dark-secondary">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
          {project.name}
        </h3>
        <div className="flex space-x-1">
          <button
            onClick={() => setIsEditing(true)}
            className="rounded p-1 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900"
            title="Edit project"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded p-1 text-red-500 hover:bg-red-100 disabled:opacity-50 dark:hover:bg-red-900"
            title="Delete project"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <p className="mb-3 text-gray-600 dark:text-gray-300">
          <FileText size={14} className="mr-1 inline" />
          {project.description}
        </p>
      )}

      {/* Dates */}
      <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
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

      {/* Delete Button (for mobile/accessibility) */}
      <div className="mt-4 flex space-x-2">
        <button
          onClick={() => setIsEditing(true)}
          className="flex-1 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex-1 rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600 disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;