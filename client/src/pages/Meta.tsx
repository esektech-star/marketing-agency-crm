import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, TrendingUp, DollarSign, Users, Eye, Sparkles, Lightbulb } from "lucide-react";
import { toast } from "sonner";

function num(v: any): number {
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return isNaN(n) ? 0 : n;
}

export default function Meta() {
  const { t } = useTranslation();
  const utils = trpc.useUtils();

  const { data: campaigns = [], isLoading, isError, error } = trpc.metaCampaigns.list.useQuery(undefined, {
    retry: false,
  });

  const summary = useMemo(() => {
    const list = campaigns as any[];
    const totalSpend = list.reduce((s, c) => s + num(c.spend), 0);
    const totalImpressions = list.reduce((s, c) => s + num(c.impressions), 0);
    const totalResults = list.reduce((s, c) => s + num(c.results), 0);
    const avgRoas = list.length ? list.reduce((s, c) => s + num(c.roas), 0) / list.length : 0;
    return { totalSpend, totalImpressions, totalResults, avgRoas };
  }, [campaigns]);

  const getStatusColor = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s.includes("ACTIVE")) return "bg-green-100 text-green-800";
    if (s.includes("PAUSE")) return "bg-amber-100 text-amber-800";
    return "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s.includes("ACTIVE")) return "نشطة";
    if (s.includes("PAUSE")) return "متوقفة";
    if (s.includes("ARCHIV")) return "مؤرشفة";
    return status || "—";
  };

  const handleRefresh = () => {
    utils.metaCampaigns.list.invalidate();
    toast.success(t("common.refreshed", "تم التحديث"));
  };

  const analyze = trpc.ai.analyzeCampaigns.useMutation({
    onError: (e) => toast.error(e.message || t("meta.aiError", "فشل التحليل")),
  });

  const handleAnalyze = () => {
    analyze.mutate({});
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">{t("meta.title", "حملات Meta")}</h1>
          <p className="text-muted-foreground mt-1">{t("meta.subtitle", "إدارة وتحليل حملاتك الإعلانية")}</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading} className="bg-background">
          <RefreshCw className={`w-4 h-4 ml-2 ${isLoading ? "animate-spin" : ""}`} />
          {t("common.refresh", "تحديث")}
        </Button>
      </div>

      {isError && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="pt-6 text-amber-800 text-sm">
            {t("meta.connectionHint", "لم يتم تكوين اتصال Meta Ads بعد. أضف بيانات الاعتماد في إعدادات النظام لجلب الحملات.")}
            {error?.message ? <span className="block mt-1 text-xs opacity-70">{error.message}</span> : null}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              {t("meta.totalSpent", "إجمالي الإنفاق")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalSpend.toLocaleString("en-US")} ₪</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              {t("meta.impressions", "الانطباعات")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalImpressions.toLocaleString("en-US")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              {t("meta.results", "النتائج")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalResults.toLocaleString("en-US")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              {t("meta.avgRoas", "متوسط ROAS")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.avgRoas.toFixed(2)}x</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {t("meta.aiAnalysis", "تحليل بالذكاء الاصطناعي")}
              </CardTitle>
              <CardDescription>{t("meta.aiAnalysisDesc", "احصل على تحليل وتوصيات مبنية على أداء حملاتك")}</CardDescription>
            </div>
            <Button onClick={handleAnalyze} disabled={analyze.isPending} className="shrink-0">
              {analyze.isPending ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Sparkles className="w-4 h-4 ml-2" />}
              {t("meta.analyzeNow", "حلّل الآن")}
            </Button>
          </div>
        </CardHeader>
        {analyze.data && (
          <CardContent className="space-y-4">
            <p className="leading-relaxed text-sm">{analyze.data.analysis}</p>
            {analyze.data.recommendations?.length > 0 && (
              <div className="space-y-2">
                {analyze.data.recommendations.map((rec: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm bg-background/60 p-3 rounded-lg">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("meta.campaigns", "الحملات")}</CardTitle>
          <CardDescription>{(campaigns as any[]).length} {t("meta.campaignsCount", "حملة")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : (campaigns as any[]).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{t("meta.noCampaigns", "لا توجد حملات")}</div>
          ) : (
            <div className="space-y-4">
              {(campaigns as any[]).map((campaign) => (
                <div key={campaign.id ?? campaign.campaignId} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold">{campaign.campaignName || campaign.campaignId}</h3>
                      {campaign.objective && <p className="text-sm text-muted-foreground mt-1">{campaign.objective}</p>}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {getStatusLabel(campaign.status)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
                    <div className="bg-green-50 p-2 rounded">
                      <p className="text-muted-foreground text-xs">{t("meta.spent", "الإنفاق")}</p>
                      <p className="font-semibold">{num(campaign.spend).toLocaleString("en-US")} ₪</p>
                    </div>
                    <div className="bg-purple-50 p-2 rounded">
                      <p className="text-muted-foreground text-xs">{t("meta.impressions", "انطباعات")}</p>
                      <p className="font-semibold">{num(campaign.impressions).toLocaleString("en-US")}</p>
                    </div>
                    <div className="bg-orange-50 p-2 rounded">
                      <p className="text-muted-foreground text-xs">{t("meta.clicks", "نقرات")}</p>
                      <p className="font-semibold">{num(campaign.clicks).toLocaleString("en-US")}</p>
                    </div>
                    <div className="bg-red-50 p-2 rounded">
                      <p className="text-muted-foreground text-xs">{t("meta.ctr", "CTR")}</p>
                      <p className="font-semibold">{num(campaign.ctr).toFixed(2)}%</p>
                    </div>
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-muted-foreground text-xs">{t("meta.results", "نتائج")}</p>
                      <p className="font-semibold">{num(campaign.results).toLocaleString("en-US")}</p>
                    </div>
                    <div className="bg-indigo-50 p-2 rounded">
                      <p className="text-muted-foreground text-xs">{t("meta.roas", "ROAS")}</p>
                      <p className="font-semibold text-green-600">{num(campaign.roas).toFixed(2)}x</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
