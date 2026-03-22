import { z } from "zod";

export const taskStatusSchema = z.enum(["pending", "running", "done"]);

export const createTaskSchema = z.object({
  name: z.string().trim().min(1).max(255),
  fileUrl: z.string().trim().min(1).max(2048),
  executor: z.string().trim().min(1).max(128),
  creator: z.string().trim().min(1).max(128)
});

export const claimTaskSchema = z.object({
  executor: z.string().trim().min(1).max(128)
});

export const listTasksSchema = z.object({
  executor: z.string().trim().min(1).max(128).optional(),
  creator: z.string().trim().min(1).max(128).optional(),
  status: taskStatusSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type ClaimTaskInput = z.infer<typeof claimTaskSchema>;
export type ListTasksInput = z.infer<typeof listTasksSchema>;
