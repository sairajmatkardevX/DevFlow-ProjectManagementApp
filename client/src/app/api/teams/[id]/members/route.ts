import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

// POST /api/teams/[id]/members - Add user to team
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id: Number(params.id) }
    })

    if (!team) {
      return NextResponse.json(
        { message: 'Team not found' },
        { status: 404 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { userId: Number(userId) }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Update user's teamId
    const updatedUser = await prisma.user.update({
      where: { userId: Number(userId) },
      data: { teamId: Number(params.id) },
      select: {
        userId: true,
        username: true,
        email: true,
        teamId: true,
        profilePictureUrl: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error: any) {
    console.error('Error adding user to team:', error)
    return NextResponse.json(
      { message: `Error adding user to team: ${error.message}` },
      { status: 500 }
    )
  }
}

// GET /api/teams/[id]/members - Get team members
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const team = await prisma.team.findUnique({
      where: { id: Number(params.id) },
      include: {
        user: {
          select: {
            userId: true,
            username: true,
            email: true,
            profilePictureUrl: true,
            role: true
          }
        }
      }
    })

    if (!team) {
      return NextResponse.json(
        { message: 'Team not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(team.user)
  } catch (error: any) {
    console.error('Error retrieving team members:', error)
    return NextResponse.json(
      { message: `Error retrieving team members: ${error.message}` },
      { status: 500 }
    )
  }
}