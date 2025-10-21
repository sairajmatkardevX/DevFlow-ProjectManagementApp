
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Project {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  tasks?: Task[];
  projectTeams?: any[];
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
  userId: number;
  username: string;
  email?: string;
  password?: string;
  role?: string;
  profilePictureUrl?: string;
  teamId?: number;
  cognitoId?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  lastLogin?: string;
  team?: Team;
  authoredTasks?: Task[];
  assignedTasks?: Task[];
}

export interface Attachment {
  id: number;
  fileUrl: string;
  fileName: string;
  taskId: number;
  uploadedById: number;
  uploadedBy?: User;
  task?: Task;
}

export interface Comment {
  id: number;
  text: string;
  taskId: number;
  userId: number;
  user?: User;
  task?: Task;
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
  projectId: number;
  authorUserId: number;
  assignedUserId?: number;
  author?: User;
  assignee?: User;
  comments?: Comment[];
  attachments?: Attachment[];
  project?: Project;
  taskAssignments?: any[];
}

export interface SearchResults {
  tasks?: Task[];
  projects?: Project[];
  users?: User[];
  query?: string;
  totals?: {
    tasks: number;
    projects: number;
    users: number;
  };
}

//
export interface Team {
  id: number;
  teamName: string;
  productOwnerUserId?: number;
 
  users?: User[];
  projectTeams?: any[];
  productOwner?: User;
 
  _count?: {
    members: number;
    projects: number;
  };
 
  productOwnerUsername?: string;
  members?: User[];
  projects?: Project[];
}

export interface ProjectTeam {
  id: number;
  teamId: number;
  projectId: number;
  team?: Team;
  project?: Project;
}

