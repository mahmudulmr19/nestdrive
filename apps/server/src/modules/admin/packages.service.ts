import { prisma } from "~/db";
import { ApiError } from "~/utils/errors";
import type {
  CreateSubscriptionPackageInput,
  UpdateSubscriptionPackageInput,
} from "@nestdrive/schemas/subscription-package";

const listPackages = async () => {
  return prisma.subscriptionPackage.findMany({
    orderBy: { createdAt: "asc" },
  });
};

const getPackage = async (id: string) => {
  const pkg = await prisma.subscriptionPackage.findUnique({ where: { id } });
  if (!pkg) {
    throw new ApiError({ code: "not_found", message: "Package not found." });
  }
  return pkg;
};

const createPackage = async (data: CreateSubscriptionPackageInput) => {
  const existing = await prisma.subscriptionPackage.findUnique({
    where: { name: data.name },
  });
  if (existing) {
    throw new ApiError({
      code: "conflict",
      message: `A package named "${data.name}" already exists.`,
    });
  }
  return prisma.subscriptionPackage.create({ data });
};

const updatePackage = async (
  id: string,
  data: UpdateSubscriptionPackageInput,
) => {
  await getPackage(id);

  if (data.name) {
    const existing = await prisma.subscriptionPackage.findFirst({
      where: { name: data.name, NOT: { id } },
    });
    if (existing) {
      throw new ApiError({
        code: "conflict",
        message: `A package named "${data.name}" already exists.`,
      });
    }
  }

  return prisma.subscriptionPackage.update({ where: { id }, data });
};

const deletePackage = async (id: string) => {
  await getPackage(id);
  await prisma.subscriptionPackage.delete({ where: { id } });
};

export const packagesService = {
  listPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage,
};
