
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

const dataDir = path.join(process.cwd(), 'prisma', 'seedData')

const read = (file: string) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf-8"))
  } catch (error) {
    console.log(`❌ Cannot read ${file}`)
    return []
  }
}

async function main() {
  console.log('🚀 Starting COMPLETE seed from scratch...')

  // STEP 1: Create ALL teams
  console.log('👥 Creating teams...')
  const teamsData = [
    { teamName: "Quantum Innovations" },
    { teamName: "Nexus Dynamics" },
    { teamName: "Apex Solutions" },
    { teamName: "Synergy Labs" },
    { teamName: "Pinnacle Systems" }
  ]
  
  const teamMap = new Map<number, any>()
  for (let i = 0; i < teamsData.length; i++) {
    const team = await prisma.team.create({
      data: teamsData[i]
    })
    teamMap.set(i + 1, team)
    console.log(` Created team: ${team.teamName} (ID: ${team.id})`)
  }

  // STEP 2: Create ALL users
  // STEP 2: Create ALL users
console.log('👤 Creating users...')
const usersData = read("user.json")
const userMap = new Map<number, any>()

for (let i = 0; i < usersData.length; i++) {
  const userData = usersData[i]
  const password = await bcrypt.hash(userData.password, 12)
  
  const user = await prisma.user.create({
    data: {
      username: userData.username,
      email: userData.email,
      password: password,
      role: userData.role?.toLowerCase() || "user", // ✅ ensures lowercase
      profilePictureUrl: userData.profilePictureUrl,
      teamId: userData.teamId ? teamMap.get(userData.teamId)?.id : null,
    }
  })
  userMap.set(i + 1, user)
  console.log(` Created user: ${user.username} (ID: ${user.userId})`)
}

  // STEP 3: Update teams with user references
  console.log('🔗 Updating team user references...')
  await prisma.team.update({
    where: { id: teamMap.get(1).id },
    data: { productOwnerUserId: userMap.get(1)?.userId, projectManagerUserId: userMap.get(2)?.userId }
  })
  await prisma.team.update({
    where: { id: teamMap.get(2).id },
    data: { productOwnerUserId: userMap.get(3)?.userId, projectManagerUserId: userMap.get(4)?.userId }
  })
  await prisma.team.update({
    where: { id: teamMap.get(3).id },
    data: { productOwnerUserId: userMap.get(5)?.userId, projectManagerUserId: userMap.get(6)?.userId }
  })
  await prisma.team.update({
    where: { id: teamMap.get(4).id },
    data: { productOwnerUserId: userMap.get(7)?.userId, projectManagerUserId: userMap.get(8)?.userId }
  })
  await prisma.team.update({
    where: { id: teamMap.get(5).id },
    data: { productOwnerUserId: userMap.get(9)?.userId, projectManagerUserId: userMap.get(10)?.userId }
  })
  console.log(' Team user references updated')

  // STEP 4: Create ALL projects
  console.log('📋 Creating projects...')
  const projectsData = read("project.json")
  const projectMap = new Map<number, any>()
  
  for (let i = 0; i < projectsData.length; i++) {
    const projectData = projectsData[i]
    const project = await prisma.project.create({
      data: {
        name: projectData.name,
        description: projectData.description,
        startDate: projectData.startDate ? new Date(projectData.startDate) : null,
        endDate: projectData.endDate ? new Date(projectData.endDate) : null,
      }
    })
    projectMap.set(i + 1, project)
    console.log(` Created project: ${project.name} (ID: ${project.id})`)
  }

  // STEP 5: Create project-team relationships
  console.log(' Creating project-team relationships...')
  const projectTeamData = read("projectTeam.json")
  for (const ptData of projectTeamData) {
    await prisma.projectTeam.create({
      data: {
        teamId: teamMap.get(ptData.teamId)?.id,
        projectId: projectMap.get(ptData.projectId)?.id,
      }
    })
  }
  console.log(` Created ${projectTeamData.length} project-team relationships`)

  // STEP 6: Create ALL tasks
  console.log(' Creating tasks...')
  const tasksData = read("task.json")
  const taskMap = new Map<number, any>()
  
  for (let i = 0; i < tasksData.length; i++) {
    const taskData = tasksData[i]
    const task = await prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        tags: taskData.tags,
        startDate: taskData.startDate ? new Date(taskData.startDate) : null,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        points: taskData.points,
        projectId: projectMap.get(taskData.projectId)?.id,
        authorUserId: userMap.get(taskData.authorUserId)?.userId,
        assignedUserId: taskData.assignedUserId ? userMap.get(taskData.assignedUserId)?.userId : null,
      }
    })
    taskMap.set(i + 1, task)
    console.log(` Created task: ${taskData.title}`)
  }

  // STEP 7: Create task assignments
  console.log(' Creating task assignments...')
  const taskAssignmentData = read("taskAssignment.json")
  for (const taData of taskAssignmentData) {
    await prisma.taskAssignment.create({
      data: {
        userId: userMap.get(taData.userId)?.userId,
        taskId: taskMap.get(taData.taskId)?.id,
      }
    })
  }
  console.log(`Created ${taskAssignmentData.length} task assignments`)

  // STEP 8: Create comments
  console.log(' Creating comments...')
  const commentsData = read("comment.json")
  for (const commentData of commentsData) {
    await prisma.comment.create({
      data: {
        text: commentData.text,
        userId: userMap.get(commentData.userId)?.userId,
        taskId: taskMap.get(commentData.taskId)?.id,
      }
    })
  }
  console.log(` Created ${commentsData.length} comments`)

  // STEP 9: Create attachments
  console.log('📎 Creating attachments...')
  const attachmentsData = read("attachment.json")
  for (const attachmentData of attachmentsData) {
    await prisma.attachment.create({
      data: {
        fileURL: attachmentData.fileURL,
        fileName: attachmentData.fileName,
        uploadedById: userMap.get(attachmentData.uploadedById)?.userId,
        taskId: taskMap.get(attachmentData.taskId)?.id,
      }
    })
  }
  console.log(` Created ${attachmentsData.length} attachments`)

  console.log(' COMPLETE SEED FINISHED!')
  console.log(' Final Counts:')
  console.log(`   Teams: ${teamMap.size}`)
  console.log(`   Users: ${userMap.size}`)
  console.log(`   Projects: ${projectMap.size}`)
  console.log(`   Tasks: ${taskMap.size}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())