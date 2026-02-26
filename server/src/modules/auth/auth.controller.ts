import { UserCreateSchema } from "@nestdrive/schemas/user";
import type { Request, Response } from "express";
import { authService } from "./auth.service";
import { ApiError } from "~/utils/errors";

const registerUser = async (req: Request, res: Response) => {
  const body = UserCreateSchema.parse(req.body);
  const existingUser = await authService.getUserByEmail(body.email);
  if (existingUser) {
    throw new ApiError({
      code: "conflict",
      message: "A user with this email already exists.",
    });
  }

  const user = await authService.createUser(body);
  return res.status(201).json(user);
};

export const authController = {
  registerUser,
};
