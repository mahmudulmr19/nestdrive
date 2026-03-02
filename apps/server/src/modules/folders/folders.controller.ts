import type { Request, Response } from "express";
import { foldersService } from "./folders.service";
import {
  CreateFolderSchema,
  RenameFolderSchema,
} from "@nestdrive/schemas/folder";

const list = async (req: Request, res: Response) => {
  const folders = await foldersService.listFolders(req.user.userId);
  return res.status(200).json(folders);
};

const create = async (req: Request, res: Response) => {
  const body = CreateFolderSchema.parse(req.body);
  const folder = await foldersService.createFolder(req.user.userId, body);
  return res.status(201).json(folder);
};

const rename = async (req: Request<{ id: string }>, res: Response) => {
  const body = RenameFolderSchema.parse(req.body);
  const folder = await foldersService.renameFolder(
    req.user.userId,
    req.params.id,
    body,
  );
  return res.status(200).json(folder);
};

const remove = async (req: Request<{ id: string }>, res: Response) => {
  await foldersService.deleteFolder(req.user.userId, req.params.id);
  return res.status(204).send();
};

export const foldersController = {
  list,
  create,
  rename,
  remove,
};
