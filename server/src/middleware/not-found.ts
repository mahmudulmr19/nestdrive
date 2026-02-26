import type { Request, Response } from "express";
import type { ErrorResponse } from "~/utils/errors";

export const notFoundHandler = (
  _req: Request,
  res: Response<ErrorResponse>,
): void => {
  res.status(404).json({
    error: {
      code: "not_found",
      message: "Route not found",
    },
  });
};
