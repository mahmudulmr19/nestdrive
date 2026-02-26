import * as z from "zod/v4";
import { generateErrorMessage } from "zod-error";
import { ErrorCode, ErrorCodes } from "./error-codes";

const ErrorSchema = z.object({
  error: z.object({
    code: ErrorCode.meta({
      description: "A short code indicating the error code returned.",
      example: "not_found",
    }),
    message: z.string().meta({
      description: "A human readable error message.",
      example: "The requested resource was not found.",
    }),
  }),
});

export type ErrorResponse = z.infer<typeof ErrorSchema>;

export class ApiError extends Error {
  public readonly code: z.infer<typeof ErrorCode>;

  constructor({
    code,
    message,
  }: {
    code: z.infer<typeof ErrorCode>;
    message: string;
  }) {
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
  console.error(error.message);

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
      status: ErrorCodes[error.code as keyof typeof ErrorCodes],
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
