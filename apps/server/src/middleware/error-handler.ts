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

  logger.error(`Http request error: ${err.message}`, {
    err,
    body: req.body,
    method: req.method,
    requestId,
    url: req.url,
  });

  res.status(status).json({ error, ...(requestId && { requestId }) });
};
