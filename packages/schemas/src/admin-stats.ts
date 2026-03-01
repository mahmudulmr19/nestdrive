import * as z from "zod/v4";

export const DailySignupSchema = z.object({
  date: z.string(),
  count: z.number(),
});

export const AdminStatsSchema = z
  .object({
    totalUsers: z.number(),
    verifiedUsers: z.number(),
    totalPackages: z.number(),
    dailySignups: z.array(DailySignupSchema),
  })
  .meta({ id: "AdminStats" });

export type AdminStats = z.infer<typeof AdminStatsSchema>;
export type DailySignup = z.infer<typeof DailySignupSchema>;
