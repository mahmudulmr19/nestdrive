import type { Request, Response } from "express";
import { packagesService } from "~/modules/admin/packages.service";

const listPackages = async (_req: Request, res: Response) => {
  const packages = await packagesService.listPackages();
  return res.status(200).json(packages);
};

export const packagesController = { listPackages };
