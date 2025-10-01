import { prisma } from '../lib/db';
import fs from "fs";
import path from "path";


const dataDir = path.join(__dirname, "seedData");

const read = (file: string) =>
  JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf-8"));

async function clearAll() {
  // Delete in correct order to respect foreign key constraints
  const tables = [
    "attachment",
    "comment",
    "taskAssignment",
    "projectTeam",
    "task",
    "user",
    "project",
    "team",
  ];
  
  for (const t of tables) {
    try {
      await (prisma as any)[t].deleteMany({});
    } catch (error) {
      console.error(`Error clearing table ${t}:`, error);
    }
  }
}

async function seedAll() {
  // Seed teams and create mapping
  const teams = await prisma.team.createManyAndReturn({
    data: read("team.json"),
  });
  const teamMap = new Map<number, number>();
  teams.forEach((t, i) => teamMap.set(i + 1, t.id));

  // Seed users and create mapping
  const users = await prisma.user.createManyAndReturn({
    data: read("user.json").map((u: any) => ({
      ...u,
      teamId: u.teamId ? teamMap.get(u.teamId) : undefined,
    })),
  });
  const userMap = new Map<number, number>();
  users.forEach((u, i) => userMap.set(i + 1, u.userId));

  // Seed projects and create mapping
  const projects = await prisma.project.createManyAndReturn({
    data: read("project.json"),
  });
  const projectMap = new Map<number, number>();
  projects.forEach((p, i) => projectMap.set(i + 1, p.id));

  // Seed tasks with proper ID mappings
  await prisma.task.createMany({
    data: read("task.json").map((t: any) => ({
      ...t,
      authorUserId: userMap.get(t.authorUserId)!,
      assignedUserId: t.assignedUserId ? userMap.get(t.assignedUserId)! : undefined,
      projectId: projectMap.get(t.projectId)!, // Add projectId mapping if needed
    })),
  });

  // Seed project-team relationships
  await prisma.projectTeam.createMany({
    data: read("projectTeam.json").map((pt: any) => ({
      teamId: teamMap.get(pt.teamId)!,
      projectId: projectMap.get(pt.projectId)!, // Use mapped projectId
    })),
  });

  // Seed other relationships
  await prisma.taskAssignment.createMany({
    data: read("taskAssignment.json").map((ta: any) => ({
      userId: userMap.get(ta.userId)!,
      taskId: ta.taskId, // Make sure this maps correctly
    })),
  });

  await prisma.comment.createMany({
    data: read("comment.json").map((c: any) => ({
      ...c,
      userId: userMap.get(c.userId)!,
      taskId: c.taskId,
    })),
  });

  await prisma.attachment.createMany({
    data: read("attachment.json").map((a: any) => ({
      ...a,
      uploadedById: userMap.get(a.uploadedById)!,
      taskId: a.taskId,
    })),
  });
}

// Improved execution with better error handling
(async () => {
  try {
    await clearAll();
    console.log("Database cleared successfully");
    
    await seedAll();
    console.log("Database seeded successfully");
    
    // Verify the data was inserted correctly
    const projectCount = await prisma.project.count();
    console.log(`Inserted ${projectCount} projects`);
    
    const userCount = await prisma.user.count();
    console.log(`Inserted ${userCount} users`);
    
  } catch (e) {
    console.error("Seeding error:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();