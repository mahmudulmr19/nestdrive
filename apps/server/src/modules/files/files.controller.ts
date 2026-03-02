import type { Request, Response } from "express";
import { filesService } from "./files.service";
import { ConfirmFileSchema, PresignFileSchema } from "@nestdrive/schemas/file";

const presign = async (req: Request, res: Response) => {
  const body = PresignFileSchema.parse(req.body);
  const result = await filesService.presign(req.user.userId, body);
  return res.status(200).json(result);
};

const confirm = async (req: Request, res: Response) => {
  const body = ConfirmFileSchema.parse(req.body);
  const file = await filesService.confirmUpload(req.user.userId, body);
  return res.status(201).json(file);
};

const list = async (req: Request, res: Response) => {
  const files = await filesService.listFiles(req.user.userId);
  return res.status(200).json(files);
};

const getUrl = async (req: Request<{ id: string }>, res: Response) => {
  const result = await filesService.getFileUrl(req.user.userId, req.params.id);
  return res.status(200).json(result);
};

const remove = async (req: Request<{ id: string }>, res: Response) => {
  await filesService.deleteFile(req.user.userId, req.params.id);
  return res.status(204).send();
};

export const filesController = {
  presign,
  confirm,
  list,
  getUrl,
  remove,
};
