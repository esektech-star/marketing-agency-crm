import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, AlertCircle, TrendingDown, DollarSign, Target, Plus, Trash2, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

export default function Alerts() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [rules, setRules] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ruleType: "roi_drop",
    metric: "roi",
    operator: "less_than",
    threshold: "",
  });

  const alertTypes = [
    { value: "roi_drop", label: t("alerts.roiDrop", "ROI Drop"), icon: TrendingDown },
    { value: "conversion_drop", label: t("alerts.conversionDrop", "Conversion Drop"), icon: Target },
    { value: "cpc_increase", label: t("alerts.cpcIncrease", "CPC Increase"), icon: DollarSign },
    { value: "impressions_low", label: t("alerts.impressionsLow", "Low Impressions"), icon: AlertCircle },
  ];

  const metrics = ["roi", "conversion_rate", "cpc", "impressions", "clicks", "spend"];
  const operators = ["less_than", "greater_than", "equals", "not_equals"];

  const handleAddRule = async () => {
    if (!formData.name.trim() || !formData.threshold.trim()) {
      toast.error(t("alerts.fillAllFields", "Please fill all fields"));
      return;
    }

    try {
      const newRule = {
        id: Date.now(),
        ...formData,
        isEnabled: true,
        notifyAdminOnly: true,
        createdAt: new Date().toISOString(),
      };
      setRules([newRule, ...rules]);
      setFormData({
        name: "",
        description: "",
        ruleType: "roi_drop",
        metric: "roi",
        operator: "less_than",
        threshold: "",
      });
      setIsOpen(false);
      toast.success(t("alerts.ruleCreated", "Alert rule created"));
    } catch (error) {
      toast.error(t("alerts.createFailed", "Failed to create rule"));
    }
  };

  const handleDeleteRule = (id: number) => {
    if (confirm(t("alerts.confirmDelete", "Are you sure?"))) {
      setRules(rules.filter((r) => r.id !== id));
      toast.success(t("alerts.ruleDeleted", "Alert rule deleted"));
    }
  };

  const toggleRuleStatus = (id: number) => {
    setRules(
      rules.map((r) =>
        r.id === id ? { ...r, isEnabled: !r.isEnabled } : r
      )
    );
  };

  const acknowledgeAlert = (id: number) => {
    setAlerts(
      alerts.map((a) =>
        a.id === id ? { ...a, status: "acknowledged", acknowledgedAt: new Date().toISOString() } : a
      )
    );
    toast.success(t("alerts.acknowledged", "Alert acknowledged"));
  };

  const resolveAlert = (id: number) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, status: "resolved" } : a)));
    toast.success(t("alerts.resolved", "Alert resolved"));
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: "bg-red-100 text-red-800 border-red-300",
      high: "bg-orange-100 text-orange-800 border-orange-300",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
      low: "bg-blue-100 text-blue-800 border-blue-300",
    };
    return colors[severity] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getSeverityLabel = (severity: string) => {
    const labels: Record<string, string> = {
      critical: "حرج",
      high: "مرتفع",
      medium: "متوسط",
      low: "منخفض",
    };
    return labels[severity] || severity;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <AlertCircle className="w-4 h-4" />;
      case "acknowledged":
        return <Clock className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: "نشط",
      acknowledged: "تم الإقرار",
      resolved: "تم الحل",
    };
    return labels[status] || status;
  };

  const enabledCount = rules.filter((r) => r.isEnabled).length;
  const activeAlerts = alerts.filter((a) => a.status === "active").length;

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bell className="w-8 h-8 text-red-600" />
          {t("alerts.title", "Performance Alerts")}
        </h1>
        <p className="text-muted-foreground mt-2">{t("alerts.subtitle", "Set up alerts to monitor campaign performance")}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("alerts.activeRules", "Active Rules")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enabledCount}</div>
            <p className="text-xs text-muted-foreground mt-1">of {rules.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("alerts.activeAlerts", "Active Alerts")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{activeAlerts}</div>
            <p className="text-xs text-muted-foreground mt-1">requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("alerts.notifications", "Notifications")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">sent this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="alerts">{t("alerts.alerts", "Alerts")}</TabsTrigger>
          <TabsTrigger value="rules">{t("alerts.rules", "Rules")}</TabsTrigger>
        </TabsList>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <h2 className="text-xl font-semibold">{t("alerts.activeAlerts", "Active Alerts")}</h2>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  {t("alerts.noAlerts", "No alerts")}
                </CardContent>
              </Card>
            ) : (
              alerts.map((alert) => (
                <Card key={alert.id} className={`border-l-4 ${getSeverityColor(alert.severity)}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(alert.status)}
                          <h3 className="font-semibold">{alert.title}</h3>
                          <span className="text-xs px-2 py-1 rounded-full bg-opacity-20 bg-current">
                            {getSeverityLabel(alert.severity)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                      </div>
                      <div className="flex gap-2">
                        {alert.status === "active" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => acknowledgeAlert(alert.id)}
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            >
                              {t("alerts.acknowledge", "Acknowledge")}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resolveAlert(alert.id)}
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              {t("alerts.resolve", "Resolve")}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(alert.createdAt).toLocaleDateString("ar-SA")}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{t("alerts.alertRules", "Alert Rules")}</h2>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("alerts.newRule", "New Rule")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle>{t("alerts.createRule", "Create Alert Rule")}</DialogTitle>
                  <DialogDescription>{t("alerts.ruleDescription", "Set up a new performance alert rule")}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">{t("common.name", "Name")}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., ROI Drop Alert"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ruleType">{t("alerts.ruleType", "Rule Type")}</Label>
                    <select
                      id="ruleType"
                      value={formData.ruleType}
                      onChange={(e) => setFormData({ ...formData, ruleType: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border rounded-md"
                    >
                      {alertTypes.map((at) => (
                        <option key={at.value} value={at.value}>
                          {at.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="metric">{t("alerts.metric", "Metric")}</Label>
                    <select
                      id="metric"
                      value={formData.metric}
                      onChange={(e) => setFormData({ ...formData, metric: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border rounded-md"
                    >
                      {metrics.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="operator">{t("alerts.operator", "Operator")}</Label>
                    <select
                      id="operator"
                      value={formData.operator}
                      onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border rounded-md"
                    >
                      {operators.map((op) => (
                        <option key={op} value={op}>
                          {op}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="threshold">{t("alerts.threshold", "Threshold")}</Label>
                    <Input
                      id="threshold"
                      type="number"
                      value={formData.threshold}
                      onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                      placeholder="e.g., 150"
                      className="mt-1"
                    />
                  </div>

                  <Button onClick={handleAddRule} className="w-full bg-red-600 hover:bg-red-700">
                    {t("common.create", "Create")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {rules.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  {t("alerts.noRules", "No rules")}
                </CardContent>
              </Card>
            ) : (
              rules.map((rule) => (
                <Card key={rule.id} className={!rule.isEnabled ? "opacity-50" : ""}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{rule.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
                        <div className="flex gap-4 mt-3 text-xs">
                          <span>
                            <strong>{t("alerts.metric", "Metric")}:</strong> {rule.metric}
                          </span>
                          <span>
                            <strong>{t("alerts.operator", "Operator")}:</strong> {rule.operator}
                          </span>
                          <span>
                            <strong>{t("alerts.threshold", "Threshold")}:</strong> {rule.threshold}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={rule.isEnabled}
                          onChange={() => toggleRuleStatus(rule.id)}
                          className="w-4 h-4"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRule(rule.id)}
                          className="text-red-600 hover:bg-red-50"
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
      </Tabs>
    </div>
  );
}
