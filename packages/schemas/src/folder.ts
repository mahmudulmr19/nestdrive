import * as z from "zod/v4";

export const FolderSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    userId: z.string(),
    parentId: z.string().nullable(),
    depth: z.number(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .meta({ id: "Folder" });

export const CreateFolderSchema = z
  .object({
    name: z.string().min(1, "Folder name is required"),
    parentId: z.string().optional(),
  })
  .meta({ id: "CreateFolderInput" });

export const RenameFolderSchema = z
  .object({
    name: z.string().min(1, "Folder name is required"),
  })
  .meta({ id: "RenameFolderInput" });

export type Folder = z.infer<typeof FolderSchema>;
export type CreateFolderInput = z.infer<typeof CreateFolderSchema>;
export type RenameFolderInput = z.infer<typeof RenameFolderSchema>;
