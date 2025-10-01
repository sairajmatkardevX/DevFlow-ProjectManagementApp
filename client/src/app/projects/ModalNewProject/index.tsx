import Modal from "@/components/Modal";
import { useCreateProjectMutation } from "@/state/api";
import React, { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: () => void; // Add success callback
};

const ModalNewProject = ({ isOpen, onClose, onProjectCreated }: Props) => {
  const [createProject, { isLoading }] = useCreateProjectMutation();
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      alert("Project name is required");
      return;
    }

    try {
      await createProject({
        name: projectName.trim(),
        description: description.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }).unwrap();

      // Success handling
      onClose();
      onProjectCreated?.(); // Refresh projects list
      
      // Reset form
      setProjectName("");
      setDescription("");
      setStartDate("");
      setEndDate("");
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Failed to create project. Please try again.");
    }
  };

  const isFormValid = () => {
    return projectName.trim() !== "";
  };

  const inputStyles =
    "w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Create New Project">
      <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
        {/* Required Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Name *
          </label>
          <input
            type="text"
            className={inputStyles}
            placeholder="Enter project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        {/* Optional Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            className={inputStyles}
            placeholder="Project description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            disabled={isLoading}
          />
        </div>

        {/* Optional Dates */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              className={inputStyles}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              className={inputStyles}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Form Validation Note */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          * Required field
        </div>

        <button
          type="submit"
          className={`mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors ${
            !isFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? "Creating Project..." : "Create Project"}
        </button>
      </form>
    </Modal>
  );
};

export default ModalNewProject;