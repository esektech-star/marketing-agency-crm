import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download, Save, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface ReportConfig {
  id?: string;
  name: string;
  metrics: string[];
  template: "summary" | "detailed" | "executive";
  dateRange: "7days" | "30days" | "90days" | "custom";
  startDate?: Date;
  endDate?: Date;
  exportFormats: string[];
  scheduleEmail?: boolean;
  recipients?: string[];
}

const AVAILABLE_METRICS = [
  { id: "roi", label: "ROI", category: "performance" },
  { id: "conversions", label: "Conversions", category: "performance" },
  { id: "revenue", label: "Revenue", category: "financial" },
  { id: "expenses", label: "Expenses", category: "financial" },
  { id: "netProfit", label: "Net Profit", category: "financial" },
  { id: "campaignCount", label: "Campaign Count", category: "campaigns" },
  { id: "activeClients", label: "Active Clients", category: "clients" },
  { id: "completedTasks", label: "Completed Tasks", category: "tasks" },
  { id: "conversionRate", label: "Conversion Rate", category: "performance" },
  { id: "cpc", label: "Cost Per Click", category: "performance" },
  { id: "ctr", label: "Click Through Rate", category: "performance" },
];

const EXPORT_FORMATS = [
  { id: "pdf", label: "PDF" },
  { id: "excel", label: "Excel" },
  { id: "csv", label: "CSV" },
  { id: "json", label: "JSON" },
];

