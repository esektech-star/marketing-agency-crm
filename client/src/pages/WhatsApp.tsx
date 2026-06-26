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
import { MessageCircle, Settings, Send, Plus, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function WhatsApp() {
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const [templateForm, setTemplateForm] = useState({
    name: "",
    category: "lead" as "lead" | "task" | "performance" | "custom",
    content: "",
  });

  const [messageForm, setMessageForm] = useState({
    clientId: 0,
    phoneNumber: "",
    messageType: "custom" as "lead" | "task" | "performance" | "custom",
    content: "",
  });

  const [settingsForm, setSettingsForm] = useState({
    businessPhoneNumberId: "",
    accessToken: "",
    businessAccountId: "",
    isEnabled: false,
    autoSendOnNewLead: false,
    autoSendOnNewTask: false,
    autoSendPerformanceAlerts: false,
  });

  const { data: clients = [] } = trpc.clients.list.useQuery();
  const { data: templates = [], isLoading: templatesLoading } = trpc.whatsapp.getTemplates.useQuery({});
  const { data: settings } = trpc.whatsapp.getSettings.useQuery();
  const { data: messages = [], isLoading: messagesLoading } = trpc.whatsapp.getMessages.useQuery(
    { clientId: selectedClientId ?? 0, limit: 50 },
    { enabled: selectedClientId !== null }
  );

  useEffect(() => {
    if (settings) {
      setSettingsForm({
        businessPhoneNumberId: (settings as any).businessPhoneNumberId ?? "",
        accessToken: (settings as any).accessToken ?? "",
        businessAccountId: (settings as any).businessAccountId ?? "",
        isEnabled: (settings as any).isEnabled ?? false,
        autoSendOnNewLead: (settings as any).autoSendOnNewLead ?? false,
        autoSendOnNewTask: (settings as any).autoSendOnNewTask ?? false,
        autoSendPerformanceAlerts: (settings as any).autoSendPerformanceAlerts ?? false,
      });
    }
  }, [settings]);

  const createTemplateMut = trpc.whatsapp.createTemplate.useMutation({
    onSuccess: () => {
      utils.whatsapp.getTemplates.invalidate();
      toast.success(t("whatsapp.templateCreated", "تم إنشاء القالب بنجاح"));
      setTemplateForm({ name: "", category: "lead", content: "" });
      setShowTemplateDialog(false);
    },
    onError: () => toast.error(t("whatsapp.createFailed", "فشل إنشاء القالب")),
  });

  const sendMessageMut = trpc.whatsapp.sendMessage.useMutation({
    onSuccess: () => {
      if (selectedClientId) utils.whatsapp.getMessages.invalidate({ clientId: selectedClientId, limit: 50 });
      toast.success(t("whatsapp.messageSent", "تم إرسال الرسالة"));
      setMessageForm({ clientId: 0, phoneNumber: "", messageType: "custom", content: "" });
      setShowMessageDialog(false);
    },
    onError: () => toast.error(t("whatsapp.sendFailed", "فشل إرسال الرسالة")),
  });

  const updateSettingsMut = trpc.whatsapp.updateSettings.useMutation({
    onSuccess: () => {
      utils.whatsapp.getSettings.invalidate();
      toast.success(t("common.saved", "تم الحفظ"));
    },
    onError: () => toast.error(t("common.error", "حدث خطأ")),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent": return "bg-blue-100 text-blue-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "read": return "bg-purple-100 text-purple-800";
      case "pending": return "bg-amber-100 text-amber-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent": return <Send className="w-4 h-4" />;
      case "delivered": case "read": return <CheckCircle2 className="w-4 h-4" />;
      case "pending": return <Clock className="w-4 h-4" />;
      case "failed": return <AlertCircle className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      sent: "مرسل", delivered: "تم التسليم", read: "مقروء", pending: "قيد الانتظار", failed: "فشل",
    };
    return labels[status] || status;
  };

  const categoryLabels: Record<string, string> = {
    lead: t("whatsapp.catLead", "ليد"),
    task: t("whatsapp.catTask", "مهمة"),
    performance: t("whatsapp.catPerformance", "أداء"),
    custom: t("whatsapp.catCustom", "مخصص"),
  };

  const handleCreateTemplate = () => {
    if (!templateForm.name.trim() || !templateForm.content.trim()) {
      toast.error(t("whatsapp.fillAllFields", "يرجى ملء جميع الحقول"));
      return;
    }
    createTemplateMut.mutate({ name: templateForm.name, category: templateForm.category, content: templateForm.content });
  };

  const handleSendMessage = () => {
    if (!messageForm.clientId || !messageForm.phoneNumber.trim() || !messageForm.content.trim()) {
      toast.error(t("whatsapp.fillAllFields", "يرجى ملء جميع الحقول"));
      return;
    }
    sendMessageMut.mutate({
      clientId: messageForm.clientId,
      phoneNumber: messageForm.phoneNumber,
      messageType: messageForm.messageType,
      content: messageForm.content,
    });
  };

  const handleSaveSettings = () => {
    updateSettingsMut.mutate(settingsForm);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageCircle className="w-8 h-8 text-green-600" />
            {t("whatsapp.title", "تكامل WhatsApp")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("whatsapp.subtitle", "إدارة رسائل WhatsApp والقوالب")}</p>
        </div>
      </div>

      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="messages">{t("whatsapp.messages", "الرسائل")}</TabsTrigger>
          <TabsTrigger value="templates">{t("whatsapp.templates", "القوالب")}</TabsTrigger>
          <TabsTrigger value="settings">{t("whatsapp.settings", "الإعدادات")}</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <Label>{t("whatsapp.selectClient", "اختر العميل")}:</Label>
              <select
                value={selectedClientId ?? ""}
                onChange={(e) => setSelectedClientId(e.target.value ? Number(e.target.value) : null)}
                className="px-3 py-2 border rounded-md bg-background min-w-[200px]"
              >
                <option value="">{t("whatsapp.choose", "— اختر —")}</option>
                {clients.map((c: any) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <Button onClick={() => setShowMessageDialog(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 ml-2" />
              {t("whatsapp.sendNew", "إرسال رسالة جديدة")}
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              {selectedClientId === null ? (
                <div className="text-center py-8 text-muted-foreground">{t("whatsapp.selectClientFirst", "اختر عميلاً لعرض الرسائل")}</div>
              ) : messagesLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">{t("whatsapp.noMessages", "لا توجد رسائل")}</div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg: any) => (
                    <div key={msg.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold">{msg.phoneNumber}</p>
                          <p className="text-sm text-muted-foreground mt-1">{msg.content}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(msg.status)}`}>
                          {getStatusIcon(msg.status)}
                          {getStatusLabel(msg.status)}
                        </span>
                      </div>
                      {msg.createdAt && (
                        <p className="text-xs text-muted-foreground">{new Date(msg.createdAt).toLocaleString("ar-SA")}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{t("whatsapp.messageTemplates", "قوالب الرسائل")}</h2>
            <Button onClick={() => setShowTemplateDialog(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 ml-2" />
              {t("whatsapp.createTemplate", "إنشاء قالب جديد")}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templatesLoading ? (
              <div className="md:col-span-2 flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : templates.length === 0 ? (
              <Card className="md:col-span-2"><CardContent className="pt-6 text-center text-muted-foreground">{t("whatsapp.noTemplates", "لا توجد قوالب")}</CardContent></Card>
            ) : (
              templates.map((template: any) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{categoryLabels[template.category] || template.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">{template.content}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {t("whatsapp.integrationSettings", "إعدادات التكامل")}
              </CardTitle>
              <CardDescription>{t("whatsapp.settingsDescription", "قم بتكوين اتصالك بـ WhatsApp Business API")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="businessPhoneId">{t("whatsapp.businessPhoneId", "معرف رقم الهاتف")}</Label>
                <Input id="businessPhoneId" value={settingsForm.businessPhoneNumberId} onChange={(e) => setSettingsForm({ ...settingsForm, businessPhoneNumberId: e.target.value })} placeholder={t("whatsapp.businessPhoneIdPlaceholder", "أدخل معرف رقم الهاتف")} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="accessToken">{t("whatsapp.accessToken", "رمز الوصول")}</Label>
                <Input id="accessToken" type="password" value={settingsForm.accessToken} onChange={(e) => setSettingsForm({ ...settingsForm, accessToken: e.target.value })} placeholder={t("whatsapp.accessTokenPlaceholder", "أدخل رمز الوصول")} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="businessAccountId">{t("whatsapp.businessAccountId", "معرف حساب العمل")}</Label>
                <Input id="businessAccountId" value={settingsForm.businessAccountId} onChange={(e) => setSettingsForm({ ...settingsForm, businessAccountId: e.target.value })} placeholder={t("whatsapp.businessAccountIdPlaceholder", "أدخل معرف حساب العمل")} className="mt-2" />
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label>{t("whatsapp.enabled", "تفعيل التكامل")}</Label>
                  <Switch checked={settingsForm.isEnabled} onCheckedChange={(v) => setSettingsForm({ ...settingsForm, isEnabled: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>{t("whatsapp.autoSendOnNewLead", "إرسال تلقائي عند ليد جديد")}</Label>
                  <Switch checked={settingsForm.autoSendOnNewLead} onCheckedChange={(v) => setSettingsForm({ ...settingsForm, autoSendOnNewLead: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>{t("whatsapp.autoSendOnNewTask", "إرسال تلقائي عند مهمة جديدة")}</Label>
                  <Switch checked={settingsForm.autoSendOnNewTask} onCheckedChange={(v) => setSettingsForm({ ...settingsForm, autoSendOnNewTask: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>{t("whatsapp.autoSendPerformanceAlerts", "إرسال تنبيهات الأداء")}</Label>
                  <Switch checked={settingsForm.autoSendPerformanceAlerts} onCheckedChange={(v) => setSettingsForm({ ...settingsForm, autoSendPerformanceAlerts: v })} />
                </div>
              </div>

              <Button onClick={handleSaveSettings} disabled={updateSettingsMut.isPending} className="w-full bg-green-600 hover:bg-green-700 mt-4">
                {updateSettingsMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t("common.save", "حفظ")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>{t("whatsapp.sendMessage", "إرسال رسالة")}</DialogTitle>
            <DialogDescription>{t("whatsapp.sendMessageDescription", "أرسل رسالة WhatsApp جديدة")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("whatsapp.selectClient", "اختر العميل")}</Label>
              <select
                value={messageForm.clientId || ""}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const client = clients.find((c: any) => c.id === id);
                  setMessageForm({ ...messageForm, clientId: id, phoneNumber: (client as any)?.phone ?? messageForm.phoneNumber });
                }}
                className="mt-2 w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">{t("whatsapp.choose", "— اختر —")}</option>
                {clients.map((c: any) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div>
              <Label htmlFor="phone">{t("whatsapp.phoneNumber", "رقم الهاتف")}</Label>
              <Input id="phone" placeholder="+972..." value={messageForm.phoneNumber} onChange={(e) => setMessageForm({ ...messageForm, phoneNumber: e.target.value })} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="content">{t("whatsapp.messageContent", "محتوى الرسالة")}</Label>
              <Textarea id="content" placeholder={t("whatsapp.messageContentPlaceholder", "أدخل محتوى الرسالة")} value={messageForm.content} onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })} className="mt-2" rows={4} />
            </div>
            <Button onClick={handleSendMessage} disabled={sendMessageMut.isPending} className="w-full bg-green-600 hover:bg-green-700">
              {sendMessageMut.isPending ? (<><Loader2 className="w-4 h-4 ml-2 animate-spin" />{t("common.sending", "جاري الإرسال...")}</>) : (<><Send className="w-4 h-4 ml-2" />{t("whatsapp.send", "إرسال")}</>)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>{t("whatsapp.createTemplate", "إنشاء قالب جديد")}</DialogTitle>
            <DialogDescription>{t("whatsapp.createTemplateDescription", "أنشئ قالب رسالة جديد")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="templateName">{t("whatsapp.templateName", "اسم القالب")}</Label>
              <Input id="templateName" placeholder={t("whatsapp.templateNamePlaceholder", "مثال: تحية لليد جديد")} value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="templateCategory">{t("whatsapp.category", "الفئة")}</Label>
              <select id="templateCategory" value={templateForm.category} onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value as any })} className="mt-2 w-full px-3 py-2 border rounded-md bg-background">
                {Object.keys(categoryLabels).map((c) => (<option key={c} value={c}>{categoryLabels[c]}</option>))}
              </select>
            </div>
            <div>
              <Label htmlFor="templateContent">{t("whatsapp.templateContent", "محتوى القالب")}</Label>
              <Textarea id="templateContent" placeholder={t("whatsapp.templateContentPlaceholder", "أدخل محتوى القالب")} value={templateForm.content} onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })} className="mt-2" rows={4} />
            </div>
            <Button onClick={handleCreateTemplate} disabled={createTemplateMut.isPending} className="w-full bg-green-600 hover:bg-green-700">
              {createTemplateMut.isPending ? (<><Loader2 className="w-4 h-4 ml-2 animate-spin" />{t("common.creating", "جاري الإنشاء...")}</>) : (<><Plus className="w-4 h-4 ml-2" />{t("whatsapp.create", "إنشاء")}</>)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
