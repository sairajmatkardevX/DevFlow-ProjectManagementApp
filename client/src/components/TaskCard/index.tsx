'use client';

import { Task, Priority } from "@/state/api";
import { 
  useDeleteTaskMutation, 
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation 
} from '@/state/api';
import React, { useState } from "react";
import { AlertCircle, ArrowUp, Clock, Minus, Signal } from "lucide-react";

type Props = {
  task: Task;
  onTaskUpdated: () => void;
  userRole?: string; 
};

const TaskCard = ({ task, onTaskUpdated, userRole }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || "");
  
 
  const getSafePriority = (priority: any): Priority => {
    if (priority && Object.values(Priority).includes(priority as Priority)) {
      return priority as Priority;
    }
    return Priority.Medium; 
  };
  
  const [editedPriority, setEditedPriority] = useState<Priority>(
    getSafePriority(task.priority)
  );
  
  // RTK Query hooks
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [updateTaskStatus, { isLoading: isUpdatingStatus }] = useUpdateTaskStatusMutation();

  // Priority configuration with type safety
  const priorityConfig = {
    [Priority.Urgent]: { 
      label: "Urgent", 
      icon: AlertCircle, 
      color: "text-red-600", 
      bgColor: "bg-red-100", 
      borderColor: "border-red-300",
      darkColor: "text-red-400",
      darkBgColor: "bg-red-900/30"
    },
    [Priority.High]: { 
      label: "High", 
      icon: ArrowUp, 
      color: "text-orange-600", 
      bgColor: "bg-orange-100", 
      borderColor: "border-orange-300",
      darkColor: "text-orange-400",
      darkBgColor: "bg-orange-900/30"
    },
    [Priority.Medium]: { 
      label: "Medium", 
      icon: Signal, 
      color: "text-yellow-600", 
      bgColor: "bg-yellow-100", 
      borderColor: "border-yellow-300",
      darkColor: "text-yellow-400",
      darkBgColor: "bg-yellow-900/30"
    },
    [Priority.Low]: { 
      label: "Low", 
      icon: Minus, 
      color: "text-green-600", 
      bgColor: "bg-green-100", 
      borderColor: "border-green-300",
      darkColor: "text-green-400",
      darkBgColor: "bg-green-900/30"
    },
    [Priority.Backlog]: { 
      label: "Backlog", 
      icon: Clock, 
      color: "text-gray-600", 
      bgColor: "bg-gray-100", 
      borderColor: "border-gray-300",
      darkColor: "text-gray-400",
      darkBgColor: "bg-gray-900/30"
    },
  };

  // Safe priority access
  const currentPriority = priorityConfig[editedPriority] || priorityConfig[Priority.Medium];
  const PriorityIcon = currentPriority.icon;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await deleteTask(task.id).unwrap();
      onTaskUpdated();
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task');
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedTitle(task.title);
      setEditedDescription(task.description || "");
      setEditedPriority(getSafePriority(task.priority));
    }
  };

  const handleSave = async () => {
    if (!editedTitle.trim()) {
      alert('Title is required');
      return;
    }

    try {
      await updateTask({
        id: task.id,
        data: {
          title: editedTitle,
          description: editedDescription,
          status: task.status,
          priority: editedPriority,
        }
      }).unwrap();
      
      setIsEditing(false);
      onTaskUpdated();
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    
    if (userRole !== 'admin') return;
    
    try {
      await updateTaskStatus({
        taskId: task.id,
        status: newStatus
      }).unwrap();
      onTaskUpdated();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handlePriorityChange = async (newPriority: Priority) => {
    
    if (userRole !== 'admin') return;
    
    try {
      await updateTask({
        id: task.id,
        data: {
          priority: newPriority
        }
      }).unwrap();
      setEditedPriority(newPriority);
      onTaskUpdated();
    } catch (error) {
      console.error('Failed to update task priority:', error);
    }
  };

  const isLoading = isDeleting || isUpdating || isUpdatingStatus;

  return (
    <div className="mb-3 rounded bg-white p-4 shadow dark:bg-dark-secondary dark:text-white relative">
      {/* Action Buttons - Only show for admins */}
      {userRole === 'admin' && (
        <div className="absolute top-2 right-2 flex space-x-2">
          <button
            onClick={handleEditToggle}
            disabled={isLoading}
            className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}

      {isEditing ? (
        // Edit Mode - Only accessible for admins
        userRole === 'admin' ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Title*</label>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full p-2 border rounded dark:bg-dark-primary dark:text-white"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="w-full p-2 border rounded dark:bg-dark-primary dark:text-white"
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={editedPriority}
                onChange={(e) => setEditedPriority(e.target.value as Priority)}
                className="w-full p-2 border rounded dark:bg-dark-primary dark:text-white"
                disabled={isLoading}
              >
                {Object.entries(priorityConfig).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : (
          
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{task.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{task.description || "No description provided"}</p>
           
          </div>
        )
      ) : (
        // View Mode
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">{task.title}</h3>
          <p className="text-gray-600 dark:text-gray-400">{task.description || "No description provided"}</p>
          
          {/* Priority Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">Priority:</span>
              <div className={`flex items-center gap-1 px-2 py-1 rounded border ${currentPriority.bgColor} ${currentPriority.borderColor} ${currentPriority.color} dark:${currentPriority.darkBgColor} dark:${currentPriority.darkColor}`}>
                <PriorityIcon size={14} />
                <span className="text-sm font-medium">{currentPriority.label}</span>
              </div>
            </div>
            
           
            {userRole === 'admin' && (
              <div className="flex gap-1">
                {Object.entries(priorityConfig).map(([value, config]) => {
                  const ConfigIcon = config.icon;
                  const priorityValue = value as Priority;
                  return (
                    <button
                      key={value}
                      onClick={() => handlePriorityChange(priorityValue)}
                      disabled={isUpdating || priorityValue === editedPriority}
                      className={`p-1 rounded border ${
                        priorityValue === editedPriority 
                          ? `${config.bgColor} ${config.borderColor} ${config.color} dark:${config.darkBgColor} dark:${config.darkColor}`
                          : 'bg-gray-100 border-gray-200 text-gray-400 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-500 dark:hover:bg-gray-600'
                      } disabled:opacity-30`}
                      title={`Set to ${config.label}`}
                    >
                      <ConfigIcon size={14} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="font-medium">Status:</span>
            {userRole === 'admin' ? (
              <select
                value={task.status || ''}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdatingStatus}
                className="border rounded p-1 dark:bg-dark-primary dark:text-white"
              >
                <option value="To Do">To Do</option>
                <option value="Work In Progress">Work In Progress</option>
                <option value="Under Review">Under Review</option>
                <option value="Completed">Completed</option>
              </select>
            ) : (
             
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                {task.status || 'To Do'}
              </span>
            )}
          </div>

          {/* Tags */}
          {task.tags && (
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                Tags: {task.tags}
              </span>
            </div>
          )}

          {/* Metadata */}
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set"}</p>
            <p>Author: {task.author?.username || "Unknown"}</p>
            <p>Assignee: {task.assignee?.username || "Unassigned"}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;