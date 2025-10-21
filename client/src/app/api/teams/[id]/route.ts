import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}
export const dynamic = 'force-dynamic';
// GET /api/teams/[id] - Get team by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const team = await prisma.team.findUnique({
      where: { id: Number(params.id) },
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
                description: true,
                startDate: true,
                endDate: true,
                tasks: {
                  select: {
                    id: true,
                    title: true,
                    status: true,
                    priority: true
                  }
                }
              }
            }
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

    // Get product owner details
    const productOwner = team.productOwnerUserId ? await prisma.user.findUnique({
      where: { userId: team.productOwnerUserId },
      select: { userId: true, username: true, profilePictureUrl: true }
    }) : null

    const teamWithDetails = {
      ...team,
      productOwner,
      _count: {
        members: team.user.length,
        projects: team.projectTeams.length
      }
    }

    return NextResponse.json(teamWithDetails)
  } catch (error: any) {
    console.error('Error retrieving team:', error)
    return NextResponse.json(
      { message: `Error retrieving team: ${error.message}` },
      { status: 500 }
    )
  }
}

// PUT /api/teams/[id] - Update team
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { teamName, productOwnerUserId } = await request.json()

    const existingTeam = await prisma.team.findUnique({
      where: { id: Number(params.id) }
    })

    if (!existingTeam) {
      return NextResponse.json(
        { message: 'Team not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (teamName !== undefined) updateData.teamName = teamName
    if (productOwnerUserId !== undefined) updateData.productOwnerUserId = productOwnerUserId ? Number(productOwnerUserId) : null

    const updatedTeam = await prisma.team.update({
      where: { id: Number(params.id) },
      data: updateData,
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

    return NextResponse.json(updatedTeam)
  } catch (error: any) {
    console.error('Error updating team:', error)
    return NextResponse.json(
      { message: `Error updating team: ${error.message}` },
      { status: 500 }
    )
  }
}

// DELETE /api/teams/[id] - Delete team
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const existingTeam = await prisma.team.findUnique({
      where: { id: Number(params.id) },
      include: {
        user: true,
        projectTeams: true
      }
    })

    if (!existingTeam) {
      return NextResponse.json(
        { message: 'Team not found' },
        { status: 404 }
      )
    }

    // Check if team has members or projects
    if (existingTeam.user.length > 0 || existingTeam.projectTeams.length > 0) {
      return NextResponse.json(
        { 
          message: 'Cannot delete team with members or projects. Remove all members and projects first.' 
        },
        { status: 400 }
      )
    }

    await prisma.team.delete({
      where: { id: Number(params.id) }
    })

    return NextResponse.json({ message: 'Team deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting team:', error)
    return NextResponse.json(
      { message: `Error deleting team: ${error.message}` },
      { status: 500 }
    )
  }
}