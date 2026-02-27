import * as z from "zod/v4";

export const Role = z.enum(["ADMIN", "USER"]);

export const UserSchema = z
  .object({
    id: z.string(),
    name: z.string().min(1, "Name is required"),
    email: z.email(),
    role: Role,
    emailVerified: z.iso.datetime().optional(),

    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .meta({ id: "User" });

export const CreateUserSchema = UserSchema.pick({
  name: true,
  email: true,
}).extend({
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long")
    .max(32, "Password must be at most 32 characters long"),
});

export const LoginUserSchema = CreateUserSchema.pick({
  email: true,
  password: true,
});

export const ForgotPasswordSchema = CreateUserSchema.pick({
  email: true,
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type LoginUserInput = z.infer<typeof LoginUserSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type User = z.infer<typeof UserSchema>;
