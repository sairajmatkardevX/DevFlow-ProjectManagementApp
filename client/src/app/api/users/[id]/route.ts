import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from 'bcryptjs'

interface RouteParams {
  params: { id: string }
}

export const dynamic = 'force-dynamic';

// GET /api/users/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

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
    console.error(`GET /api/users/${params.id} error:`, error);
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

// PUT /api/users/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { username, email, password, role, profilePictureUrl, teamId } = await request.json()
    
    const updateData: any = { 
      username, 
      email, 
      role, 
      profilePictureUrl, 
      teamId: teamId ? Number(teamId) : null 
    }

    // Only update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }
    
    const updatedUser = await prisma.user.update({
      where: { userId: Number(params.id) },
      data: updateData,
      select: {
        userId: true, username: true, email: true, role: true,
        profilePictureUrl: true, teamId: true,
        team: { select: { id: true, teamName: true } }
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error: any) {
    console.error(`PUT /api/users/${params.id} error:`, error);
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

// DELETE /api/users/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has tasks before deleting
    const userWithTasks = await prisma.user.findUnique({
      where: { userId: Number(params.id) },
      include: {
        _count: {
          select: {
            authoredTasks: true,
            assignedTasks: true
          }
        }
      }
    })

    if (!userWithTasks) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    if (userWithTasks._count.authoredTasks > 0 || userWithTasks._count.assignedTasks > 0) {
      return NextResponse.json(
        { 
          message: 'Cannot delete user with assigned tasks. Please reassign tasks first.',
          taskCount: {
            authored: userWithTasks._count.authoredTasks,
            assigned: userWithTasks._count.assignedTasks
          }
        },
        { status: 400 }
      )
    }

    await prisma.user.delete({ where: { userId: Number(params.id) } })
    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error: any) {
    console.error(`DELETE /api/users/${params.id} error:`, error);
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}