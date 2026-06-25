import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, TrendingDown, Target } from "lucide-react";

const INDUSTRY_BENCHMARKS = {
  roi: {
    average: 250,
    good: 350,
    excellent: 500,
  },
  conversionRate: {
    average: 2.5,
    good: 4.0,
    excellent: 6.0,
  },
  cpc: {
    average: 1.5,
    good: 1.0,
    excellent: 0.5,
  },
  ctr: {
    average: 1.2,
    good: 2.0,
    excellent: 3.5,
  },
};

const BENCHMARK_DATA = [
  { metric: "ROI (%)", yourValue: 320, average: 250, good: 350, excellent: 500 },
  { metric: "Conversion Rate (%)", yourValue: 3.2, average: 2.5, good: 4.0, excellent: 6.0 },
  { metric: "CPC ($)", yourValue: 1.2, average: 1.5, good: 1.0, excellent: 0.5 },
  { metric: "CTR (%)", yourValue: 1.8, average: 1.2, good: 2.0, excellent: 3.5 },
];

const COMPETITIVE_DATA = [
  { campaign: "Campaign A", roi: 280, conversionRate: 2.8, cpc: 1.3 },
  { campaign: "Campaign B", roi: 320, conversionRate: 3.2, cpc: 1.2 },
  { campaign: "Campaign C", roi: 290, conversionRate: 2.9, cpc: 1.4 },
  { campaign: "Campaign D", roi: 350, conversionRate: 3.8, cpc: 1.1 },
  { campaign: "Campaign E", roi: 310, conversionRate: 3.1, cpc: 1.2 },
];

