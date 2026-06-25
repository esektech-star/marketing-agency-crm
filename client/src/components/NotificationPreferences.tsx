import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bell, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
  };
}

export default function NotificationPreferences() {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: "task_assigned",
      label: t("notifications.taskAssigned", "Task Assigned"),
      description: t("notifications.taskAssignedDesc", "Get notified when a task is assigned to you"),
      icon: <MessageSquare className="w-5 h-5" />,
      enabled: true,
      channels: { inApp: true, email: true, push: false },
    },
    {
      id: "campaign_update",
      label: t("notifications.campaignUpdate", "Campaign Updates"),
      description: t("notifications.campaignUpdateDesc", "Get notified about campaign status changes"),
      icon: <Bell className="w-5 h-5" />,
      enabled: true,
      channels: { inApp: true, email: false, push: true },
    },
    {
      id: "payment_reminder",
      label: t("notifications.paymentReminder", "Payment Reminders"),
      description: t("notifications.paymentReminderDesc", "Get notified about payments and invoices"),
      icon: <Mail className="w-5 h-5" />,
      enabled: true,
      channels: { inApp: true, email: true, push: false },
    },
    {
      id: "client_milestone",
      label: t("notifications.clientMilestone", "Client Milestones"),
      description: t("notifications.clientMilestoneDesc", "Get notified about important client events"),
      icon: <Bell className="w-5 h-5" />,
      enabled: false,
      channels: { inApp: true, email: false, push: false },
    },
  ]);

  const handleTogglePreference = (id: string) => {
    setPreferences((prev) =>
      prev.map((pref) =>
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
      )
    );
  };

  const handleToggleChannel = (id: string, channel: "inApp" | "email" | "push") => {
    setPreferences((prev) =>
      prev.map((pref) =>
        pref.id === id
          ? {
              ...pref,
              channels: {
                ...pref.channels,
                [channel]: !pref.channels[channel],
              },
            }
          : pref
      )
    );
  };

  const handleSavePreferences = () => {
    // In a real app, this would save to the backend
    toast.success(t("common.saved", "Preferences saved successfully"));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("notifications.preferences", "Notification Preferences")}</h2>
        <p className="text-muted-foreground mt-1">
          {t("notifications.preferencesDesc", "Manage how you receive notifications")}
        </p>
      </div>

      <div className="space-y-4">
        {preferences.map((pref) => (
          <Card key={pref.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="text-blue-600 mt-1">{pref.icon}</div>
                  <div>
                    <CardTitle className="text-base">{pref.label}</CardTitle>
                    <CardDescription className="mt-1">{pref.description}</CardDescription>
                  </div>
                </div>
                <Switch
                  checked={pref.enabled}
                  onCheckedChange={() => handleTogglePreference(pref.id)}
                />
              </div>
            </CardHeader>

            {pref.enabled && (
              <CardContent>
                <div className="space-y-3 ps-8">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      {t("notifications.inApp", "In-App Notifications")}
                    </Label>
                    <Switch
                      checked={pref.channels.inApp}
                      onCheckedChange={() => handleToggleChannel(pref.id, "inApp")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      {t("notifications.emailNotifications", "Email Notifications")}
                    </Label>
                    <Switch
                      checked={pref.channels.email}
                      onCheckedChange={() => handleToggleChannel(pref.id, "email")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      {t("notifications.pushNotifications", "Push Notifications")}
                    </Label>
                    <Switch
                      checked={pref.channels.push}
                      onCheckedChange={() => handleToggleChannel(pref.id, "push")}
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline">{t("common.cancel", "Cancel")}</Button>
        <Button onClick={handleSavePreferences}>{t("common.save", "Save Preferences")}</Button>
      </div>
    </div>
  );
}
