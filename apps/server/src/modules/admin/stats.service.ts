import { prisma } from "~/db";

const getStats = async () => {
  const [totalUsers, verifiedUsers, totalPackages, rawSignups] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { emailVerified: { not: null } } }),
      prisma.subscriptionPackage.count(),
      prisma.$queryRaw<{ date: Date; count: bigint }[]>`
        SELECT DATE(created_at) AS date, COUNT(*) AS count
        FROM users
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
    ]);

  // Build a full 30-day array with zero-filled gaps
  const today = new Date();
  const dailySignups: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dailySignups.push({ date: d.toISOString().split("T")[0]!, count: 0 });
  }

  for (const row of rawSignups) {
    const dateStr = new Date(row.date).toISOString().split("T")[0]!;
    const entry = dailySignups.find((d) => d.date === dateStr);
    if (entry) entry.count = Number(row.count);
  }

  return { totalUsers, verifiedUsers, totalPackages, dailySignups };
};

export const statsService = { getStats };
