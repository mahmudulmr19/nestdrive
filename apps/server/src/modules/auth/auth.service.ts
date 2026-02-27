import { prisma } from "~/db";
import type { CreateUserInput, LoginUserInput } from "@nestdrive/schemas/user";
import { createId } from "~/utils/create-id";
import bcrypt from "bcrypt";
import { ApiError } from "~/utils/errors";
import { authUtils } from "~/utils/auth";

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
    omit: {
      passwordHash: true,
    },
  });
  return newUser;
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
