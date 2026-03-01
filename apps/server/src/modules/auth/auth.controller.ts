import {
  CreateUserSchema,
  LoginUserSchema,
  VerifyEmailSchema,
} from "@nestdrive/schemas/user";
import type { Request, Response } from "express";
import { authService } from "./auth.service";
import { env } from "~/config/env";

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

const verifyEmail = async (req: Request, res: Response) => {
  try {
    const query = VerifyEmailSchema.parse(req.query);
    await authService.verifyEmail(query.token);
    res.redirect(env.FRONTEND_URL.concat("/email-verification?status=success"));
  } catch (error) {
    res.redirect(env.FRONTEND_URL.concat("/email-verification?status=failed"));
  }
};

export const authController = {
  loginUser,
  registerUser,
  verifyEmail,
};
