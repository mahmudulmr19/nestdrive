import { prisma } from "~/db";
import { ApiError } from "~/utils/errors";
import { createId } from "~/utils/create-id";
import type {
  CreateFolderInput,
  RenameFolderInput,
} from "@nestdrive/schemas/folder";

const getActivePackage = async (userId: string) => {
  const sub = await prisma.userSubscription.findFirst({
    where: { userId, endedAt: null },
    include: { package: true },
    orderBy: { startedAt: "desc" },
  });
  return sub?.package ?? null;
};

const listFolders = async (userId: string) => {
  return prisma.folder.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
};

const createFolder = async (userId: string, data: CreateFolderInput) => {
  const pkg = await getActivePackage(userId);
  if (!pkg) {
    throw new ApiError({
      code: "bad_request",
      message: "You need an active subscription to create folders.",
    });
  }

  const folderCount = await prisma.folder.count({ where: { userId } });
  if (folderCount >= pkg.maxFolders) {
    throw new ApiError({
      code: "exceeded_limit",
      message: `Your plan allows a maximum of ${pkg.maxFolders} folders.`,
    });
  }

  let depth = 0;
  if (data.parentId) {
    const parent = await prisma.folder.findFirst({
      where: { id: data.parentId, userId },
    });
    if (!parent) {
      throw new ApiError({
        code: "not_found",
        message: "Parent folder not found.",
      });
    }
    depth = parent.depth + 1;
    if (depth >= pkg.maxNestingLevel) {
      throw new ApiError({
        code: "exceeded_limit",
        message: `Your plan allows a maximum nesting level of ${pkg.maxNestingLevel}.`,
      });
    }
  }

  return prisma.folder.create({
    data: {
      id: createId({ prefix: "fold_" }),
      name: data.name,
      userId,
      parentId: data.parentId ?? null,
      depth,
    },
  });
};

const renameFolder = async (
  userId: string,
  id: string,
  data: RenameFolderInput,
) => {
  const folder = await prisma.folder.findFirst({ where: { id, userId } });
  if (!folder) {
    throw new ApiError({ code: "not_found", message: "Folder not found." });
  }
  return prisma.folder.update({ where: { id }, data: { name: data.name } });
};

const deleteFolder = async (userId: string, id: string) => {
  const folder = await prisma.folder.findFirst({ where: { id, userId } });
  if (!folder) {
    throw new ApiError({ code: "not_found", message: "Folder not found." });
  }
  await prisma.folder.delete({ where: { id } });
};

export const foldersService = {
  listFolders,
  createFolder,
  renameFolder,
  deleteFolder,
};
