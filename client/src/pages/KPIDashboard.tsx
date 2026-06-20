import { trpc } from "@/lib/trpc";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Target, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["#1e3a5f", "#F59E0B", "#5b9bd5", "#10B981", "#EF4444"];

export default function KPIDashboard() {
  const { t } = useTranslation();
  const { data: stats, isLoading } = trpc.dashboard.getStats.useQuery();

  const currency = t("common.currency");

  const formatCurrency = (value: number) =>
    `${currency}${value.toLocaleString("en-US")}`;

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

  // Calculate year-over-year comparison
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  // Mock data for yearly comparison
  const yearlyData = [
    { month: "Jan", [currentYear]: 45000, [previousYear]: 38000 },
    { month: "Feb", [currentYear]: 52000, [previousYear]: 41000 },
    { month: "Mar", [currentYear]: 48000, [previousYear]: 39000 },
    { month: "Apr", [currentYear]: 61000, [previousYear]: 50000 },
    { month: "May", [currentYear]: 55000, [previousYear]: 48000 },
    { month: "Jun", [currentYear]: 67000, [previousYear]: 52000 },
  ];

  const kpiMetrics = [
    {
      label: t("kpi.revenueGrowth"),
      value: "+18.5%",
      change: "positive",
      icon: TrendingUp,
    },
    {
      label: t("kpi.clientRetention"),
      value: "94.2%",
      change: "positive",
      icon: Target,
    },
    {
      label: t("kpi.profitMargin"),
      value: `${(stats?.profitMargin || 0).toFixed(1)}%`,
      change: stats?.profitMargin && stats.profitMargin > 30 ? "positive" : "negative",
      icon: Zap,
    },
    {
      label: t("kpi.costPerLead"),
      value: stats?.activeLeadsCount ? formatCurrency((stats.totalExpense || 0) / stats.activeLeadsCount) : "N/A",
      change: "neutral",
      icon: TrendingDown,
    },
  ];

  const conversionData = [
    { stage: t("kpi.leads"), value: stats?.activeLeadsCount || 0 },
    { stage: t("kpi.clients"), value: stats?.activeClientsCount || 0 },
    { stage: t("kpi.activeProjects"), value: Math.floor((stats?.activeClientsCount || 0) * 0.7) },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("kpi.title")}</h1>
        <p className="text-gray-600">{t("kpi.subtitle")}</p>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiMetrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${metric.change === "positive" ? "text-green-600" : metric.change === "negative" ? "text-red-600" : "text-gray-600"}`} />
                  {metric.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{metric.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Year-over-Year Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>{t("kpi.yearOverYear")}</CardTitle>
            <CardDescription>{t("kpi.revenueComparison")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey={currentYear.toString()} stroke="#1e3a5f" strokeWidth={2} />
                <Line type="monotone" dataKey={previousYear.toString()} stroke="#cbd5e1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>{t("kpi.conversionFunnel")}</CardTitle>
            <CardDescription>{t("kpi.leadToClient")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1e3a5f" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{t("kpi.performanceSummary")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{t("kpi.totalRevenue")}</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats?.totalRevenue || 0)}</p>
              <p className="text-xs text-gray-500">+12.5% {t("kpi.fromLastMonth")}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{t("kpi.totalExpense")}</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(stats?.totalExpense || 0)}</p>
              <p className="text-xs text-gray-500">-5.2% {t("kpi.fromLastMonth")}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{t("kpi.netProfit")}</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats?.netProfit || 0)}</p>
              <p className="text-xs text-gray-500">+18.3% {t("kpi.fromLastMonth")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
