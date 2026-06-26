import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Receipt, Settings, Plus, CheckCircle2, Clock, AlertCircle, Loader2, Download } from "lucide-react";
import { toast } from "sonner";

interface Invoice {
  id: number;
  clientId: number;
  invoiceId: string;
  amount: string;
  currency: string;
  description?: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  dueDate?: string;
  paidDate?: string;
  createdAt: string;
}

export default function SUMIT() {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);

  const [invoiceForm, setInvoiceForm] = useState({
    clientId: 0,
    invoiceId: "",
    amount: "",
    currency: "SAR",
    description: "",
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-slate-100 text-slate-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="w-4 h-4" />;
      case "sent":
        return <Clock className="w-4 h-4" />;
      case "draft":
        return <Receipt className="w-4 h-4" />;
      case "overdue":
        return <AlertCircle className="w-4 h-4" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Receipt className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      paid: "مدفوع",
      sent: "مرسل",
      draft: "مسودة",
      overdue: "متأخر",
      cancelled: "ملغي",
    };
    return labels[status] || status;
  };

  const createInvoice = async () => {
    if (!invoiceForm.invoiceId.trim() || !invoiceForm.amount.trim()) {
      toast.error(t("sumit.fillAllFields", "يرجى ملء جميع الحقول"));
      return;
    }

    setIsLoading(true);
    try {
      const newInvoice: Invoice = {
        id: Date.now(),
        clientId: invoiceForm.clientId,
        invoiceId: invoiceForm.invoiceId,
        amount: invoiceForm.amount,
        currency: invoiceForm.currency,
        description: invoiceForm.description,
        status: "draft",
        createdAt: new Date().toISOString(),
      };
      setInvoices([newInvoice, ...invoices]);
      setInvoiceForm({ clientId: 0, invoiceId: "", amount: "", currency: "SAR", description: "" });
      setShowInvoiceDialog(false);
      toast.success(t("sumit.invoiceCreated", "تم إنشاء الفاتورة بنجاح"));
    } catch (error) {
      toast.error(t("sumit.createFailed", "فشل إنشاء الفاتورة"));
    } finally {
      setIsLoading(false);
    }
  };

  const markAsPaid = (invoiceId: number) => {
    setInvoices(
      invoices.map((inv) =>
        inv.id === invoiceId ? { ...inv, status: "paid" as const, paidDate: new Date().toISOString() } : inv
      )
    );
    toast.success(t("sumit.markedAsPaid", "تم تحديد الفاتورة كمدفوعة"));
  };

  const downloadInvoice = (invoice: Invoice) => {
    toast.success(t("sumit.downloadStarted", "جاري تحميل الفاتورة..."));
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Receipt className="w-8 h-8 text-orange-600" />
            {t("sumit.title", "SUMIT Integration")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("sumit.subtitle", "إدارة الفواتير والدفع عبر SUMIT")}
          </p>
        </div>
      </div>

      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invoices">{t("sumit.invoices", "الفواتير")}</TabsTrigger>
          <TabsTrigger value="settings">{t("sumit.settings", "الإعدادات")}</TabsTrigger>
        </TabsList>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{t("sumit.invoiceList", "قائمة الفواتير")}</h2>
            <Button onClick={() => setShowInvoiceDialog(true)} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 ml-2" />
              {t("sumit.createNew", "إنشاء فاتورة جديدة")}
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              {invoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t("sumit.noInvoices", "لا توجد فواتير")}
                </div>
              ) : (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold">{invoice.invoiceId}</p>
                          <p className="text-sm text-muted-foreground mt-1">{invoice.description}</p>
                          <p className="text-lg font-bold mt-2">
                            {invoice.amount} {invoice.currency}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(invoice.status)}`}>
                            {getStatusIcon(invoice.status)}
                            {getStatusLabel(invoice.status)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadInvoice(invoice)}
                            className="ml-2"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <p>
                          {t("sumit.created", "تم الإنشاء")}: {new Date(invoice.createdAt).toLocaleDateString("ar-SA")}
                        </p>
                        {invoice.status !== "paid" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsPaid(invoice.id)}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            {t("sumit.markAsPaid", "تحديد كمدفوع")}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {t("sumit.integrationSettings", "إعدادات التكامل")}
              </CardTitle>
              <CardDescription>
                {t("sumit.settingsDescription", "قم بتكوين اتصالك بـ SUMIT API")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="apiKey">{t("sumit.apiKey", "مفتاح API")}</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder={t("sumit.apiKeyPlaceholder", "أدخل مفتاح API")}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="apiSecret">{t("sumit.apiSecret", "سر API")}</Label>
                <Input
                  id="apiSecret"
                  type="password"
                  placeholder={t("sumit.apiSecretPlaceholder", "أدخل سر API")}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="businessId">{t("sumit.businessId", "معرف العمل")}</Label>
                <Input
                  id="businessId"
                  placeholder={t("sumit.businessIdPlaceholder", "أدخل معرف العمل")}
                  className="mt-2"
                />
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label>{t("sumit.autoCreateInvoice", "إنشاء فاتورة تلقائي")}</Label>
                  <input type="checkbox" className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between">
                  <Label>{t("sumit.autoSendInvoice", "إرسال فاتورة تلقائي")}</Label>
                  <input type="checkbox" className="w-4 h-4" />
                </div>
              </div>

              <Button className="w-full bg-orange-600 hover:bg-orange-700 mt-4">
                {t("common.save", "حفظ")}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("sumit.syncStatus", "حالة المزامنة")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-green-800">{t("sumit.lastSync", "آخر مزامنة")}</span>
                  <span className="text-green-600 font-semibold">منذ 5 دقائق</span>
                </div>
                <Button className="w-full" variant="outline">
                  {t("sumit.syncNow", "مزامنة الآن")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>{t("sumit.createInvoice", "إنشاء فاتورة")}</DialogTitle>
            <DialogDescription>
              {t("sumit.createInvoiceDescription", "أنشئ فاتورة جديدة عبر SUMIT")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="invoiceId">{t("sumit.invoiceNumber", "رقم الفاتورة")}</Label>
              <Input
                id="invoiceId"
                placeholder="INV-001"
                value={invoiceForm.invoiceId}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceId: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="amount">{t("sumit.amount", "المبلغ")}</Label>
              <Input
                id="amount"
                type="number"
                placeholder="1000"
                value={invoiceForm.amount}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="description">{t("sumit.description", "الوصف")}</Label>
              <Textarea
                id="description"
                placeholder={t("sumit.descriptionPlaceholder", "أدخل وصف الفاتورة")}
                value={invoiceForm.description}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                className="mt-2"
                rows={3}
              />
            </div>
            <Button
              onClick={createInvoice}
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  {t("common.creating", "جاري الإنشاء...")}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 ml-2" />
                  {t("sumit.create", "إنشاء")}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
