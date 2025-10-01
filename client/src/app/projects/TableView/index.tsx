import { useAppSelector } from "@/app/store";
import Header from "@/components/Header";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { useGetTasksQuery } from "@/state/api";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React from "react";
import { Plus } from "lucide-react";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  refreshTrigger?: number;
};

const TableView = ({ id, setIsModalNewTaskOpen, refreshTrigger }: Props) => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const {
    data: tasks,
    error,
    isLoading,
    refetch,
  } = useGetTasksQuery({ projectId: Number(id) });

  // Format data for DataGrid
  const rows = tasks?.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description || "No description",
    status: task.status || "To Do",
    priority: task.priority || "Medium",
    tags: task.tags || "No tags",
    startDate: task.startDate ? new Date(task.startDate).toLocaleDateString() : "Not set",
    dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set",
    author: task.author?.username || "Unknown",
    assignee: task.assignee?.username || "Unassigned",
    points: task.points || 0,
  })) || [];

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Title",
      width: 150,
      flex: 1,
    },
    {
      field: "description",
      headerName: "Description",
      width: 200,
      flex: 2,
      renderCell: (params) => (
        <div className="max-w-full truncate" title={params.value}>
          {params.value}
        </div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => {
        const statusColors: Record<string, string> = {
          "To Do": "bg-blue-100 text-blue-800",
          "Work In Progress": "bg-yellow-100 text-yellow-800",
          "Under Review": "bg-orange-100 text-orange-800",
          "Completed": "bg-green-100 text-green-800",
        };
        
        const colorClass = statusColors[params.value] || "bg-gray-100 text-gray-800";
        
        return (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${colorClass}`}>
            {params.value}
          </span>
        );
      },
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 100,
      renderCell: (params) => {
        const priorityColors: Record<string, string> = {
          "Urgent": "text-red-600 font-bold",
          "High": "text-orange-600 font-semibold",
          "Medium": "text-yellow-600",
          "Low": "text-green-600",
          "Backlog": "text-gray-500",
        };
        
        const colorClass = priorityColors[params.value] || "text-gray-600";
        
        return (
          <span className={colorClass}>
            {params.value}
          </span>
        );
      },
    },
    {
      field: "points",
      headerName: "Points",
      width: 80,
      renderCell: (params) => (
        <span className="font-mono text-sm">
          {params.value > 0 ? `${params.value} pts` : "-"}
        </span>
      ),
    },
    {
      field: "tags",
      headerName: "Tags",
      width: 120,
      renderCell: (params) => (
        <div className="max-w-full truncate" title={params.value}>
          {params.value}
        </div>
      ),
    },
    {
      field: "startDate",
      headerName: "Start Date",
      width: 110,
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      width: 110,
    },
    {
      field: "author",
      headerName: "Author",
      width: 120,
    },
    {
      field: "assignee",
      headerName: "Assignee",
      width: 120,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64">
        <div className="text-red-500 text-lg mb-4">Error loading tasks</div>
        <button 
          onClick={() => refetch()}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full px-4 pb-8 xl:px-6">
      <div className="pt-5">
        <Header
          name={`Table View ${tasks ? `(${tasks.length} tasks)` : ''}`}
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

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <Plus size={48} />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
            No tasks yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
            Create your first task to see it displayed in this table view.
          </p>
          <button
            className="flex items-center gap-2 rounded bg-blue-primary px-6 py-3 text-white hover:bg-blue-600 transition-colors"
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            <Plus size={18} />
            Create First Task
          </button>
        </div>
      ) : (
        <div className="h-[540px] w-full">
          <DataGrid
            rows={rows}
            columns={columns}
            className={dataGridClassNames}
            sx={dataGridSxStyles(isDarkMode)}
            pageSizeOptions={[5, 10, 25, 50]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            }}
            disableRowSelectionOnClick
          />
        </div>
      )}
    </div>
  );
};

export default TableView;