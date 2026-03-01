import * as z from "zod/v4";
import { generateErrorMessage } from "zod-error";
import { ErrorCodeSchema, ErrorCodes, type ErrorCode } from "./error-codes";
import { ZodOpenApiResponseObject } from "zod-openapi";

export const ErrorResponseSchema = z
  .object({
    error: z.object({
      code: ErrorCodeSchema.meta({
        description: "A short code indicating the error code returned.",
        example: "not_found",
      }),
      message: z.string().meta({
        description: "A human readable error message.",
        example: "The requested resource was not found.",
      }),
    }),
    requestId: z.string().optional().meta({
      description:
        "A unique identifier for the request, useful for debugging and tracing errors in logs.",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
  })
  .meta({ id: "ErrorResponse" });

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export class ApiError extends Error {
  public readonly code: ErrorCode;

  constructor({ code, message }: { code: ErrorCode; message: string }) {
    super(message);
    this.code = code;
  }
}

export function fromZodError(error: z.ZodError): ErrorResponse {
  return {
    error: {
      code: "unprocessable_entity",
      message: generateErrorMessage(error.issues, {
        maxErrors: 1,
        delimiter: {
          component: ": ",
        },
        path: {
          enabled: true,
          type: "objectNotation",
          label: "",
        },
        code: {
          enabled: true,
          label: "",
        },
        message: {
          enabled: true,
          label: "",
        },
      }),
    },
  };
}

// biome-ignore lint/suspicious/noExplicitAny: any error can be passed
export function handleApiError(error: any): ErrorResponse & { status: number } {
  // Zod errors
  if (error instanceof z.ZodError) {
    return {
      ...fromZodError(error),
      status: ErrorCodes.unprocessable_entity,
    };
  }

  // ApiError errors
  if (error instanceof ApiError) {
    return {
      error: {
        code: error.code,
        message: error.message,
      },
      status: ErrorCodes[error.code],
    };
  }

  // Prisma record not found error
  if (error.code === "P2025") {
    return {
      error: {
        code: "not_found",
        message:
          error?.meta?.cause ||
          error.message ||
          "The requested resource was not found.",
      },
      status: 404,
    };
  }

  // Fallback
  // Unhandled errors are not user-facing, so we don't expose the actual error
  return {
    error: {
      code: "internal_server_error",
      message:
        "An internal server error occurred. Please contact our support if the problem persists.",
    },
    status: 500,
  };
}

export const errorSchemaFactory = (
  code: ErrorCode,
  description: string,
): ZodOpenApiResponseObject => {
  return {
    description,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            error: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                  enum: [code],
                  description:
                    "A short code indicating the error code returned.",
                  example: code,
                },
                message: {
                  type: "string",
                  description:
                    "A human readable explanation of what went wrong.",
                  example: "The requested resource was not found.",
                },
              },
              required: ["code", "message"],
            },
          },
          required: ["error"],
        },
      },
    },
  };
};
