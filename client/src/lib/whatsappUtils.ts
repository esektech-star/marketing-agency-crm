/**
 * WhatsApp Share Utilities
 * Generate WhatsApp share links with pre-formatted messages
 */

export interface WhatsAppShareOptions {
  phoneNumber?: string;
  message: string;
  prefilledMessage?: boolean;
}

/**
 * Generate WhatsApp share URL
 * @param options Share options
 * @returns WhatsApp share URL
 */
export function generateWhatsAppShareUrl(options: WhatsAppShareOptions): string {
  const { phoneNumber, message, prefilledMessage = true } = options;
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);
  
  if (phoneNumber) {
    // Direct message to specific number (format: country code + number)
    // Remove any non-digit characters
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
  } else {
    // Share to any contact
    return `https://wa.me/?text=${encodedMessage}`;
  }
}

/**
 * Open WhatsApp share in new window
 * @param options Share options
 */
export function shareViaWhatsApp(options: WhatsAppShareOptions): void {
  const url = generateWhatsAppShareUrl(options);
  window.open(url, '_blank', 'width=600,height=400');
}

/**
 * Format client share message
 */
export function formatClientShareMessage(clientName: string, serviceType: string, monthlyAmount: number): string {
  return `🤝 *عميل جديد*\n\nالعميل: ${clientName}\nالخدمة: ${serviceType}\nالمبلغ الشهري: ₪${monthlyAmount}\n\n#Esek_Tech`;
}

/**
 * Format lead share message
 */
export function formatLeadShareMessage(leadName: string, source: string, budget?: number): string {
  const budgetText = budget ? `\nالميزانية: ₪${budget}` : '';
  return `📞 *ليد جديد*\n\nالاسم: ${leadName}\nالمصدر: ${source}${budgetText}\n\n#Esek_Tech`;
}

/**
 * Format campaign share message
 */
export function formatCampaignShareMessage(campaignName: string, platform: string, startDate: string): string {
  return `📢 *حملة جديدة*\n\nالحملة: ${campaignName}\nالمنصة: ${platform}\nتاريخ البداية: ${startDate}\n\n#Esek_Tech`;
}

/**
 * Format access details share message (secure - no passwords)
 */
export function formatAccessDetailsShareMessage(clientName: string, platform: string, username: string): string {
  return `🔐 *بيانات وصول*\n\nالعميل: ${clientName}\nالمنصة: ${platform}\nاسم المستخدم: ${username}\n\n⚠️ يرجى عدم مشاركة كلمة المرور عبر WhatsApp\n\n#Esek_Tech`;
}

/**
 * Format Hebrew client share message
 */
export function formatClientShareMessageHE(clientName: string, serviceType: string, monthlyAmount: number): string {
  return `🤝 *לקוח חדש*\n\nלקוח: ${clientName}\nשירות: ${serviceType}\nסכום חודשי: ₪${monthlyAmount}\n\n#Esek_Tech`;
}

/**
 * Format Hebrew lead share message
 */
export function formatLeadShareMessageHE(leadName: string, source: string, budget?: number): string {
  const budgetText = budget ? `\nתקציב: ₪${budget}` : '';
  return `📞 *ליד חדש*\n\nשם: ${leadName}\nמקור: ${source}${budgetText}\n\n#Esek_Tech`;
}

/**
 * Format Hebrew campaign share message
 */
export function formatCampaignShareMessageHE(campaignName: string, platform: string, startDate: string): string {
  return `📢 *קמפיין חדש*\n\nקמפיין: ${campaignName}\nפלטפורמה: ${platform}\nתאריך התחלה: ${startDate}\n\n#Esek_Tech`;
}

/**
 * Format Hebrew access details share message
 */
export function formatAccessDetailsShareMessageHE(clientName: string, platform: string, username: string): string {
  return `🔐 *פרטי גישה*\n\nלקוח: ${clientName}\nפלטפורמה: ${platform}\nשם משתמש: ${username}\n\n⚠️ אנא אל תשתף סיסמה דרך WhatsApp\n\n#Esek_Tech`;
}

/**
 * Format English client share message
 */
export function formatClientShareMessageEN(clientName: string, serviceType: string, monthlyAmount: number): string {
  return `🤝 *New Client*\n\nClient: ${clientName}\nService: ${serviceType}\nMonthly Amount: ₪${monthlyAmount}\n\n#Esek_Tech`;
}

/**
 * Format English lead share message
 */
export function formatLeadShareMessageEN(leadName: string, source: string, budget?: number): string {
  const budgetText = budget ? `\nBudget: ₪${budget}` : '';
  return `📞 *New Lead*\n\nName: ${leadName}\nSource: ${source}${budgetText}\n\n#Esek_Tech`;
}

/**
 * Format English campaign share message
 */
export function formatCampaignShareMessageEN(campaignName: string, platform: string, startDate: string): string {
  return `📢 *New Campaign*\n\nCampaign: ${campaignName}\nPlatform: ${platform}\nStart Date: ${startDate}\n\n#Esek_Tech`;
}

/**
 * Format English access details share message
 */
export function formatAccessDetailsShareMessageEN(clientName: string, platform: string, username: string): string {
  return `🔐 *Access Details*\n\nClient: ${clientName}\nPlatform: ${platform}\nUsername: ${username}\n\n⚠️ Please do not share passwords via WhatsApp\n\n#Esek_Tech`;
}
