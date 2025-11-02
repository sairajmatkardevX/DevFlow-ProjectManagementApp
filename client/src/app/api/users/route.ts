import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic';

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

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
    console.error('GET /api/users error:', error);
    return NextResponse.json(
      { message: `Error retrieving users: ${error.message}` },
      { status: 500 }
    )
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { username, email, password, role = "user", profilePictureUrl = "/p1.jpeg", teamId } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'Username, email and password are required' },
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: { 
        username, 
        email, 
        password: hashedPassword,
        role, 
        profilePictureUrl, 
        teamId: teamId ? Number(teamId) : null 
      },
      select: {
        userId: true, username: true, email: true, role: true, 
        profilePictureUrl: true, teamId: true,
        team: { select: { id: true, teamName: true } }
      }
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/users error:', error);
    return NextResponse.json(
      { message: `Error creating user: ${error.message}` },
      { status: 500 }
    )
  }
}