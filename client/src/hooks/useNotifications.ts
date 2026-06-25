import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export interface Notification {
  id: number;
  type: "task_assigned" | "campaign_update" | "payment_reminder" | "task_due";
  title: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
}

const POLL_INTERVAL = 30000; // 30 seconds

/**
 * Hook for real-time notification polling
 * Checks for new notifications at regular intervals
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isPolling, setIsPolling] = useState(true);
  const pollingIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastCheckRef = useRef<number>(Date.now());

  // Mock notifications for demo
  const mockNotifications: Notification[] = [
    {
      id: 1,
      type: "task_assigned",
      title: "Task Assigned",
      message: "You have been assigned: Website Redesign",
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
      isRead: false,
    },
    {
      id: 2,
      type: "campaign_update",
      title: "Campaign Launched",
      message: "Facebook Campaign 'Summer Sale' is live",
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
      isRead: false,
    },
  ];

  /**
   * Poll for new notifications
   */
  const pollNotifications = () => {
    try {
      // In a real app, this would be a tRPC query
      // const { data } = await trpc.notifications.list.useQuery();
      
      // For demo, use mock data
      const newNotifications = mockNotifications;
      setNotifications(newNotifications);
      
      const unread = newNotifications.filter((n) => !n.isRead).length;
      const previousUnread = unreadCount;
      
      setUnreadCount(unread);

      // Show toast for new notifications
      if (unread > previousUnread) {
        const newCount = unread - previousUnread;
        toast.info(`${newCount} new notification${newCount > 1 ? "s" : ""}`);
      }

      lastCheckRef.current = Date.now();
    } catch (error) {
      console.error("Error polling notifications:", error);
    }
  };

  /**
   * Start polling for notifications
   */
  const startPolling = () => {
    if (pollingIntervalRef.current) return;

    setIsPolling(true);
    pollNotifications(); // Initial check

    pollingIntervalRef.current = setInterval(() => {
      pollNotifications();
    }, POLL_INTERVAL);
  };

  /**
   * Stop polling for notifications
   */
  const stopPolling = () => {
    if (pollingIntervalRef.current !== undefined) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = undefined;
    }
    setIsPolling(false);
  };

  /**
   * Mark notification as read
   */
  const markAsRead = (notificationId: number) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );
    setUnreadCount(0);
  };

  /**
   * Delete notification
   */
  const deleteNotification = (notificationId: number) => {
    setNotifications((prev) =>
      prev.filter((n) => n.id !== notificationId)
    );
  };

  /**
   * Refresh notifications immediately
   */
  const refresh = () => {
    pollNotifications();
  };

  // Start polling on mount, stop on unmount
  useEffect(() => {
    startPolling();

    return () => {
      stopPolling();
    };
  }, []);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return {
    notifications,
    unreadCount,
    isPolling,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
    startPolling,
    stopPolling,
  };
}
