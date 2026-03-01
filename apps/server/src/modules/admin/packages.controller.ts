import type { Request, Response } from "express";
import { packagesService } from "./packages.service";
import {
  CreateSubscriptionPackageSchema,
  UpdateSubscriptionPackageSchema,
} from "@nestdrive/schemas/subscription-package";

const listPackages = async (_req: Request, res: Response) => {
  const packages = await packagesService.listPackages();
  return res.status(200).json(packages);
};

const getPackage = async (req: Request<{ id: string }>, res: Response) => {
  const pkg = await packagesService.getPackage(req.params.id);
  return res.status(200).json(pkg);
};

const createPackage = async (req: Request, res: Response) => {
  const body = CreateSubscriptionPackageSchema.parse(req.body);
  const pkg = await packagesService.createPackage(body);
  return res.status(201).json(pkg);
};

const updatePackage = async (req: Request<{ id: string }>, res: Response) => {
  const body = UpdateSubscriptionPackageSchema.parse(req.body);
  const pkg = await packagesService.updatePackage(req.params.id, body);
  return res.status(200).json(pkg);
};

const deletePackage = async (req: Request<{ id: string }>, res: Response) => {
  await packagesService.deletePackage(req.params.id);
  return res.status(204).send();
};

export const packagesController = {
  listPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage,
};
