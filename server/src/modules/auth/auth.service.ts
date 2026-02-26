import { prisma } from "~/db";
import { UserCreateInput } from "@nestdrive/schemas/user";
import { createId } from "~/utils/create-id";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

const getUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

const createUser = async (user: UserCreateInput) => {
  const passwordHash = await bcrypt.hash(user.password, SALT_ROUNDS);
  const newUser = await prisma.user.create({
    data: {
      id: createId({ prefix: "user_" }),
      name: user.name,
      email: user.email,
      passwordHash,
    },
  });
  return newUser;
};

export const authService = {
  getUserByEmail,
  createUser,
};
