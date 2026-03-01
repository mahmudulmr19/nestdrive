import type { NextFunction, Request, Response } from "express";
import { authUtils } from "~/utils/auth";
import { ApiError } from "~/utils/errors";
import type { Role } from "~/generated/prisma/client";

interface JwtPayload {
  userId: string;
  name: string;
  email: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(
      new ApiError({
        code: "unauthorized",
        message: "Authentication required",
      }),
    );
  }

  const token = authHeader.slice(7);
  try {
    req.user = authUtils.verifyAccessToken(token) as JwtPayload;
    next();
  } catch {
    next(
      new ApiError({
        code: "unauthorized",
        message: "Invalid or expired token",
      }),
    );
  }
}
