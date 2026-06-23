import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, CheckCircle2, TrendingUp, Zap, Package, AlertCircle, Plus, Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

const COLORS = ["#1e3a5f", "#F59E0B", "#5b9bd5", "#10B981"];

export default function Dashboard() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he" || i18n.language === "ar";
  
  const { data: stats, isLoading } = trpc.dashboard.getStats.useQuery();
  const { data: tasks = [] } = trpc.tasks.list.useQuery() as any;
  const { data: campaigns = [] } = trpc.campaigns.list.useQuery() as any;

  const currency = t("common.currency");

  const formatCurrency = (value: number) =>
    `${currency}${value.toLocaleString("en-US")}`;

  // Greeting based on time
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
  
  // Motivational messages
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

  // Calculate today's focus items
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTasks = (tasks as any[])?.filter((t: any) => {
    const taskDate = new Date(t.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime() && t.status !== "done";
  }) || [];

  const overdueTasks = (tasks as any[])?.filter((t: any) => {
    const taskDate = new Date(t.dueDate);
    return taskDate < today && t.status !== "done";
  }) || [];

  const highPriorityTasks = (tasks as any[])?.filter((t: any) => 
    t.priority === "high" && t.status !== "done"
  ) || [];

  // Campaign Overview
  const activeCampaigns = (campaigns as any[])?.filter((c: any) => c.status === "active") || [];
  const totalCampaignSpend = activeCampaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
  const totalCampaignLeads = activeCampaigns.reduce((sum, c) => sum + (c.leads || 0), 0);
  const avgCPL = totalCampaignLeads > 0 ? totalCampaignSpend / totalCampaignLeads : 0;

  // Alerts
  const highCPLCampaigns = activeCampaigns.filter((c: any) => {
    const cpl = c.leads > 0 ? c.budget / c.leads : 0;
    return cpl > 50; // Alert if CPL > 50
  });

  const lowPerformanceCampaigns = activeCampaigns.filter((c: any) => {
    const roi = c.revenue ? ((c.revenue - c.budget) / c.budget) * 100 : -100;
    return roi < 0; // Alert if ROI negative
  });

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
              {t("dashboard.breakEvenPoint")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#EF4444]">
              {formatCurrency(stats?.breakEvenPoint || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TODAY FOCUS SECTION */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {/* Today's Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              {t("dashboard.todayFocus", "משימות היום")}
            </CardTitle>
            <CardDescription>{todayTasks.length} {t("common.tasks", "משימות")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayTasks.length > 0 ? (
                todayTasks.slice(0, 3).map((task: any) => (
                  <div key={task.id} className="text-sm p-2 bg-blue-50 rounded border-l-2 border-blue-600">
                    <p className="font-medium truncate">{task.title}</p>
                    <p className="text-xs text-gray-600">{task.client}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">{t("common.noData", "אין נתונים")}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Overdue Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              {t("dashboard.overdueTasks", "משימות מעוכבות")}
            </CardTitle>
            <CardDescription>{overdueTasks.length} {t("common.tasks", "משימות")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueTasks.length > 0 ? (
                overdueTasks.slice(0, 3).map((task: any) => (
                  <div key={task.id} className="text-sm p-2 bg-red-50 rounded border-l-2 border-red-600">
                    <p className="font-medium truncate">{task.title}</p>
                    <p className="text-xs text-gray-600">{task.client}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">{t("common.noData", "אין נתונים")}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* High Priority */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-600" />
              {t("dashboard.highPriority", "עדיפות גבוהה")}
            </CardTitle>
            <CardDescription>{highPriorityTasks.length} {t("common.tasks", "משימות")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {highPriorityTasks.length > 0 ? (
                highPriorityTasks.slice(0, 3).map((task: any) => (
                  <div key={task.id} className="text-sm p-2 bg-orange-50 rounded border-l-2 border-orange-600">
                    <p className="font-medium truncate">{task.title}</p>
                    <p className="text-xs text-gray-600">{task.client}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">{t("common.noData", "אין נתונים")}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CAMPAIGN OVERVIEW SECTION */}
      <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("dashboard.activeCampaigns", "קמפיינים פעילים")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{activeCampaigns.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("dashboard.campaignSpend", "הוצאות קמפיינים")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{formatCurrency(totalCampaignSpend)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("dashboard.campaignLeads", "לידים מקמפיינים")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalCampaignLeads}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("dashboard.avgCPL", "CPL ממוצע")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">{formatCurrency(avgCPL)}</div>
          </CardContent>
        </Card>
      </div>

      {/* ALERTS SECTION */}
      {(highCPLCampaigns.length > 0 || lowPerformanceCampaigns.length > 0) && (
        <Card className="border-l-4 border-l-red-600 bg-red-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              {t("dashboard.alerts", "אזהרות")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highCPLCampaigns.length > 0 && (
                <div>
                  <p className="font-medium text-red-700 mb-1">⚠️ {t("dashboard.highCPLAlert", "CPL גבוה מדי")}</p>
                  <div className="text-sm text-gray-700">
                    {highCPLCampaigns.map((c: any) => (
                      <div key={c.id}>{c.name}</div>
                    ))}
                  </div>
                </div>
              )}
              {lowPerformanceCampaigns.length > 0 && (
                <div>
                  <p className="font-medium text-red-700 mb-1">⚠️ {t("dashboard.lowPerformanceAlert", "ביצוע נמוך")}</p>
                  <div className="text-sm text-gray-700">
                    {lowPerformanceCampaigns.map((c: any) => (
                      <div key={c.id}>{c.name}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* QUICK ACTIONS SECTION */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.quickActions", "פעולות מהירות")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`flex flex-wrap gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Link href="/clients">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                {t("dashboard.newClient", "לקוח חדש")}
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                {t("dashboard.newCampaign", "קמפיין חדש")}
              </Button>
            </Link>
            <Link href="/tasks">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                {t("dashboard.newTask", "משימה חדשה")}
              </Button>
            </Link>
            <Link href="/leads">
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                {t("dashboard.newLead", "ליד חדש")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>
    </div>
  );
}
