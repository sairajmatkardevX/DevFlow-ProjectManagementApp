import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/teams - Get all teams with optimized queries
export async function GET(request: NextRequest) {
  try {
    // Get all teams with user relationships in a single query
    const teams = await prisma.team.findMany({
      include: {
        user: {
          select: {
            userId: true,
            username: true,
            profilePictureUrl: true
          }
        },
        projectTeams: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      },
      orderBy: { id: 'asc' }
    })

    // Get product owner details
    const productOwnerUserIds = teams.map(team => team.productOwnerUserId).filter(Boolean) as number[]
    
    const productOwners = await prisma.user.findMany({
      where: {
        userId: { in: productOwnerUserIds }
      },
      select: {
        userId: true,
        username: true
      }
    })

    // Create a user map for quick lookup
    const userMap = new Map(productOwners.map(user => [user.userId, user]))

    // Build response with usernames
    const teamsWithUsernames = teams.map(team => ({
      id: team.id,
      teamName: team.teamName,
      productOwnerUserId: team.productOwnerUserId,
      productOwnerUsername: team.productOwnerUserId ? userMap.get(team.productOwnerUserId)?.username : null,
      members: team.user, // Include team members
      projects: team.projectTeams.map(pt => pt.project), // Include team projects
      _count: {
        members: team.user.length,
        projects: team.projectTeams.length
      }
    }))

    return NextResponse.json(teamsWithUsernames)
  } catch (error: any) {
    console.error('Error retrieving teams:', error)
    return NextResponse.json(
      { message: `Error retrieving teams: ${error.message}` },
      { status: 500 }
    )
  }
}

// POST /api/teams - Create new team
export async function POST(request: NextRequest) {
  try {
    const { teamName, productOwnerUserId } = await request.json()

    if (!teamName) {
      return NextResponse.json(
        { message: 'Team name is required' },
        { status: 400 }
      )
    }

    const newTeam = await prisma.team.create({
      data: {
        teamName,
        productOwnerUserId: productOwnerUserId ? Number(productOwnerUserId) : undefined,
      },
      include: {
        user: {
          select: {
            userId: true,
            username: true,
            profilePictureUrl: true
          }
        }
      }
    })

    return NextResponse.json(newTeam, { status: 201 })
  } catch (error: any) {
    console.error('Error creating team:', error)
    return NextResponse.json(
      { message: `Error creating team: ${error.message}` },
      { status: 500 }
    )
  }
}