import * as z from "zod/v4";

export const FileTypeEnum = z.enum(["IMAGE", "VIDEO", "PDF", "AUDIO"]);

export const SubscriptionPackageSchema = z
  .object({
    id: z.string(),
    name: z.string().min(1, "Name is required"),
    maxFolders: z.number().int().positive("Must be a positive integer"),
    maxNestingLevel: z.number().int().positive("Must be a positive integer"),
    allowedFileTypes: z
      .array(FileTypeEnum)
      .min(1, "At least one file type must be allowed"),
    maxFileSizeMb: z.number().int().positive("Must be a positive integer"),
    totalFileLimit: z.number().int().positive("Must be a positive integer"),
    filesPerFolder: z.number().int().positive("Must be a positive integer"),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .meta({ id: "SubscriptionPackage" });

export const CreateSubscriptionPackageSchema = SubscriptionPackageSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).meta({ id: "CreateSubscriptionPackage" });

export const UpdateSubscriptionPackageSchema =
  CreateSubscriptionPackageSchema.partial().meta({
    id: "UpdateSubscriptionPackage",
  });

export type SubscriptionPackage = z.infer<typeof SubscriptionPackageSchema>;
export type CreateSubscriptionPackageInput = z.infer<
  typeof CreateSubscriptionPackageSchema
>;
export type UpdateSubscriptionPackageInput = z.infer<
  typeof UpdateSubscriptionPackageSchema
>;
export type FileType = z.infer<typeof FileTypeEnum>;
