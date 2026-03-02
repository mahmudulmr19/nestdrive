import * as z from "zod/v4";
import { SubscriptionPackageSchema } from "./subscription-package";

export const SubscriptionSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    packageId: z.string(),
    startedAt: z.iso.datetime(),
    endedAt: z.iso.datetime().nullable(),
    package: SubscriptionPackageSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .meta({ id: "Subscription" });

export const SubscribeSchema = z
  .object({
    packageId: z.string().min(1, "Package ID is required"),
  })
  .meta({ id: "SubscribeInput" });

export type Subscription = z.infer<typeof SubscriptionSchema>;
export type SubscribeInput = z.infer<typeof SubscribeSchema>;
