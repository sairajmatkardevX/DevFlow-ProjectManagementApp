import Header from "@/components/Header";
import TaskCard from "@/components/TaskCard";
import { Task, useGetTasksQuery } from "@/state/api";
import React from "react";
import { Plus } from "lucide-react";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  refreshTrigger?: number; // Add refresh trigger prop
};

const ListView = ({ id, setIsModalNewTaskOpen, refreshTrigger }: Props) => {
  const {
    data: tasks,
    error,
    isLoading,
    refetch,
  } = useGetTasksQuery({ projectId: Number(id) });

  const handleTaskUpdated = () => {
    refetch(); // Refresh the task list
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-red-500 text-lg">Error loading tasks</div>
        <button 
          onClick={() => refetch()}
          className="ml-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pb-8 xl:px-6">
      <div className="pt-5">
        <Header
          name={`List View ${tasks ? `(${tasks.length} tasks)` : ''}`}
          buttonComponent={
            <button
              className="flex items-center gap-2 rounded bg-blue-primary px-4 py-2 text-white hover:bg-blue-600 transition-colors"
              onClick={() => setIsModalNewTaskOpen(true)}
            >
              <Plus size={18} />
              Add Task
            </button>
          }
          isSmallText
        />
      </div>

      {tasks?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <Plus size={48} />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
            No tasks yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
            Get started by creating your first task for this project. 
            Tasks will appear here in a organized list view.
          </p>
          <button
            className="flex items-center gap-2 rounded bg-blue-primary px-6 py-3 text-white hover:bg-blue-600 transition-colors"
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            <Plus size={18} />
            Create Your First Task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {tasks?.map((task: Task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onTaskUpdated={handleTaskUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ListView;