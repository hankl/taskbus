import { Prisma, TaskStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { ClaimTaskInput, CreateTaskInput, ListTasksInput } from "@/lib/task-schema";

export async function createTask(input: CreateTaskInput) {
  return prisma.task.create({
    data: {
      name: input.name,
      fileUrl: input.fileUrl,
      executor: input.executor,
      creator: input.creator
    }
  });
}

export async function getTaskById(id: number) {
  return prisma.task.findUnique({
    where: { id }
  });
}

export async function listTasks(input: ListTasksInput) {
  const skip = (input.page - 1) * input.pageSize;
  const where: Prisma.TaskWhereInput = {
    executor: input.executor,
    creator: input.creator,
    status: input.status
  };

  const [items, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip,
      take: input.pageSize
    }),
    prisma.task.count({ where })
  ]);

  return {
    items,
    total,
    page: input.page,
    pageSize: input.pageSize
  };
}

export async function claimTask(input: ClaimTaskInput) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const claimed = await prisma.$transaction(async (tx) => {
      const candidate = await tx.task.findFirst({
        where: {
          executor: input.executor,
          status: TaskStatus.pending
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }]
      });

      if (!candidate) {
        return null;
      }

      const now = new Date();
      const updated = await tx.task.updateMany({
        where: {
          id: candidate.id,
          status: TaskStatus.pending
        },
        data: {
          status: TaskStatus.running,
          startedAt: now
        }
      });

      if (updated.count === 0) {
        return undefined;
      }

      return tx.task.findUnique({
        where: { id: candidate.id }
      });
    });

    if (claimed !== undefined) {
      return claimed;
    }
  }

  return null;
}

export async function markTaskDone(id: number) {
  return prisma.$transaction(async (tx) => {
    const task = await tx.task.findUnique({
      where: { id }
    });

    if (!task) {
      return { type: "not_found" as const };
    }

    if (task.status !== TaskStatus.running) {
      return { type: "invalid_status" as const, task };
    }

    const updated = await tx.task.update({
      where: { id },
      data: {
        status: TaskStatus.done,
        completedAt: new Date()
      }
    });

    return { type: "ok" as const, task: updated };
  });
}
