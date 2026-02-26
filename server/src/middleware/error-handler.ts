import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import { type ErrorResponse, handleApiError } from "~/utils/errors";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction,
): void => {
  const { error, status } = handleApiError(err);

  res.status(status).json({ error });
};
