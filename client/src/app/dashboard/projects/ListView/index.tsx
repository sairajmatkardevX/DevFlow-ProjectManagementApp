import Header from "@/components/Header";
import TaskCard from "@/components/TaskCard";
import { Task, useGetTasksQuery } from "@/state/api";
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  refreshTrigger?: number;
  userRole?: string; 
};

const ListView = ({ id, setIsModalNewTaskOpen, refreshTrigger, userRole }: Props) => {
  const {
    data: tasks,
    error,
    isLoading,
    refetch,
  } = useGetTasksQuery({ projectId: Number(id) });

  const handleTaskUpdated = () => {
    refetch();
  };

  if (isLoading) {
    return <ListViewSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>Error loading tasks</AlertDescription>
        </Alert>
        <Button onClick={() => refetch()} variant="outline" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 pb-8 xl:px-6">
      <div className="pt-5">
        <Header
          name={`List View ${tasks ? `(${tasks.length} tasks)` : ''}`}
          buttonComponent={
          
            userRole === 'admin' && (
              <Button onClick={() => setIsModalNewTaskOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            )
          }
          isSmallText
        />
      </div>

      {tasks?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-16 text-center">
            <div className="text-muted-foreground mb-4">
              <Plus size={48} />
            </div>
            <CardTitle className="text-lg font-semibold mb-2">
              No tasks yet
            </CardTitle>
            <CardDescription className="mb-6 max-w-md">
              {userRole === 'admin' 
                ? "Get started by creating your first task for this project. Tasks will appear here in an organized list view."
                : "No tasks have been created for this project yet."
              }
            </CardDescription>
            {/* INLINE ROLE CHECK - Only show Create button to admins */}
            {userRole === 'admin' && (
              <Button onClick={() => setIsModalNewTaskOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Task
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {tasks?.map((task: Task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onTaskUpdated={handleTaskUpdated}
              userRole={userRole} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Skeleton Loader
const ListViewSkeleton = () => (
  <div className="px-4 pb-8 xl:px-6">
    <div className="pt-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default ListView;