import type { NextFunction, Request, Response } from "express";
import type { Role } from "~/generated/prisma/client";
import { ApiError } from "~/utils/errors";

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError({
          code: "forbidden",
          message: "You do not have permission to access this resource.",
        }),
      );
    }
    next();
  };
}
