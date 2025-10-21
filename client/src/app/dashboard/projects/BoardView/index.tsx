import { useGetTasksQuery, useUpdateTaskStatusMutation } from "@/state/api";
import React from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Task as TaskType } from "@/state/api";
import { EllipsisVertical, MessageSquareMore, Plus } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type BoardProps = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  refreshTrigger?: number;
  userRole?: string; 
};

const taskStatus = ["To Do", "Work In Progress", "Under Review", "Completed"];

const BoardView = ({ id, setIsModalNewTaskOpen, refreshTrigger, userRole }: BoardProps) => {
  const {
    data: tasks,
    isLoading,
    error,
    refetch,
  } = useGetTasksQuery({ projectId: Number(id) });

  const [updateTaskStatus] = useUpdateTaskStatusMutation();

  const moveTask = async (taskId: number, toStatus: string) => {
  
    if (userRole !== 'admin') return;
    
    try {
      await updateTaskStatus({ taskId, status: toStatus }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  if (isLoading) return <BoardSkeleton />;
  if (error) return (
    <Alert variant="destructive" className="m-4">
      <AlertDescription>Error loading tasks</AlertDescription>
    </Alert>
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
        {taskStatus.map((status) => (
          <TaskColumn
            key={status}
            status={status}
            tasks={tasks || []}
            moveTask={moveTask}
            setIsModalNewTaskOpen={setIsModalNewTaskOpen}
            userRole={userRole}
          />
        ))}
      </div>
    </DndProvider>
  );
};

type TaskColumnProps = {
  status: string;
  tasks: TaskType[];
  moveTask: (taskId: number, toStatus: string) => void;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  userRole?: string; 
};

const TaskColumn = ({
  status,
  tasks,
  moveTask,
  setIsModalNewTaskOpen,
  userRole,
}: TaskColumnProps) => {
  
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item: { id: number }) => {
      if (userRole === 'admin') {
        moveTask(item.id, status);
      }
    },
    canDrop: () => userRole === 'admin', 
    collect: (monitor: any) => ({
      isOver: userRole === 'admin' ? !!monitor.isOver() : false,
    }),
  }));

  const tasksCount = tasks.filter((task) => task.status === status).length;

  const statusColor: Record<string, string> = {
    "To Do": "#2563EB",
    "Work In Progress": "#059669",
    "Under Review": "#D97706",
    Completed: "#000000",
  };

  return (
    <div
      ref={drop}
      className={`rounded-lg border p-2 transition-colors ${
        isOver ? "bg-accent/50 border-primary" : "border-border"
      } ${userRole !== 'admin' ? 'cursor-not-allowed' : ''}`}
    >
      <Card className="mb-3">
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div 
              className="h-3 w-3 rounded-full" 
              style={{ backgroundColor: statusColor[status] }}
            />
            <CardTitle className="text-lg font-semibold">{status}</CardTitle>
            <Badge variant="secondary" className="ml-2">
              {tasksCount}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
           
            {userRole === 'admin' && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsModalNewTaskOpen(true)}
                title="Add new task"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {tasks
          .filter((task) => task.status === status)
          .map((task) => (
            <Task key={task.id} task={task} userRole={userRole} /> 
          ))}
        
        {tasksCount === 0 && userRole === 'admin' && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <div className="text-muted-foreground">
                No tasks in {status}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setIsModalNewTaskOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

type TaskProps = {
  task: TaskType;
  userRole?: string; 
};

const Task = ({ task, userRole }: TaskProps) => {
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task.id },
    canDrag: () => userRole === 'admin', 
    collect: (monitor: any) => ({
      isDragging: userRole === 'admin' ? !!monitor.isDragging() : false,
    }),
  }));

  const taskTagsSplit = task.tags ? task.tags.split(",") : [];

  const formattedStartDate = task.startDate
    ? format(new Date(task.startDate), "P")
    : "";
  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), "P")
    : "";

  const numberOfComments = task.comments?.length || 0;

  const getPriorityVariant = (priority: TaskType["priority"]) => {
    switch (priority) {
      case "Urgent": return "destructive";
      case "High": return "default";
      case "Medium": return "secondary";
      case "Low": return "outline";
      default: return "outline";
    }
  };

  return (
    <Card
      ref={drag}
      className={`transition-all hover:shadow-md ${
        isDragging ? "opacity-50 cursor-grabbing" : "opacity-100"
      } ${userRole === 'admin' ? 'cursor-grab' : 'cursor-default'}`}
    >
      {/* Task Attachment */}
      {task.attachments && task.attachments.length > 0 && task.attachments[0]?.fileUrl && (
        <div className="relative h-40 w-full">
          <Image
            src={`/${task.attachments[0].fileUrl}`}
            alt={task.attachments[0]?.fileName || 'Task attachment'}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="rounded-t-lg object-cover"
          />
        </div>
      )}

      <CardContent className="p-4">
        {/* Priority & Tags */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {task.priority && (
              <Badge variant={getPriorityVariant(task.priority)}>
                {task.priority}
              </Badge>
            )}
            <div className="flex gap-1">
              {taskTagsSplit.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          </div>
          
          {userRole === 'admin' && (
            <Button variant="ghost" size="icon" title="Task options">
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Title & Points */}
        <div className="mb-3 flex justify-between items-start">
          <h4 className="font-semibold leading-tight flex-1 mr-2">{task.title}</h4>
          {typeof task.points === "number" && (
            <Badge variant="secondary" className="flex-shrink-0">
              {task.points} pts
            </Badge>
          )}
        </div>

        {/* Dates */}
        <div className="text-xs text-muted-foreground mb-3">
          {formattedStartDate && <span>{formattedStartDate} - </span>}
          {formattedDueDate && <span>{formattedDueDate}</span>}
          {!formattedStartDate && !formattedDueDate && "No dates set"}
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {task.description}
          </p>
        )}

        <div className="border-t border-border pt-3" />

        {/* Assignee & Comments */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex -space-x-2">
            {task.assignee?.profilePictureUrl && (
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarImage src={`/${task.assignee.profilePictureUrl}`} />
                <AvatarFallback>
                  {task.assignee.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            {task.author?.profilePictureUrl && (
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarImage src={`/${task.author.profilePictureUrl}`} />
                <AvatarFallback>
                  {task.author.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          <div className="flex items-center text-muted-foreground">
            <MessageSquareMore className="h-4 w-4 mr-1" />
            <span className="text-sm">
              {numberOfComments}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Skeleton Loader
const BoardSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
    {taskStatus.map((status, index) => (
      <div key={status} className="space-y-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-8 rounded-full" />
            </div>
            <div className="flex gap-1">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </CardHeader>
        </Card>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </div>
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex justify-between">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-8" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    ))}
  </div>
);

export default BoardView;