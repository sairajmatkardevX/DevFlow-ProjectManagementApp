"use client";

import Header from "@/components/Header";
import { useGetProjectsQuery } from "@/state/api";
import React, { useMemo, useState, useEffect } from "react";
import { useSession } from "next-auth/react"; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CustomGantt } from "@/components/CustomGantt";

type ViewMode = 'day' | 'week' | 'month';

interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
}

const Timeline = () => {
  const { data: session } = useSession(); // ADD THIS
  const { data: projects, isLoading, isError } = useGetProjectsQuery();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [mounted, setMounted] = useState(false);

  const isAdmin = session?.user?.role === 'admin';

  useEffect(() => {
    setMounted(true);
  }, []);

 
  const filteredProjects = useMemo(() => {
    if (!projects || !mounted) return [];
    
    if (isAdmin) {
     
      return projects;
    } else {
      
      return projects.filter(project => 
        project.teamMembers?.some(member => member.id === session?.user?.id) ||
        project.tasks?.some(task => task.assignee?.id === session?.user?.id)
      );
    }
  }, [projects, mounted, isAdmin, session?.user?.id]);

  const ganttTasks = useMemo((): GanttTask[] => {
    if (!filteredProjects || !mounted) return [];

    return filteredProjects
      .filter(project => project.startDate && project.endDate)
      .map((project) => {
        const start = new Date(project.startDate as string);
        const end = new Date(project.endDate as string);
        
        const validEnd = end > start ? end : new Date(start.getTime() + 24 * 60 * 60 * 1000);
        
        return {
          id: `Project-${project.id}`,
          name: project.name,
          start: start,
          end: validEnd,
          progress: 50,
        };
      });
  }, [filteredProjects, mounted]);

  if (!mounted) {
    return <TimelineSkeleton />;
  }

  if (isLoading) return <TimelineSkeleton />;
  
  if (isError || !projects) {
    return (
      <div className="p-6">
        <Header name="Projects Timeline" />
        <Alert variant="destructive">
          <AlertDescription>
            An error occurred while fetching projects
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (ganttTasks.length === 0) {
    return (
      <div className="p-6">
        <Header 
          name="Projects Timeline" 
          description={isAdmin ? "Visualize all project timelines and schedules" : "View your assigned project timelines"}
        />
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold">
                {isAdmin ? "No projects timeline available" : "No assigned projects timeline available"}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {isAdmin 
                  ? "Add start and end dates to your projects to see them on the timeline."
                  : "You don't have any assigned projects with timelines yet."
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-2">
            <CardTitle className="text-2xl">
              {isAdmin ? "Projects Timeline" : "My Projects Timeline"}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {isAdmin 
                ? "Visualize all project timelines and schedules" 
                : "View timelines for your assigned projects"
              }
            </CardDescription>
          </div>
          <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="View mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border">
            <CustomGantt 
              tasks={ganttTasks} 
              viewMode={viewMode} 
              isReadOnly={!isAdmin} 
            />
          </div>
          {!isAdmin && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Timeline view only - No modifications allowed
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const TimelineSkeleton = () => (
  <div className="p-6">
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
    <Skeleton className="h-96 w-full rounded-md" />
  </div>
);

export default Timeline;