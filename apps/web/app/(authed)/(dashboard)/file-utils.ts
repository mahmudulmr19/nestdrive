import { FileAudio, FileImage, FileText, FileVideo } from "lucide-react";

export type FileCategory = "IMAGE" | "VIDEO" | "PDF" | "AUDIO";

export const FILE_ICONS = {
  IMAGE: FileImage,
  VIDEO: FileVideo,
  AUDIO: FileAudio,
  PDF: FileText,
} as const;

export const FILE_COLORS = {
  IMAGE: "text-blue-400",
  VIDEO: "text-purple-400",
  AUDIO: "text-green-400",
  PDF: "text-red-400",
} as const;

/** Format a size given in MB (from the API) into a human-readable string. */
export function formatSizeMb(sizeMb: number): string {
  if (sizeMb < 1) return `${(sizeMb * 1024).toFixed(0)} KB`;
  return `${sizeMb.toFixed(1)} MB`;
}

/** Format a size given in bytes (from File.size) into a human-readable string. */
export function formatSizeBytes(bytes: number): string {
  return formatSizeMb(bytes / (1024 * 1024));
}
