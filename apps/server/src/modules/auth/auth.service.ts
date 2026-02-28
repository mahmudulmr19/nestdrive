import { prisma } from "~/db";
import type { CreateUserInput, LoginUserInput } from "@nestdrive/schemas/user";
import { createId } from "~/utils/create-id";
import bcrypt from "bcrypt";
import { ApiError } from "~/utils/errors";
import { authUtils } from "~/utils/auth";
import { randomBytes } from "node:crypto";
import { EMAIL_VERIFICATION_TOKEN_EXPIRY } from "~/utils/constants";
import { logger } from "~/config/logger";
import { getVerifyEmailTemplate, resend } from "~/utils/resend";
import { env } from "~/config/env";

const SALT_ROUNDS = 10;

const getUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

const createUser = async (data: CreateUserInput) => {
  const existingUser = await getUserByEmail(data.email);
  if (existingUser) {
    throw new ApiError({
      code: "conflict",
      message: "A user with this email already exists.",
    });
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const newUser = await prisma.user.create({
    data: {
      id: createId({ prefix: "user_" }),
      name: data.name,
      email: data.email,
      passwordHash,
    },
  });

  try {
    const token = randomBytes(32).toString("hex");
    await prisma.token.create({
      data: {
        identifier: data.email,
        token,
        expires: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_EXPIRY),
        type: "EMAIL_VERIFICATION",
      },
    });
    const verification_url = env.SERVER_URL.concat(
      `/v1/auth/verify-email?token=${token}`,
    );

    await resend.emails.send({
      to: data.email,
      subject: "Verify your email for NestDrive",
      template: getVerifyEmailTemplate(data.name, verification_url),
    });
  } catch (error) {
    logger.error("Failed to create email verification token:", error);
  }

  const accessToken = authUtils.generateAccessToken({
    userId: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  });
  return { accessToken };
};

const authenticateUser = async (data: LoginUserInput) => {
  const user = await getUserByEmail(data.email);
  if (!user) {
    throw new ApiError({
      code: "unauthorized",
      message: "Invalid email or password",
    });
  }
  const isPasswordValid = await bcrypt.compare(
    data.password,
    user.passwordHash,
  );
  if (!isPasswordValid) {
    throw new ApiError({
      code: "unauthorized",
      message: "Invalid email or password",
    });
  }

  const accessToken = authUtils.generateAccessToken({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  return { accessToken };
};

export const authService = {
  getUserByEmail,
  createUser,
  authenticateUser,
};
