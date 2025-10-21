import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query) {
      return NextResponse.json(
        { message: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // Search tasks
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
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

    // Search projects
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        projectTeams: {
          include: {
            team: true
          }
        }
      }
    })

    // Search users
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } }
        ],
      },
      select: {
        userId: true,
        username: true,
        profilePictureUrl: true,
        team: {
          select: {
            id: true,
            teamName: true
          }
        }
      }
    })

    return NextResponse.json({ 
      tasks, 
      projects, 
      users,
      query,
      totals: {
        tasks: tasks.length,
        projects: projects.length,
        users: users.length
      }
    })
  } catch (error: any) {
    console.error('Error performing search:', error)
    return NextResponse.json(
      { message: `Error performing search: ${error.message}` },
      { status: 500 }
    )
  }
}