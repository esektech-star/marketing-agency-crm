import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, AlertCircle, TrendingDown, DollarSign, Target, Plus, Trash2, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Alerts() {
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const [isOpen, setIsOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ruleType: "roi_drop" as "roi_drop" | "conversion_drop" | "cpc_increase" | "impressions_low" | "custom",
    metric: "roi",
    operator: "less_than" as "less_than" | "greater_than" | "equals" | "not_equals",
    threshold: "",
  });

  const { data: rules = [], isLoading: rulesLoading } = trpc.alerts.getRules.useQuery();
  const { data: alerts = [], isLoading: alertsLoading } = trpc.alerts.getActiveAlerts.useQuery();

  const createRule = trpc.alerts.createRule.useMutation({
    onSuccess: () => {
      utils.alerts.getRules.invalidate();
      toast.success(t("alerts.ruleCreated", "تم إنشاء قاعدة التنبيه"));
      setIsOpen(false);
      setFormData({ name: "", description: "", ruleType: "roi_drop", metric: "roi", operator: "less_than", threshold: "" });
    },
    onError: () => toast.error(t("alerts.createFailed", "فشل إنشاء القاعدة")),
  });

  const updateRule = trpc.alerts.updateRule.useMutation({
    onSuccess: () => utils.alerts.getRules.invalidate(),
    onError: () => toast.error(t("common.error", "حدث خطأ")),
  });

  const acknowledgeMut = trpc.alerts.acknowledgeAlert.useMutation({
    onSuccess: () => {
      utils.alerts.getActiveAlerts.invalidate();
      toast.success(t("alerts.acknowledged", "تم الإقرار بالتنبيه"));
    },
    onError: () => toast.error(t("common.error", "حدث خطأ")),
  });

  const resolveMut = trpc.alerts.resolveAlert.useMutation({
    onSuccess: () => {
      utils.alerts.getActiveAlerts.invalidate();
      toast.success(t("alerts.resolved", "تم حل التنبيه"));
    },
    onError: () => toast.error(t("common.error", "حدث خطأ")),
  });

  const alertTypes = [
    { value: "roi_drop", label: t("alerts.roiDrop", "انخفاض ROI"), icon: TrendingDown },
    { value: "conversion_drop", label: t("alerts.conversionDrop", "انخفاض التحويلات"), icon: Target },
    { value: "cpc_increase", label: t("alerts.cpcIncrease", "ارتفاع تكلفة النقرة"), icon: DollarSign },
    { value: "impressions_low", label: t("alerts.impressionsLow", "انخفاض الظهور"), icon: AlertCircle },
  ];

  const metricLabels: Record<string, string> = {
    roi: t("alerts.metricRoi", "العائد على الاستثمار"),
    conversion_rate: t("alerts.metricConversion", "معدل التحويل"),
    cpc: t("alerts.metricCpc", "تكلفة النقرة"),
    impressions: t("alerts.metricImpressions", "الظهور"),
    clicks: t("alerts.metricClicks", "النقرات"),
    spend: t("alerts.metricSpend", "الإنفاق"),
  };
  const operatorLabels: Record<string, string> = {
    less_than: t("alerts.opLessThan", "أقل من"),
    greater_than: t("alerts.opGreaterThan", "أكبر من"),
    equals: t("alerts.opEquals", "يساوي"),
    not_equals: t("alerts.opNotEquals", "لا يساوي"),
  };

  const handleAddRule = () => {
    if (!formData.name.trim() || !formData.threshold.trim()) {
      toast.error(t("alerts.fillAllFields", "يرجى ملء جميع الحقول"));
      return;
    }
    createRule.mutate({
      name: formData.name,
      description: formData.description || undefined,
      ruleType: formData.ruleType,
      metric: formData.metric,
      operator: formData.operator,
      threshold: parseFloat(formData.threshold),
      notifyAdminOnly: true,
    });
  };

  const toggleRuleStatus = (id: number, current: boolean) => {
    updateRule.mutate({ id, isEnabled: !current });
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: "border-red-500",
      high: "border-orange-500",
      medium: "border-yellow-500",
      low: "border-blue-500",
    };
    return colors[severity] || "border-gray-300";
  };

  const getSeverityLabel = (severity: string) => {
    const labels: Record<string, string> = { critical: "حرج", high: "مرتفع", medium: "متوسط", low: "منخفض" };
    return labels[severity] || severity;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <AlertCircle className="w-4 h-4" />;
      case "acknowledged": return <Clock className="w-4 h-4" />;
      case "resolved": return <CheckCircle2 className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const enabledCount = rules.filter((r: any) => r.isEnabled).length;
  const activeAlerts = alerts.filter((a: any) => a.status === "active").length;

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bell className="w-8 h-8 text-red-600" />
          {t("alerts.title", "تنبيهات الأداء")}
        </h1>
        <p className="text-muted-foreground mt-2">{t("alerts.subtitle", "إعداد التنبيهات لمراقبة أداء الحملات")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("alerts.activeRules", "القواعد النشطة")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enabledCount}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("alerts.ofTotal", "من أصل")} {rules.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("alerts.activeAlerts", "التنبيهات النشطة")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{activeAlerts}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("alerts.requiringAttention", "تحتاج إلى انتباه")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("alerts.totalAlerts", "إجمالي التنبيهات")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("alerts.allTime", "الإجمالي")}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="alerts">{t("alerts.alerts", "التنبيهات")}</TabsTrigger>
          <TabsTrigger value="rules">{t("alerts.rules", "القواعد")}</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <h2 className="text-xl font-semibold">{t("alerts.activeAlerts", "التنبيهات النشطة")}</h2>
          <div className="space-y-3">
            {alertsLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : alerts.length === 0 ? (
              <Card><CardContent className="pt-6 text-center text-muted-foreground">{t("alerts.noAlerts", "لا توجد تنبيهات")}</CardContent></Card>
            ) : (
              alerts.map((alert: any) => (
                <Card key={alert.id} className={`border-r-4 ${getSeverityColor(alert.severity)}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(alert.status)}
                          <h3 className="font-semibold">{alert.title}</h3>
                          <span className="text-xs px-2 py-1 rounded-full bg-muted">{getSeverityLabel(alert.severity)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                      </div>
                      <div className="flex gap-2">
                        {alert.status === "active" && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => acknowledgeMut.mutate({ alertId: alert.id })} className="text-blue-600 border-blue-600 hover:bg-blue-50">
                              {t("alerts.acknowledge", "إقرار")}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => resolveMut.mutate({ alertId: alert.id })} className="text-green-600 border-green-600 hover:bg-green-50">
                              {t("alerts.resolve", "حل")}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    {alert.createdAt && (
                      <p className="text-xs text-muted-foreground">{new Date(alert.createdAt).toLocaleDateString("ar-SA")}</p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{t("alerts.alertRules", "قواعد التنبيه")}</h2>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="w-4 h-4 ml-2" />
                  {t("alerts.newRule", "قاعدة جديدة")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                  <DialogTitle>{t("alerts.createRule", "إنشاء قاعدة تنبيه")}</DialogTitle>
                  <DialogDescription>{t("alerts.ruleDescription", "إعداد قاعدة تنبيه أداء جديدة")}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">{t("common.name", "الاسم")}</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder={t("alerts.namePlaceholder", "مثال: تنبيه انخفاض ROI")} className="mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="ruleType">{t("alerts.ruleType", "نوع القاعدة")}</Label>
                    <select id="ruleType" value={formData.ruleType} onChange={(e) => setFormData({ ...formData, ruleType: e.target.value as any })} className="mt-1 w-full px-3 py-2 border rounded-md bg-background">
                      {alertTypes.map((at) => (<option key={at.value} value={at.value}>{at.label}</option>))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="metric">{t("alerts.metric", "المقياس")}</Label>
                    <select id="metric" value={formData.metric} onChange={(e) => setFormData({ ...formData, metric: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-md bg-background">
                      {Object.keys(metricLabels).map((m) => (<option key={m} value={m}>{metricLabels[m]}</option>))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="operator">{t("alerts.operator", "العامل")}</Label>
                    <select id="operator" value={formData.operator} onChange={(e) => setFormData({ ...formData, operator: e.target.value as any })} className="mt-1 w-full px-3 py-2 border rounded-md bg-background">
                      {Object.keys(operatorLabels).map((op) => (<option key={op} value={op}>{operatorLabels[op]}</option>))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="threshold">{t("alerts.threshold", "الحد")}</Label>
                    <Input id="threshold" type="number" value={formData.threshold} onChange={(e) => setFormData({ ...formData, threshold: e.target.value })} placeholder={t("alerts.thresholdPlaceholder", "مثال: 150")} className="mt-1" />
                  </div>

                  <Button onClick={handleAddRule} disabled={createRule.isPending} className="w-full bg-red-600 hover:bg-red-700">
                    {createRule.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t("common.create", "إنشاء")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {rulesLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : rules.length === 0 ? (
              <Card><CardContent className="pt-6 text-center text-muted-foreground">{t("alerts.noRules", "لا توجد قواعد")}</CardContent></Card>
            ) : (
              rules.map((rule: any) => (
                <Card key={rule.id} className={!rule.isEnabled ? "opacity-50" : ""}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{rule.name}</h3>
                        {rule.description && <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>}
                        <div className="flex flex-wrap gap-4 mt-3 text-xs">
                          <span><strong>{t("alerts.metric", "المقياس")}:</strong> {metricLabels[rule.metric] || rule.metric}</span>
                          <span><strong>{t("alerts.operator", "العامل")}:</strong> {operatorLabels[rule.operator] || rule.operator}</span>
                          <span><strong>{t("alerts.threshold", "الحد")}:</strong> {rule.threshold}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => toggleRuleStatus(rule.id, rule.isEnabled)}>
                          {rule.isEnabled ? t("alerts.disable", "تعطيل") : t("alerts.enable", "تفعيل")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
