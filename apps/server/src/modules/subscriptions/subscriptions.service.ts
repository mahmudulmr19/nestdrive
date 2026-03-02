import { prisma } from "~/db";
import { ApiError } from "~/utils/errors";
import type { SubscribeInput } from "@nestdrive/schemas/subscription";

const getActiveSubscription = async (userId: string) => {
  return prisma.userSubscription.findFirst({
    where: { userId, endedAt: null },
    include: { package: true },
    orderBy: { startedAt: "desc" },
  });
};

const subscribe = async (userId: string, data: SubscribeInput) => {
  const pkg = await prisma.subscriptionPackage.findUnique({
    where: { id: data.packageId },
  });
  if (!pkg) {
    throw new ApiError({ code: "not_found", message: "Package not found." });
  }

  const current = await getActiveSubscription(userId);
  if (current?.packageId === data.packageId) {
    throw new ApiError({
      code: "conflict",
      message: "You are already subscribed to this package.",
    });
  }

  return prisma.$transaction(async (tx) => {
    if (current) {
      await tx.userSubscription.update({
        where: { id: current.id },
        data: { endedAt: new Date() },
      });
    }

    return tx.userSubscription.create({
      data: { userId, packageId: data.packageId },
      include: { package: true },
    });
  });
};

const getHistory = async (userId: string) => {
  return prisma.userSubscription.findMany({
    where: { userId },
    include: { package: true },
    orderBy: { startedAt: "desc" },
  });
};

export const subscriptionsService = {
  getActiveSubscription,
  subscribe,
  getHistory,
};
