import Header from "@/components/Header";
import { useGetTasksQuery } from "@/state/api";
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  refreshTrigger?: number;
  userRole?: string;
};

const TableView = ({ id, setIsModalNewTaskOpen, refreshTrigger, userRole }: Props) => {
  const {
    data: tasks,
    error,
    isLoading,
    refetch,
  } = useGetTasksQuery({ projectId: Number(id) });

  if (isLoading) {
    return <TableViewSkeleton />;
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "To Do": return "default";
      case "Work In Progress": return "secondary";
      case "Under Review": return "outline";
      case "Completed": return "destructive";
      default: return "outline";
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "Urgent": return "destructive";
      case "High": return "default";
      case "Medium": return "secondary";
      case "Low": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="w-full px-4 pb-8 xl:px-6">
      <div className="pt-5">
        <Header
          name={`Table View ${tasks ? `(${tasks.length} tasks)` : ''}`}
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
                ? "Create your first task to see it displayed in this table view."
                : "No tasks have been created for this project yet."
              }
            </CardDescription>
          
            {userRole === 'admin' && (
              <Button onClick={() => setIsModalNewTaskOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Task
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Assignee</TableHead>
                  
                    {userRole === 'admin' && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks?.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate" title={task.description || "No description"}>
                          {task.description || "No description"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(task.status || "To Do")}>
                          {task.status || "To Do"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityVariant(task.priority || "Medium")}>
                          {task.priority || "Medium"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {task.points ? (
                          <span className="font-mono text-sm">
                            {task.points} pts
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[120px] truncate" title={task.tags || "No tags"}>
                          {task.tags || "No tags"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {task.startDate ? (
                          new Date(task.startDate).toLocaleDateString()
                        ) : (
                          <span className="text-muted-foreground">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {task.dueDate ? (
                          new Date(task.dueDate).toLocaleDateString()
                        ) : (
                          <span className="text-muted-foreground">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>{task.author?.username || "Unknown"}</TableCell>
                      <TableCell>{task.assignee?.username || "Unassigned"}</TableCell>
                      
                      {userRole === 'admin' && (
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
const TableViewSkeleton = () => (
  <div className="w-full px-4 pb-8 xl:px-6">
    <div className="pt-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
    </div>

    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              {[...Array(11)].map((_, i) => ( 
                <TableHead key={i}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {[...Array(11)].map((_, j) => ( 
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);

export default TableView;