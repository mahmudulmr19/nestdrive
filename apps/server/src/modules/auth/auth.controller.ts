import { CreateUserSchema, LoginUserSchema } from "@nestdrive/schemas/user";
import type { Request, Response } from "express";
import { authService } from "./auth.service";

const registerUser = async (req: Request, res: Response) => {
  const body = CreateUserSchema.parse(req.body);
  const user = await authService.createUser(body);
  return res.status(201).json(user);
};

const loginUser = async (req: Request, res: Response) => {
  const body = LoginUserSchema.parse(req.body);
  const result = await authService.authenticateUser(body);

  return res.status(200).json(result);
};

export const authController = {
  loginUser,
  registerUser,
};
