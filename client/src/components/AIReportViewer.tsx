import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, RefreshCw, FileText } from "lucide-react";
import { toast } from "sonner";

interface AIReportViewerProps {
  type: "performance" | "client";
  clientId?: number;
}

export default function AIReportViewer({ type, clientId }: AIReportViewerProps) {
  const { t } = useTranslation();

  const { data: report, isLoading, refetch } = type === "performance"
    ? trpc.ai.performanceReport.useQuery()
    : trpc.ai.clientReport.useQuery({ clientId: clientId! }, { enabled: !!clientId });

  const handleDownload = () => {
    if (!report) return;

    const reportContent = JSON.stringify(report, null, 2);
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(reportContent));
    element.setAttribute("download", `${type}-report-${new Date().toISOString().split('T')[0]}.json`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(t("common.downloadSuccess", "Report downloaded successfully"));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!report) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12 text-muted-foreground">
          {t("reports.noData", "Unable to generate report")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {type === "performance" ? t("reports.performanceReport", "Performance Report") : t("reports.clientReport", "Client Report")}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 me-2" />
            {t("common.refresh", "Refresh")}
          </Button>
          <Button size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 me-2" />
            {t("common.download", "Download")}
          </Button>
        </div>
      </div>

      {type === "performance" && report.executive_summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("reports.executiveSummary", "Executive Summary")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 leading-relaxed">{report.executive_summary}</p>
          </CardContent>
        </Card>
      )}

      {type === "client" && report.client_overview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("reports.clientOverview", "Client Overview")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 leading-relaxed">{report.client_overview}</p>
          </CardContent>
        </Card>
      )}

      {type === "client" && report.performance_summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("reports.performanceSummary", "Performance Summary")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 leading-relaxed">{report.performance_summary}</p>
          </CardContent>
        </Card>
      )}

      {report.key_metrics && report.key_metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("reports.keyMetrics", "Key Metrics")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.key_metrics.map((metric: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-blue-50">
                  <Badge className="mt-1">{idx + 1}</Badge>
                  <p className="text-sm text-gray-700">{metric}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {report.performance_analysis && report.performance_analysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("reports.analysis", "Analysis")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.performance_analysis.map((item: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-amber-50">
                  <div className="w-2 h-2 rounded-full bg-amber-600 mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {report.achievements && report.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("reports.achievements", "Achievements")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.achievements.map((achievement: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-green-50">
                  <div className="w-2 h-2 rounded-full bg-green-600 mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">{achievement}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {report.challenges && report.challenges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("reports.challenges", "Challenges")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.challenges.map((challenge: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-red-50">
                  <div className="w-2 h-2 rounded-full bg-red-600 mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">{challenge}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {report.recommendations && report.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("reports.recommendations", "Recommendations")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.recommendations.map((rec: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-purple-50">
                  <div className="w-2 h-2 rounded-full bg-purple-600 mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {report.next_steps && report.next_steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("reports.nextSteps", "Next Steps")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.next_steps.map((step: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-indigo-50">
                  <Badge variant="outline" className="mt-1">{idx + 1}</Badge>
                  <p className="text-sm text-gray-700">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
