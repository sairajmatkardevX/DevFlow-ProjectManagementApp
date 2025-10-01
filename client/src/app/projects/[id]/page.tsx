"use client";

import React, { useState } from "react";
import ProjectHeader from "@/app/projects/ProjectHeader";
import Board from "../BoardView";
import List from "../ListView";
import Timeline from "../TimelineView";
import Table from "../TableView";
import ModalNewTask from "@/components/ModalNewTask";
import { useGetProjectByIdQuery } from "@/state/api";

type Props = {
  params: { id: string };
};

const Project = ({ params }: Props) => {
  const { id } = params;
  const projectId = Number(id);
  
  const [activeTab, setActiveTab] = useState("Board");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Force refresh

  // Fetch project data
  const { data: project, isLoading, error } = useGetProjectByIdQuery(projectId);

  const handleTaskCreated = () => {
    setIsModalNewTaskOpen(false);
    setRefreshTrigger(prev => prev + 1); // Trigger refresh in all views
  };

  const commonProps = {
    id: projectId,
    setIsModalNewTaskOpen,
    refreshTrigger, // Pass refresh trigger to all views
    project // Pass project data to views
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading project...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-red-500 text-lg">Error loading project</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Project not found</div>
      </div>
    );
  }

  return (
    <div>
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
        id={id}
        onTaskCreated={handleTaskCreated}
      />
      
      <ProjectHeader 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        project={project}
        onNewTaskClick={() => setIsModalNewTaskOpen(true)}
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

export default Project;