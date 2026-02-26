import { UserCreateSchema, UserLoginSchema } from "@nestdrive/schemas/user";
import type { Request, Response } from "express";
import { authService } from "./auth.service";

const registerUser = async (req: Request, res: Response) => {
  const body = UserCreateSchema.parse(req.body);
  const user = await authService.createUser(body);
  return res.status(201).json(user);
};

const loginUser = async (req: Request, res: Response) => {
  const body = UserLoginSchema.parse(req.body);
  // TODO: implement
  await authService.authenticateUser(body);

  return res.status(200).end();
};

export const authController = {
  loginUser,
  registerUser,
};
