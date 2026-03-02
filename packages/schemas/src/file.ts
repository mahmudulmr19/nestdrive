import * as z from "zod/v4";

export const SUPPORTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/ogg",
  "application/pdf",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
] as const;

export const PresignFileSchema = z
  .object({
    name: z.string().min(1).max(255),
    mimeType: z.enum(SUPPORTED_MIME_TYPES),
    sizeMb: z.number().positive(),
    folderId: z.string().optional(),
  })
  .meta({ id: "PresignFileInput" });

export const ConfirmFileSchema = z
  .object({
    fileKey: z.string().min(1),
    name: z.string().min(1).max(255),
    mimeType: z.enum(SUPPORTED_MIME_TYPES),
    sizeMb: z.number().positive(),
    folderId: z.string().optional(),
  })
  .meta({ id: "ConfirmFileInput" });

export const FileSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    userId: z.string(),
    folderId: z.string().nullable(),
    fileType: z.enum(["IMAGE", "VIDEO", "PDF", "AUDIO"]),
    mimeType: z.string(),
    sizeMb: z.number(),
    storageKey: z.string(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .meta({ id: "File" });

export const PresignResponseSchema = z
  .object({
    uploadUrl: z.url(),
    fileKey: z.string(),
  })
  .meta({ id: "PresignResponse" });

export const FileUrlResponseSchema = z
  .object({
    url: z.url(),
  })
  .meta({ id: "FileUrlResponse" });

export type PresignFileInput = z.infer<typeof PresignFileSchema>;
export type ConfirmFileInput = z.infer<typeof ConfirmFileSchema>;
