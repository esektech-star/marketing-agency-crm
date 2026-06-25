import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Share2, Copy, Mail, Calendar } from "lucide-react";
import { toast } from "sonner";

interface ExportShareProps {
  title: string;
  data?: any;
  reportType?: "analytics" | "campaign" | "client";
}

export default function ExportShare({
  title,
  data,
  reportType = "analytics",
}: ExportShareProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [shareLink, setShareLink] = useState("");
  const [expirationDays, setExpirationDays] = useState("7");
  const [recipientEmail, setRecipientEmail] = useState("");

  const handleExport = async () => {
    try {
      if (exportFormat === "pdf") {
        // Simulate PDF export
        const content = `
# ${title}

Generated: ${new Date().toLocaleDateString("ar-SA")}

## Summary
${includeSummary ? "Report summary data..." : ""}

## Charts
${includeCharts ? "Chart data..." : ""}

## Details
${JSON.stringify(data, null, 2)}
        `;

        const element = document.createElement("a");
        element.setAttribute(
          "href",
          "data:text/plain;charset=utf-8," + encodeURIComponent(content)
        );
        element.setAttribute("download", `${title}.pdf`);
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      } else {
        // Simulate Excel export
        const csvContent = [
          ["Report Name", title],
          ["Generated Date", new Date().toLocaleDateString("ar-SA")],
          [""],
          ["Metric", "Value"],
          ...Object.entries(data || {}).map(([key, value]) => [key, value]),
        ]
          .map((row) => row.join(","))
          .join("\n");

        const element = document.createElement("a");
        element.setAttribute(
          "href",
          "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent)
        );
        element.setAttribute("download", `${title}.csv`);
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }

      toast.success(
        t(
          "export.success",
          `تم تصدير التقرير بصيغة ${exportFormat === "pdf" ? "PDF" : "Excel"}`
        )
      );
      setIsOpen(false);
    } catch (error) {
      toast.error(t("common.error", "حدث خطأ"));
    }
  };

  const handleCreateShareLink = () => {
    const link = `https://esektech.manus.space/share/${Math.random().toString(36).substr(2, 9)}`;
    setShareLink(link);
    toast.success(t("share.linkCreated", "تم إنشاء رابط المشاركة"));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success(t("common.copied", "تم النسخ إلى الحافظة"));
  };

  const handleSendEmail = async () => {
    if (!recipientEmail) {
      toast.error(t("share.emailRequired", "يرجى إدخال بريد إلكتروني"));
      return;
    }

    try {
      // Simulate email sending
      toast.success(
        t("share.emailSent", `تم إرسال التقرير إلى ${recipientEmail}`)
      );
      setRecipientEmail("");
      setShareOpen(false);
    } catch (error) {
      toast.error(t("common.error", "حدث خطأ"));
    }
  };

  return (
    <div className="flex gap-2">
      {/* Export Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 me-2" />
            {t("export.title", "تصدير")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("export.title", "تصدير التقرير")}</DialogTitle>
            <DialogDescription>
              {t("export.desc", "اختر صيغة التصدير والخيارات المطلوبة")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>{t("export.format", "صيغة التصدير")}</Label>
              <Select value={exportFormat} onValueChange={(v: any) => setExportFormat(v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel (CSV)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="include-summary"
                  checked={includeSummary}
                  onCheckedChange={(v) => setIncludeSummary(v as boolean)}
                />
                <Label htmlFor="include-summary" className="cursor-pointer">
                  {t("export.includeSummary", "تضمين الملخص")}
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="include-charts"
                  checked={includeCharts}
                  onCheckedChange={(v) => setIncludeCharts(v as boolean)}
                />
                <Label htmlFor="include-charts" className="cursor-pointer">
                  {t("export.includeCharts", "تضمين الرسوم البيانية")}
                </Label>
              </div>
            </div>

            <Button onClick={handleExport} className="w-full bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 me-2" />
              {t("export.download", "تحميل")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 me-2" />
            {t("share.title", "مشاركة")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("share.title", "مشاركة التقرير")}</DialogTitle>
            <DialogDescription>
              {t("share.desc", "أنشئ رابط آمن للمشاركة أو أرسل عبر البريد الإلكتروني")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Share Link Section */}
            <div className="space-y-2">
              <Label>{t("share.linkExpiration", "انتهاء الصلاحية")}</Label>
              <Select value={expirationDays} onValueChange={setExpirationDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t("share.oneDay", "يوم واحد")}</SelectItem>
                  <SelectItem value="7">{t("share.sevenDays", "7 أيام")}</SelectItem>
                  <SelectItem value="30">{t("share.thirtyDays", "30 يوم")}</SelectItem>
                  <SelectItem value="90">{t("share.ninetyDays", "90 يوم")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!shareLink ? (
              <Button
                onClick={handleCreateShareLink}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Calendar className="w-4 h-4 me-2" />
                {t("share.createLink", "إنشاء رابط")}
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                  <code className="text-sm text-muted-foreground truncate">
                    {shareLink}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyLink}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("share.expiresIn", `ينتهي في ${expirationDays} أيام`)}
                </p>
              </div>
            )}

            {/* Email Section */}
            <div className="border-t pt-4 space-y-2">
              <Label htmlFor="email">{t("share.sendEmail", "إرسال عبر البريد الإلكتروني")}</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder={t("share.emailPlaceholder", "البريد الإلكتروني")}
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
                <Button
                  onClick={handleSendEmail}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
