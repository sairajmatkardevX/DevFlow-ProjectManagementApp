import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/tasks/[id] - Get task by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: Number(params.id) },
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
          },
          orderBy: { id: 'asc' }
        },
        attachments: true,
        project: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    })

    if (!task) {
      return NextResponse.json(
        { message: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(task)
  } catch (error: any) {
    console.error('Error retrieving task:', error)
    return NextResponse.json(
      { message: `Error retrieving task: ${error.message}` },
      { status: 500 }
    )
  }
}

// PUT /api/tasks/[id] - Update task
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
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
    } = await request.json()

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: Number(params.id) }
    })

    if (!existingTask) {
      return NextResponse.json(
        { message: 'Task not found' },
        { status: 404 }
      )
    }

    // Build update data dynamically
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (status !== undefined) updateData.status = status
    if (priority !== undefined) updateData.priority = priority
    if (tags !== undefined) updateData.tags = tags
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (points !== undefined) updateData.points = points ? Number(points) : null
    if (projectId !== undefined) updateData.projectId = Number(projectId)
    if (authorUserId !== undefined) updateData.authorUserId = Number(authorUserId)
    if (assignedUserId !== undefined) {
      updateData.assignedUserId = assignedUserId ? Number(assignedUserId) : null
    }

    const updatedTask = await prisma.task.update({
      where: { id: Number(params.id) },
      data: updateData,
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

    return NextResponse.json(updatedTask)
  } catch (error: any) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { message: `Error updating task: ${error.message}` },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const existingTask = await prisma.task.findUnique({
      where: { id: Number(params.id) }
    })

    if (!existingTask) {
      return NextResponse.json(
        { message: 'Task not found' },
        { status: 404 }
      )
    }

    await prisma.task.delete({
      where: { id: Number(params.id) }
    })

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { message: `Error deleting task: ${error.message}` },
      { status: 500 }
    )
  }
}