import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Plus, Download } from "lucide-react";
import { toast } from "sonner";
import { parseRTLNumber } from "@/lib/numberUtils";

const MONTHS = [
  { key: "01", label: "ינואר", labelAr: "يناير", labelEn: "January" },
  { key: "02", label: "פברואר", labelAr: "فبراير", labelEn: "February" },
  { key: "03", label: "מרץ", labelAr: "مارس", labelEn: "March" },
  { key: "04", label: "אפריל", labelAr: "أبريل", labelEn: "April" },
  { key: "05", label: "מאי", labelAr: "مايو", labelEn: "May" },
  { key: "06", label: "יוני", labelAr: "يونيو", labelEn: "June" },
  { key: "07", label: "יולי", labelAr: "يوليو", labelEn: "July" },
  { key: "08", label: "אוגוסט", labelAr: "أغسطس", labelEn: "August" },
  { key: "09", label: "ספטמבר", labelAr: "سبتمبر", labelEn: "September" },
  { key: "10", label: "אוקטובר", labelAr: "أكتوبر", labelEn: "October" },
  { key: "11", label: "נובמבר", labelAr: "نوفمبر", labelEn: "November" },
  { key: "12", label: "דצמבר", labelAr: "ديسمبر", labelEn: "December" },
];

export default function KPI() {
  const { t, i18n } = useTranslation();
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [comparisonYear, setComparisonYear] = useState<string>((new Date().getFullYear() - 1).toString());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Manual data entry state
  const [manualData, setManualData] = useState<Record<string, Record<string, string>>>({
    [selectedYear]: {},
    [comparisonYear]: {},
  });

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

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (!Number.isFinite(numValue)) return "₪0";
    return `₪${numValue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const handleManualDataChange = (year: string, month: string, value: string) => {
    setManualData(prev => ({
      ...prev,
      [year]: {
        ...prev[year],
        [month]: value,
      }
    }));
  };

  const handleSaveManualData = () => {
    try {
      // Validate all entries
      for (const year in manualData) {
        for (const month in manualData[year]) {
          const value = manualData[year][month];
          if (value && !Number.isFinite(parseRTLNumber(value))) {
            toast.error(t("common.invalidNumber", "Invalid number format"));
            return;
          }
        }
      }
      
      // Save to localStorage for now (in production, would save to database)
      localStorage.setItem('kpi_manual_data', JSON.stringify(manualData));
      toast.success(t("common.saved", "Saved successfully"));
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(t("common.error", "Error saving data"));
    }
  };

  const handleExportData = () => {
    try {
      const data = {
        year: selectedYear,
        comparisonYear,
        manualData,
        timestamp: new Date().toISOString(),
      };
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kpi-data-${selectedYear}.json`;
      link.click();
      
      toast.success(t("common.exported", "Exported successfully"));
    } catch (error) {
      toast.error(t("common.error", "Error exporting data"));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1e3a5f]">{t("kpi.title", "מודל KPI")}</h1>
        <p className="text-muted-foreground mt-1">{t("kpi.subtitle", "מדדי ביצוע עיקריים והשוואה שנתית")}</p>
      </div>

      {/* Controls */}
      <div className="flex gap-4 flex-wrap items-end">
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
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {t("kpi.enterManualData", "הכנס נתונים ידני")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("kpi.enterManualData", "הכנס נתונים ידני")}</DialogTitle>
              <DialogDescription>
                {t("kpi.enterRevenueData", "הכנס הכנסות חודשיות לשנים שנבחרו")}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {[selectedYear, comparisonYear].map(year => (
                <div key={year} className="space-y-4">
                  <h3 className="font-semibold text-lg">{t("kpi.year", "שנה")}: {year}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {MONTHS.map(month => (
                      <div key={month.key} className="space-y-1">
                        <Label className="text-xs">{month.label}</Label>
                        <Input
                          type="text"
                          placeholder="0"
                          value={manualData[year]?.[month.key] || ""}
                          onChange={(e) => handleManualDataChange(year, month.key, e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 justify-end mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t("common.cancel", "ביטול")}
              </Button>
              <Button onClick={handleSaveManualData}>
                {t("common.save", "שמור")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline" className="gap-2" onClick={handleExportData}>
          <Download className="w-4 h-4" />
          {t("common.export", "ייצוא")}
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("kpi.totalRevenue", "סה״כ הכנסות")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(yearlyStats.totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("kpi.totalExpenses", "סה״כ הוצאות")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(yearlyStats.totalExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("kpi.totalProfit", "סה״כ רווח")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(yearlyStats.totalProfit)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("kpi.profitMargin", "שולי רווח")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {yearlyStats.profitMargin}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("kpi.monthlyRevenue", "הכנסות חודשיות")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockKPIData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" name={t("kpi.revenue", "הכנסות")} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("kpi.yearComparison", "השוואה שנתית")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="year1" fill="#1e3a5f" name={selectedYear} />
                <Bar dataKey="year2" fill="#F59E0B" name={comparisonYear} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("kpi.monthlyDetails", "פרטים חודשיים")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-2 px-2">{t("kpi.month", "חודש")}</th>
                  <th className="text-right py-2 px-2">{t("kpi.revenue", "הכנסות")}</th>
                  <th className="text-right py-2 px-2">{t("kpi.expenses", "הוצאות")}</th>
                  <th className="text-right py-2 px-2">{t("kpi.profit", "רווח")}</th>
                  <th className="text-right py-2 px-2">{t("kpi.monthChange", "שינוי חודשי")}</th>
                  <th className="text-right py-2 px-2">{t("kpi.yearChange", "שינוי שנתי")}</th>
                </tr>
              </thead>
              <tbody>
                {mockKPIData.map((row, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2">{row.month}</td>
                    <td className="py-2 px-2 text-green-600">{formatCurrency(row.revenue)}</td>
                    <td className="py-2 px-2 text-red-600">{formatCurrency(row.expenses)}</td>
                    <td className="py-2 px-2 text-blue-600">{formatCurrency(row.profit)}</td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1">
                        {row.changePercent >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={row.changePercent >= 0 ? "text-green-600" : "text-red-600"}>
                          {row.changePercent >= 0 ? "+" : ""}{row.changePercent}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1">
                        {row.yoyChange >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={row.yoyChange >= 0 ? "text-green-600" : "text-red-600"}>
                          {row.yoyChange >= 0 ? "+" : ""}{row.yoyChange}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
