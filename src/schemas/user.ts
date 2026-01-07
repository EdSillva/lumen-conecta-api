import { z } from "zod";

export enum Role {
  PUBLIC = "PUBLIC",
  USER = "USER",
  CREATOR = "CREATOR",
  ADMIN = "ADMIN",
}

export const createUserSchema = z.object({
  name: z.string().min(3),
  email: z
    .string()
    .nonempty()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  roles: z.array(z.nativeEnum(Role)).default([Role.PUBLIC]),
});

export const userResponseSchema = z.object({
  id: z.string().uuid(),
  firebase_uid: z.string(),
  name: z.string(),
  email: z.string(),
  roles: z.array(z.nativeEnum(Role)),
  createdAt: z.string(),
  deletedAt: z.string().nullable(),
});

export type UserResponse = z.infer<typeof userResponseSchema>;
export type UserSummary = Pick<UserResponse, "id" | "email" | "name">;