export default function Benchmarking() {
  const { t } = useTranslation();
  const [selectedMetric, setSelectedMetric] = useState("roi");

  const getPerformanceLevel = (value: number, metric: string) => {
    const benchmarks = INDUSTRY_BENCHMARKS[metric as keyof typeof INDUSTRY_BENCHMARKS];
    if (!benchmarks) return "neutral";
    
    if (metric === "cpc") {
      if (value <= benchmarks.excellent) return "excellent";
      if (value <= benchmarks.good) return "good";
      if (value <= benchmarks.average) return "average";
      return "below-average";
    }
    
    if (value >= benchmarks.excellent) return "excellent";
    if (value >= benchmarks.good) return "good";
    if (value >= benchmarks.average) return "average";
    return "below-average";
  };

  const getPerformanceColor = (level: string) => {
    switch (level) {
      case "excellent":
        return "#10b981";
      case "good":
        return "#3b82f6";
      case "average":
        return "#f59e0b";
      case "below-average":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getPerformanceBadge = (level: string) => {
    switch (level) {
      case "excellent":
        return { label: t("benchmarking.excellent", "ممتاز"), color: "bg-green-100 text-green-800" };
      case "good":
        return { label: t("benchmarking.good", "جيد"), color: "bg-blue-100 text-blue-800" };
      case "average":
        return { label: t("benchmarking.average", "متوسط"), color: "bg-yellow-100 text-yellow-800" };
      case "below-average":
        return { label: t("benchmarking.belowAverage", "أقل من المتوسط"), color: "bg-red-100 text-red-800" };
      default:
        return { label: t("common.unknown", "غير معروف"), color: "bg-gray-100 text-gray-800" };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">{t("benchmarking.title", "مقارنة الأداء")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("benchmarking.subtitle", "قارن أداء حملاتك مع معايير الصناعة")}
        </p>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {BENCHMARK_DATA.map((item) => {
          const level = getPerformanceLevel(item.yourValue, item.metric.toLowerCase().replace(/\s|%|\(|\)/g, ""));
          const badge = getPerformanceBadge(level);
          const isAboveAverage = level === "excellent" || level === "good";

          return (
            <Card key={item.metric}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  {item.metric}
                  {isAboveAverage ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{item.yourValue}</span>
                  <span className="text-xs text-muted-foreground">
                    {t("benchmarking.yourValue", "قيمتك")}
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>{t("benchmarking.average", "المتوسط")}:</span>
                    <span>{item.average}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("benchmarking.good", "جيد")}:</span>
                    <span>{item.good}</span>
                  </div>
                </div>
                <Badge className={badge.color}>{badge.label}</Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ROI vs Industry Average */}
      <Card>
        <CardHeader>
          <CardTitle>{t("benchmarking.roiComparison", "مقارنة العائد على الاستثمار")}</CardTitle>
          <CardDescription>
            {t("benchmarking.roiDesc", "مقارنة عائدك مع معايير الصناعة")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              {
                name: t("benchmarking.yourValue", "قيمتك"),
                value: 320,
                fill: "#3b82f6",
              },
              {
                name: t("benchmarking.average", "المتوسط"),
                value: 250,
                fill: "#f59e0b",
              },
              {
                name: t("benchmarking.good", "جيد"),
                value: 350,
                fill: "#10b981",
              },
              {
                name: t("benchmarking.excellent", "ممتاز"),
                value: 500,
                fill: "#06b6d4",
              },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {[
                  { name: t("benchmarking.yourValue", "قيمتك"), fill: "#3b82f6" },
                  { name: t("benchmarking.average", "المتوسط"), fill: "#f59e0b" },
                  { name: t("benchmarking.good", "جيد"), fill: "#10b981" },
                  { name: t("benchmarking.excellent", "ممتاز"), fill: "#06b6d4" },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Campaign Performance Scatter */}
      <Card>
        <CardHeader>
          <CardTitle>{t("benchmarking.campaignPerformance", "أداء الحملات")}</CardTitle>
          <CardDescription>
            {t("benchmarking.campaignDesc", "توزيع الحملات حسب العائد والتحويلات")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="roi" name={t("benchmarking.roi", "العائد")} />
              <YAxis dataKey="conversionRate" name={t("benchmarking.conversionRate", "معدل التحويل")} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter name={t("benchmarking.campaigns", "الحملات")} data={COMPETITIVE_DATA} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Conversion Rate Trend */}
      <Card>
        <CardHeader>
          <CardTitle>{t("benchmarking.conversionTrend", "اتجاه معدل التحويل")}</CardTitle>
          <CardDescription>
            {t("benchmarking.conversionDesc", "مقارنة معدل التحويل عبر الحملات")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={COMPETITIVE_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="campaign" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="conversionRate"
                stroke="#3b82f6"
                name={t("benchmarking.conversionRate", "معدل التحويل")}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="roi"
                stroke="#10b981"
                name={t("benchmarking.roi", "العائد")}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            {t("benchmarking.insights", "الرؤى والتوصيات")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">{t("benchmarking.strengths", "نقاط القوة")}</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>{t("benchmarking.strength1", "عائد استثمار أعلى من المتوسط (320% مقابل 250%)")}</li>
              <li>{t("benchmarking.strength2", "معدل تحويل جيد (3.2% مقابل 2.5%)")}</li>
              <li>{t("benchmarking.strength3", "تكلفة نقرة منخفضة نسبياً (1.2$ مقابل 1.5$)")}</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">{t("benchmarking.improvements", "مجالات التحسين")}</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>{t("benchmarking.improvement1", "يمكن تحسين معدل النقر (1.8% مقابل 2.0% للمعايير الجيدة)")}</li>
              <li>{t("benchmarking.improvement2", "استهدف معدل تحويل 4% للوصول إلى المستوى الممتاز")}</li>
              <li>{t("benchmarking.improvement3", "قلل تكلفة النقرة إلى 1$ أو أقل للتنافسية الأفضل")}</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">{t("benchmarking.recommendations", "التوصيات")}</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>{t("benchmarking.rec1", "ركز على تحسين جودة الإعلانات لزيادة معدل النقر")}</li>
              <li>{t("benchmarking.rec2", "اختبر استراتيجيات استهداف جديدة لتحسين التحويلات")}</li>
              <li>{t("benchmarking.rec3", "راجع الحملات ذات الأداء المنخفضة وأعد توزيع الميزانية")}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
