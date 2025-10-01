import { useGetTasksQuery, useUpdateTaskStatusMutation } from "@/state/api";
import React from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Task as TaskType } from "@/state/api";
import { EllipsisVertical, MessageSquareMore, Plus } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

type BoardProps = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  refreshTrigger?: number;
};

const taskStatus = ["To Do", "Work In Progress", "Under Review", "Completed"];

const BoardView = ({ id, setIsModalNewTaskOpen, refreshTrigger }: BoardProps) => {
  const {
    data: tasks,
    isLoading,
    error,
    refetch,
  } = useGetTasksQuery({ projectId: Number(id) });

  const [updateTaskStatus] = useUpdateTaskStatusMutation();

  const moveTask = async (taskId: number, toStatus: string) => {
    try {
      await updateTaskStatus({ taskId, status: toStatus }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  if (isLoading) return <div className="flex justify-center p-8">Loading tasks...</div>;
  if (error) return <div className="flex justify-center p-8 text-red-500">Error loading tasks</div>;

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
};

const TaskColumn = ({
  status,
  tasks,
  moveTask,
  setIsModalNewTaskOpen,
}: TaskColumnProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item: { id: number }) => moveTask(item.id, status),
    collect: (monitor: any) => ({
      isOver: !!monitor.isOver(),
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
      className={`sl:py-4 rounded-lg py-2 xl:px-2 ${isOver ? "bg-blue-100 dark:bg-neutral-950" : ""}`}
    >
      <div className="mb-3 flex w-full">
        <div
          className="w-2 rounded-s-lg"
          style={{ backgroundColor: statusColor[status] }}
        />
        <div className="flex w-full items-center justify-between rounded-e-lg bg-white px-5 py-4 dark:bg-dark-secondary">
          <h3 className="flex items-center text-lg font-semibold dark:text-white">
            {status}{" "}
            <span className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-sm dark:bg-dark-tertiary">
              {tasksCount}
            </span>
          </h3>
          <div className="flex items-center gap-1">
            <button 
              className="flex h-6 w-5 items-center justify-center dark:text-neutral-500"
              title="More options"
            >
              <EllipsisVertical size={26} />
            </button>
            <button
              className="flex h-6 w-6 items-center justify-center rounded bg-gray-200 dark:bg-dark-tertiary dark:text-white"
              onClick={() => setIsModalNewTaskOpen(true)}
              title="Add new task"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {tasks
        .filter((task) => task.status === status)
        .map((task) => (
          <Task key={task.id} task={task} />
        ))}
        
      {tasksCount === 0 && (
        <div className="rounded-md border-2 border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-600">
          No tasks in {status}
        </div>
      )}
    </div>
  );
};

type TaskProps = {
  task: TaskType;
};

const Task = ({ task }: TaskProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task.id },
    collect: (monitor: any) => ({
      isDragging: !!monitor.isDragging(),
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

  const PriorityTag = ({ priority }: { priority: TaskType["priority"] }) => (
    <div
      className={`rounded-full px-2 py-1 text-xs font-semibold ${
        priority === "Urgent"
          ? "bg-red-200 text-red-700"
          : priority === "High"
            ? "bg-yellow-200 text-yellow-700"
            : priority === "Medium"
              ? "bg-green-200 text-green-700"
              : priority === "Low"
                ? "bg-blue-200 text-blue-700"
                : "bg-gray-200 text-gray-700"
      }`}
    >
      {priority}
    </div>
  );

  return (
    <div
      ref={drag}
      className={`mb-4 cursor-grab rounded-md bg-white shadow transition-all hover:shadow-md dark:bg-dark-secondary ${
        isDragging ? "opacity-50 cursor-grabbing" : "opacity-100"
      }`}
    >
      {/* Task Attachment */}
      {task.attachments && task.attachments.length > 0 && task.attachments[0]?.fileUrl && (
        <div className="relative h-40 w-full">
          <Image
            src={`/${task.attachments[0].fileUrl}`}
            alt={task.attachments[0]?.fileName || 'Task attachment'}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="rounded-t-md object-cover"
          />
        </div>
      )}

      <div className="p-4 md:p-6">
        {/* Priority & Tags */}
        <div className="flex items-start justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {task.priority && <PriorityTag priority={task.priority} />}
            <div className="flex gap-2">
              {taskTagsSplit.map((tag) => (
                <div
                  key={tag}
                  className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                >
                  {tag.trim()}
                </div>
              ))}
            </div>
          </div>
          <button 
            className="flex h-6 w-4 flex-shrink-0 items-center justify-center dark:text-neutral-500 hover:bg-gray-100 dark:hover:bg-dark-tertiary rounded"
            title="Task options"
          >
            <EllipsisVertical size={26} />
          </button>
        </div>

        {/* Title & Points */}
        <div className="my-3 flex justify-between">
          <h4 className="text-md font-bold dark:text-white">{task.title}</h4>
          {typeof task.points === "number" && (
            <div className="text-xs font-semibold dark:text-white bg-gray-100 dark:bg-dark-tertiary px-2 py-1 rounded">
              {task.points} pts
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="text-xs text-gray-500 dark:text-neutral-500 mb-2">
          {formattedStartDate && <span>{formattedStartDate} - </span>}
          {formattedDueDate && <span>{formattedDueDate}</span>}
          {!formattedStartDate && !formattedDueDate && "No dates set"}
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-gray-600 dark:text-neutral-400 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="mt-4 border-t border-gray-200 dark:border-stroke-dark" />

        {/* Assignee & Comments */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex -space-x-2">
            {task.assignee?.profilePictureUrl && (
              <div className="relative h-8 w-8">
                <Image
                  src={`/${task.assignee.profilePictureUrl}`}
                  alt={task.assignee.username || 'Assignee'}
                  fill
                  sizes="32px"
                  className="rounded-full border-2 border-white object-cover dark:border-dark-secondary"
                  title={task.assignee.username}
                />
              </div>
            )}
            {task.author?.profilePictureUrl && (
              <div className="relative h-8 w-8">
                <Image
                  src={`/${task.author.profilePictureUrl}`}
                  alt={task.author.username || 'Author'}
                  fill
                  sizes="32px"
                  className="rounded-full border-2 border-white object-cover dark:border-dark-secondary"
                  title={task.author.username}
                />
              </div>
            )}
          </div>
          <div className="flex items-center text-gray-500 dark:text-neutral-500">
            <MessageSquareMore size={20} />
            <span className="ml-1 text-sm dark:text-neutral-400">
              {numberOfComments}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardView;