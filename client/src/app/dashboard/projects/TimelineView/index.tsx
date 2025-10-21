"use client";

import { useGetTasksQuery } from "@/state/api";
import React, { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { CustomGantt } from "@/components/CustomGantt";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  refreshTrigger?: number;
  userRole?: string; 
};

type ViewMode = 'day' | 'week' | 'month';

const Timeline = ({ id, setIsModalNewTaskOpen, refreshTrigger, userRole }: Props) => {
  const {
    data: tasks,
    error,
    isLoading,
    refetch,
  } = useGetTasksQuery({ projectId: Number(id) });

  const [viewMode, setViewMode] = useState<ViewMode>('week');

  const ganttTasks = useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return [];

    const validTasks = tasks
      .filter(task => {
        if (!task.startDate || !task.dueDate) return false;
        
        const startDate = new Date(task.startDate);
        const dueDate = new Date(task.dueDate);
        
        const isValidStart = !isNaN(startDate.getTime());
        const isValidDue = !isNaN(dueDate.getTime());
        
        if (!isValidStart || !isValidDue) return false;

        if (viewMode === 'day') {
          const diffTime = Math.abs(dueDate.getTime() - startDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays < 1) return false;
        }

        return true;
      })
      .map((task) => {
        const startDate = new Date(task.startDate as string);
        const dueDate = new Date(task.dueDate as string);

        if (isNaN(startDate.getTime()) || isNaN(dueDate.getTime())) {
          return null;
        }

        if (viewMode === 'day' && dueDate <= startDate) {
          return null;
        }

        return {
          id: `Task-${task.id}`,
          name: task.title || 'Untitled Task',
          start: startDate,
          end: dueDate,
          progress: task.status === "Completed" ? 100 : task.points ? Math.min((task.points / 10) * 100, 100) : 0,
        };
      })
      .filter(Boolean);

    return validTasks;
  }, [tasks, viewMode, refreshTrigger]);

  const handleViewModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newViewMode = event.target.value as ViewMode;
    
    if (newViewMode === 'day') {
      const dayViewTasks = ganttTasks.filter(task => {
        const startDate = new Date(task.start);
        const dueDate = new Date(task.end);
        const diffTime = Math.abs(dueDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 1;
      });
      
      if (dayViewTasks.length === 0) {
        alert('No tasks suitable for Day view. Tasks need at least 1 day duration.');
        return;
      }
    }
    
    setViewMode(newViewMode);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-64">Loading timeline...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64">
        <div className="text-red-500 text-lg mb-4">Error loading timeline</div>
        <button onClick={() => refetch()} className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
          Retry
        </button>
      </div>
    );
  }

  const tasksForCurrentView = ganttTasks.filter(task => {
    if (viewMode === 'day') {
      const startDate = new Date(task.start);
      const dueDate = new Date(task.end);
      const diffTime = Math.abs(dueDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 1;
    }
    return true;
  });

  if (tasksForCurrentView.length === 0) {
    return (
      <div className="px-4 xl:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 py-5">
          <div>
            <h1 className="text-xl font-bold dark:text-white mb-2">
              Project Timeline - {viewMode} View
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              No tasks with valid dates available
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              className="block w-48 rounded border border-gray-300 bg-white px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={viewMode}
              onChange={handleViewModeChange}
            >
              <option value="day">Day View</option>
              <option value="week">Week View</option>
              <option value="month">Month View</option>
            </select>

           
            {userRole === 'admin' && (
              <button
                className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
                onClick={() => setIsModalNewTaskOpen(true)}
              >
                <Plus size={18} />
                Add Task
              </button>
            )}
          </div>
        </div>
        
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No tasks to display
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {userRole === 'admin' 
              ? "Add tasks with start and due dates to see them on the timeline."
              : "No tasks with valid dates are available to display on the timeline."
            }
          </p>
         
          {userRole === 'admin' && (
            <button
              className="mt-4 flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
              onClick={() => setIsModalNewTaskOpen(true)}
            >
              <Plus size={18} />
              Create First Task
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 xl:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 py-5">
        <div>
          <h1 className="text-xl font-bold dark:text-white mb-2">
            Project Timeline - {viewMode} View
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {tasksForCurrentView.length} of {tasks?.length || 0} tasks visible
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            className="block w-48 rounded border border-gray-300 bg-white px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={viewMode}
            onChange={handleViewModeChange}
          >
            <option value="day">Day View</option>
            <option value="week">Week View</option>
            <option value="month">Month View</option>
          </select>

         
          {userRole === 'admin' && (
            <button
              className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
              onClick={() => setIsModalNewTaskOpen(true)}
            >
              <Plus size={18} />
              Add Task
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
        <CustomGantt
          tasks={tasksForCurrentView}
          viewMode={viewMode}
          isReadOnly={userRole !== 'admin'}
        />
      </div>
    </div>
  );
};

export default Timeline;