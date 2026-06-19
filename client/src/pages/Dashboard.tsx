import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, CheckCircle2, TrendingUp, Zap, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const COLORS = ["#1e3a5f", "#F59E0B", "#5b9bd5", "#10B981"];

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { data: stats, isLoading } = trpc.dashboard.getStats.useQuery();

  const currency = t("common.currency");

  const formatCurrency = (value: number) =>
    `${currency}${value.toLocaleString("en-US")}`;

  // تحية حسب وقت اليوم
  const hour = new Date().getHours();
  const timeKey =
    hour >= 5 && hour < 12
      ? "morning"
      : hour >= 12 && hour < 17
        ? "afternoon"
        : hour >= 17 && hour < 21
          ? "evening"
          : "night";
  const greeting = t(`dashboard.greeting.${timeKey}`);
  // رسائل تحفيزية متغيرة
  const motivations = t("dashboard.motivations", { returnObjects: true }) as string[];
  const motivation = Array.isArray(motivations) && motivations.length > 0
    ? motivations[new Date().getDate() % motivations.length]
    : "";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const revenueData = [
    { month: t("dashboard.revenue"), [t("dashboard.revenue")]: stats?.totalRevenue || 0, [t("dashboard.expenses")]: stats?.totalExpense || 0 },
  ];

  const monthlyData = (stats?.monthlyData as Array<{ month: string; revenue: number; expense: number }> | undefined) || [];
  const chartData = monthlyData.length > 0
    ? monthlyData.map((m) => ({
        month: m.month,
        [t("dashboard.revenue")]: m.revenue,
        [t("dashboard.expenses")]: m.expense,
      }))
    : revenueData;

  const leadsBySource = (stats?.leadsBySource as Array<{ name: string; value: number }> | undefined) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-l from-[#1e3a5f] to-[#2d5080] rounded-xl p-6 text-white shadow-lg">
        <p className="text-blue-100 text-sm mb-1">{greeting}{user?.name ? `، ${user.name}` : ""}</p>
        <h1 className="text-3xl font-bold mb-2">
          {t("dashboard.welcome")}
        </h1>
        {motivation && <p className="text-blue-50 text-lg">{motivation}</p>}
        <p className="text-blue-100">{t("dashboard.subtitle")}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow border-r-4 border-r-[#1e3a5f]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-[#1e3a5f]" />
              {t("dashboard.activeClients")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1e3a5f]">{stats?.activeClientsCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-r-4 border-r-[#F59E0B]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" />
              {t("dashboard.pendingTasks")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#F59E0B]">{stats?.pendingTasksCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-r-4 border-r-[#5b9bd5]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#5b9bd5]" />
              {t("dashboard.newLeads")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#5b9bd5]">{stats?.activeLeadsCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-r-4 border-r-[#10B981]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#10B981]" />
              {t("dashboard.monthlyRevenue")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#10B981]">
              {formatCurrency(stats?.totalRevenue || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-r-4 border-r-[#EF4444]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#EF4444]" />
              {t("dashboard.monthlySubscriptions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#EF4444]">
              {formatCurrency(stats?.totalSubscriptionsCost || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("dashboard.revenueVsExpenses")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={t("dashboard.revenue")} fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                <Bar dataKey={t("dashboard.expenses")} fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.leadsBySource")}</CardTitle>
          </CardHeader>
          <CardContent>
            {leadsBySource.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={leadsBySource}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {leadsBySource.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                {t("dashboard.noLeads")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("transactions.totalIncome")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#10B981]">
              {formatCurrency(stats?.totalRevenue || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("transactions.totalExpenses")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats?.totalExpense || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("transactions.netProfit")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(stats?.netProfit || 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {(stats?.netProfit || 0) >= 0 ? "+" : ""}{formatCurrency(stats?.netProfit || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("dashboard.breakEvenClients", "Break-even Point")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#8B5CF6]">
              {stats?.breakEvenClients || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t("dashboard.breakEvenDesc", "Clients to break even")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
