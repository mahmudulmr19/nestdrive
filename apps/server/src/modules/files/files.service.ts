import { randomUUID } from "node:crypto";
import { prisma } from "~/db";
import { ApiError } from "~/utils/errors";
import {
  generatePresignedGetUrl,
  generatePresignedPutUrl,
  deleteS3Object,
} from "~/utils/s3";
import type {
  ConfirmFileInput,
  PresignFileInput,
} from "@nestdrive/schemas/file";

/** Maps MIME types to the FileType enum stored in the DB. */
const MIME_TO_FILE_TYPE: Record<string, "IMAGE" | "VIDEO" | "PDF" | "AUDIO"> = {
  "image/jpeg": "IMAGE",
  "image/png": "IMAGE",
  "image/gif": "IMAGE",
  "image/webp": "IMAGE",
  "image/svg+xml": "IMAGE",
  "video/mp4": "VIDEO",
  "video/webm": "VIDEO",
  "video/ogg": "VIDEO",
  "application/pdf": "PDF",
  "audio/mpeg": "AUDIO",
  "audio/ogg": "AUDIO",
  "audio/wav": "AUDIO",
  "audio/webm": "AUDIO",
};

const getActivePackage = async (userId: string) => {
  const sub = await prisma.userSubscription.findFirst({
    where: { userId, endedAt: null },
    include: { package: true },
    orderBy: { startedAt: "desc" },
  });
  return sub?.package ?? null;
};

/**
 * Validate subscription limits and return a pre-signed S3 PUT URL.
 * The browser uploads the file directly to S3 using this URL.
 */
const presign = async (userId: string, data: PresignFileInput) => {
  const pkg = await getActivePackage(userId);
  if (!pkg) {
    throw new ApiError({
      code: "bad_request",
      message: "You need an active subscription to upload files.",
    });
  }

  const fileType = MIME_TO_FILE_TYPE[data.mimeType];
  if (!fileType) {
    throw new ApiError({
      code: "bad_request",
      message: "Unsupported file type.",
    });
  }
  if (!pkg.allowedFileTypes.includes(fileType)) {
    throw new ApiError({
      code: "exceeded_limit",
      message: `Your plan does not allow ${fileType.toLowerCase()} files.`,
    });
  }

  if (data.sizeMb > pkg.maxFileSizeMb) {
    throw new ApiError({
      code: "exceeded_limit",
      message: `Your plan allows a maximum file size of ${pkg.maxFileSizeMb} MB.`,
    });
  }

  const totalCount = await prisma.file.count({ where: { userId } });
  if (totalCount >= pkg.totalFileLimit) {
    throw new ApiError({
      code: "exceeded_limit",
      message: `Your plan allows a maximum of ${pkg.totalFileLimit} files.`,
    });
  }

  if (data.folderId) {
    const folder = await prisma.folder.findFirst({
      where: { id: data.folderId, userId },
    });
    if (!folder) {
      throw new ApiError({ code: "not_found", message: "Folder not found." });
    }

    const folderCount = await prisma.file.count({
      where: { folderId: data.folderId },
    });
    if (folderCount >= pkg.filesPerFolder) {
      throw new ApiError({
        code: "exceeded_limit",
        message: `Your plan allows a maximum of ${pkg.filesPerFolder} files per folder.`,
      });
    }
  }

  const ext = data.name.split(".").pop()?.toLowerCase() ?? "";
  const fileKey = `files/${userId}/${randomUUID()}${ext ? `.${ext}` : ""}`;
  const uploadUrl = await generatePresignedPutUrl(fileKey, data.mimeType);

  return { uploadUrl, fileKey };
};

/**
 * Save the File record to the DB after the browser has finished uploading to S3.
 */
const confirmUpload = async (userId: string, data: ConfirmFileInput) => {
  if (data.folderId) {
    const folder = await prisma.folder.findFirst({
      where: { id: data.folderId, userId },
    });
    if (!folder) {
      throw new ApiError({ code: "not_found", message: "Folder not found." });
    }
  }

  const fileType = MIME_TO_FILE_TYPE[data.mimeType];
  if (!fileType) {
    throw new ApiError({
      code: "bad_request",
      message: "Unsupported file type.",
    });
  }

  return prisma.file.create({
    data: {
      name: data.name,
      userId,
      folderId: data.folderId ?? null,
      fileType,
      mimeType: data.mimeType,
      sizeMb: data.sizeMb,
      storageKey: data.fileKey,
    },
  });
};

/** List all files for the user. Optionally filter by folderId. */
const listFiles = async (userId: string) => {
  return prisma.file.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

/** Generate a short-lived pre-signed GET URL for viewing/downloading a file. */
const getFileUrl = async (userId: string, id: string) => {
  const file = await prisma.file.findFirst({ where: { id, userId } });
  if (!file) {
    throw new ApiError({ code: "not_found", message: "File not found." });
  }
  const url = await generatePresignedGetUrl(file.storageKey);
  return { url };
};

/** Delete a file from S3 and the database. */
const deleteFile = async (userId: string, id: string) => {
  const file = await prisma.file.findFirst({ where: { id, userId } });
  if (!file) {
    throw new ApiError({ code: "not_found", message: "File not found." });
  }
  await deleteS3Object(file.storageKey);
  await prisma.file.delete({ where: { id } });
};

export const filesService = {
  presign,
  confirmUpload,
  listFiles,
  getFileUrl,
  deleteFile,
};
