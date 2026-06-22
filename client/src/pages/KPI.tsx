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
import { trpc } from "@/lib/trpc";

const PERIODS = [
  { key: "quarterly", label: "רבעוני", labelAr: "ربع سنوي", labelEn: "Quarterly", months: 3 },
  { key: "half-yearly", label: "חצי שנתי", labelAr: "نصف سنوي", labelEn: "Half-Yearly", months: 6 },
  { key: "yearly", label: "שנתי", labelAr: "سنوي", labelEn: "Yearly", months: 12 },
];

const QUARTERS = [
  { key: "Q1", label: "Q1", months: ["01", "02", "03"] },
  { key: "Q2", label: "Q2", months: ["04", "05", "06"] },
  { key: "Q3", label: "Q3", months: ["07", "08", "09"] },
  { key: "Q4", label: "Q4", months: ["10", "11", "12"] },
];

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
  const isRTL = i18n.language === "he" || i18n.language === "ar";
  
  // Fetch clients
  const { data: clients = [] } = trpc.clients.list.useQuery() as any;
  
  // State
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("yearly");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [comparisonYear, setComparisonYear] = useState<string>((new Date().getFullYear() - 1).toString());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Manual data entry state - structure: { year: { month: revenue } }
  const [manualData, setManualData] = useState<Record<string, Record<string, string>>>({
    [selectedYear]: {},
    [comparisonYear]: {},
  });

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
      const key = `kpi_client_${selectedClientId}_${selectedYear}`;
      localStorage.setItem(key, JSON.stringify(manualData));
      toast.success(t("common.saved", "Saved successfully"));
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(t("common.error", "Error saving data"));
    }
  };

  const handleExportData = () => {
    try {
      const selectedClient = clients.find((c: any) => c.id === parseInt(selectedClientId));
      const data = {
        client: selectedClient?.name || "Unknown",
        year: selectedYear,
        comparisonYear,
        period: selectedPeriod,
        manualData,
        timestamp: new Date().toISOString(),
      };
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kpi-${selectedClient?.name}-${selectedYear}.json`;
      link.click();
      
      toast.success(t("common.exported", "Exported successfully"));
    } catch (error) {
      toast.error(t("common.error", "Error exporting data"));
    }
  };

  // Get period label
  const getPeriodLabel = () => {
    const period = PERIODS.find(p => p.key === selectedPeriod);
    return period?.label || "";
  };

  // Calculate comparison data
  const comparisonData = useMemo(() => {
    if (!selectedPeriod) return [];
    
    if (selectedPeriod === "quarterly") {
      return QUARTERS.map(q => {
        const year1Revenue = q.months.reduce((sum, m) => {
          const val = parseRTLNumber(manualData[selectedYear]?.[m] || "0");
          return sum + (Number.isFinite(val) ? val : 0);
        }, 0);
        
        const year2Revenue = q.months.reduce((sum, m) => {
          const val = parseRTLNumber(manualData[comparisonYear]?.[m] || "0");
          return sum + (Number.isFinite(val) ? val : 0);
        }, 0);
        
        return {
          period: q.key,
          [selectedYear]: year1Revenue,
          [comparisonYear]: year2Revenue,
          growth: year2Revenue > 0 ? ((year1Revenue - year2Revenue) / year2Revenue * 100).toFixed(1) : 0,
        };
      });
    }
    
    // For half-yearly and yearly, group months
    const monthGroups = selectedPeriod === "half-yearly" 
      ? [
          { label: "H1", months: ["01", "02", "03", "04", "05", "06"] },
          { label: "H2", months: ["07", "08", "09", "10", "11", "12"] },
        ]
      : [
          { label: selectedYear, months: MONTHS.map(m => m.key) },
        ];
    
    return monthGroups.map(group => {
      const year1Revenue = group.months.reduce((sum, m) => {
        const val = parseRTLNumber(manualData[selectedYear]?.[m] || "0");
        return sum + (Number.isFinite(val) ? val : 0);
      }, 0);
      
      const year2Revenue = group.months.reduce((sum, m) => {
        const val = parseRTLNumber(manualData[comparisonYear]?.[m] || "0");
        return sum + (Number.isFinite(val) ? val : 0);
      }, 0);
      
      return {
        period: group.label,
        [selectedYear]: year1Revenue,
        [comparisonYear]: year2Revenue,
        growth: year2Revenue > 0 ? ((year1Revenue - year2Revenue) / year2Revenue * 100).toFixed(1) : 0,
      };
    });
  }, [selectedPeriod, selectedYear, comparisonYear, manualData]);

  // Calculate yearly stats
  const yearlyStats = useMemo(() => {
    const totalRevenue = Object.values(manualData[selectedYear] || {}).reduce((sum, val) => {
      const num = parseRTLNumber(val);
      return sum + (Number.isFinite(num) ? num : 0);
    }, 0);

    const comparisonRevenue = Object.values(manualData[comparisonYear] || {}).reduce((sum, val) => {
      const num = parseRTLNumber(val);
      return sum + (Number.isFinite(num) ? num : 0);
    }, 0);

    const growth = comparisonRevenue > 0 
      ? ((totalRevenue - comparisonRevenue) / comparisonRevenue * 100).toFixed(2)
      : 0;

    return {
      totalRevenue,
      comparisonRevenue,
      growth,
      avgMonthlyRevenue: totalRevenue / 12,
    };
  }, [selectedYear, comparisonYear, manualData]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1e3a5f]">{t("kpi.title", "ניתוח KPI")}</h1>
        <p className="text-muted-foreground mt-1">{t("kpi.subtitle", "ניתוח ביצוע עסקי של לקוחות")}</p>
      </div>

      {/* Controls */}
      <div className={`flex gap-4 flex-wrap items-end ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <label className="text-sm font-medium">{t("kpi.selectClient", "בחר לקוח")}</label>
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger className="w-48 mt-1">
              <SelectValue placeholder={t("kpi.selectClient", "בחר לקוח")} />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client: any) => (
                <SelectItem key={client.id} value={client.id.toString()}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">{t("kpi.selectPeriod", "בחר תקופה")}</label>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map(p => (
                <SelectItem key={p.key} value={p.key}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">{t("kpi.selectYear", "בחר שנה")}</label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023">2023</SelectItem>
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
              <SelectItem value="2022">2022</SelectItem>
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
              {t("kpi.enterRevenue", "הכנס הכנסות")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("kpi.enterRevenue", "הכנס הכנסות")}</DialogTitle>
              <DialogDescription>
                {t("kpi.enterMonthlyRevenue", "הכנס הכנסות חודשיות לשנים שנבחרו")}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {[selectedYear, comparisonYear].map(year => (
                <div key={year} className="space-y-4">
                  <h3 className="font-semibold text-lg">{t("kpi.year", "שנה")}: {year}</h3>
                  <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${isRTL ? 'rtl' : ''}`}>
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
            
            <div className={`flex gap-2 justify-end mt-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("kpi.totalRevenue", "סה״כ הכנסות")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(yearlyStats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedYear}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("kpi.comparisonRevenue", "הכנסות השוואה")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(yearlyStats.comparisonRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {comparisonYear}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("kpi.growth", "גדילה")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${Number(yearlyStats.growth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Number(yearlyStats.growth) >= 0 ? '+' : ''}{yearlyStats.growth}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("kpi.yearOverYear", "שנה על שנה")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t("kpi.periodComparison", "השוואת תקופות")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey={selectedYear} fill="#1e3a5f" name={selectedYear} />
              <Bar dataKey={comparisonYear} fill="#F59E0B" name={comparisonYear} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("kpi.detailedComparison", "השוואה מפורטת")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className={`py-2 px-2 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t("kpi.period", "תקופה")}
                  </th>
                  <th className={`py-2 px-2 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                    {selectedYear}
                  </th>
                  <th className={`py-2 px-2 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                    {comparisonYear}
                  </th>
                  <th className={`py-2 px-2 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t("kpi.growth", "גדילה")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className={`py-2 px-2 ${isRTL ? 'text-right' : 'text-left'}`}>{row.period}</td>
                    <td className={`py-2 px-2 text-green-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {formatCurrency(row[selectedYear] as number)}
                    </td>
                    <td className={`py-2 px-2 text-blue-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {formatCurrency(row[comparisonYear] as number)}
                    </td>
                    <td className={`py-2 px-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className="flex items-center gap-1">
                        {Number(row.growth) >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={Number(row.growth) >= 0 ? "text-green-600" : "text-red-600"}>
                          {Number(row.growth) >= 0 ? '+' : ''}{row.growth}%
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
