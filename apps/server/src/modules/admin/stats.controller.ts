import type { Request, Response } from "express";
import { statsService } from "./stats.service";

const getStats = async (_req: Request, res: Response) => {
  const stats = await statsService.getStats();
  return res.status(200).json(stats);
};

export const statsController = { getStats };
