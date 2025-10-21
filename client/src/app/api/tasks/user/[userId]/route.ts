import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    userId: string
  }
}

// GET /api/tasks/user/[userId] - Get user tasks
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { authorUserId: Number(params.userId) },
          { assignedUserId: Number(params.userId) },
        ],
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
      },
      orderBy: { id: 'desc' }
    })
    
    return NextResponse.json(tasks)
  } catch (error: any) {
    console.error('Error retrieving user tasks:', error)
    return NextResponse.json(
      { message: `Error retrieving user tasks: ${error.message}` },
      { status: 500 }
    )
  }
}