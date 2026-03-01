import { prisma } from "~/db";
import { ApiError } from "~/utils/errors";

const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError({ code: "not_found", message: "User not found" });
  }

  return user;
};

export const usersService = { getUserById };
