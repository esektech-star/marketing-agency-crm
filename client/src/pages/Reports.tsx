import { trpc } from "@/lib/trpc";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Reports() {
  const { t } = useTranslation();
  const { data: leads = [], isLoading: leadsLoading } = trpc.leads.list.useQuery();
  const { data: transactions = [], isLoading: transactionsLoading } = trpc.transactions.list.useQuery();
  const { data: tasks = [], isLoading: tasksLoading } = trpc.tasks.list.useQuery();
  const { data: clients = [], isLoading: clientsLoading } = trpc.clients.list.useQuery();

  const isLoading = leadsLoading || transactionsLoading || tasksLoading || clientsLoading;

  const leadsByStage = leads.reduce((acc: any, lead: any) => {
    const stage = lead.stage;
    const existing = acc.find((item: any) => item.name === stage);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: stage, value: 1 });
    }
    return acc;
  }, []);

  const monthlyData: any = {};
  transactions.forEach((transaction: any) => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { month: monthKey, revenue: 0, expense: 0 };
    }
    
    if (transaction.type === "revenue") {
      monthlyData[monthKey].revenue += transaction.amount;
    } else {
      monthlyData[monthKey].expense += transaction.amount;
    }
  });

  const monthlyChartData = Object.values(monthlyData).sort((a: any, b: any) => a.month.localeCompare(b.month));

  const tasksByStatus = tasks.reduce((acc: any, task: any) => {
    const status = task.status;
    const existing = acc.find((item: any) => item.name === status);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: status, value: 1 });
    }
    return acc;
  }, []);

  const clientsByStatus = clients.reduce((acc: any, client: any) => {
    const status = client.status;
    const existing = acc.find((item: any) => item.name === status);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: status, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const handleDownloadReport = () => {
    const reportData = {
      generatedAt: new Date().toLocaleString('ar-SA'),
      summary: {
        totalLeads: leads.length,
        totalClients: clients.length,
        totalTasks: tasks.length,
        totalTransactions: transactions.length,
        totalRevenue: transactions.filter((t: any) => t.type === "revenue").reduce((sum: number, t: any) => sum + t.amount, 0),
        totalExpense: transactions.filter((t: any) => t.type === "expense").reduce((sum: number, t: any) => sum + t.amount, 0),
      },
      leadsByStage,
      tasksByStatus,
      clientsByStatus,
      monthlyData: monthlyChartData,
    };

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2)));
    element.setAttribute("download", `report-${new Date().toISOString().split('T')[0]}.json`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t("reports.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("reports.subtitle")}</p>
        </div>
        <Button onClick={handleDownloadReport} className="bg-[#1e3a5f] hover:bg-[#2d5080]">
          <Download className="w-4 h-4 ms-2" />
          {t("reports.download")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("reports.totalLeads")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{leads.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("reports.potentialCustomers")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("reports.totalClients")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{clients.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("reports.activeClients")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("reports.totalTasks")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{tasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("reports.tasksInProgress")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("reports.netProfit")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div dir="ltr" className={`text-3xl font-bold ${
              (transactions.filter((t: any) => t.type === "revenue").reduce((sum: number, t: any) => sum + t.amount, 0) -
              transactions.filter((t: any) => t.type === "expense").reduce((sum: number, t: any) => sum + t.amount, 0)) >= 0
              ? 'text-emerald-600'
              : 'text-red-600'
            }`}>
              {`\u20AA${(transactions.filter((t: any) => t.type === "revenue").reduce((sum: number, t: any) => sum + t.amount, 0) -
              transactions.filter((t: any) => t.type === "expense").reduce((sum: number, t: any) => sum + t.amount, 0)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("reports.leadsByStage")}</CardTitle>
            <CardDescription>{t("reports.leadsByStageDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {leadsByStage.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={leadsByStage}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {leadsByStage.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">{t("common.noData")}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("reports.tasksByStatus")}</CardTitle>
            <CardDescription>{t("reports.tasksByStatusDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {tasksByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tasksByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">{t("common.noData")}</div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("reports.monthlyRevenue")}</CardTitle>
            <CardDescription>{t("reports.monthlyRevenueDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" name={t("reports.revenue")} />
                  <Line type="monotone" dataKey="expense" stroke="#ef4444" name={t("reports.expense")} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">{t("common.noData")}</div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("reports.clientsByStatus")}</CardTitle>
            <CardDescription>{t("reports.clientsByStatusDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {clientsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={clientsByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">{t("common.noData")}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
