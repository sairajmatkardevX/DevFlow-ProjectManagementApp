import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const dataDir = path.join(__dirname, "seedData");

const read = (file: string) =>
  JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf-8"));

async function clearAll() {
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
  for (const t of tables) await (prisma as any)[t].deleteMany({});
}

async function seedAll() {
  const teams = await prisma.team.createManyAndReturn({
    data: read("team.json"),
    select: { id: true },
  });
  const teamMap = new Map<number, number>();
  teams.forEach((t, i) => teamMap.set(i + 1, t.id));

  const users = await prisma.user.createManyAndReturn({
    data: read("user.json").map((u: any) => ({
      ...u,
      teamId: u.teamId ? teamMap.get(u.teamId) : undefined,
    })),
    select: { userId: true },
  });
  const userMap = new Map<number, number>();
  users.forEach((u, i) => userMap.set(i + 1, u.userId));

  await prisma.project.createMany({ data: read("project.json") });

  await prisma.task.createMany({
    data: read("task.json").map((t: any) => ({
      ...t,
      authorUserId: userMap.get(t.authorUserId)!,
      assignedUserId: t.assignedUserId ? userMap.get(t.assignedUserId)! : undefined,
    })),
  });

  await prisma.projectTeam.createMany({
    data: read("projectTeam.json").map((pt: any) => ({
      teamId: teamMap.get(pt.teamId)!,
      projectId: pt.projectId,
    })),
  });

  await prisma.taskAssignment.createMany({
    data: read("taskAssignment.json").map((ta: any) => ({
      userId: userMap.get(ta.userId)!,
      taskId: ta.taskId,
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

(async () => {
  await clearAll();
  await seedAll();
})()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());