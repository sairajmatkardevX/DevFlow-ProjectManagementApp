import { Request, Response } from "express";
import { prisma } from '../../lib/db';

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        tasks: true, // Include tasks count if needed
      },
      orderBy: { id: 'desc' }
    });
    res.status(200).json(projects);
  } catch (error: any) {
    console.error('Error retrieving projects:', error);
    res.status(500).json({ message: `Error retrieving projects: ${error.message}` });
  }
};

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  try {
    const project = await prisma.project.findUnique({
      where: { id: Number(id) },
      include: {
        tasks: {
          include: {
            assignee: true,
            author: true
          }
        },
        projectTeams: {
          include: {
            team: true
          }
        }
      }
    });

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.status(200).json(project);
  } catch (error: any) {
    console.error('Error retrieving project:', error);
    res.status(500).json({ message: `Error retrieving project: ${error.message}` });
  }
};

export const createProject = async (req: Request, res: Response): Promise<void> => {
  const { name, description, startDate, endDate } = req.body;

  if (!name) {
    res.status(400).json({ message: 'Project name is required' });
    return;
  }

  try {
    const newProject = await prisma.project.create({
      data: {
        name,
        description: description || undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      include: {
        tasks: true,
        projectTeams: true
      }
    });
    
    res.status(201).json(newProject);
  } catch (error: any) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: `Error creating project: ${error.message}` });
  }
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, startDate, endDate } = req.body;

  try {
    const existingProject = await prisma.project.findUnique({
      where: { id: Number(id) }
    });

    if (!existingProject) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const updatedProject = await prisma.project.update({
      where: { id: Number(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      },
      include: {
        tasks: true,
        projectTeams: true
      }
    });

    res.status(200).json(updatedProject);
  } catch (error: any) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: `Error updating project: ${error.message}` });
  }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const existingProject = await prisma.project.findUnique({
      where: { id: Number(id) },
      include: {
        tasks: true,
      }
    });

    if (!existingProject) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    // Optional: Check if project has tasks
    if (existingProject.tasks.length > 0) {
      res.status(400).json({ 
        message: 'Cannot delete project with existing tasks. Delete tasks first.' 
      });
      return;
    }

    await prisma.project.delete({
      where: { id: Number(id) }
    });

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: `Error deleting project: ${error.message}` });
  }
};