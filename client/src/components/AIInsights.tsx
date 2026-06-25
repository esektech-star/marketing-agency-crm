import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lightbulb, TrendingUp, AlertCircle, Target } from "lucide-react";

interface AIInsightsProps {
  clientId: number;
}

export default function AIInsights({ clientId }: AIInsightsProps) {
  const { t } = useTranslation();
  const { data: insights, isLoading } = trpc.ai.clientInsights.useQuery({ clientId });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("ai.noInsights", "Unable to generate insights at this time")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* KPIs */}
      {insights.kpis && insights.kpis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              {t("ai.kpis", "Key Performance Indicators")}
            </CardTitle>
            <CardDescription>{t("ai.kpisDesc", "Metrics to track for success")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.kpis.map((kpi: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-blue-50">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">{kpi}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {insights.recommendations && insights.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              {t("ai.recommendations", "Strategic Recommendations")}
            </CardTitle>
            <CardDescription>{t("ai.recommendationsDesc", "Actions to improve performance")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.recommendations.map((rec: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-amber-50">
                  <div className="w-2 h-2 rounded-full bg-amber-600 mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Opportunities */}
      {insights.opportunities && insights.opportunities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              {t("ai.opportunities", "Growth Opportunities")}
            </CardTitle>
            <CardDescription>{t("ai.opportunitiesDesc", "Potential areas for expansion")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.opportunities.map((opp: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-green-50">
                  <div className="w-2 h-2 rounded-full bg-green-600 mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">{opp}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risks */}
      {insights.risks && insights.risks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              {t("ai.risks", "Risk Areas to Monitor")}
            </CardTitle>
            <CardDescription>{t("ai.risksDesc", "Potential challenges to address")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.risks.map((risk: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-red-50">
                  <div className="w-2 h-2 rounded-full bg-red-600 mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">{risk}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
