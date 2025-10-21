import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/projects/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: Number(params.id) },
      include: {
        tasks: {
          include: {
            author: {
              select: {
                userId: true,
                username: true,
                profilePictureUrl: true
              }
            },
            assignee: {
              select: {
                userId: true,
                username: true,
                profilePictureUrl: true
              }
            }
          }
        },
        projectTeams: {
          include: {
            team: true
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error: any) {
    console.error('Error retrieving project:', error)
    return NextResponse.json(
      { message: `Error retrieving project: ${error.message}` },
      { status: 500 }
    )
  }
}

// PUT /api/projects/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { name, description, startDate, endDate } = await request.json()

    const existingProject = await prisma.project.findUnique({
      where: { id: Number(params.id) }
    })

    if (!existingProject) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      )
    }

    const updatedProject = await prisma.project.update({
      where: { id: Number(params.id) },
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
    })

    return NextResponse.json(updatedProject)
  } catch (error: any) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { message: `Error updating project: ${error.message}` },
      { status: 500 }
    )
  }
}


export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const projectId = Number(params.id)

    // Use transaction to ensure all or nothing
    await prisma.$transaction(async (tx) => {
      // Check if project exists and get all related data
      const existingProject = await tx.project.findUnique({
        where: { id: projectId },
        include: {
          tasks: {
            include: {
              comments: true,
              attachments: true,
              taskAssignments: true
            }
          },
          projectTeams: true
        }
      })

      if (!existingProject) {
        throw new Error('Project not found')
      }

      // Delete all task-related data first
      for (const task of existingProject.tasks) {
        // Delete task comments
        await tx.comment.deleteMany({
          where: { taskId: task.id }
        })

        // Delete task attachments  
        await tx.attachment.deleteMany({
          where: { taskId: task.id }
        })

        // Delete task assignments
        await tx.taskAssignment.deleteMany({
          where: { taskId: task.id }
        })

        // Delete the task itself
        await tx.task.delete({
          where: { id: task.id }
        })
      }

      // Delete project-team relationships
      await tx.projectTeam.deleteMany({
        where: { projectId: projectId }
      })

      // Finally delete the project
      await tx.project.delete({
        where: { id: projectId }
      })
    })

    return NextResponse.json({ 
      message: 'Project and all associated data deleted successfully' 
    })
  } catch (error: any) {
    console.error('Error deleting project:', error)
    
    if (error.message === 'Project not found') {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { message: `Error deleting project: ${error.message}` },
      { status: 500 }
    )
  }
}