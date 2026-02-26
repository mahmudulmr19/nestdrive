import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import { logger } from "~/config/logger";
import { type ErrorResponse, handleApiError } from "~/utils/errors";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response<ErrorResponse & { requestId?: string }>,
  _next: NextFunction,
): void => {
  const { error, status } = handleApiError(err);
  const requestId = req.requestId;

  logger.error("Request error", {
    requestId,
    status,
    code: error.code,
    message: error.message,
    err: err.message,
  });

  res.status(status).json({ error, ...(requestId && { requestId }) });
};
