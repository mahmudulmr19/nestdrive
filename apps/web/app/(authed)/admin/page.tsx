"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Users, UserCheck, UserX, Package } from "lucide-react";
import { api } from "~/lib/api";
import { DashboardBody } from "~/components/layout";

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number | undefined;
  icon: React.ElementType;
  loading: boolean;
}) {
  return (
    <div className="bg-card border-border flex flex-col gap-3 rounded-xl border p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
        <div className="bg-primary/10 flex size-9 items-center justify-center rounded-lg">
          <Icon className="text-primary size-4" />
        </div>
      </div>
      {loading ? (
        <div className="bg-muted/60 h-8 w-20 animate-pulse rounded" />
      ) : (
        <p className="text-3xl font-semibold tabular-nums">{value ?? "—"}</p>
      )}
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function DashboardPage() {
  const { data, isLoading } = api.useQuery("get", "/v1/admin/stats");

  const unverifiedUsers =
    data != null ? data.totalUsers - data.verifiedUsers : undefined;

  const chartData = data?.dailySignups.map((d) => ({
    ...d,
    date: formatDate(d.date),
  }));

  return (
    <DashboardBody
      title="Dashboard"
      description="Overview of your NestDrive platform."
    >
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={data?.totalUsers}
          icon={Users}
          loading={isLoading}
        />
        <StatCard
          label="Verified Users"
          value={data?.verifiedUsers}
          icon={UserCheck}
          loading={isLoading}
        />
        <StatCard
          label="Unverified Users"
          value={unverifiedUsers}
          icon={UserX}
          loading={isLoading}
        />
        <StatCard
          label="Subscription Packages"
          value={data?.totalPackages}
          icon={Package}
          loading={isLoading}
        />
      </div>

      {/* Signup growth chart */}
      <div className="bg-card border-border mt-6 rounded-xl border p-5 shadow-xs">
        <div className="mb-6">
          <p className="font-medium">User Signups</p>
          <p className="text-muted-foreground mt-0.5 text-sm">
            New registrations over the last 30 days
          </p>
        </div>

        {isLoading ? (
          <div className="bg-muted/60 h-56 animate-pulse rounded-lg" />
        ) : (
          <ResponsiveContainer width="100%" height={224}>
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ fontWeight: 600 }}
                itemStyle={{ color: "var(--color-primary)" }}
                cursor={{ stroke: "var(--color-border)" }}
              />
              <Area
                type="monotone"
                dataKey="count"
                name="Signups"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#signupGradient)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </DashboardBody>
  );
}
