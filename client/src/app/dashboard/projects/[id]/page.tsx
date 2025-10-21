"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ProjectHeader from "@/app/dashboard/projects/ProjectHeader";
import Board from "../BoardView";
import List from "../ListView";
import Timeline from "../TimelineView";
import Table from "../TableView";
import ModalNewTask from "@/components/ModalNewTask";
import { useGetProjectByIdQuery } from "@/state/api";
import { useSearchParams } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";


const ProjectForm = ({ onProjectCreated, onCancel, loading }: { 
  onProjectCreated: () => void; 
  onCancel: () => void;
  loading: boolean;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Creating project:', formData);
    onProjectCreated();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">Project Name</label>
        <input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter project name"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">Description</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter project description"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
          {loading ? "Creating..." : "Create Project"}
        </button>
      </div>
    </form>
  );
};


type Props = {
  params: { id: string };
};

const Project = ({ params }: Props) => {
  const { data: session } = useSession();
  const { id } = params;
  const projectId = Number(id);
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState("Board");
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { data: project, isLoading, error } = useGetProjectByIdQuery(projectId);

  useEffect(() => {
    const newProject = searchParams.get('newProject');
    const newTask = searchParams.get('newTask');
    
    
    if (newProject === 'true' && session?.user?.role === 'admin') {
      setIsProjectDialogOpen(true);
      const url = new URL(window.location.href);
      url.searchParams.delete('newProject');
      window.history.replaceState({}, '', url.toString());
    }
    
    if (newTask === 'true') {
      setIsTaskDialogOpen(true);
      const url = new URL(window.location.href);
      url.searchParams.delete('newTask');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams, session?.user?.role]); 

  const handleTaskCreated = () => {
    setIsTaskDialogOpen(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleProjectCreated = () => {
    setIsProjectDialogOpen(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const commonProps = {
    id: projectId.toString(),
    setIsModalNewTaskOpen: setIsTaskDialogOpen,
    refreshTrigger,
    project,
    userRole: session?.user?.role 
  };

  if (isLoading) {
    return <ProjectSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>Error loading project</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>Project not found</AlertDescription>
        </Alert>
      </div>
    );
  }


   return (
    <div>
     
      <ModalNewTask
        isOpen={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
        id={projectId.toString()}
        onTaskCreated={handleTaskCreated}
      />
      
     
      {session?.user?.role === 'admin' && (
        <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
          <DialogContent>
            <ProjectForm
              onProjectCreated={handleProjectCreated}
              onCancel={() => setIsProjectDialogOpen(false)}
              loading={false}
            />
          </DialogContent>
        </Dialog>
      )}
      
      <ProjectHeader 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        project={project}
        onNewTaskClick={() => setIsTaskDialogOpen(true)}
        userRole={session?.user?.role} 
      />
      
      <div className="p-6">
        {activeTab === "Board" && <Board {...commonProps} />}
        {activeTab === "List" && <List {...commonProps} />}
        {activeTab === "Timeline" && <Timeline {...commonProps} />}
        {activeTab === "Table" && <Table {...commonProps} />}
      </div>
    </div>
  );
};

// Skeleton Loader
const ProjectSkeleton = () => (
  <div className="p-6">
    {/* Header Skeleton */}
    <div className="mb-6">
      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-4 w-96" />
    </div>
    
    {/* Tabs Skeleton */}
    <div className="flex gap-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-10 w-20" />
      ))}
    </div>
    
    {/* Content Skeleton */}
    <Skeleton className="h-64 w-full rounded-lg" />
  </div>
);

export default Project;