import { createEnv } from "@t3-oss/env-core";
import * as z from "zod/v4";

export const env = createEnv({
  server: {
    PORT: z.coerce.number().default(8080),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    /** Comma-separated origins for CORS, or "*" for development. Empty = same as "*". */
    CORS_ORIGIN: z.string().optional(),
    DATABASE_URL: z.string(),
    JWT_SECRET: z.string(),
    RESEND_API_KEY: z.string().startsWith("re_"),
    SERVER_URL: z.url(),
    FRONTEND_URL: z.url(),
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
    AWS_REGION: z.string(),
    AWS_S3_BUCKET: z.string(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  onValidationError: (error) => {
    console.error("❌ Invalid environment variables:", error);
    process.exit(1);
  },
});
