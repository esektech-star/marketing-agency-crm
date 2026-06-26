import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Share2, Plus, Trash2, Eye, BarChart3, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Report {
  id: number;
  name: string;
  type: "summary" | "detailed" | "executive";
  format: "pdf" | "excel" | "csv";
  metrics: string[];
  dateRange: { from: string; to: string };
  createdAt: string;
  sharedWith: string[];
}

export default function Reports() {
  const { t } = useTranslation();
  const [reports, setReports] = useState<Report[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "summary" as const,
    format: "pdf" as const,
    metrics: ["roi", "conversions", "revenue"],
    dateFrom: "",
    dateTo: "",
  });

  const reportTypes = [
    { value: "summary", label: t("reports.summary", "Summary Report") },
    { value: "detailed", label: t("reports.detailed", "Detailed Report") },
    { value: "executive", label: t("reports.executive", "Executive Report") },
  ];

  const exportFormats = [
    { value: "pdf", label: "PDF", icon: "📄" },
    { value: "excel", label: "Excel", icon: "📊" },
    { value: "csv", label: "CSV", icon: "📋" },
  ];

  const availableMetrics = [
    { id: "roi", label: "ROI" },
    { id: "conversions", label: t("reports.conversions", "Conversions") },
    { id: "revenue", label: t("reports.revenue", "Revenue") },
    { id: "expenses", label: t("reports.expenses", "Expenses") },
    { id: "impressions", label: t("reports.impressions", "Impressions") },
    { id: "clicks", label: t("reports.clicks", "Clicks") },
    { id: "ctr", label: "CTR" },
    { id: "cpc", label: "CPC" },
  ];

  const handleCreateReport = () => {
    if (!formData.name.trim() || !formData.dateFrom || !formData.dateTo) {
      toast.error(t("reports.fillAllFields", "Please fill all fields"));
      return;
    }

    const newReport: Report = {
      id: Date.now(),
      name: formData.name,
      type: formData.type,
      format: formData.format,
      metrics: formData.metrics,
      dateRange: { from: formData.dateFrom, to: formData.dateTo },
      createdAt: new Date().toISOString(),
      sharedWith: [],
    };

    setReports([newReport, ...reports]);
    setFormData({
      name: "",
      type: "summary",
      format: "pdf",
      metrics: ["roi", "conversions", "revenue"],
      dateFrom: "",
      dateTo: "",
    });
    setIsOpen(false);
    toast.success(t("reports.reportCreated", "Report created successfully"));
  };

  const handleDownloadReport = (reportId: number) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    toast.success(t("reports.downloadStarted", `Downloading ${report.name} as ${report.format.toUpperCase()}...`));
  };

  const handleShareReport = (reportId: number) => {
    setSelectedReportId(reportId);
    setShowShareDialog(true);
  };

  const handleDeleteReport = (reportId: number) => {
    if (confirm(t("reports.confirmDelete", "Are you sure?"))) {
      setReports(reports.filter((r) => r.id !== reportId));
      toast.success(t("reports.reportDeleted", "Report deleted"));
    }
  };

  const toggleMetric = (metricId: string) => {
    setFormData((prev) => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter((m) => m !== metricId)
        : [...prev.metrics, metricId],
    }));
  };

  const getReportTypeLabel = (type: string) => {
    return reportTypes.find((rt) => rt.value === type)?.label || type;
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          {t("reports.title", "Advanced Reports")}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t("reports.subtitle", "Create, manage, and share custom reports")}
        </p>
      </div>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reports">{t("reports.myReports", "My Reports")}</TabsTrigger>
          <TabsTrigger value="templates">{t("reports.templates", "Templates")}</TabsTrigger>
        </TabsList>

        {/* My Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{t("reports.savedReports", "Saved Reports")}</h2>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("reports.newReport", "New Report")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl" dir="rtl">
                <DialogHeader>
                  <DialogTitle>{t("reports.createReport", "Create Report")}</DialogTitle>
                  <DialogDescription>
                    {t("reports.createReportDescription", "Create a custom report with your selected metrics")}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div>
                    <Label htmlFor="reportName">{t("common.name", "Name")}</Label>
                    <Input
                      id="reportName"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t("reports.reportNamePlaceholder", "e.g., Q2 Performance Report")}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reportType">{t("reports.type", "Report Type")}</Label>
                      <select
                        id="reportType"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="mt-1 w-full px-3 py-2 border rounded-md"
                      >
                        {reportTypes.map((rt) => (
                          <option key={rt.value} value={rt.value}>
                            {rt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="exportFormat">{t("reports.format", "Export Format")}</Label>
                      <select
                        id="exportFormat"
                        value={formData.format}
                        onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                        className="mt-1 w-full px-3 py-2 border rounded-md"
                      >
                        {exportFormats.map((ef) => (
                          <option key={ef.value} value={ef.value}>
                            {ef.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dateFrom">{t("reports.dateFrom", "Date From")}</Label>
                      <Input
                        id="dateFrom"
                        type="date"
                        value={formData.dateFrom}
                        onChange={(e) => setFormData({ ...formData, dateFrom: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="dateTo">{t("reports.dateTo", "Date To")}</Label>
                      <Input
                        id="dateTo"
                        type="date"
                        value={formData.dateTo}
                        onChange={(e) => setFormData({ ...formData, dateTo: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>{t("reports.metrics", "Metrics")}</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {availableMetrics.map((metric) => (
                        <label key={metric.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.metrics.includes(metric.id)}
                            onChange={() => toggleMetric(metric.id)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{metric.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleCreateReport} className="w-full bg-blue-600 hover:bg-blue-700">
                    {t("reports.create", "Create Report")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {reports.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  {t("reports.noReports", "No reports yet")}
                </CardContent>
              </Card>
            ) : (
              reports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold">{report.name}</h3>
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                            {getReportTypeLabel(report.type)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {t("reports.format", "Format")}: {report.format.toUpperCase()} | {t("reports.metrics", "Metrics")}: {report.metrics.join(", ")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("reports.dateRange", "Date Range")}: {report.dateRange.from} {t("reports.to", "to")} {report.dateRange.to}
                        </p>
                        {report.sharedWith.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {t("reports.sharedWith", "Shared with")}: {report.sharedWith.join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReport(report.id)}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShareReport(report.id)}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteReport(report.id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <h2 className="text-xl font-semibold">{t("reports.reportTemplates", "Report Templates")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reportTypes.map((type) => (
              <Card key={type.value} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-base">{type.label}</CardTitle>
                  <CardDescription>
                    {type.value === "summary" && t("reports.summaryDesc", "Quick overview of key metrics")}
                    {type.value === "detailed" && t("reports.detailedDesc", "In-depth analysis with all details")}
                    {type.value === "executive" && t("reports.executiveDesc", "High-level insights for executives")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    {t("reports.useTemplate", "Use Template")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>{t("reports.shareReport", "Share Report")}</DialogTitle>
            <DialogDescription>
              {t("reports.shareDescription", "Share this report with team members or clients")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="shareEmail">{t("reports.emailAddress", "Email Address")}</Label>
              <Input
                id="shareEmail"
                type="email"
                placeholder={t("reports.emailPlaceholder", "Enter email address")}
                className="mt-1"
              />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              {t("reports.share", "Share")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
