import Header from "@/components/Header";
import {
  Clock,
  Grid3x3,
  List,
  PlusSquare,
  Table,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { Project, useDeleteProjectMutation } from "@/state/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type Props = {
  activeTab: string;
  setActiveTab: (tabName: string) => void;
  project?: Project;
  onNewTaskClick?: () => void;
  userRole?: string; 
};

const ProjectHeader = ({ activeTab, setActiveTab, project, onNewTaskClick, userRole }: Props) => {
  const router = useRouter();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const { toast } = useToast();
  
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

  const projectName = project?.name || "Product Design Development";
  const projectDescription = project?.description;

  const handleDeleteProject = async () => {
    if (!project?.id) return;
    
    try {
      await deleteProject(project.id).unwrap();
      setIsDeleteConfirmOpen(false);
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
      router.push("/dashboard/projects");
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="px-4 xl:px-6">
      
      {userRole === 'admin' && (
        <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Project</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>&ldquo;{projectName}&rdquo;</strong>? 
                This action cannot be undone and all tasks in this project will be deleted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteConfirmOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteProject}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete Project"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <div className="pb-6 pt-6 lg:pb-4 lg:pt-8">
        <Header
          name={projectName}
          description={projectDescription}
          buttonComponent={
            <div className="flex gap-2">
              {project?.id && (
                <>
                  {/* New Task Button - Show to all users */}
                  <Button
                    onClick={onNewTaskClick}
                    title="Add new task to this project"
                  >
                    <PlusSquare className="mr-2 h-4 w-4" /> 
                    New Task
                  </Button>
                  
                  {/* Delete Project Button - Only show to admins */}
                  {userRole === 'admin' && (
                    <Button
                      variant="destructive"
                      onClick={() => setIsDeleteConfirmOpen(true)}
                      title="Delete this project"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> 
                      Delete Project
                    </Button>
                  )}
                </>
              )}
            </div>
          }
        />
      </div>

      {/* Project Metadata - Show to all users */}
      {project && (
        <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {project.startDate && (
            <div className="flex items-center gap-1">
              <span className="font-medium">Start:</span>
              <Badge variant="outline">
                {new Date(project.startDate).toLocaleDateString()}
              </Badge>
            </div>
          )}
          {project.endDate && (
            <div className="flex items-center gap-1">
              <span className="font-medium">End:</span>
              <Badge variant="outline">
                {new Date(project.endDate).toLocaleDateString()}
              </Badge>
            </div>
          )}
          <div className="ml-auto flex items-center gap-1">
            <span className="font-medium">Project ID:</span>
            <Badge variant="secondary">
              {project.id}
            </Badge>
          </div>
        </div>
      )}

      {/* Tabs Navigation - Show to all users */}
      <div className="flex border-y border-border pb-[8px] pt-2">
        <div className="flex items-center gap-2 md:gap-4">
          <TabButton
            name="Board"
            icon={<Grid3x3 className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
            description="Kanban-style task management"
          />
          <TabButton
            name="List"
            icon={<List className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
            description="Card-based task list"
          />
          <TabButton
            name="Timeline"
            icon={<Clock className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
            description="Gantt chart timeline view"
          />
          <TabButton
            name="Table"
            icon={<Table className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
            description="Spreadsheet-style data table"
          />
        </div>
      </div>
    </div>
  );
};

type TabButtonProps = {
  name: string;
  icon: React.ReactNode;
  setActiveTab: (tabName: string) => void;
  activeTab: string;
  description?: string;
};

const TabButton = ({ name, icon, setActiveTab, activeTab, description }: TabButtonProps) => {
  const isActive = activeTab === name;

  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className={`group relative flex items-center gap-2 px-1 py-2 sm:px-2 lg:px-4 transition-colors ${
        isActive ? "font-semibold" : ""
      }`}
      onClick={() => setActiveTab(name)}
      title={description}
    >
      {icon}
      <span className="hidden sm:inline">{name}</span>
    </Button>
  );
};

export default ProjectHeader;