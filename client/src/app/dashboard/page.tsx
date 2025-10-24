"use client";

import {
  Priority,
  Project,
  Task,
  useGetProjectsQuery,
  useGetTasksQuery,
} from "@/state/api";
import React, { useMemo, useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle,  } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Users, FolderOpen, Target } from "lucide-react";
import { useTheme } from "next-themes";

const Dashboard = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: session, status: sessionStatus } = useSession(); 

  const { data: tasks, isLoading: tasksLoading, isError: tasksError, error: tasksErrorData } = useGetTasksQuery({ projectId: parseInt("1") });
  const { data: projects, isLoading: isProjectsLoading, isError: isProjectsError, error: projectsErrorData } = useGetProjectsQuery();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  if (!mounted || sessionStatus === 'loading' || tasksLoading || isProjectsLoading) {
    return <DashboardSkeleton />;
  }

  if (!tasks || !projects) return <div className="p-6">No data available</div>;

  if (tasksError) return <ErrorMessage title="Tasks Error" error={tasksErrorData} />;
  if (isProjectsError) return <ErrorMessage title="Projects Error" error={projectsErrorData} />;

  const isAdmin = session?.user?.role?.toLowerCase() === 'admin';
  const currentUserId = session?.user?.id;

  const userTasks = useMemo(() => {
    if (!mounted) return [];
    if (isAdmin) return tasks;

    return tasks.filter(task => {
      const assigneeId = task.assignedUserId || task.assignee?.userId || task.assignee?.id;
      return assigneeId === currentUserId || Number(assigneeId) === Number(currentUserId) || String(assigneeId) === String(currentUserId);
    });
  }, [tasks, isAdmin, currentUserId, mounted]);

  const userProjects = useMemo(() => {
    if (!mounted) return [];
    if (isAdmin) return projects;

    return projects.filter(project => project.teamMembers?.some(member => 
      member.id === currentUserId || member.userId === currentUserId || String(member.id) === String(currentUserId)
    ));
  }, [projects, isAdmin, currentUserId, mounted]);

  const priorityCount = userTasks.reduce((acc: Record<string, number>, task: Task) => {
    const { priority } = task;
    acc[priority as Priority] = (acc[priority as Priority] || 0) + 1;
    return acc;
  }, {});

  const taskDistribution = Object.keys(priorityCount).map((key) => ({ name: key, count: priorityCount[key] }));

  const statusCount = userProjects.reduce((acc: Record<string, number>, project: Project) => {
    const status = project.endDate ? "Completed" : "Active";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const projectStatus = Object.keys(statusCount).map((key) => ({ name: key, count: statusCount[key] }));

  const taskStatusCount = userTasks.reduce((acc: Record<string, number>, task: Task) => {
    const status = task.status?.toLowerCase() || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const completionRate = userTasks.length > 0 ? Math.round(((taskStatusCount['completed'] || 0) / userTasks.length) * 100) : 0;

  const stats = [
    { title: isAdmin ? "Total Projects" : "My Projects", value: userProjects.length.toString(), icon: <FolderOpen className="h-6 w-6 text-primary" />, description: isAdmin ? `${statusCount['Active'] || 0} active, ${statusCount['Completed'] || 0} completed` : `${statusCount['Active'] || 0} active projects`, trend: "+12%" },
    { title: isAdmin ? "Total Tasks" : "My Tasks", value: userTasks.length.toString(), icon: <Target className="h-6 w-6 text-primary" />, description: `${taskStatusCount['completed'] || 0} completed`, trend: "+8%" },
    { title: isAdmin ? "Team Members" : "My Team", value: isAdmin ? "24" : "8", icon: <Users className="h-6 w-6 text-primary" />, description: isAdmin ? "Across all projects" : "In my projects", trend: "+5%" },
    { title: "Completion Rate", value: `${completionRate}%`, icon: <TrendingUp className="h-6 w-6 text-primary" />, description: isAdmin ? "Project success rate" : "My task completion", trend: "+3%" },
  ];

  return (
    <div className="h-full flex flex-col space-y-6">
      <Header name="Project Management Dashboard" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden border-l-4 border-l-primary hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className="p-2 bg-muted rounded-lg">{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      {taskDistribution.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 flex-1 min-h-0">
          {/* Task Priority Distribution */}
          <ChartCard title={isAdmin ? 'Task Priority Distribution' : 'My Task Priorities'} icon={<AlertTriangle className="h-5 w-5 text-primary" />} data={taskDistribution} isBarChart />

          {/* Project Status */}
          {projectStatus.length > 0 && <ChartCard title={isAdmin ? 'Project Status' : 'My Projects Status'} icon={<CheckCircle className="h-5 w-5 text-primary" />} data={projectStatus} />}
        </div>
      )}

      {/* Tasks Table */}
      {userTasks.length > 0 && <TasksTable tasks={userTasks} />}
    </div>
  );
};

// --- Helpers ---

const ErrorMessage = ({ title, error }: { title: string; error: any }) => (
  <div className="p-6">
    <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
      <h3 className="font-semibold text-destructive mb-2">{title}</h3>
      <p className="text-sm">{JSON.stringify(error)}</p>
    </div>
  </div>
);

const ChartCard = ({ title, icon, data, isBarChart = false }: any) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const tooltipStyle = {
    backgroundColor: isDarkMode ? 'hsl(222.2 84% 4.9%)' : 'hsl(0 0% 100%)',
    borderColor: isDarkMode ? 'hsl(217.2 32.6% 17.5%)' : 'hsl(214.3 31.8% 91.4%)',
    borderRadius: '8px',
    color: isDarkMode ? 'hsl(210 40% 98%)' : 'hsl(222.2 84% 4.9%)',
  };
  const getChartColor = (index: number) => {
    const colors = ['hsl(var(--primary))','hsl(var(--secondary))','hsl(var(--destructive))','hsl(var(--accent))','hsl(var(--muted-foreground))'];
    return colors[index % colors.length];
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="bg-muted/50 rounded-t-lg">
        <CardTitle className="flex items-center gap-2">{icon} {title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={300}>
          {isBarChart ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
            </BarChart>
          ) : (
            <PieChart>
              <Pie dataKey="count" data={data} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                {data.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={getChartColor(index)} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const TasksTable = ({ tasks }: { tasks: Task[] }) => {
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in progress':
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'todo': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Target className="h-4 w-4 text-muted-foreground" />;
    }
  };
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="bg-muted/50 rounded-t-lg">
        <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> My Tasks</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Project</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.slice(0, 8).map(task => (
              <TableRow key={task.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium flex items-center gap-2">{getStatusIcon(task.status)} {task.title}</TableCell>
                <TableCell><Badge variant="outline">{task.status}</Badge></TableCell>
                <TableCell><Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge></TableCell>
                <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</TableCell>
                <TableCell><Badge variant="outline" className="text-xs">Project {task.projectId}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const DashboardSkeleton = () => (
  <div className="h-full w-full p-6 space-y-6">
    <Skeleton className="h-8 w-80" />
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}><CardHeader><Skeleton className="h-4 w-24" /></CardHeader></Card>
      ))}
    </div>
  </div>
);

export default Dashboard;
