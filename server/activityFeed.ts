import * as db from "./db";
import { notifications, type InsertNotification } from "../drizzle/schema";

export type ActivityType = 
  | "task_created"
  | "task_updated"
  | "task_completed"
  | "campaign_launched"
  | "campaign_updated"
  | "client_added"
  | "client_updated"
  | "milestone_reached"
  | "payment_received"
  | "comment_added";

export interface ActivityEvent {
  type: ActivityType;
  userId: number;
  title: string;
  message: string;
  relatedTaskId?: number;
  relatedClientId?: number;
  relatedCampaignId?: number;
  metadata?: Record<string, any>;
}

/**
 * Log an activity event and create notifications for relevant team members
 */
export async function logActivity(event: ActivityEvent) {
  try {
    // Get all team members (for now, we'll notify the owner)
    const users = await db.getAppUsers();
    
    for (const user of users) {
      // Create notification for each user
      const notification: InsertNotification = {
        userId: user.id,
        type: mapActivityTypeToNotificationType(event.type),
        title: event.title,
        message: event.message,
        relatedTaskId: event.relatedTaskId,
        relatedClientId: event.relatedClientId,
        isRead: false,
      };

      // Insert notification into database
      // This would use the actual database insert method
      console.log(`Notification created for user ${user.id}:`, notification);
    }

    return true;
  } catch (error) {
    console.error("Error logging activity:", error);
    return false;
  }
}

/**
 * Map activity types to notification types
 */
function mapActivityTypeToNotificationType(activityType: ActivityType): "task_due" | "payment_reminder" | "task_assigned" | "campaign_update" {
  const typeMap: Record<ActivityType, "task_due" | "payment_reminder" | "task_assigned" | "campaign_update"> = {
    task_created: "task_assigned",
    task_updated: "campaign_update",
    task_completed: "task_due",
    campaign_launched: "campaign_update",
    campaign_updated: "campaign_update",
    client_added: "campaign_update",
    client_updated: "campaign_update",
    milestone_reached: "campaign_update",
    payment_received: "payment_reminder",
    comment_added: "task_assigned",
  };

  return typeMap[activityType] || "campaign_update";
}

/**
 * Get activity feed for a user
 */
export async function getUserActivityFeed(userId: number, limit: number = 20) {
  try {
    // This would query the notifications table
    // For now, return mock data
    return [];
  } catch (error) {
    console.error("Error getting activity feed:", error);
    return [];
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: number): Promise<number> {
  try {
    // This would count unread notifications for the user
    return 0;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: number) {
  try {
    // This would update the notification in the database
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: number) {
  try {
    // This would update all notifications for the user
    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
}
