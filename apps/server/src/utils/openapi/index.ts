export * from "./responses";
import * as z from "zod/v4";
import { ErrorResponseSchema } from "~/utils/errors";

const JSON_CONTENT_TYPE = "application/json";

export const requestBody = (schema: z.ZodType, description: string) => ({
  required: true,
  description,
  content: {
    [JSON_CONTENT_TYPE]: {
      schema,
    },
  },
});

export const jsonResponse = (schema: z.ZodType, description: string) => ({
  description,
  content: {
    [JSON_CONTENT_TYPE]: {
      schema,
    },
  },
});

export const errorResponse = (description: string) =>
  jsonResponse(ErrorResponseSchema, description);
