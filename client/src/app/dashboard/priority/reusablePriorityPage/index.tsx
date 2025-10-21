"use client";

import Header from "@/components/Header";
import TaskCard from "@/components/TaskCard";
import ModalNewTask from "@/components/ModalNewTask";
import {
  Priority,
  Task,
  useGetTasksByUserQuery,
} from "@/state/api";
import React, { useState } from "react";
import { useSession } from "next-auth/react"; 
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  priority: Priority;
  userId?: number;
};

const ReusablePriorityPage = ({ priority, userId = 1 }: Props) => {
  const { data: session } = useSession(); 
  const [view, setView] = useState<"list" | "table">("list");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);
  
  const {
    data: tasks,
    isLoading,
    isError: isTasksError,
    refetch,
  } = useGetTasksByUserQuery(userId, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const filteredTasks = tasks?.filter(
    (task: Task) => task.priority === priority,
  ) || [];

  const getStatusVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      "To Do": "default",
      "Work In Progress": "secondary",
      "Under Review": "outline",
      "Completed": "destructive",
    };
    return variants[status] || "outline";
  };

  const getPriorityVariant = (taskPriority: string) => {
    const variants: Record<string, "destructive" | "default" | "secondary" | "outline"> = {
      "Urgent": "destructive",
      "High": "default",
      "Medium": "secondary",
      "Low": "outline",
    };
    return variants[taskPriority] || "outline";
  };

  const handleTaskCreated = () => {
    setIsModalNewTaskOpen(false);
    refetch();
  };

  if (isTasksError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>Error fetching tasks. Please try again.</AlertDescription>
        </Alert>
        <Button onClick={() => refetch()} variant="outline" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Task Creation Modal */}
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
        onTaskCreated={handleTaskCreated}
      />
      
      {/* Header */}
      <Header
        name={`${priority} Priority Tasks`}
        description={`Tasks with ${priority.toLowerCase()} priority level`}
        buttonComponent={
          // INLINE ROLE CHECK - Only show Add Task button to admins
          session?.user?.role === 'admin' && (
            <Button onClick={() => setIsModalNewTaskOpen(true)}>
              Add Task
            </Button>
          )
        }
      />
      
      {/* Task count */}
      <div className="mb-4 text-sm text-muted-foreground">
        {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} with {priority.toLowerCase()} priority
      </div>
      
      {/* View Toggle - Show to all users */}
      <Tabs value={view} onValueChange={(value) => setView(value as "list" | "table")} className="mb-6">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Content */}
      {isLoading ? (
        <PriorityPageSkeleton />
      ) : filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-16 text-center">
            <CardTitle className="text-lg font-semibold mb-2 text-muted-foreground">
              No tasks found
            </CardTitle>
            <CardDescription className="mb-6">
              {session?.user?.role === 'admin' 
                ? `No tasks with ${priority.toLowerCase()} priority yet`
                : `No ${priority.toLowerCase()} priority tasks assigned to you`
              }
            </CardDescription>
            {/* INLINE ROLE CHECK - Only show Create button to admins */}
            {session?.user?.role === 'admin' && (
              <Button onClick={() => setIsModalNewTaskOpen(true)}>
                Create Your First Task
              </Button>
            )}
          </CardContent>
        </Card>
      ) : view === "list" ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.map((task: Task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onTaskUpdated={refetch}
              userRole={session?.user?.role} 
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Tasks Overview</CardTitle>
            <CardDescription>
              {session?.user?.role === 'admin'
                ? `All tasks with ${priority.toLowerCase()} priority in table view`
                : `Your ${priority.toLowerCase()} priority tasks`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Assignee</TableHead>
                    {/* INLINE ROLE CHECK - Action column only for admins */}
                    {session?.user?.role === 'admin' && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task: Task) => (
                    <TableRow key={task.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                          {task.description || "No description"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(task.status || "To Do")}>
                          {task.status || "To Do"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityVariant(task.priority)}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {task.dueDate ? (
                          <span className="text-sm">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {task.assignee?.username ? (
                          <span className="text-sm">{task.assignee.username}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      {/* INLINE ROLE CHECK - Action buttons only for admins */}
                      {session?.user?.role === 'admin' && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm">
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Skeleton Loader
const PriorityPageSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
    <Skeleton className="h-4 w-48" />
    <div className="flex gap-2">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-24" />
    </div>
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default ReusablePriorityPage;