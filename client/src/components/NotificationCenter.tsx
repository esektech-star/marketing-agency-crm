import { useTranslation } from "react-i18next";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NotificationCenter() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // Mock notifications - in a real app, these would come from tRPC queries
  const notifications = [
    {
      id: 1,
      type: "task_assigned",
      title: t("notifications.taskAssigned", "Task Assigned"),
      message: "You have been assigned a new task: Website Redesign",
      createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      isRead: false,
    },
    {
      id: 2,
      type: "campaign_update",
      title: t("notifications.campaignLaunched", "Campaign Launched"),
      message: "Facebook Campaign 'Summer Sale' has been launched successfully",
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      isRead: false,
    },
    {
      id: 3,
      type: "payment_reminder",
      title: t("notifications.paymentReceived", "Payment Received"),
      message: "Payment of ₪5,000 received from Acme Corp",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      isRead: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task_assigned":
        return "📋";
      case "campaign_update":
        return "📢";
      case "payment_reminder":
        return "💰";
      default:
        return "🔔";
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("common.justNow", "Just now");
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold">{t("notifications.title", "Notifications")}</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => {
                  // Mark all as read
                  toast.success(t("common.success", "Success"));
                }}
              >
                <Check className="w-3 h-3 me-1" />
                {t("notifications.markAllRead", "Mark all read")}
              </Button>
            )}
          </div>

          <div className="divide-y">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {t("notifications.empty", "No notifications")}
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Delete notification
                        toast.success(t("common.deleted", "Deleted"));
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-gray-200 text-center">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              {t("notifications.viewAll", "View all notifications")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
