import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Receipt, Settings, Plus, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SUMIT() {
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const [invoiceForm, setInvoiceForm] = useState({
    clientId: 0,
    invoiceId: "",
    amount: "",
    description: "",
  });

  const [settingsForm, setSettingsForm] = useState({
    apiKey: "",
    apiSecret: "",
    businessId: "",
    isEnabled: false,
    autoCreateInvoice: false,
    autoSendInvoice: false,
  });

  const { data: clients = [] } = trpc.clients.list.useQuery();
  const { data: settings } = trpc.sumit.getSettings.useQuery();
  const { data: invoices = [], isLoading: invoicesLoading } = trpc.sumit.getInvoices.useQuery(
    { clientId: selectedClientId ?? 0 },
    { enabled: selectedClientId !== null }
  );

  useEffect(() => {
    if (settings) {
      setSettingsForm({
        apiKey: (settings as any).apiKey ?? "",
        apiSecret: (settings as any).apiSecret ?? "",
        businessId: (settings as any).businessId ?? "",
        isEnabled: (settings as any).isEnabled ?? false,
        autoCreateInvoice: (settings as any).autoCreateInvoice ?? false,
        autoSendInvoice: (settings as any).autoSendInvoice ?? false,
      });
    }
  }, [settings]);

  const createInvoiceMut = trpc.sumit.createInvoice.useMutation({
    onSuccess: () => {
      if (selectedClientId) utils.sumit.getInvoices.invalidate({ clientId: selectedClientId });
      toast.success(t("sumit.invoiceCreated", "تم إنشاء الفاتورة"));
      setInvoiceForm({ clientId: 0, invoiceId: "", amount: "", description: "" });
      setShowInvoiceDialog(false);
    },
    onError: () => toast.error(t("sumit.createFailed", "فشل إنشاء الفاتورة")),
  });

  const updateStatusMut = trpc.sumit.updateStatus.useMutation({
    onSuccess: () => {
      if (selectedClientId) utils.sumit.getInvoices.invalidate({ clientId: selectedClientId });
      toast.success(t("common.saved", "تم الحفظ"));
    },
    onError: () => toast.error(t("common.error", "حدث خطأ")),
  });

  const updateSettingsMut = trpc.sumit.updateSettings.useMutation({
    onSuccess: () => {
      utils.sumit.getSettings.invalidate();
      toast.success(t("common.saved", "تم الحفظ"));
    },
    onError: () => toast.error(t("common.error", "حدث خطأ")),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "sent": return "bg-blue-100 text-blue-800";
      case "draft": return "bg-gray-100 text-gray-800";
      case "overdue": return "bg-red-100 text-red-800";
      case "cancelled": return "bg-slate-100 text-slate-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return <CheckCircle2 className="w-4 h-4" />;
      case "sent": return <Receipt className="w-4 h-4" />;
      case "draft": return <Clock className="w-4 h-4" />;
      case "overdue": return <AlertCircle className="w-4 h-4" />;
      default: return <Receipt className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      paid: "مدفوعة", sent: "مرسلة", draft: "مسودة", overdue: "متأخرة", cancelled: "ملغاة",
    };
    return labels[status] || status;
  };

  const handleCreateInvoice = () => {
    if (!invoiceForm.clientId || !invoiceForm.invoiceId.trim() || !invoiceForm.amount.trim()) {
      toast.error(t("sumit.fillAllFields", "يرجى ملء جميع الحقول"));
      return;
    }
    createInvoiceMut.mutate({
      clientId: invoiceForm.clientId,
      invoiceId: invoiceForm.invoiceId,
      amount: parseFloat(invoiceForm.amount),
      currency: "ILS",
      description: invoiceForm.description || undefined,
    });
  };

  const handleSaveSettings = () => updateSettingsMut.mutate(settingsForm);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Receipt className="w-8 h-8 text-indigo-600" />
            {t("sumit.title", "تكامل SUMIT")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("sumit.subtitle", "إدارة الفواتير والمدفوعات")}</p>
        </div>
      </div>

      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invoices">{t("sumit.invoices", "الفواتير")}</TabsTrigger>
          <TabsTrigger value="settings">{t("sumit.settings", "الإعدادات")}</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <Label>{t("sumit.selectClient", "اختر العميل")}:</Label>
              <select
                value={selectedClientId ?? ""}
                onChange={(e) => setSelectedClientId(e.target.value ? Number(e.target.value) : null)}
                className="px-3 py-2 border rounded-md bg-background min-w-[200px]"
              >
                <option value="">{t("sumit.choose", "— اختر —")}</option>
                {clients.map((c: any) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <Button onClick={() => setShowInvoiceDialog(true)} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 ml-2" />
              {t("sumit.newInvoice", "فاتورة جديدة")}
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              {selectedClientId === null ? (
                <div className="text-center py-8 text-muted-foreground">{t("sumit.selectClientFirst", "اختر عميلاً لعرض الفواتير")}</div>
              ) : invoicesLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">{t("sumit.noInvoices", "لا توجد فواتير")}</div>
              ) : (
                <div className="space-y-3">
                  {invoices.map((inv: any) => (
                    <div key={inv.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold">#{inv.invoiceId}</p>
                          {inv.description && <p className="text-sm text-muted-foreground mt-1">{inv.description}</p>}
                          <p className="text-lg font-bold mt-1">{Number(inv.amount).toLocaleString("en-US")} ₪</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(inv.status)}`}>
                            {getStatusIcon(inv.status)}
                            {getStatusLabel(inv.status)}
                          </span>
                          <select
                            value={inv.status}
                            onChange={(e) => updateStatusMut.mutate({ id: inv.id, status: e.target.value as any })}
                            className="text-xs px-2 py-1 border rounded bg-background"
                          >
                            {["draft", "sent", "paid", "overdue", "cancelled"].map((s) => (<option key={s} value={s}>{getStatusLabel(s)}</option>))}
                          </select>
                        </div>
                      </div>
                      {inv.createdAt && (<p className="text-xs text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString("en-GB")}</p>)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {t("sumit.integrationSettings", "إعدادات التكامل")}
              </CardTitle>
              <CardDescription>{t("sumit.settingsDescription", "قم بتكوين اتصالك بـ SUMIT API")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="apiKey">{t("sumit.apiKey", "مفتاح API")}</Label>
                <Input id="apiKey" type="password" value={settingsForm.apiKey} onChange={(e) => setSettingsForm({ ...settingsForm, apiKey: e.target.value })} placeholder={t("sumit.apiKeyPlaceholder", "أدخل مفتاح API")} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="apiSecret">{t("sumit.apiSecret", "السر السري")}</Label>
                <Input id="apiSecret" type="password" value={settingsForm.apiSecret} onChange={(e) => setSettingsForm({ ...settingsForm, apiSecret: e.target.value })} placeholder={t("sumit.apiSecretPlaceholder", "أدخل السر السري")} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="businessId">{t("sumit.businessId", "معرف العمل")}</Label>
                <Input id="businessId" value={settingsForm.businessId} onChange={(e) => setSettingsForm({ ...settingsForm, businessId: e.target.value })} placeholder={t("sumit.businessIdPlaceholder", "أدخل معرف العمل")} className="mt-2" />
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label>{t("sumit.enabled", "تفعيل التكامل")}</Label>
                  <Switch checked={settingsForm.isEnabled} onCheckedChange={(v) => setSettingsForm({ ...settingsForm, isEnabled: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>{t("sumit.autoCreateInvoice", "إنشاء فاتورة تلقائي")}</Label>
                  <Switch checked={settingsForm.autoCreateInvoice} onCheckedChange={(v) => setSettingsForm({ ...settingsForm, autoCreateInvoice: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>{t("sumit.autoSendInvoice", "إرسال فاتورة تلقائي")}</Label>
                  <Switch checked={settingsForm.autoSendInvoice} onCheckedChange={(v) => setSettingsForm({ ...settingsForm, autoSendInvoice: v })} />
                </div>
              </div>

              <Button onClick={handleSaveSettings} disabled={updateSettingsMut.isPending} className="w-full bg-indigo-600 hover:bg-indigo-700 mt-4">
                {updateSettingsMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t("common.save", "حفظ")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>{t("sumit.newInvoice", "فاتورة جديدة")}</DialogTitle>
            <DialogDescription>{t("sumit.newInvoiceDescription", "إنشاء فاتورة جديدة في SUMIT")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("sumit.selectClient", "اختر العميل")}</Label>
              <select value={invoiceForm.clientId || ""} onChange={(e) => setInvoiceForm({ ...invoiceForm, clientId: Number(e.target.value) })} className="mt-2 w-full px-3 py-2 border rounded-md bg-background">
                <option value="">{t("sumit.choose", "— اختر —")}</option>
                {clients.map((c: any) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div>
              <Label htmlFor="invoiceId">{t("sumit.invoiceNumber", "رقم الفاتورة")}</Label>
              <Input id="invoiceId" value={invoiceForm.invoiceId} onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceId: e.target.value })} placeholder="INV-001" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="amount">{t("sumit.amount", "المبلغ")} (₪)</Label>
              <Input id="amount" type="number" value={invoiceForm.amount} onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })} placeholder="1000" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="invDescription">{t("sumit.description", "الوصف")}</Label>
              <Textarea id="invDescription" value={invoiceForm.description} onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })} placeholder={t("sumit.descriptionPlaceholder", "وصف الفاتورة")} className="mt-2" rows={3} />
            </div>
            <Button onClick={handleCreateInvoice} disabled={createInvoiceMut.isPending} className="w-full bg-indigo-600 hover:bg-indigo-700">
              {createInvoiceMut.isPending ? (<><Loader2 className="w-4 h-4 ml-2 animate-spin" />{t("common.creating", "جاري الإنشاء...")}</>) : (<><Plus className="w-4 h-4 ml-2" />{t("sumit.create", "إنشاء")}</>)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
