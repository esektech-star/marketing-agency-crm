/**
 * WhatsApp Integration Utility
 * Provides functions to send messages via WhatsApp
 */

export interface WhatsAppMessage {
  phone: string;
  message: string;
  title?: string;
}

/**
 * Format phone number to WhatsApp format (+972XXXXXXXXX)
 */
export function formatPhoneForWhatsApp(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");

  // Handle Israeli phone numbers
  if (cleaned.startsWith("0")) {
    cleaned = "972" + cleaned.substring(1);
  } else if (!cleaned.startsWith("972")) {
    cleaned = "972" + cleaned;
  }

  return cleaned;
}

/**
 * Generate WhatsApp link
 */
export function getWhatsAppLink(phone: string, message?: string): string {
  const formatted = formatPhoneForWhatsApp(phone);
  const encoded = message ? encodeURIComponent(message) : "";
  return `https://wa.me/${formatted}${encoded ? `?text=${encoded}` : ""}`;
}

/**
 * Open WhatsApp chat
 */
export function openWhatsApp(phone: string, message?: string): void {
  const link = getWhatsAppLink(phone, message);
  window.open(link, "_blank");
}

/**
 * Send WhatsApp message with predefined templates
 */
export function sendWhatsAppMessage(
  phone: string,
  type: "payment_reminder" | "campaign_update" | "invoice" | "custom",
  data?: Record<string, any>
): void {
  let message = "";

  switch (type) {
    case "payment_reminder":
      message = `السلام عليكم ورحمة الله وبركاته\n\nتذكير بدفع الفاتورة رقم ${data?.invoiceNumber || "---"}\nالمبلغ: ₪${data?.amount || "0"}\nتاريخ الاستحقاق: ${data?.dueDate || "---"}\n\nشكراً لك`;
      break;

    case "campaign_update":
      message = `السلام عليكم ورحمة الله وبركاته\n\nتحديث حملتك: ${data?.campaignName || "---"}\nالحالة: ${data?.status || "---"}\nالنتائج: ${data?.results || "---"}\n\nشكراً لك`;
      break;

    case "invoice":
      message = `السلام عليكم ورحمة الله وبركاته\n\nفاتورة جديدة: ${data?.invoiceNumber || "---"}\nالمبلغ: ₪${data?.amount || "0"}\nالتاريخ: ${data?.date || "---"}\n\nشكراً لك`;
      break;

    case "custom":
      message = data?.message || "";
      break;
  }

  if (message) {
    openWhatsApp(phone, message);
  }
}

/**
 * Create WhatsApp button props
 */
export function getWhatsAppButtonProps(phone: string, message?: string) {
  return {
    onClick: () => openWhatsApp(phone, message),
    title: "فتح WhatsApp",
  };
}
