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
    RESEND_FROM_EMAIL: z.email(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  onValidationError: (error) => {
    console.error("❌ Invalid environment variables:", error);
    process.exit(1);
  },
});
