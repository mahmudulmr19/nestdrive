import { env } from "~/config/env";
import { Role } from "~/generated/prisma/client";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRATION = "7d";

interface GenerateAccessTokenOptions {
  userId: string;
  name: string;
  email: string;
  role: Role;
}

const generateAccessToken = (options: GenerateAccessTokenOptions) => {
  return jwt.sign(options, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRATION,
  });
};

const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.JWT_SECRET);
};

export const authUtils = {
  generateAccessToken,
  verifyAccessToken,
};
