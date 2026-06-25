import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, AlertTriangle, TrendingDown, DollarSign, Target, Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

interface Alert {
  id: string;
  name: string;
  type: "roi_decline" | "conversion_drop" | "budget_overspend" | "low_engagement";
  threshold: number;
  enabled: boolean;
  notifyEmail: boolean;
  notifyPush: boolean;
  campaigns: string[];
  createdAt: Date;
}

export default function Alerts() {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "1",
      name: "ROI Below 150%",
      type: "roi_decline",
      threshold: 150,
      enabled: true,
      notifyEmail: true,
      notifyPush: true,
      campaigns: ["Facebook Summer Sale", "Google Ads - Search"],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: "2",
      name: "Conversion Rate Drop",
      type: "conversion_drop",
      threshold: 5,
      enabled: true,
      notifyEmail: true,
      notifyPush: false,
      campaigns: ["All"],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: "3",
      name: "Budget Overspend Alert",
      type: "budget_overspend",
      threshold: 90,
      enabled: false,
      notifyEmail: true,
      notifyPush: false,
      campaigns: ["All"],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "roi_decline" as Alert["type"],
    threshold: 150,
    notifyEmail: true,
    notifyPush: false,
    campaigns: ["All"],
  });

  const alertTypes = [
    { value: "roi_decline", label: t("alerts.roiDecline", "ROI Decline"), icon: TrendingDown },
    { value: "conversion_drop", label: t("alerts.conversionDrop", "Conversion Drop"), icon: Target },
    { value: "budget_overspend", label: t("alerts.budgetOverspend", "Budget Overspend"), icon: DollarSign },
    { value: "low_engagement", label: t("alerts.lowEngagement", "Low Engagement"), icon: AlertTriangle },
  ];

  const campaigns = ["All", "Facebook Summer Sale", "Google Ads - Search", "Instagram Influencer", "LinkedIn B2B", "TikTok Viral"];

  const handleAddAlert = () => {
    if (!formData.name.trim()) {
      toast.error(t("alerts.nameRequired", "Alert name is required"));
      return;
    }

    if (editingId) {
      setAlerts(
        alerts.map((alert) =>
          alert.id === editingId
            ? { ...alert, ...formData }
            : alert
        )
      );
      toast.success(t("alerts.updateSuccess", "Alert updated"));
      setEditingId(null);
    } else {
      const newAlert: Alert = {
        id: Date.now().toString(),
        ...formData,
        enabled: true,
        createdAt: new Date(),
      };
      setAlerts([newAlert, ...alerts]);
      toast.success(t("alerts.createSuccess", "Alert created"));
    }

    setFormData({
      name: "",
      type: "roi_decline",
      threshold: 150,
      notifyEmail: true,
      notifyPush: false,
      campaigns: ["All"],
    });
    setIsOpen(false);
  };

  const handleDeleteAlert = (id: string) => {
    if (confirm(t("alerts.confirmDelete", "Are you sure?"))) {
      setAlerts(alerts.filter((a) => a.id !== id));
      toast.success(t("alerts.deleteSuccess", "Alert deleted"));
    }
  };

  const handleEditAlert = (alert: Alert) => {
    setEditingId(alert.id);
    setFormData({
      name: alert.name,
      type: alert.type,
      threshold: alert.threshold,
      notifyEmail: alert.notifyEmail,
      notifyPush: alert.notifyPush,
      campaigns: alert.campaigns,
    });
    setIsOpen(true);
  };

  const toggleAlertStatus = (id: string) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
      )
    );
  };

  const getAlertIcon = (type: Alert["type"]) => {
    const alertType = alertTypes.find((at) => at.value === type);
    const Icon = alertType?.icon || AlertTriangle;
    return <Icon className="w-5 h-5" />;
  };

  const getAlertColor = (type: Alert["type"]) => {
    const colors: Record<Alert["type"], string> = {
      roi_decline: "bg-red-100 text-red-800",
      conversion_drop: "bg-orange-100 text-orange-800",
      budget_overspend: "bg-yellow-100 text-yellow-800",
      low_engagement: "bg-purple-100 text-purple-800",
    };
    return colors[type];
  };

  const enabledCount = alerts.filter((a) => a.enabled).length;
  const totalTriggered = 5; // Mock data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bell className="w-8 h-8" />
          {t("alerts.title", "Performance Alerts")}
        </h1>
        <p className="text-muted-foreground mt-2">{t("alerts.subtitle", "Set up alerts to monitor campaign performance")}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("alerts.activeAlerts", "Active Alerts")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enabledCount}</div>
            <p className="text-xs text-muted-foreground mt-1">of {alerts.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("alerts.triggered", "Triggered This Week")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalTriggered}</div>
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

      {/* Alerts List */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">{t("alerts.active", "Active")}</TabsTrigger>
          <TabsTrigger value="all">{t("alerts.all", "All")}</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      name: "",
                      type: "roi_decline",
                      threshold: 150,
                      notifyEmail: true,
                      notifyPush: false,
                      campaigns: ["All"],
                    });
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t("alerts.newAlert", "New Alert")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingId ? t("alerts.editAlert", "Edit Alert") : t("alerts.createAlert", "Create Alert")}</DialogTitle>
                  <DialogDescription>{t("alerts.alertDescription", "Set up a performance alert")}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">{t("common.name", "Name")}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., ROI Below 150%"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">{t("alerts.type", "Alert Type")}</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as Alert["type"] })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {alertTypes.map((at) => (
                          <SelectItem key={at.value} value={at.value}>
                            {at.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="threshold">{t("alerts.threshold", "Threshold")}</Label>
                    <Input
                      id="threshold"
                      type="number"
                      value={formData.threshold}
                      onChange={(e) => setFormData({ ...formData, threshold: parseFloat(e.target.value) })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="campaigns">{t("alerts.campaigns", "Campaigns")}</Label>
                    <Select value={formData.campaigns[0]} onValueChange={(value) => setFormData({ ...formData, campaigns: [value] })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {campaigns.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>{t("alerts.emailNotification", "Email Notification")}</Label>
                      <Switch
                        checked={formData.notifyEmail}
                        onCheckedChange={(checked) => setFormData({ ...formData, notifyEmail: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>{t("alerts.pushNotification", "Push Notification")}</Label>
                      <Switch
                        checked={formData.notifyPush}
                        onCheckedChange={(checked) => setFormData({ ...formData, notifyPush: checked })}
                      />
                    </div>
                  </div>

                  <Button onClick={handleAddAlert} className="w-full bg-blue-600 hover:bg-blue-700">
                    {editingId ? t("common.update", "Update") : t("common.create", "Create")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {alerts
            .filter((a) => a.enabled)
            .map((alert) => (
              <Card key={alert.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getAlertColor(alert.type)}`}>
                        {getAlertIcon(alert.type)}
                      </div>
                      <div>
                        <CardTitle className="text-base">{alert.name}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {alertTypes.find((at) => at.value === alert.type)?.label}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAlert(alert)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAlert(alert.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("alerts.threshold", "Threshold")}:</span>
                    <Badge variant="secondary">{alert.threshold}%</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("alerts.campaigns", "Campaigns")}:</span>
                    <span>{alert.campaigns.join(", ")}</span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    {alert.notifyEmail && (
                      <Badge variant="outline">{t("alerts.emailEnabled", "Email")}</Badge>
                    )}
                    {alert.notifyPush && (
                      <Badge variant="outline">{t("alerts.pushEnabled", "Push")}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className={!alert.enabled ? "opacity-50" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${getAlertColor(alert.type)}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{alert.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {alertTypes.find((at) => at.value === alert.type)?.label}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={alert.enabled}
                      onCheckedChange={() => toggleAlertStatus(alert.id)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAlert(alert.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
