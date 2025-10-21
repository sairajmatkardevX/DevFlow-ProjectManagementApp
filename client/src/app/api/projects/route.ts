import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/projects - Get all projects
export async function GET(request: NextRequest) {
  try {
    const projects = await prisma.project.findMany({
      include: {
        tasks: true,
      },
      orderBy: { id: 'desc' }
    });

    return NextResponse.json(projects);
  } catch (error: any) {
    console.error('Error retrieving projects:', error);
    return NextResponse.json(
      { message: `Error retrieving projects: ${error.message}` },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const { name, description, startDate, endDate } = await request.json();

    if (!name) {
      return NextResponse.json(
        { message: 'Project name is required' },
        { status: 400 }
      );
    }

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

    return NextResponse.json(newProject, { status: 201 });
  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { message: `Error creating project: ${error.message}` },
      { status: 500 }
    );
  }
}