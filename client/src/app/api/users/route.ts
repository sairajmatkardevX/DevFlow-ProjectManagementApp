import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: {
        userId: true,
        username: true,
        email: true,
        role: true,
        profilePictureUrl: true,
        teamId: true,
        team: {
          select: {
            id: true,
            teamName: true
          }
        },
        _count: {
          select: {
            authoredTasks: true,
            assignedTasks: true
          }
        }
      },
      orderBy: { userId: 'asc' }
    })

    return NextResponse.json(users)
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error retrieving users: ${error.message}` },
      { status: 500 }
    )
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const { username, email, role = "USER", profilePictureUrl = "i1.jpg", teamId } = await request.json()

    if (!username || !email) {
      return NextResponse.json(
        { message: 'Username and email are required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 409 }
      )
    }

    const newUser = await prisma.user.create({
      data: { username, email, role, profilePictureUrl, teamId: teamId ? Number(teamId) : null },
      select: {
        userId: true, username: true, email: true, role: true, 
        profilePictureUrl: true, teamId: true,
        team: { select: { id: true, teamName: true } }
      }
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error creating user: ${error.message}` },
      { status: 500 }
    )
  }
}