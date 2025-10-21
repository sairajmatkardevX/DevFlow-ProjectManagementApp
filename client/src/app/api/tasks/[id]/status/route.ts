import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

// PATCH /api/tasks/[id]/status - Update task status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json(
        { message: 'Status is required' },
        { status: 400 }
      )
    }

    const existingTask = await prisma.task.findUnique({
      where: { id: Number(params.id) }
    })

    if (!existingTask) {
      return NextResponse.json(
        { message: 'Task not found' },
        { status: 404 }
      )
    }

    const updatedTask = await prisma.task.update({
      where: { id: Number(params.id) },
      data: { status },
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
    })

    return NextResponse.json(updatedTask)
  } catch (error: any) {
    console.error('Error updating task status:', error)
    return NextResponse.json(
      { message: `Error updating task status: ${error.message}` },
      { status: 500 }
    )
  }
}