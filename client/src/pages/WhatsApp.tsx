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
import { MessageCircle, Settings, Send, Plus, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Template {
  id: number;
  name: string;
  category: string;
  content: string;
  variables?: Record<string, any>;
  isActive: boolean;
}

interface Message {
  id: number;
  clientId: number;
  phoneNumber: string;
  messageType: string;
  content: string;
  status: "pending" | "sent" | "delivered" | "read" | "failed";
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
}

export default function WhatsApp() {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const [templateForm, setTemplateForm] = useState({
    name: "",
    category: "lead",
    content: "",
  });

  const [messageForm, setMessageForm] = useState({
    clientId: 0,
    phoneNumber: "",
    messageType: "custom",
    content: "",
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "read":
        return "bg-purple-100 text-purple-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Send className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle2 className="w-4 h-4" />;
      case "read":
        return <CheckCircle2 className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "failed":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      sent: "مرسل",
      delivered: "تم التسليم",
      read: "مقروء",
      pending: "قيد الانتظار",
      failed: "فشل",
    };
    return labels[status] || status;
  };

  const createTemplate = async () => {
    if (!templateForm.name.trim() || !templateForm.content.trim()) {
      toast.error(t("whatsapp.fillAllFields", "يرجى ملء جميع الحقول"));
      return;
    }

    setIsLoading(true);
    try {
      // Simulate template creation
      const newTemplate: Template = {
        id: Date.now(),
        name: templateForm.name,
        category: templateForm.category,
        content: templateForm.content,
        isActive: true,
      };
      setTemplates([...templates, newTemplate]);
      setTemplateForm({ name: "", category: "lead", content: "" });
      setShowTemplateDialog(false);
      toast.success(t("whatsapp.templateCreated", "تم إنشاء القالب بنجاح"));
    } catch (error) {
      toast.error(t("whatsapp.createFailed", "فشل إنشاء القالب"));
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageForm.phoneNumber.trim() || !messageForm.content.trim()) {
      toast.error(t("whatsapp.fillAllFields", "يرجى ملء جميع الحقول"));
      return;
    }

    setIsLoading(true);
    try {
      // Simulate message sending
      const newMessage: Message = {
        id: Date.now(),
        clientId: messageForm.clientId,
        phoneNumber: messageForm.phoneNumber,
        messageType: messageForm.messageType,
        content: messageForm.content,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      setMessages([newMessage, ...messages]);
      setMessageForm({ clientId: 0, phoneNumber: "", messageType: "custom", content: "" });
      setShowMessageDialog(false);
      toast.success(t("whatsapp.messageSent", "تم إرسال الرسالة"));
    } catch (error) {
      toast.error(t("whatsapp.sendFailed", "فشل إرسال الرسالة"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageCircle className="w-8 h-8 text-green-600" />
            {t("whatsapp.title", "WhatsApp Integration")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("whatsapp.subtitle", "إدارة رسائل WhatsApp والقوالب")}
          </p>
        </div>
      </div>

      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="messages">{t("whatsapp.messages", "الرسائل")}</TabsTrigger>
          <TabsTrigger value="templates">{t("whatsapp.templates", "القوالب")}</TabsTrigger>
          <TabsTrigger value="settings">{t("whatsapp.settings", "الإعدادات")}</TabsTrigger>
        </TabsList>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{t("whatsapp.messageHistory", "سجل الرسائل")}</h2>
            <Button onClick={() => setShowMessageDialog(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 ml-2" />
              {t("whatsapp.sendNew", "إرسال رسالة جديدة")}
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t("whatsapp.noMessages", "لا توجد رسائل")}
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
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
                      <p className="text-xs text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleDateString("ar-SA")} {new Date(msg.createdAt).toLocaleTimeString("ar-SA")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{t("whatsapp.messageTemplates", "قوالب الرسائل")}</h2>
            <Button onClick={() => setShowTemplateDialog(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 ml-2" />
              {t("whatsapp.createTemplate", "إنشاء قالب جديد")}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.length === 0 ? (
              <Card className="md:col-span-2">
                <CardContent className="pt-6 text-center text-muted-foreground">
                  {t("whatsapp.noTemplates", "لا توجد قوالب")}
                </CardContent>
              </Card>
            ) : (
              templates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedTemplate(template)}>
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">{template.content}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {t("whatsapp.integrationSettings", "إعدادات التكامل")}
              </CardTitle>
              <CardDescription>
                {t("whatsapp.settingsDescription", "قم بتكوين اتصالك بـ WhatsApp Business API")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="businessPhoneId">{t("whatsapp.businessPhoneId", "معرف رقم الهاتف")}</Label>
                <Input
                  id="businessPhoneId"
                  placeholder={t("whatsapp.businessPhoneIdPlaceholder", "أدخل معرف رقم الهاتف")}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="accessToken">{t("whatsapp.accessToken", "رمز الوصول")}</Label>
                <Input
                  id="accessToken"
                  type="password"
                  placeholder={t("whatsapp.accessTokenPlaceholder", "أدخل رمز الوصول")}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="businessAccountId">{t("whatsapp.businessAccountId", "معرف حساب العمل")}</Label>
                <Input
                  id="businessAccountId"
                  placeholder={t("whatsapp.businessAccountIdPlaceholder", "أدخل معرف حساب العمل")}
                  className="mt-2"
                />
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label>{t("whatsapp.autoSendOnNewLead", "إرسال تلقائي عند ليد جديد")}</Label>
                  <input type="checkbox" className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between">
                  <Label>{t("whatsapp.autoSendOnNewTask", "إرسال تلقائي عند مهمة جديدة")}</Label>
                  <input type="checkbox" className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between">
                  <Label>{t("whatsapp.autoSendPerformanceAlerts", "إرسال تنبيهات الأداء")}</Label>
                  <input type="checkbox" className="w-4 h-4" />
                </div>
              </div>

              <Button className="w-full bg-green-600 hover:bg-green-700 mt-4">
                {t("common.save", "حفظ")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Send Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>{t("whatsapp.sendMessage", "إرسال رسالة")}</DialogTitle>
            <DialogDescription>
              {t("whatsapp.sendMessageDescription", "أرسل رسالة WhatsApp جديدة")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">{t("whatsapp.phoneNumber", "رقم الهاتف")}</Label>
              <Input
                id="phone"
                placeholder="+966..."
                value={messageForm.phoneNumber}
                onChange={(e) => setMessageForm({ ...messageForm, phoneNumber: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="content">{t("whatsapp.messageContent", "محتوى الرسالة")}</Label>
              <Textarea
                id="content"
                placeholder={t("whatsapp.messageContentPlaceholder", "أدخل محتوى الرسالة")}
                value={messageForm.content}
                onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
                className="mt-2"
                rows={4}
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  {t("common.sending", "جاري الإرسال...")}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 ml-2" />
                  {t("whatsapp.send", "إرسال")}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>{t("whatsapp.createTemplate", "إنشاء قالب جديد")}</DialogTitle>
            <DialogDescription>
              {t("whatsapp.createTemplateDescription", "أنشئ قالب رسالة جديد")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="templateName">{t("whatsapp.templateName", "اسم القالب")}</Label>
              <Input
                id="templateName"
                placeholder={t("whatsapp.templateNamePlaceholder", "مثال: تحية لقيادة جديدة")}
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="templateContent">{t("whatsapp.templateContent", "محتوى القالب")}</Label>
              <Textarea
                id="templateContent"
                placeholder={t("whatsapp.templateContentPlaceholder", "أدخل محتوى القالب")}
                value={templateForm.content}
                onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                className="mt-2"
                rows={4}
              />
            </div>
            <Button
              onClick={createTemplate}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  {t("common.creating", "جاري الإنشاء...")}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 ml-2" />
                  {t("whatsapp.create", "إنشاء")}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
