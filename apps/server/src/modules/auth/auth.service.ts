import { prisma } from "~/db";
import {
  AuthTokenSchema,
  type AuthToken,
  type CreateUserInput,
  type ForgotPasswordInput,
  type LoginUserInput,
  type ResetPasswordInput,
} from "@nestdrive/schemas/user";
import { createId } from "~/utils/create-id";
import bcrypt from "bcrypt";
import { ApiError } from "~/utils/errors";
import { authUtils } from "~/utils/auth";
import { randomBytes } from "node:crypto";
import {
  EMAIL_VERIFICATION_TOKEN_EXPIRY,
  PASSWORD_RESET_TOKEN_EXPIRY,
} from "~/utils/constants";
import { logger } from "~/config/logger";
import {
  getResetPasswordTemplate,
  getVerifyEmailTemplate,
  resend,
} from "~/utils/resend";
import { env } from "~/config/env";

const SALT_ROUNDS = 10;

const getUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

const createUser = async (data: CreateUserInput): Promise<AuthToken> => {
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
  return AuthTokenSchema.parse({ accessToken });
};

const authenticateUser = async (data: LoginUserInput): Promise<AuthToken> => {
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

  return AuthTokenSchema.parse({ accessToken });
};

const verifyEmail = async (token: string) => {
  const tokenFound = await prisma.token.findFirst({
    where: {
      token,
      expires: {
        gte: new Date(),
      },
      type: "EMAIL_VERIFICATION",
    },
    select: {
      identifier: true,
    },
  });

  if (!tokenFound) {
    throw Error("Invalid or expired email verification token used:");
  }

  const { identifier } = tokenFound;
  await prisma.$transaction([
    prisma.user.update({
      where: { email: identifier },
      data: { emailVerified: new Date() },
    }),
    prisma.token.delete({
      where: { token },
    }),
  ]);
};

const forgotPassword = async (data: ForgotPasswordInput): Promise<void> => {
  const user = await getUserByEmail(data.email);
  if (!user) {
    throw new ApiError({
      code: "not_found",
      message: "No account found with that email address.",
    });
  }

  // Invalidate any existing reset tokens for this address
  await prisma.token.deleteMany({
    where: { identifier: data.email, type: "PASSWORD_RESET" },
  });

  const token = randomBytes(32).toString("hex");
  await prisma.token.create({
    data: {
      identifier: data.email,
      token,
      expires: new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRY),
      type: "PASSWORD_RESET",
    },
  });

  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      to: data.email,
      template: getResetPasswordTemplate(user.name, resetUrl),
    });
  } catch (error) {
    logger.error("Failed to send password reset email:", error);
  }
};

const resetPassword = async (data: ResetPasswordInput): Promise<void> => {
  const tokenRecord = await prisma.token.findFirst({
    where: {
      token: data.token,
      expires: { gte: new Date() },
      type: "PASSWORD_RESET",
    },
    select: { identifier: true },
  });

  if (!tokenRecord) {
    throw new ApiError({
      code: "unauthorized",
      message: "Invalid or expired password reset link.",
    });
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({
      where: { email: tokenRecord.identifier },
      data: { passwordHash },
    }),
    prisma.token.delete({ where: { token: data.token } }),
  ]);
};

export const authService = {
  getUserByEmail,
  createUser,
  authenticateUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