export interface TaskAssignment {
  id: number;
  userId: number;
  taskId: number;
  user?: User;
  task?: Task;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL + '/api',
  }),
  reducerPath: "api",
  tagTypes: ["Projects", "Tasks", "Users", "Teams", "Search"],
  endpoints: (build) => ({
    // PROJECT ENDPOINTS
    getProjects: build.query<Project[], void>({
      query: () => "projects",
      providesTags: (result) =>
        result 
          ? [
              ...result.map(({ id }) => ({ type: "Projects" as const, id })),
              { type: "Projects", id: 'LIST' }
            ]
          : [{ type: "Projects", id: 'LIST' }],
    }),
    
    getProjectById: build.query<Project, number>({
      query: (id) => `projects/${id}`,
      providesTags: (result, error, id) => [
        { type: "Projects", id },
        { type: "Projects", id: 'LIST' }
      ],
    }),
    
    createProject: build.mutation<Project, Partial<Project>>({
      query: (project) => ({
        url: "projects",
        method: "POST",
        body: project,
      }),
      invalidatesTags: [
        { type: "Projects", id: 'LIST' },
        "Tasks"
      ],
    }),
    
    updateProject: build.mutation<Project, { id: number; data: Partial<Project> }>({
      query: ({ id, data }) => ({
        url: `projects/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Projects", id },
        { type: "Projects", id: 'LIST' },
        "Tasks"
      ],
    }),
    
    deleteProject: build.mutation<void, number>({
      query: (id) => ({
        url: `projects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Projects", id },
        { type: "Projects", id: 'LIST' },
        "Tasks"
      ],
    }),

    // TASK ENDPOINTS
    getTasks: build.query<Task[], { projectId?: number }>({
      query: ({ projectId }) => 
        projectId ? `tasks?projectId=${projectId}` : 'tasks',
      providesTags: (result, error, { projectId }) => {
        const tags: any[] = [{ type: "Tasks", id: 'ALL' }];
        
        if (result) {
          tags.push(...result.map(({ id }) => ({ type: "Tasks" as const, id })));
        }
        
        if (projectId) {
          tags.push({ type: "Tasks", id: `PROJECT-${projectId}` });
        }
        
        return tags;
      },
    }),
    
    getTaskById: build.query<Task, number>({
      query: (id) => `tasks/${id}`,
      providesTags: (result, error, id) => [
        { type: "Tasks", id },
        { type: "Tasks", id: 'ALL' }
      ],
    }),
    
    getTasksByUser: build.query<Task[], number>({
      query: (userId) => `tasks/user/${userId}`,
      providesTags: (result, error, userId) => {
        const tags: any[] = [
          { type: "Tasks", id: 'ALL' },
          { type: "Tasks", id: `USER-${userId}` }
        ];
        
        if (result) {
          tags.push(...result.map(({ id }) => ({ type: "Tasks" as const, id })));
        }
        
        return tags;
      },
    }),
    
    createTask: build.mutation<Task, Partial<Task>>({
      query: (task) => ({
        url: "tasks",
        method: "POST",
        body: task,
      }),
      invalidatesTags: [
        { type: "Tasks", id: 'ALL' },
        { type: "Projects", id: 'LIST' },
        "Tasks"
      ],
    }),
    
    updateTask: build.mutation<Task, { id: number; data: Partial<Task> }>({
      query: ({ id, data }) => ({
        url: `tasks/${id}`,
        method: "PUT", 
        body: data,
      }),
      invalidatesTags: (result, error, { id, data }) => {
        const tags: any[] = [
          { type: "Tasks", id },
          { type: "Tasks", id: 'ALL' },
        ];
        
        if (data.assignedUserId !== undefined) {
          tags.push({ type: "Tasks", id: 'USER' });
        }
        
        if (data.projectId !== undefined) {
          tags.push({ type: "Tasks", id: `PROJECT-${data.projectId}` });
        }
        
        tags.push({ type: "Tasks", id: 'USER' });
        
        return tags;
      },
    }),
    
    updateTaskStatus: build.mutation<Task, { taskId: number; status: string }>({
      query: ({ taskId, status }) => ({
        url: `tasks/${taskId}/status`,
        method: "PATCH", 
        body: { status },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Tasks", id: taskId },
        { type: "Tasks", id: 'ALL' },
        { type: "Tasks", id: 'USER' },
      ],
    }),
    
    deleteTask: build.mutation<void, number>({
      query: (id) => ({
        url: `tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Tasks", id: 'ALL' },
        { type: "Projects", id: 'LIST' },
        { type: "Tasks", id: 'USER' },
        "Tasks"
      ],
    }),

    // USER CRUD ENDPOINTS
    getUsers: build.query<User[], void>({
      query: () => "users",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ userId }) => ({ type: "Users" as const, id: userId })),
              { type: "Users", id: 'LIST' }
            ]
          : [{ type: "Users", id: 'LIST' }],
    }),
    
    getUserById: build.query<User, number>({
      query: (id) => `users/${id}`,
      providesTags: (result, error, id) => [
        { type: "Users", id },
        { type: "Users", id: 'LIST' }
      ],
    }),
    
    createUser: build.mutation<User, Partial<User>>({
      query: (user) => ({
        url: "users",
        method: "POST",
        body: user,
      }),
      invalidatesTags: [{ type: "Users", id: 'LIST' }],
    }),
    
    updateUser: build.mutation<User, { id: number; data: Partial<User> }>({
      query: ({ id, data }) => ({
        url: `users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: 'LIST' }
      ],
    }),
    
    deleteUser: build.mutation<void, number>({
      query: (id) => ({
        url: `users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Users", id },
        { type: "Users", id: 'LIST' }
      ],
    }),

    // TEAM CRUD ENDPOINTS 
    getTeams: build.query<Team[], void>({
      query: () => "teams",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Teams" as const, id })),
              { type: "Teams", id: 'LIST' }
            ]
          : [{ type: "Teams", id: 'LIST' }],
    }),
    
    getTeamById: build.query<Team, number>({
      query: (id) => `teams/${id}`,
      providesTags: (result, error, id) => [
        { type: "Teams", id },
        { type: "Teams", id: 'LIST' }
      ],
    }),
    
    createTeam: build.mutation<Team, Partial<Team>>({
      query: (team) => ({
        url: "teams",
        method: "POST",
        body: {
          teamName: team.teamName,
          productOwnerUserId: team.productOwnerUserId,
          
        },
      }),
      invalidatesTags: [{ type: "Teams", id: 'LIST' }],
    }),
    
    updateTeam: build.mutation<Team, { id: number; data: Partial<Team> }>({
      query: ({ id, data }) => ({
        url: `teams/${id}`,
        method: "PUT",
        body: {
          teamName: data.teamName,
          productOwnerUserId: data.productOwnerUserId,
         
        },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Teams", id },
        { type: "Teams", id: 'LIST' }
      ],
    }),
    
    deleteTeam: build.mutation<void, number>({
      query: (id) => ({
        url: `teams/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Teams", id },
        { type: "Teams", id: 'LIST' }
      ],
    }),

    // TEAM MEMBERS MANAGEMENT ENDPOINTS -
    getTeamMembers: build.query<User[], number>({
      query: (teamId) => `teams/${teamId}/members`,
      providesTags: (result, error, teamId) => [
        { type: "Teams", id: teamId },
        { type: "Users", id: 'LIST' }
      ],
    }),
    
    addTeamMember: build.mutation<User, { teamId: number; userId: number }>({
      query: ({ teamId, userId }) => ({
        url: `teams/${teamId}/members`,
        method: "POST",
        body: { userId },
      }),
      invalidatesTags: (result, error, { teamId }) => [
        { type: "Teams", id: teamId },
        { type: "Teams", id: 'LIST' },
        { type: "Users", id: 'LIST' }
      ],
    }),
    
    removeTeamMember: build.mutation<void, { teamId: number; userId: number }>({
      query: ({ teamId, userId }) => ({
        url: `teams/${teamId}/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { teamId }) => [
        { type: "Teams", id: teamId },
        { type: "Teams", id: 'LIST' },
        { type: "Users", id: 'LIST' }
      ],
    }),

    // SEARCH ENDPOINT
    search: build.query<SearchResults, string>({
      query: (query) => `search?query=${encodeURIComponent(query)}`,
      providesTags: [{ type: "Search", id: 'LIST' }],
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
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  
  // Team hooks
  useGetTeamsQuery,
  useGetTeamByIdQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  
  // Team Members hooks 
  useGetTeamMembersQuery,
  useAddTeamMemberMutation,
  useRemoveTeamMemberMutation,
  
  // Search hook
  useSearchQuery,
} = api;