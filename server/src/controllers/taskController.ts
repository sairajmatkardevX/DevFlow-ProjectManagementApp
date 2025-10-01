import { Request, Response } from "express";
import { prisma } from '../../lib/db';

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.query;
  
  try {
    const tasks = await prisma.task.findMany({
      where: projectId ? { projectId: Number(projectId) } : undefined,
      include: {
        author: true,
        assignee: true,
        comments: {
          include: {
            user: true // Use 'user' instead of 'author' for comments
          }
        },
        attachments: true,
      },
      orderBy: { id: 'desc' } // Use id since createdAt doesn't exist
    });
    res.status(200).json(tasks);
  } catch (error: any) {
    console.error('Error retrieving tasks:', error);
    res.status(500).json({ message: `Error retrieving tasks: ${error.message}` });
  }
};

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  try {
    const task = await prisma.task.findUnique({
      where: { id: Number(id) },
      include: {
        author: true,
        assignee: true,
        comments: {
          include: {
            user: true // Use 'user' instead of 'author' for comments
          },
          orderBy: { id: 'asc' }
        },
        attachments: true,
        project: true
      }
    });

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.status(200).json(task);
  } catch (error: any) {
    console.error('Error retrieving task:', error);
    res.status(500).json({ message: `Error retrieving task: ${error.message}` });
  }
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
  const {
    title,
    description,
    status = 'To Do',
    priority = 'Medium',
    tags,
    startDate,
    dueDate,
    points,
    projectId,
    authorUserId,
    assignedUserId,
  } = req.body;

  // Validation
  if (!title || !projectId || !authorUserId) {
    res.status(400).json({ message: 'Title, projectId, and authorUserId are required' });
    return;
  }

  try {
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        tags,
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        points: points ? Number(points) : null,
        projectId: Number(projectId),
        authorUserId: Number(authorUserId),
        assignedUserId: assignedUserId ? Number(assignedUserId) : undefined,
      },
      include: {
        author: true,
        assignee: true,
        project: true
      }
    });
    
    res.status(201).json(newTask);
  } catch (error: any) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: `Error creating task: ${error.message}` });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    title,
    description,
    status,
    priority,
    tags,
    startDate,
    dueDate,
    points,
    projectId,
    authorUserId,
    assignedUserId,
  } = req.body;

  try {
    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: Number(id) }
    });

    if (!existingTask) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Build update data dynamically
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (tags !== undefined) updateData.tags = tags;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (points !== undefined) updateData.points = points ? Number(points) : null;
    if (projectId !== undefined) updateData.projectId = Number(projectId);
    if (authorUserId !== undefined) updateData.authorUserId = Number(authorUserId);
    if (assignedUserId !== undefined) {
      updateData.assignedUserId = assignedUserId ? Number(assignedUserId) : null;
    }

    const updatedTask = await prisma.task.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        author: true,
        assignee: true,
        project: true
      }
    });

    res.status(200).json(updatedTask);
  } catch (error: any) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: `Error updating task: ${error.message}` });
  }
};

export const updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    res.status(400).json({ message: 'Status is required' });
    return;
  }

  try {
    const existingTask = await prisma.task.findUnique({
      where: { id: Number(id) }
    });

    if (!existingTask) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    const updatedTask = await prisma.task.update({
      where: { id: Number(id) },
      data: { status },
      include: {
        author: true,
        assignee: true
      }
    });

    res.status(200).json(updatedTask);
  } catch (error: any) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: `Error updating task status: ${error.message}` });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const existingTask = await prisma.task.findUnique({
      where: { id: Number(id) }
    });

    if (!existingTask) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    await prisma.task.delete({
      where: { id: Number(id) }
    });

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: `Error deleting task: ${error.message}` });
  }
};

export const getUserTasks = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  
  try {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { authorUserId: Number(userId) },
          { assignedUserId: Number(userId) },
        ],
      },
      include: {
        author: true,
        assignee: true,
        project: true
      },
      orderBy: { id: 'desc' }
    });
    
    res.status(200).json(tasks);
  } catch (error: any) {
    console.error('Error retrieving user tasks:', error);
    res.status(500).json({ message: `Error retrieving user tasks: ${error.message}` });
  }
};