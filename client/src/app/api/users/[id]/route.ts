import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: { id: string }
}

// GET /api/users/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await prisma.user.findUnique({
      where: { userId: Number(params.id) },
      select: {
        userId: true, username: true, email: true, role: true,
        profilePictureUrl: true, teamId: true,
        team: { select: { id: true, teamName: true } },
        _count: { select: { authoredTasks: true, assignedTasks: true } }
      }
    })

    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 })
    return NextResponse.json(user)
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

// PUT /api/users/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { username, email, role, profilePictureUrl, teamId } = await request.json()
    
    const updatedUser = await prisma.user.update({
      where: { userId: Number(params.id) },
      data: { username, email, role, profilePictureUrl, teamId: teamId ? Number(teamId) : null },
      select: {
        userId: true, username: true, email: true, role: true,
        profilePictureUrl: true, teamId: true,
        team: { select: { id: true, teamName: true } }
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

// DELETE /api/users/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await prisma.user.delete({ where: { userId: Number(params.id) } })
    return NextResponse.json({ message: 'User deleted' })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}