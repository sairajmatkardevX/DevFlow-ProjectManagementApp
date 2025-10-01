import { useAppSelector } from "@/app/store";
import { useGetTasksQuery } from "@/state/api";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import React, { useMemo, useState } from "react";
import { Plus } from "lucide-react";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  refreshTrigger?: number;
};

type TaskTypeItems = "task" | "milestone" | "project";

const Timeline = ({ id, setIsModalNewTaskOpen, refreshTrigger }: Props) => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const {
    data: tasks,
    error,
    isLoading,
    refetch,
  } = useGetTasksQuery({ projectId: Number(id) });

  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Week, // Start with Week instead of Month
    locale: "en-US",
  });

  const ganttTasks = useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return [];

    const validTasks = tasks
      .filter(task => {
        if (!task.startDate || !task.dueDate) return false;
        
        const startDate = new Date(task.startDate);
        const dueDate = new Date(task.dueDate);
        
        // Check if dates are valid
        const isValidStart = !isNaN(startDate.getTime());
        const isValidDue = !isNaN(dueDate.getTime());
        
        if (!isValidStart || !isValidDue) return false;

        // For Day view, ensure dates are not too far apart or have minimum duration
        if (displayOptions.viewMode === ViewMode.Day) {
          const diffTime = Math.abs(dueDate.getTime() - startDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Ensure tasks have at least 1 day duration for Day view
          if (diffDays < 1) return false;
        }

        return true;
      })
      .map((task) => {
        const startDate = new Date(task.startDate as string);
        const dueDate = new Date(task.dueDate as string);

        // Double-check dates are valid
        if (isNaN(startDate.getTime()) || isNaN(dueDate.getTime())) {
          return null;
        }

        // For Day view, ensure due date is after start date
        if (displayOptions.viewMode === ViewMode.Day && dueDate <= startDate) {
          console.warn('Skipping task for Day view - due date before start date:', task.id);
          return null;
        }

        return {
          start: startDate,
          end: dueDate,
          name: task.title || 'Untitled Task',
          id: `Task-${task.id}`,
          type: "task" as TaskTypeItems,
          progress: task.status === "Completed" ? 100 : task.points ? Math.min((task.points / 10) * 100, 100) : 0,
          isDisabled: false,
          styles: {
            backgroundColor: getTaskColor(task.priority),
            backgroundSelectedColor: getTaskSelectedColor(task.priority),
          },
        };
      })
      .filter(Boolean); // Remove null entries

    return validTasks;
  }, [tasks, displayOptions.viewMode]); // Add viewMode to dependencies

  const handleViewModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newViewMode = event.target.value as ViewMode;
    
    // If switching to Day view and no valid tasks, show warning
    if (newViewMode === ViewMode.Day) {
      const dayViewTasks = ganttTasks.filter(task => {
        const startDate = new Date(task.start);
        const dueDate = new Date(task.end);
        const diffTime = Math.abs(dueDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 1;
      });
      
      if (dayViewTasks.length === 0) {
        alert('No tasks suitable for Day view. Tasks need at least 1 day duration.');
        return; // Don't switch to Day view
      }
    }
    
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: newViewMode,
    }));
  };

  // Helper function for task colors based on priority
  function getTaskColor(priority?: string): string {
    const colors: Record<string, string> = {
      "Urgent": "#ef4444",
      "High": "#f59e0b", 
      "Medium": "#10b981",
      "Low": "#3b82f6",
      "Backlog": "#6b7280",
    };
    return colors[priority || "Medium"] || "#10b981";
  }

  function getTaskSelectedColor(priority?: string): string {
    const colors: Record<string, string> = {
      "Urgent": "#dc2626",
      "High": "#d97706",
      "Medium": "#059669",
      "Low": "#2563eb",
      "Backlog": "#4b5563",
    };
    return colors[priority || "Medium"] || "#059669";
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading timeline...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64">
        <div className="text-red-500 text-lg mb-4">Error loading timeline</div>
        <button 
          onClick={() => refetch()}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // Don't render Gantt if no valid tasks for current view
  const tasksForCurrentView = ganttTasks.filter(task => {
    if (displayOptions.viewMode === ViewMode.Day) {
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
              Project Timeline - {displayOptions.viewMode} View
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              No tasks suitable for {displayOptions.viewMode.toLowerCase()} view
            </p>
            {displayOptions.viewMode === ViewMode.Day && (
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                Day view requires tasks with at least 1 day duration
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                className="block w-48 appearance-none rounded border border-gray-300 bg-white px-4 py-2 pr-8 leading-tight shadow-sm hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-secondary dark:bg-dark-secondary dark:text-white"
                value={displayOptions.viewMode}
                onChange={handleViewModeChange}
              >
                <option value={ViewMode.Day}>Day View</option>
                <option value={ViewMode.Week}>Week View</option>
                <option value={ViewMode.Month}>Month View</option>
                <option value={ViewMode.Year}>Year View</option>
              </select>
            </div>

            <button
              className="flex items-center gap-2 rounded bg-blue-primary px-4 py-2 text-white hover:bg-blue-600 transition-colors"
              onClick={() => setIsModalNewTaskOpen(true)}
            >
              <Plus size={18} />
              Add Task
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <Plus size={48} />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
            No timeline data for {displayOptions.viewMode.toLowerCase()} view
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
            {displayOptions.viewMode === ViewMode.Day 
              ? "Day view requires tasks with start and due dates that are at least 1 day apart."
              : "Tasks need both start and due dates to appear on the timeline."
            }
          </p>
          <button
            className="flex items-center gap-2 rounded bg-blue-primary px-6 py-3 text-white hover:bg-blue-600 transition-colors"
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            <Plus size={18} />
            Add Task with Dates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 xl:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 py-5">
        <div>
          <h1 className="text-xl font-bold dark:text-white mb-2">
            Project Timeline - {displayOptions.viewMode} View
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {tasksForCurrentView.length} of {tasks?.length || 0} tasks visible
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              className="block w-48 appearance-none rounded border border-gray-300 bg-white px-4 py-2 pr-8 leading-tight shadow-sm hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-secondary dark:bg-dark-secondary dark:text-white"
              value={displayOptions.viewMode}
              onChange={handleViewModeChange}
            >
              <option value={ViewMode.Day}>Day View</option>
              <option value={ViewMode.Week}>Week View</option>
              <option value={ViewMode.Month}>Month View</option>
              <option value={ViewMode.Year}>Year View</option>
            </select>
          </div>

          <button
            className="flex items-center gap-2 rounded bg-blue-primary px-4 py-2 text-white hover:bg-blue-600 transition-colors"
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            <Plus size={18} />
            Add Task
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-dark-secondary">
        <div className="timeline">
          <Gantt
            tasks={tasksForCurrentView}
            {...displayOptions}
            columnWidth={displayOptions.viewMode === ViewMode.Month ? 150 : 100}
            listCellWidth="160px"
            barBackgroundColor={isDarkMode ? "#374151" : "#e5e7eb"}
            barBackgroundSelectedColor={isDarkMode ? "#4b5563" : "#d1d5db"}
            barCornerRadius={4}
            fontSize="12px"
          />
        </div>
      </div>
    </div>
  );
};

export default Timeline;