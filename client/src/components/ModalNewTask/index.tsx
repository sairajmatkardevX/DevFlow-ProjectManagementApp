import Modal from "@/components/Modal";
import { Priority, Status, useCreateTaskMutation } from "@/state/api";
import React, { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  id?: string | null;
  onTaskCreated?: () => void;
};

const ModalNewTask = ({ isOpen, onClose, id = null, onTaskCreated }: Props) => {
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>(Status.ToDo);
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [tags, setTags] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [authorUserId, setAuthorUserId] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [projectId, setProjectId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    
    const hasProjectId = id !== null || projectId.trim() !== "";
    if (!title.trim() || !authorUserId.trim() || !hasProjectId) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      
      const finalProjectId = id !== null ? Number(id) : Number(projectId);
      
      console.log('Creating task with:', {
        title: title.trim(),
        authorUserId: parseInt(authorUserId),
        projectId: finalProjectId,
        priority 
      });

      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        tags: tags.trim() || undefined,
        startDate: startDate || undefined,
        dueDate: dueDate || undefined,
        authorUserId: parseInt(authorUserId),
        assignedUserId: assignedUserId ? parseInt(assignedUserId) : undefined,
        projectId: finalProjectId,
      }).unwrap();

      // Success handling
      onClose();
      onTaskCreated?.();
      
      // Reset form
      setTitle("");
      setDescription("");
      setStatus(Status.ToDo);
      setPriority(Priority.Medium); 
      setTags("");
      setStartDate("");
      setDueDate("");
      setAuthorUserId("");
      setAssignedUserId("");
      setProjectId("");
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task. Please check that the User ID exists in the database.");
    }
  };

  const isFormValid = () => {
    const hasProjectId = id !== null || projectId.trim() !== "";
    return title.trim() !== "" && authorUserId.trim() !== "" && hasProjectId;
  };

  const selectStyles = "mb-4 block w-full rounded border border-gray-300 px-3 py-2 dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none";
  const inputStyles = "w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none";

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Create New Task">
      <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
        {/* Required fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            className={inputStyles}
            placeholder="Enter task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Author User ID *
          </label>
          <input
            type="number"
            className={inputStyles}
            placeholder="Enter valid User ID"
            value={authorUserId}
            onChange={(e) => setAuthorUserId(e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Must be a valid User ID from your database
          </p>
        </div>

        {id === null && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project ID *
            </label>
            <input
              type="number"
              className={inputStyles}
              placeholder="Enter Project ID"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
            />
          </div>
        )}

        {/* Optional fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            className={inputStyles}
            placeholder="Task description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* Status & Priority Row */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              className={selectStyles}
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
            >
              <option value={Status.ToDo}>To Do</option>
              <option value={Status.WorkInProgress}>Work In Progress</option>
              <option value={Status.UnderReview}>Under Review</option>
              <option value={Status.Completed}>Completed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <select
              className={selectStyles}
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              <option value={Priority.Urgent}>🚨 Urgent</option>
              <option value={Priority.High}>⬆️ High</option>
              <option value={Priority.Medium}>⚡ Medium</option>
              <option value={Priority.Low}>⬇️ Low</option>
              <option value={Priority.Backlog}>📥 Backlog</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags
          </label>
          <input
            type="text"
            className={inputStyles}
            placeholder="Tags (comma separated, optional)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        {/* Dates */}
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Due Date
            </label>
            <input
              type="date"
              className={inputStyles}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Assignee */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Assignee User ID (Optional)
          </label>
          <input
            type="number"
            className={inputStyles}
            placeholder="Assignee User ID (optional)"
            value={assignedUserId}
            onChange={(e) => setAssignedUserId(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className={`mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors ${
            !isFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? "Creating..." : "Create Task"}
        </button>
      </form>
    </Modal>
  );
};

export default ModalNewTask;