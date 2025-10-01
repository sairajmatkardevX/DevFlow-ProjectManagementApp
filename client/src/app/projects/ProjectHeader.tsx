import Header from "@/components/Header";
import {
  Clock,
  Filter,
  Grid3x3,
  List,
  PlusSquare,
  Share2,
  Table,
  Search,
} from "lucide-react";
import React, { useState } from "react";
import ModalNewProject from "./ModalNewProject";
import { Project } from "@/state/api";

type Props = {
  activeTab: string;
  setActiveTab: (tabName: string) => void;
  project?: Project; // Add project data prop
  onNewTaskClick?: () => void; // Add new task callback
};

const ProjectHeader = ({ activeTab, setActiveTab, project, onNewTaskClick }: Props) => {
  const [isModalNewProjectOpen, setIsModalNewProjectOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Use dynamic project name or fallback
  const projectName = project?.name || "Product Design Development";
  const projectDescription = project?.description;

  const handleNewProjectCreated = () => {
    // This would refresh the projects list in the parent component
    setIsModalNewProjectOpen(false);
  };

  return (
    <div className="px-4 xl:px-6">
      <ModalNewProject
        isOpen={isModalNewProjectOpen}
        onClose={() => setIsModalNewProjectOpen(false)}
        onProjectCreated={handleNewProjectCreated}
      />
      
      <div className="pb-6 pt-6 lg:pb-4 lg:pt-8">
        <Header
          name={projectName}
          description={projectDescription} // Add project description
          buttonComponent={
            <div className="flex gap-2">
              <button
                className="flex items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-white hover:bg-green-700 transition-colors"
                onClick={onNewTaskClick}
                title="Add new task to this project"
              >
                <PlusSquare className="h-5 w-5" /> 
                New Task
              </button>
              <button
                className="flex items-center gap-2 rounded-md bg-blue-primary px-3 py-2 text-white hover:bg-blue-600 transition-colors"
                onClick={() => setIsModalNewProjectOpen(true)}
                title="Create a new project"
              >
                <PlusSquare className="h-5 w-5" /> 
                New Project
              </button>
            </div>
          }
        />
      </div>

      {/* Project Metadata */}
      {project && (
        <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
          {project.startDate && (
            <div>
              <span className="font-medium">Start: </span>
              {new Date(project.startDate).toLocaleDateString()}
            </div>
          )}
          {project.endDate && (
            <div>
              <span className="font-medium">End: </span>
              {new Date(project.endDate).toLocaleDateString()}
            </div>
          )}
          {/* Add more project stats here if needed */}
        </div>
      )}

      {/* TABS & CONTROLS */}
      <div className="flex flex-wrap-reverse gap-2 border-y border-gray-200 pb-[8px] pt-2 dark:border-stroke-dark md:items-center">
        <div className="flex flex-1 items-center gap-2 md:gap-4">
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
        
        <div className="flex items-center gap-3">
          <button 
            className="flex items-center gap-2 rounded-md px-3 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 dark:text-neutral-500 dark:hover:bg-dark-tertiary dark:hover:text-gray-300 transition-colors"
            title="Filter tasks"
          >
            <Filter className="h-5 w-5" />
            <span className="hidden sm:inline">Filter</span>
          </button>
          
          <button 
            className="flex items-center gap-2 rounded-md px-3 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 dark:text-neutral-500 dark:hover:bg-dark-tertiary dark:hover:text-gray-300 transition-colors"
            title="Share project"
          >
            <Share2 className="h-5 w-5" />
            <span className="hidden sm:inline">Share</span>
          </button>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-neutral-500" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-dark-secondary dark:bg-dark-secondary dark:text-white dark:focus:ring-blue-600 transition-colors"
            />
          </div>
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
    <button
      className={`group relative flex items-center gap-2 px-1 py-2 text-gray-500 after:absolute after:-bottom-[9px] after:left-0 after:h-[1px] after:w-full hover:text-blue-600 dark:text-neutral-500 dark:hover:text-white sm:px-2 lg:px-4 transition-colors ${
        isActive 
          ? "text-blue-600 after:bg-blue-600 dark:text-white font-semibold" 
          : "hover:after:bg-gray-300 dark:hover:after:bg-gray-600"
      }`}
      onClick={() => setActiveTab(name)}
      title={description}
    >
      {icon}
      <span className="hidden sm:inline">{name}</span>
    </button>
  );
};

export default ProjectHeader;