export default function CustomReports() {
  const { t } = useTranslation();
  const [savedReports, setSavedReports] = useState<ReportConfig[]>([
    {
      id: "1",
      name: "Monthly Performance",
      metrics: ["roi", "conversions", "revenue"],
      template: "summary",
      dateRange: "30days",
      exportFormats: ["pdf", "excel"],
    },
    {
      id: "2",
      name: "Executive Summary",
      metrics: ["revenue", "netProfit", "activeClients"],
      template: "executive",
      dateRange: "90days",
      exportFormats: ["pdf"],
    },
  ]);

  const [currentReport, setCurrentReport] = useState<ReportConfig>({
    name: "New Report",
    metrics: [],
    template: "summary",
    dateRange: "30days",
    exportFormats: ["pdf"],
  });

  const [showBuilder, setShowBuilder] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: campaigns = [] } = trpc.campaigns.list.useQuery();
  const { data: transactions = [] } = trpc.transactions.list.useQuery();
  const { data: tasks = [] } = trpc.tasks.list.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();

  const toggleMetric = (metricId: string) => {
    setCurrentReport(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter(m => m !== metricId)
        : [...prev.metrics, metricId]
    }));
  };

  const calculateMetricValue = (metricId: string): number | string => {
    switch (metricId) {
      case "roi":
        return campaigns.length > 0 
          ? (campaigns.reduce((sum: number, c: any) => sum + (c.roi || 0), 0) / campaigns.length).toFixed(2)
          : "0";
      case "conversions":
        return campaigns.reduce((sum: number, c: any) => sum + (c.conversions || 0), 0);
      case "revenue":
        return transactions
          .filter((t: any) => t.type === "revenue")
          .reduce((sum: number, t: any) => sum + t.amount, 0)
          .toLocaleString('en-US', { minimumFractionDigits: 2 });
      case "expenses":
        return transactions
          .filter((t: any) => t.type === "expense")
          .reduce((sum: number, t: any) => sum + t.amount, 0)
          .toLocaleString('en-US', { minimumFractionDigits: 2 });
      case "netProfit":
        const revenue = transactions
          .filter((t: any) => t.type === "revenue")
          .reduce((sum: number, t: any) => sum + t.amount, 0);
        const expenses = transactions
          .filter((t: any) => t.type === "expense")
          .reduce((sum: number, t: any) => sum + t.amount, 0);
        return (revenue - expenses).toLocaleString('en-US', { minimumFractionDigits: 2 });
      case "campaignCount":
        return campaigns.length;
      case "activeClients":
        return clients.filter((c: any) => c.status === "active").length;
      case "completedTasks":
        return tasks.filter((t: any) => t.status === "done").length;
      case "conversionRate":
        return campaigns.length > 0
          ? (campaigns.reduce((sum: number, c: any) => sum + (c.conversionRate || 0), 0) / campaigns.length).toFixed(2) + "%"
          : "0%";
      case "cpc":
        return campaigns.length > 0
          ? "₪" + (campaigns.reduce((sum: number, c: any) => sum + (c.cpc || 0), 0) / campaigns.length).toFixed(2)
          : "₪0";
      case "ctr":
        return campaigns.length > 0
          ? (campaigns.reduce((sum: number, c: any) => sum + (c.ctr || 0), 0) / campaigns.length).toFixed(2) + "%"
          : "0%";
      default:
        return "N/A";
    }
  };

  const handleGenerateReport = async () => {
    if (currentReport.metrics.length === 0) {
      toast.error(t("customReports.selectMetrics", "Please select at least one metric"));
      return;
    }

    setIsGenerating(true);

    try {
      const reportData = {
        name: currentReport.name,
        generatedAt: new Date().toLocaleString('ar-SA'),
        dateRange: currentReport.dateRange,
        template: currentReport.template,
        metrics: currentReport.metrics.map(metricId => ({
          id: metricId,
          label: AVAILABLE_METRICS.find(m => m.id === metricId)?.label,
          value: calculateMetricValue(metricId),
        })),
      };

      // Export as JSON (can be extended to PDF/Excel)
      currentReport.exportFormats.forEach(format => {
        const element = document.createElement("a");
        element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2)));
        element.setAttribute("download", `report-${currentReport.name}-${new Date().toISOString().split('T')[0]}.json`);
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      });

      toast.success(t("customReports.reportGenerated", "Report generated successfully"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveReport = () => {
    if (!currentReport.name || currentReport.metrics.length === 0) {
      toast.error(t("customReports.fillAllFields", "Please fill all required fields"));
      return;
    }

    const newReport = {
      ...currentReport,
      id: Date.now().toString(),
    };

    setSavedReports([...savedReports, newReport]);
    toast.success(t("customReports.reportSaved", "Report saved successfully"));
    setShowBuilder(false);
    setCurrentReport({
      name: "New Report",
      metrics: [],
      template: "summary",
      dateRange: "30days",
      exportFormats: ["pdf"],
    });
  };

  const handleDeleteReport = (reportId: string) => {
    setSavedReports(savedReports.filter(r => r.id !== reportId));
    toast.success(t("customReports.reportDeleted", "Report deleted"));
  };

  const handleLoadReport = (report: ReportConfig) => {
    setCurrentReport(report);
    setShowBuilder(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t("customReports.title", "Custom Reports")}</h1>
          <p className="text-muted-foreground mt-1">{t("customReports.subtitle", "Create and manage custom reports")}</p>
        </div>
        <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {t("customReports.newReport", "New Report")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("customReports.buildReport", "Build Custom Report")}</DialogTitle>
              <DialogDescription>{t("customReports.selectMetrics", "Select metrics and configure your report")}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Report Name */}
              <div>
                <Label htmlFor="reportName">{t("customReports.reportName", "Report Name")}</Label>
                <Input
                  id="reportName"
                  value={currentReport.name}
                  onChange={(e) => setCurrentReport(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t("customReports.enterName", "Enter report name")}
                  className="mt-2"
                />
              </div>

              {/* Metrics Selection */}
              <div>
                <Label>{t("customReports.selectMetrics", "Select Metrics")}</Label>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  {AVAILABLE_METRICS.map(metric => (
                    <div key={metric.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={metric.id}
                        checked={currentReport.metrics.includes(metric.id)}
                        onCheckedChange={() => toggleMetric(metric.id)}
                      />
                      <Label htmlFor={metric.id} className="cursor-pointer">
                        {metric.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Template Selection */}
              <div>
                <Label htmlFor="template">{t("customReports.template", "Template")}</Label>
                <Select value={currentReport.template} onValueChange={(value: any) => setCurrentReport(prev => ({ ...prev, template: value }))}>
                  <SelectTrigger id="template" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">{t("customReports.summary", "Summary")}</SelectItem>
                    <SelectItem value="detailed">{t("customReports.detailed", "Detailed")}</SelectItem>
                    <SelectItem value="executive">{t("customReports.executive", "Executive")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div>
                <Label htmlFor="dateRange">{t("customReports.dateRange", "Date Range")}</Label>
                <Select value={currentReport.dateRange} onValueChange={(value: any) => setCurrentReport(prev => ({ ...prev, dateRange: value }))}>
                  <SelectTrigger id="dateRange" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">{t("customReports.last7Days", "Last 7 Days")}</SelectItem>
                    <SelectItem value="30days">{t("customReports.last30Days", "Last 30 Days")}</SelectItem>
                    <SelectItem value="90days">{t("customReports.last90Days", "Last 90 Days")}</SelectItem>
                    <SelectItem value="custom">{t("customReports.custom", "Custom")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Export Formats */}
              <div>
                <Label>{t("customReports.exportFormats", "Export Formats")}</Label>
                <div className="flex flex-wrap gap-3 mt-3">
                  {EXPORT_FORMATS.map(format => (
                    <div key={format.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={format.id}
                        checked={currentReport.exportFormats.includes(format.id)}
                        onCheckedChange={(checked) => {
                          setCurrentReport(prev => ({
                            ...prev,
                            exportFormats: checked
                              ? [...prev.exportFormats, format.id]
                              : prev.exportFormats.filter(f => f !== format.id)
                          }));
                        }}
                      />
                      <Label htmlFor={format.id} className="cursor-pointer">
                        {format.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowBuilder(false)}>
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button variant="outline" onClick={handleSaveReport} className="gap-2">
                  <Save className="w-4 h-4" />
                  {t("customReports.save", "Save Report")}
                </Button>
                <Button onClick={handleGenerateReport} disabled={isGenerating} className="gap-2">
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {t("customReports.generate", "Generate & Export")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Saved Reports */}
      <div>
        <h2 className="text-2xl font-bold mb-4">{t("customReports.savedReports", "Saved Reports")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedReports.map(report => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {report.metrics.length} {t("customReports.metrics", "metrics")}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteReport(report.id!)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t("customReports.template", "Template")}:</p>
                    <p className="text-sm font-medium capitalize">{report.template}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t("customReports.metrics", "Metrics")}:</p>
                    <div className="flex flex-wrap gap-1">
                      {report.metrics.slice(0, 3).map(metricId => (
                        <span key={metricId} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                          {AVAILABLE_METRICS.find(m => m.id === metricId)?.label}
                        </span>
                      ))}
                      {report.metrics.length > 3 && (
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                          +{report.metrics.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleLoadReport(report)}
                    >
                      {t("customReports.edit", "Edit")}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => {
                        setCurrentReport(report);
                        handleGenerateReport();
                      }}
                    >
                      <Download className="w-3 h-3" />
                      {t("customReports.export", "Export")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Report Preview */}
      {currentReport.metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("customReports.preview", "Report Preview")}</CardTitle>
            <CardDescription>{t("customReports.previewDesc", "Preview of selected metrics")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentReport.metrics.map(metricId => {
                const metric = AVAILABLE_METRICS.find(m => m.id === metricId);
                return (
                  <Card key={metricId} className="bg-muted">
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground mb-2">{metric?.label}</p>
                      <p className="text-2xl font-bold">{calculateMetricValue(metricId)}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
