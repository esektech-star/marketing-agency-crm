import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function KPI() {
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [comparisonYear, setComparisonYear] = useState<string>((new Date().getFullYear() - 1).toString());

  // Mock data - in production, this would come from tRPC
  const mockKPIData = [
    { month: "ינואר", revenue: 45000, expenses: 15000, profit: 30000, changePercent: 5.2, yoyChange: 12.3 },
    { month: "פברואר", revenue: 52000, expenses: 16000, profit: 36000, changePercent: 15.6, yoyChange: 18.5 },
    { month: "מרץ", revenue: 48000, expenses: 15500, profit: 32500, changePercent: -7.7, yoyChange: 8.2 },
    { month: "אפריל", revenue: 61000, expenses: 17000, profit: 44000, changePercent: 27.1, yoyChange: 22.1 },
    { month: "מאי", revenue: 58000, expenses: 16500, profit: 41500, changePercent: -4.9, yoyChange: 15.3 },
    { month: "יוני", revenue: 65000, expenses: 18000, profit: 47000, changePercent: 12.1, yoyChange: 25.6 },
    { month: "יולי", revenue: 72000, expenses: 19000, profit: 53000, changePercent: 10.8, yoyChange: 30.2 },
    { month: "אוגוסט", revenue: 68000, expenses: 18500, profit: 49500, changePercent: -5.6, yoyChange: 26.8 },
    { month: "ספטמבר", revenue: 75000, expenses: 20000, profit: 55000, changePercent: 10.3, yoyChange: 32.1 },
    { month: "אוקטובר", revenue: 82000, expenses: 21000, profit: 61000, changePercent: 9.3, yoyChange: 38.5 },
    { month: "נובמבר", revenue: 88000, expenses: 22000, profit: 66000, changePercent: 7.3, yoyChange: 42.3 },
    { month: "דצמבר", revenue: 95000, expenses: 23000, profit: 72000, changePercent: 8.0, yoyChange: 48.2 },
  ];

  const mockComparisonData = [
    { month: "ינואר", year1: 45000, year2: 40000 },
    { month: "פברואר", year1: 52000, year2: 44000 },
    { month: "מרץ", year1: 48000, year2: 44000 },
    { month: "אפריל", year1: 61000, year2: 50000 },
    { month: "מאי", year1: 58000, year2: 50000 },
    { month: "יוני", year1: 65000, year2: 52000 },
    { month: "יולי", year1: 72000, year2: 55000 },
    { month: "אוגוסט", year1: 68000, year2: 54000 },
    { month: "ספטמבר", year1: 75000, year2: 57000 },
    { month: "אוקטובר", year1: 82000, year2: 59000 },
    { month: "נובמבר", year1: 88000, year2: 62000 },
    { month: "דצמבר", year1: 95000, year2: 64000 },
  ];

  const yearlyStats = useMemo(() => {
    const totalRevenue = mockKPIData.reduce((sum, d) => sum + d.revenue, 0);
    const totalExpenses = mockKPIData.reduce((sum, d) => sum + d.expenses, 0);
    const totalProfit = mockKPIData.reduce((sum, d) => sum + d.profit, 0);
    const avgMonthlyRevenue = totalRevenue / 12;
    const avgMonthlyProfit = totalProfit / 12;

    return {
      totalRevenue,
      totalExpenses,
      totalProfit,
      avgMonthlyRevenue,
      avgMonthlyProfit,
      profitMargin: ((totalProfit / totalRevenue) * 100).toFixed(2),
    };
  }, []);

  const formatCurrency = (value: number) => {
    return `₪${(value || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1e3a5f]">{t("kpi.title", "מודל KPI")}</h1>
        <p className="text-muted-foreground mt-1">{t("kpi.subtitle", "מדדי ביצוע עיקריים והשוואה שנתית")}</p>
      </div>

      {/* Year Selection */}
      <div className="flex gap-4 flex-wrap">
        <div>
          <label className="text-sm font-medium">{t("kpi.selectYear", "בחר שנה")}</label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">{t("kpi.comparisonYear", "שנה להשוואה")}</label>
          <Select value={comparisonYear} onValueChange={setComparisonYear}>
            <SelectTrigger className="w-32 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("kpi.totalRevenue", "סה\"כ הכנסות")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(yearlyStats.totalRevenue)}</div>
            <p className="text-xs text-green-600 mt-1">↑ 12.5% {t("kpi.fromLastYear", "מהשנה שעברה")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("kpi.totalExpenses", "סה\"כ הוצאות")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(yearlyStats.totalExpenses)}</div>
            <p className="text-xs text-red-600 mt-1">↑ 8.3% {t("kpi.fromLastYear", "מהשנה שעברה")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("kpi.netProfit", "רווח נקי")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(yearlyStats.totalProfit)}</div>
            <p className="text-xs text-green-600 mt-1">↑ 15.2% {t("kpi.fromLastYear", "מהשנה שעברה")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("kpi.avgMonthlyRevenue", "ממוצע חודשי")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(yearlyStats.avgMonthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("kpi.perMonth", "לחודש")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("kpi.profitMargin", "מרווח רווח")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{yearlyStats.profitMargin}%</div>
            <p className="text-xs text-green-600 mt-1">↑ 2.1% {t("kpi.improvement", "שיפור")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t("kpi.monthlyRevenue", "הכנסות חודשיות")}</CardTitle>
          <CardDescription>{t("kpi.revenueAndExpenses", "הכנסות והוצאות לפי חודש")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockKPIData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="revenue" fill="#3b82f6" name={t("kpi.revenue", "הכנסות")} />
              <Bar dataKey="expenses" fill="#ef4444" name={t("kpi.expenses", "הוצאות")} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Year Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t("kpi.yearComparison", "השוואה שנתית")}</CardTitle>
          <CardDescription>{t("kpi.compareYears", `השוואה בין ${selectedYear} ל-${comparisonYear}`)}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Line type="monotone" dataKey="year1" stroke="#3b82f6" name={selectedYear} strokeWidth={2} />
              <Line type="monotone" dataKey="year2" stroke="#10b981" name={comparisonYear} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Change Percentage */}
      <Card>
        <CardHeader>
          <CardTitle>{t("kpi.monthlyChange", "שינוי חודשי")}</CardTitle>
          <CardDescription>{t("kpi.percentageChange", "אחוז שינוי מחודש לחודש")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockKPIData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `${(value as number).toFixed(2)}%`} />
              <Legend />
              <Line type="monotone" dataKey="changePercent" stroke="#8b5cf6" name={t("kpi.monthlyChange", "שינוי חודשי")} strokeWidth={2} />
              <Line type="monotone" dataKey="yoyChange" stroke="#f59e0b" name={t("kpi.yearOverYear", "שינוי שנתי")} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* KPI Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("kpi.detailedTable", "טבלה מפורטת")}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-right py-2 px-4">{t("kpi.month", "חודש")}</th>
                <th className="text-right py-2 px-4">{t("kpi.revenue", "הכנסות")}</th>
                <th className="text-right py-2 px-4">{t("kpi.expenses", "הוצאות")}</th>
                <th className="text-right py-2 px-4">{t("kpi.profit", "רווח")}</th>
                <th className="text-right py-2 px-4">{t("kpi.monthlyChange", "שינוי חודשי")}</th>
                <th className="text-right py-2 px-4">{t("kpi.yearOverYear", "שינוי שנתי")}</th>
              </tr>
            </thead>
            <tbody>
              {mockKPIData.map((row, idx) => (
                <tr key={idx} className="border-b hover:bg-slate-50">
                  <td className="py-2 px-4">{row.month}</td>
                  <td className="py-2 px-4">{formatCurrency(row.revenue)}</td>
                  <td className="py-2 px-4">{formatCurrency(row.expenses)}</td>
                  <td className="py-2 px-4 text-green-600 font-medium">{formatCurrency(row.profit)}</td>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-1">
                      {row.changePercent > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={row.changePercent > 0 ? "text-green-600" : "text-red-600"}>
                        {row.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <span className="text-blue-600 font-medium">{row.yoyChange.toFixed(2)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
