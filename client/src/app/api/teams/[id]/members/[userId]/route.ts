import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/teams/[id]/members/[userId] - Remove user from team
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
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

    // Check if user exists and is in this team
    const user = await prisma.user.findUnique({
      where: { userId: Number(params.userId) }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    if (user.teamId !== Number(params.id)) {
      return NextResponse.json(
        { message: 'User is not a member of this team' },
        { status: 400 }
      )
    }

    // Remove user from team by setting teamId to null
    const updatedUser = await prisma.user.update({
      where: { userId: Number(params.userId) },
      data: { teamId: null },
      select: {
        userId: true,
        username: true,
        email: true,
        teamId: true
      }
    })

    return NextResponse.json({ 
      message: 'User removed from team successfully',
      user: updatedUser
    })
  } catch (error: any) {
    console.error('Error removing user from team:', error)
    return NextResponse.json(
      { message: `Error removing user from team: ${error.message}` },
      { status: 500 }
    )
  }
}