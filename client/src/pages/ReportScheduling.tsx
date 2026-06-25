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
import { Clock, Mail, FileText, Plus, Trash2, Edit2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ReportSchedule {
  id: string;
  name: string;
  frequency: "weekly" | "biweekly" | "monthly";
  dayOfWeek: number;
  time: string;
  recipients: string[];
  includeMetrics: boolean;
  includeRecommendations: boolean;
  includeInsights: boolean;
  enabled: boolean;
  lastSent?: Date;
  nextSend?: Date;
}

export default function ReportScheduling() {
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState<ReportSchedule[]>([
    {
      id: "1",
      name: "Weekly Performance Summary",
      frequency: "weekly",
      dayOfWeek: 1,
      time: "09:00",
      recipients: ["manager@company.com", "team@company.com"],
      includeMetrics: true,
      includeRecommendations: true,
      includeInsights: true,
      enabled: true,
      lastSent: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      nextSend: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: "2",
      name: "Monthly Client Report",
      frequency: "monthly",
      dayOfWeek: 1,
      time: "14:00",
      recipients: ["client@example.com"],
      includeMetrics: true,
      includeRecommendations: false,
      includeInsights: true,
      enabled: true,
      lastSent: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      nextSend: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    frequency: "weekly" | "biweekly" | "monthly";
    dayOfWeek: number;
    time: string;
    recipients: string;
    includeMetrics: boolean;
    includeRecommendations: boolean;
    includeInsights: boolean;
  }>({
    name: "",
    frequency: "weekly",
    dayOfWeek: 1,
    time: "09:00",
    recipients: "",
    includeMetrics: true,
    includeRecommendations: true,
    includeInsights: true,
  });

  const daysOfWeek = [
    { value: 0, label: t("common.sunday", "الأحد") },
    { value: 1, label: t("common.monday", "الاثنين") },
    { value: 2, label: t("common.tuesday", "الثلاثاء") },
    { value: 3, label: t("common.wednesday", "الأربعاء") },
    { value: 4, label: t("common.thursday", "الخميس") },
    { value: 5, label: t("common.friday", "الجمعة") },
    { value: 6, label: t("common.saturday", "السبت") },
  ];

  const handleAddSchedule = () => {
    if (!formData.name.trim()) {
      toast.error(t("reports.nameRequired", "Schedule name is required"));
      return;
    }

    if (!formData.recipients.trim()) {
      toast.error(t("reports.recipientsRequired", "At least one recipient is required"));
      return;
    }

    if (editingId) {
      setSchedules(
        schedules.map((s) =>
          s.id === editingId
            ? {
                ...s,
                name: formData.name,
                frequency: formData.frequency,
                dayOfWeek: formData.dayOfWeek,
                time: formData.time,
                recipients: formData.recipients.split(",").map((r) => r.trim()),
                includeMetrics: formData.includeMetrics,
                includeRecommendations: formData.includeRecommendations,
                includeInsights: formData.includeInsights,
              }
            : s
        )
      );
      toast.success(t("reports.scheduleUpdated", "Schedule updated"));
      setEditingId(null);
    } else {
      const newSchedule: ReportSchedule = {
        id: Date.now().toString(),
        name: formData.name,
        frequency: formData.frequency,
        dayOfWeek: formData.dayOfWeek,
        time: formData.time,
        recipients: formData.recipients.split(",").map((r) => r.trim()),
        includeMetrics: formData.includeMetrics,
        includeRecommendations: formData.includeRecommendations,
        includeInsights: formData.includeInsights,
        enabled: true,
        nextSend: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };
      setSchedules([newSchedule, ...schedules]);
      toast.success(t("reports.scheduleCreated", "Schedule created"));
    }

    setFormData({
      name: "",
      frequency: "weekly",
      dayOfWeek: 1,
      time: "09:00",
      recipients: "",
      includeMetrics: true,
      includeRecommendations: true,
      includeInsights: true,
    });
    setIsOpen(false);
  };

  const handleDeleteSchedule = (id: string) => {
    if (confirm(t("reports.confirmDelete", "Are you sure?"))) {
      setSchedules(schedules.filter((s) => s.id !== id));
      toast.success(t("reports.scheduleDeleted", "Schedule deleted"));
    }
  };

  const handleEditSchedule = (schedule: ReportSchedule) => {
    setEditingId(schedule.id);
    setFormData({
      name: schedule.name,
      frequency: schedule.frequency,
      dayOfWeek: schedule.dayOfWeek,
      time: schedule.time,
      recipients: schedule.recipients.join(", "),
      includeMetrics: schedule.includeMetrics,
      includeRecommendations: schedule.includeRecommendations,
      includeInsights: schedule.includeInsights,
    });
    setIsOpen(true);
  };

  const toggleScheduleStatus = (id: string) => {
    setSchedules(
      schedules.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const getFrequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      weekly: t("reports.weekly", "أسبوعي"),
      biweekly: t("reports.biweekly", "كل أسبوعين"),
      monthly: t("reports.monthly", "شهري"),
    };
    return labels[freq] || freq;
  };

  const enabledCount = schedules.filter((s) => s.enabled).length;
  const totalSent = 24; // Mock data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Clock className="w-8 h-8" />
          {t("reports.scheduling", "جدولة التقارير")}
        </h1>
        <p className="text-muted-foreground mt-2">{t("reports.schedulingDesc", "إعداد التقارير المجدولة وتسليمها التلقائي")}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("reports.activeSchedules", "الجداول النشطة")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enabledCount}</div>
            <p className="text-xs text-muted-foreground mt-1">من {schedules.length} إجمالي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("reports.reportsSent", "التقارير المرسلة")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent}</div>
            <p className="text-xs text-muted-foreground mt-1">هذا الشهر</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("reports.nextReport", "التقرير التالي")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">غداً الساعة 9:00</div>
            <p className="text-xs text-muted-foreground mt-1">Weekly Performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Schedules List */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">{t("reports.active", "نشطة")}</TabsTrigger>
          <TabsTrigger value="all">{t("reports.all", "الكل")}</TabsTrigger>
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
                      frequency: "weekly" as "weekly" | "biweekly" | "monthly",
                      dayOfWeek: 1,
                      time: "09:00",
                      recipients: "",
                      includeMetrics: true,
                      includeRecommendations: true,
                      includeInsights: true,
                    });
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t("reports.newSchedule", "جدول جديد")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingId ? t("reports.editSchedule", "تحرير الجدول") : t("reports.createSchedule", "إنشاء جدول")}</DialogTitle>
                  <DialogDescription>{t("reports.scheduleDescription", "إعداد جدول تقرير جديد")}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">{t("common.name", "الاسم")}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Weekly Summary"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="frequency">{t("reports.frequency", "التكرار")}</Label>
                    <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value as "weekly" | "biweekly" | "monthly" })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">{t("reports.weekly", "أسبوعي")}</SelectItem>
                        <SelectItem value="biweekly">{t("reports.biweekly", "كل أسبوعين")}</SelectItem>
                        <SelectItem value="monthly">{t("reports.monthly", "شهري")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dayOfWeek">{t("reports.dayOfWeek", "يوم الأسبوع")}</Label>
                    <Select value={formData.dayOfWeek.toString()} onValueChange={(value) => setFormData({ ...formData, dayOfWeek: parseInt(value) })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {daysOfWeek.map((day) => (
                          <SelectItem key={day.value} value={day.value.toString()}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="time">{t("reports.time", "الوقت")}</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="mt-1"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <Label htmlFor="recipients">{t("reports.recipients", "المستقبلون")}</Label>
                    <Input
                      id="recipients"
                      value={formData.recipients}
                      onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                      placeholder="email1@example.com, email2@example.com"
                      className="mt-1"
                    />
                  </div>

                  <div className="space-y-3 border-t pt-4">
                    <h3 className="font-medium text-sm">{t("reports.includeInReport", "تضمين في التقرير")}</h3>
                    <div className="flex items-center justify-between">
                      <Label>{t("reports.metrics", "المقاييس")}</Label>
                      <Switch
                        checked={formData.includeMetrics}
                        onCheckedChange={(checked) => setFormData({ ...formData, includeMetrics: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>{t("reports.recommendations", "التوصيات")}</Label>
                      <Switch
                        checked={formData.includeRecommendations}
                        onCheckedChange={(checked) => setFormData({ ...formData, includeRecommendations: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>{t("reports.insights", "الرؤى")}</Label>
                      <Switch
                        checked={formData.includeInsights}
                        onCheckedChange={(checked) => setFormData({ ...formData, includeInsights: checked })}
                      />
                    </div>
                  </div>

                  <Button onClick={handleAddSchedule} className="w-full bg-blue-600 hover:bg-blue-700">
                    {editingId ? t("common.update", "تحديث") : t("common.create", "إنشاء")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {schedules
            .filter((s) => s.enabled)
            .map((schedule) => (
              <Card key={schedule.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{schedule.name}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {getFrequencyLabel(schedule.frequency)} · {daysOfWeek.find((d) => d.value === schedule.dayOfWeek)?.label} في {schedule.time}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSchedule(schedule)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("reports.recipients", "المستقبلون")}:</span>
                    <span className="text-xs">{schedule.recipients.length} متلقي</span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    {schedule.includeMetrics && (
                      <Badge variant="secondary">{t("reports.metrics", "المقاييس")}</Badge>
                    )}
                    {schedule.includeRecommendations && (
                      <Badge variant="secondary">{t("reports.recommendations", "التوصيات")}</Badge>
                    )}
                    {schedule.includeInsights && (
                      <Badge variant="secondary">{t("reports.insights", "الرؤى")}</Badge>
                    )}
                  </div>
                  {schedule.nextSend && (
                    <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>التقرير التالي: {new Date(schedule.nextSend).toLocaleDateString("ar-SA")}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {schedules.map((schedule) => (
            <Card key={schedule.id} className={!schedule.enabled ? "opacity-50" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${schedule.enabled ? "bg-blue-100" : "bg-gray-100"}`}>
                      <FileText className={`w-5 h-5 ${schedule.enabled ? "text-blue-600" : "text-gray-600"}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{schedule.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {getFrequencyLabel(schedule.frequency)} · {daysOfWeek.find((d) => d.value === schedule.dayOfWeek)?.label} في {schedule.time}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={schedule.enabled}
                      onCheckedChange={() => toggleScheduleStatus(schedule.id)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSchedule(schedule.id)}
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
