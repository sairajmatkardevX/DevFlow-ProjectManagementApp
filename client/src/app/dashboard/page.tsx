"use client";

import {
  Priority,
  Project,
  Task,
  useGetProjectsQuery,
  useGetTasksQuery,
} from "@/state/api";
import React, { useMemo } from "react";
import { useSession } from "next-auth/react"; 
import Header from "@/components/Header";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, AlertTriangle, CheckCircle, Clock, TrendingUp, Users, FolderOpen, Target } from "lucide-react";
import { useTheme } from "next-themes";

const Dashboard = () => {
  const { data: session, status: sessionStatus } = useSession(); 
  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
    error: tasksErrorData
  } = useGetTasksQuery({ projectId: parseInt("1") });
  
  const { 
    data: projects, 
    isLoading: isProjectsLoading,
    isError: isProjectsError,
    error: projectsErrorData
  } = useGetProjectsQuery();
  
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Debug logging
  React.useEffect(() => {
    if (sessionStatus === 'authenticated') {
      console.log('🔐 Session:', {
        email: session?.user?.email,
        role: session?.user?.role,
        id: session?.user?.id,
        name: session?.user?.name
      });
    }
  }, [session, sessionStatus]);

  React.useEffect(() => {
    if (tasks) {
      console.log('📝 Tasks loaded:', {
        count: tasks.length,
        sample: tasks[0]
      });
    }
    if (projects) {
      console.log('📁 Projects loaded:', {
        count: projects.length,
        sample: projects[0]
      });
    }
  }, [tasks, projects]);

  // Loading state
  if (sessionStatus === 'loading' || tasksLoading || isProjectsLoading) {
    return <DashboardSkeleton />;
  }

  // Error states with detailed messages
  if (tasksError) {
    console.error('Tasks Error:', tasksErrorData);
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
          <h3 className="font-semibold text-destructive mb-2">Error Loading Tasks</h3>
          <p className="text-sm">{JSON.stringify(tasksErrorData)}</p>
        </div>
      </div>
    );
  }

  if (isProjectsError) {
    console.error('Projects Error:', projectsErrorData);
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
          <h3 className="font-semibold text-destructive mb-2">Error Loading Projects</h3>
          <p className="text-sm">{JSON.stringify(projectsErrorData)}</p>
        </div>
      </div>
    );
  }

  // Ensure we have data
  if (!tasks || !projects) {
    return (
      <div className="p-6">
        <div className="bg-muted rounded-lg p-4">
          <p>No data available. Please check your API endpoints.</p>
        </div>
      </div>
    );
  }

  const isAdmin = session?.user?.role?.toLowerCase() === 'admin';
  const currentUserId = session?.user?.id;

  console.log('👤 User Info:', { isAdmin, currentUserId });

  // Filter data based on user role - with improved logic
  const userTasks = useMemo(() => {
    if (isAdmin) {
      console.log('✅ Admin user - showing all tasks');
      return tasks;
    }
    
    // For regular users, show tasks assigned to them
    const filtered = tasks.filter(task => {
      // Check multiple possible ID formats
      const assigneeId = task.assignedUserId || task.assignee?.userId || task.assignee?.id;
      const matches = assigneeId === currentUserId || 
                     assigneeId === Number(currentUserId) || 
                     String(assigneeId) === String(currentUserId);
      return matches;
    });
    
    console.log('🔍 Filtered tasks:', { 
      total: tasks.length, 
      filtered: filtered.length,
      currentUserId 
    });
    
    return filtered;
  }, [tasks, isAdmin, currentUserId]);

  const userProjects = useMemo(() => {
    if (isAdmin) {
      console.log('✅ Admin user - showing all projects');
      return projects;
    }
    
    // For regular users, show projects they're part of
    const filtered = projects.filter(project => {
      // Check if user is in team members
      const isTeamMember = project.teamMembers?.some(member => 
        member.id === currentUserId || 
        member.userId === currentUserId ||
        String(member.id) === String(currentUserId)
      );
      return isTeamMember;
    });
    
    console.log('🔍 Filtered projects:', { 
      total: projects.length, 
      filtered: filtered.length,
      currentUserId 
    });
    
    return filtered;
  }, [projects, isAdmin, currentUserId]);

  // Priority count for tasks
  const priorityCount = userTasks.reduce(
    (acc: Record<string, number>, task: Task) => {
      const { priority } = task;
      acc[priority as Priority] = (acc[priority as Priority] || 0) + 1;
      return acc;
    },
    {},
  );

  const taskDistribution = Object.keys(priorityCount).map((key) => ({
    name: key,
    count: priorityCount[key],
  }));

  // Project status count
  const statusCount = userProjects.reduce(
    (acc: Record<string, number>, project: Project) => {
      const status = project.endDate ? "Completed" : "Active";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {},
  );

  const projectStatus = Object.keys(statusCount).map((key) => ({
    name: key,
    count: statusCount[key],
  }));

  // Task status count
  const taskStatusCount = userTasks.reduce(
    (acc: Record<string, number>, task: Task) => {
      const status = task.status?.toLowerCase() || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {},
  );

  // Helper functions
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in progress': 
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'todo': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Target className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Calculate completion rate
  const completionRate = userTasks.length > 0 
    ? Math.round(((taskStatusCount['completed'] || 0) / userTasks.length) * 100)
    : 0;

  // Stats data
  const stats = [
    {
      title: isAdmin ? "Total Projects" : "My Projects",
      value: userProjects.length.toString(),
      icon: <FolderOpen className="h-6 w-6 text-primary" />,
      description: isAdmin 
        ? `${statusCount['Active'] || 0} active, ${statusCount['Completed'] || 0} completed`
        : `${statusCount['Active'] || 0} active projects`,
      trend: "+12%",
    },
    {
      title: isAdmin ? "Total Tasks" : "My Tasks",
      value: userTasks.length.toString(),
      icon: <Target className="h-6 w-6 text-primary" />,
      description: `${taskStatusCount['completed'] || 0} completed`,
      trend: "+8%",
    },
    {
      title: isAdmin ? "Team Members" : "My Team",
      value: isAdmin ? "24" : "8",
      icon: <Users className="h-6 w-6 text-primary" />,
      description: isAdmin ? "Across all projects" : "In my projects",
      trend: "+5%",
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      icon: <TrendingUp className="h-6 w-6 text-primary" />,
      description: isAdmin ? "Project success rate" : "My task completion",
      trend: "+3%",
    },
  ];

  const getChartColor = (index: number) => {
    const colors = [
      'hsl(var(--primary))',
      'hsl(var(--secondary))',
      'hsl(var(--destructive))',
      'hsl(var(--accent))',
      'hsl(var(--muted-foreground))'
    ];
    return colors[index % colors.length];
  };

  const tooltipStyle = {
    backgroundColor: isDarkMode ? 'hsl(222.2 84% 4.9%)' : 'hsl(0 0% 100%)',
    borderColor: isDarkMode ? 'hsl(217.2 32.6% 17.5%)' : 'hsl(214.3 31.8% 91.4%)',
    borderRadius: '8px',
    color: isDarkMode ? 'hsl(210 40% 98%)' : 'hsl(222.2 84% 4.9%)',
  };

  // Show message if no data after filtering
  if (userTasks.length === 0 && userProjects.length === 0) {
    return (
      <div className="h-full flex flex-col space-y-6">
        <Header name="Project Management Dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-6xl">📊</div>
            <h3 className="text-xl font-semibold">No Data Available</h3>
            <p className="text-muted-foreground max-w-md">
              {isAdmin 
                ? "No projects or tasks found in the system."
                : "You haven't been assigned to any projects or tasks yet."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <Header name="Project Management Dashboard" />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden border-l-4 border-l-primary hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className="p-2 bg-muted rounded-lg">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-500">{stat.trend}</span>
                <span className="text-xs text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      {taskDistribution.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 flex-1 min-h-0">
          {/* Task Priority Distribution */}
          <Card className="border shadow-sm">
            <CardHeader className="bg-muted/50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                {isAdmin ? 'Task Priority Distribution' : 'My Task Priorities'}
              </CardTitle>
              <CardDescription>
                {isAdmin 
                  ? 'Overview of task priorities across projects' 
                  : 'Priority distribution of your tasks'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={taskDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    className="text-sm"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-sm"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Project Status */}
          {projectStatus.length > 0 && (
            <Card className="border shadow-sm">
              <CardHeader className="bg-muted/50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  {isAdmin ? 'Project Status' : 'My Projects Status'}
                </CardTitle>
                <CardDescription>
                  {isAdmin 
                    ? 'Current status of all projects' 
                    : 'Status of projects you are involved in'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie 
                      dataKey="count" 
                      data={projectStatus} 
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {projectStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getChartColor(index)} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tasks Table */}
      {userTasks.length > 0 && (
        <Card className="border shadow-sm">
          <CardHeader className="bg-muted/50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {isAdmin ? 'All Tasks' : 'My Tasks'}
            </CardTitle>
            <CardDescription>
              {isAdmin 
                ? 'Recent tasks across all projects' 
                : 'Recent tasks assigned to you'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold">Title</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Priority</TableHead>
                  <TableHead className="font-semibold">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Due Date
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold">Project</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userTasks.slice(0, 8).map((task: Task) => (
                  <TableRow key={task.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        {task.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`
                          ${task.status?.toLowerCase() === 'completed' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300' : ''}
                          ${task.status?.toLowerCase() === 'in progress' || task.status?.toLowerCase() === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300' : ''}
                          ${task.status?.toLowerCase() === 'todo' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300' : ''}
                        `}
                      >
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityColor(task.priority)} className="font-medium">
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        Project {task.projectId}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const DashboardSkeleton = () => (
  <div className="h-full w-full p-6 space-y-6">
    <Skeleton className="h-8 w-80" />
    
    {/* Stats Skeleton */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-40 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Charts Skeleton */}
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {[...Array(2)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Table Skeleton */}
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default Dashboard;