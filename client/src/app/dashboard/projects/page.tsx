"use client";

import { useGetProjectsQuery } from "@/state/api";
import ProjectCard from "@/components/ProjectCard"; 
import ModalNewProject from "@/app/dashboard/projects/ModalNewProject";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function ProjectsPage() {
  const { data: session } = useSession();
  const { data: projects, isLoading, error, refetch } = useGetProjectsQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  const filteredProjects = projects?.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewProjectCreated = () => {
    setIsNewProjectModalOpen(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-destructive">Error loading projects</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* New Project Modal */}
      <ModalNewProject
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onProjectCreated={handleNewProjectCreated}
      />
      
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Projects
            </h1>
            <p className="mt-2 text-muted-foreground">
              {session?.user?.role === 'admin' 
                ? "Manage all projects and team assignments" 
                : "View and track your assigned projects"
              }
            </p>
          </div>
          
          {/* Inline role check for New Project button */}
          {session?.user?.role === 'admin' && (
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus size={20} />
              New Project
            </button>
          )}
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Projects Grid */}
        {filteredProjects?.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted">
            <div className="text-center">
              <p className="text-muted-foreground">
                {searchTerm ? "No projects found matching your search" : "No projects yet"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {session?.user?.role === 'admin' 
                  ? "Create your first project to get started" 
                  : "No projects assigned to you yet"
                }
              </p>
              {/* Inline role check for Create button in empty state */}
              {session?.user?.role === 'admin' && (
                <button
                  onClick={() => setIsNewProjectModalOpen(true)}
                  className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Plus size={20} />
                  Create Your First Project
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects?.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onProjectDeleted={refetch}
                onProjectUpdated={refetch}
                // Pass user role to ProjectCard for inline checks there too
                userRole={session?.user?.role}
              />
            ))}
          </div>
        )}

        {/* Project Count */}
        <div className="mt-6 text-sm text-muted-foreground">
          Showing {filteredProjects?.length || 0} of {projects?.length || 0} projects
        </div>
      </div>
    </div>
  );
}