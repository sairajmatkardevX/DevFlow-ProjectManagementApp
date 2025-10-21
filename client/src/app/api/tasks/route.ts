import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic';
// GET /api/tasks - Get all tasks with optional project filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    
    const tasks = await prisma.task.findMany({
      where: projectId ? { projectId: Number(projectId) } : undefined,
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
        },
        comments: {
          include: {
            user: {
              select: {
                userId: true,
                username: true,
                profilePictureUrl: true
              }
            }
          }
        },
        attachments: true,
        project: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { id: 'desc' }
    })

    return NextResponse.json(tasks)
  } catch (error: any) {
    console.error('Error retrieving tasks:', error)
    return NextResponse.json(
      { message: `Error retrieving tasks: ${error.message}` },
      { status: 500 }
    )
  }
}

// POST /api/tasks - Create new task
export async function POST(request: NextRequest) {
  try {
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
    } = await request.json()

    // Validation
    if (!title || !projectId || !authorUserId) {
      return NextResponse.json(
        { message: 'Title, projectId, and authorUserId are required' },
        { status: 400 }
      )
    }

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
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    return NextResponse.json(newTask, { status: 201 })
  } catch (error: any) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { message: `Error creating task: ${error.message}` },
      { status: 500 }
    )
  }
}