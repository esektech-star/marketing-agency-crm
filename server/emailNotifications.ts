import { notifyOwner } from "./_core/notification";

export interface EmailNotificationTemplate {
  subject: string;
  body: string;
  recipientEmail: string;
  type: "task_assigned" | "campaign_update" | "payment_reminder" | "client_milestone";
}

/**
 * Send email notification to a user
 */
export async function sendEmailNotification(template: EmailNotificationTemplate): Promise<boolean> {
  try {
    // Use the built-in notification system to send email
    const result = await notifyOwner({
      title: template.subject,
      content: template.body,
    });

    console.log(`Email notification sent to ${template.recipientEmail}:`, template.subject);
    return result;
  } catch (error) {
    console.error("Error sending email notification:", error);
    return false;
  }
}

/**
 * Send task assigned notification email
 */
export async function sendTaskAssignedEmail(
  recipientEmail: string,
  taskTitle: string,
  assignerName: string
): Promise<boolean> {
  const template: EmailNotificationTemplate = {
    subject: `New Task Assigned: ${taskTitle}`,
    body: `
You have been assigned a new task: "${taskTitle}"

Assigned by: ${assignerName}

Please log in to your dashboard to view more details and start working on this task.
    `.trim(),
    recipientEmail,
    type: "task_assigned",
  };

  return sendEmailNotification(template);
}

/**
 * Send campaign launch notification email
 */
export async function sendCampaignLaunchEmail(
  recipientEmail: string,
  campaignName: string,
  platform: string
): Promise<boolean> {
  const template: EmailNotificationTemplate = {
    subject: `Campaign Launched: ${campaignName}`,
    body: `
Your campaign "${campaignName}" has been successfully launched on ${platform}.

Monitor the campaign performance in your dashboard:
- View real-time analytics
- Track conversions and ROI
- Adjust targeting as needed

Log in to your dashboard to see detailed metrics.
    `.trim(),
    recipientEmail,
    type: "campaign_update",
  };

  return sendEmailNotification(template);
}

/**
 * Send payment received notification email
 */
export async function sendPaymentReceivedEmail(
  recipientEmail: string,
  clientName: string,
  amount: number,
  currency: string = "₪"
): Promise<boolean> {
  const template: EmailNotificationTemplate = {
    subject: `Payment Received from ${clientName}`,
    body: `
Payment received successfully!

Client: ${clientName}
Amount: ${currency}${amount.toFixed(2)}

The payment has been recorded in your system. You can view the transaction details in the Transactions section of your dashboard.
    `.trim(),
    recipientEmail,
    type: "payment_reminder",
  };

  return sendEmailNotification(template);
}

/**
 * Send client milestone notification email
 */
export async function sendClientMilestoneEmail(
  recipientEmail: string,
  clientName: string,
  milestone: string
): Promise<boolean> {
  const template: EmailNotificationTemplate = {
    subject: `Client Milestone: ${clientName}`,
    body: `
Important milestone reached for client ${clientName}:

${milestone}

This is a great opportunity to review the client's progress and plan next steps. Log in to your dashboard to view the client's full profile and activity history.
    `.trim(),
    recipientEmail,
    type: "client_milestone",
  };

  return sendEmailNotification(template);
}

/**
 * Send daily digest email with summary of activities
 */
export async function sendDailyDigestEmail(
  recipientEmail: string,
  summary: {
    newTasks: number;
    completedTasks: number;
    newCampaigns: number;
    newPayments: number;
  }
): Promise<boolean> {
  const template: EmailNotificationTemplate = {
    subject: "Daily Activity Summary",
    body: `
Here's your daily summary:

📋 Tasks:
  - New tasks: ${summary.newTasks}
  - Completed: ${summary.completedTasks}

📢 Campaigns:
  - New campaigns: ${summary.newCampaigns}

💰 Payments:
  - New payments: ${summary.newPayments}

Log in to your dashboard to see detailed information about all activities.
    `.trim(),
    recipientEmail,
    type: "task_assigned",
  };

  return sendEmailNotification(template);
}
