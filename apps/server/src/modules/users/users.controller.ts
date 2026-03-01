import type { Request, Response } from "express";
import { usersService } from "./users.service";

const getMe = async (req: Request, res: Response) => {
  const user = await usersService.getUserById(req.user.userId);
  return res.status(200).json(user);
};

export const usersController = { getMe };
