import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Project {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export enum Priority {
  Urgent = "Urgent",
  High = "High",
  Medium = "Medium",
  Low = "Low",
  Backlog = "Backlog"
}

export enum Status {
  ToDo = "To Do",
  WorkInProgress = "Work In Progress",
  UnderReview = "Under Review",
  Completed = "Completed",
}

export interface User {
  userId?: number;
  username?: string;
  email?: string;
  profilePictureUrl?: string;
  congnitoId?: string;
  teamId?: number;
}

export interface Attachment {
  id: number;
  fileUrl: string;
  fileName: string;
  taskId: number;
  uploadedById: number;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  tags?: string;
  startDate?: string;
  dueDate?: string;
  points?: number;
  projectId?: number;
  authorUserId?: number;
  assignedUserId?: number;

  author?: User;
  assignee?: User;
  comments?: Comment[];
  attachments: Attachment[];
}

export interface SearchResults {
  tasks?: Task[];
  projects?: Project[];
  users?: User[];
}

export interface Team {
  teamId: number;
  teamName: string;
  productOwnerUserId?: number;
  projectManagerUserId?: number;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL!,
  }),
  reducerPath: "api",
  tagTypes: ["Projects", "Tasks", "Users", "Teams"],
  endpoints: (build) => ({
    // PROJECT ENDPOINTS
    getProjects: build.query<Project[], void>({
      query: () => "projects",
      providesTags: ["Projects"],
    }),
    getProjectById: build.query<Project, number>({
      query: (id) => `projects/${id}`,
      providesTags: (result, error, id) => [{ type: "Projects", id }],
    }),
    createProject: build.mutation<Project, Partial<Project>>({
      query: (project) => ({
        url: "projects",
        method: "POST",
        body: project,
      }),
      invalidatesTags: ["Projects"],
    }),
    updateProject: build.mutation<Project, { id: number; data: Partial<Project> }>({
      query: ({ id, data }) => ({
        url: `projects/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Projects", id },
        { type: "Projects" }
      ],
    }),
    deleteProject: build.mutation<void, number>({
      query: (id) => ({
        url: `projects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Projects"],
    }),

    // TASK ENDPOINTS
    getTasks: build.query<Task[], { projectId: number }>({
      query: ({ projectId }) => `tasks?projectId=${projectId}`,
      providesTags: (result) =>
        result
          ? result.map(({ id }) => ({ type: "Tasks" as const, id }))
          : [{ type: "Tasks" as const }],
    }),
    getTaskById: build.query<Task, number>({
      query: (id) => `tasks/${id}`,
      providesTags: (result, error, id) => [{ type: "Tasks", id }],
    }),
    getTasksByUser: build.query<Task[], number>({
      query: (userId) => `tasks/user/${userId}`,
      providesTags: (result, error, userId) =>
        result
          ? result.map(({ id }) => ({ type: "Tasks", id }))
          : [{ type: "Tasks", id: userId }],
    }),
    createTask: build.mutation<Task, Partial<Task>>({
      query: (task) => ({
        url: "tasks",
        method: "POST",
        body: task,
      }),
      invalidatesTags: ["Tasks"],
    }),
    updateTask: build.mutation<Task, { id: number; data: Partial<Task> }>({
      query: ({ id, data }) => ({
        url: `tasks/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Tasks", id },
        { type: "Tasks" }
      ],
    }),
    updateTaskStatus: build.mutation<Task, { taskId: number; status: string }>({
      query: ({ taskId, status }) => ({
        url: `tasks/${taskId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Tasks", id: taskId },
      ],
    }),
    deleteTask: build.mutation<void, number>({
      query: (id) => ({
        url: `tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tasks"],
    }),

    // USER ENDPOINTS
    getUsers: build.query<User[], void>({
      query: () => "users",
      providesTags: ["Users"],
    }),
    getUserById: build.query<User, number>({
      query: (id) => `users/${id}`,
      providesTags: (result, error, id) => [{ type: "Users", id }],
    }),

    // TEAM ENDPOINTS
    getTeams: build.query<Team[], void>({
      query: () => "teams",
      providesTags: ["Teams"],
    }),
    getTeamById: build.query<Team, number>({
      query: (id) => `teams/${id}`,
      providesTags: (result, error, id) => [{ type: "Teams", id }],
    }),

    // SEARCH ENDPOINT
    search: build.query<SearchResults, string>({
      query: (query) => `search?query=${query}`,
    }),
  }),
});

export const {
  // Project hooks
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  
  // Task hooks
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useGetTasksByUserQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
  
  // User hooks
  useGetUsersQuery,
  useGetUserByIdQuery,
  
  // Team hooks
  useGetTeamsQuery,
  useGetTeamByIdQuery,
  
  // Search hook
  useSearchQuery,
} = api;