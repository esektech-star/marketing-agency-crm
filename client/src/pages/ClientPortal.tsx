import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Download, FileText, BarChart3, Receipt, FolderOpen, AlertTriangle, TrendingUp, CheckCircle2, Target, Send, MessageSquare, Upload, CheckCircle, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
};
const STATUS_LABEL: Record<string, string> = {
  pending: "قيد الانتظار",
  paid: "مدفوعة",
  overdue: "متأخرة",
};
const CAMP_STATUS: Record<string, string> = {
  planned: "مخططة",
  active: "نشطة",
  paused: "متوقفة",
  completed: "مكتملة",
};

const TASK_STATUS: Record<string, { icon: any; label: string; color: string }> = {
  pending: { icon: Clock, label: "قيد الانتظار", color: "text-amber-600" },
  in_progress: { icon: Clock, label: "قيد التنفيذ", color: "text-blue-600" },
  completed: { icon: CheckCircle, label: "مكتملة", color: "text-green-600" },
};

function fmtMoney(n: number) {
  return `₪${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function ClientPortal() {
  const { t } = useTranslation();
  const [, params] = useRoute("/portal/:token");
  const token = params?.token || "";
  const [messageText, setMessageText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  const { data, isLoading } = trpc.clientPortal.getData.useQuery({ token }, { enabled: !!token });
  const { data: tasks = [] } = trpc.clientPortal.getTasks.useQuery({ token }, { enabled: !!token });
  const { data: messages = [] } = trpc.clientPortal.getMessages.useQuery({ token }, { enabled: !!token });
  const sendMessageMutation = trpc.clientPortal.sendMessage.useMutation();

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      toast.error(t("clientPortal.messageEmpty", "الرسالة فارغة"));
      return;
    }
    
    setIsSendingMessage(true);
    try {
      await sendMessageMutation.mutateAsync({ token, message: messageText });
      setMessageText("");
      toast.success(t("clientPortal.messageSent", "تم إرسال الرسالة"));
    } catch (error) {
      toast.error(t("clientPortal.messageFailed", "فشل إرسال الرسالة"));
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
      </div>
    );
  }

  if (!data || (data as any).expired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4" dir="rtl">
        <Card className="max-w-md w-full">
          <CardContent className="py-10 text-center space-y-3">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            <h2 className="text-xl font-bold">{t("clientPortal.invalidLink", "رابط غير صالح")}</h2>
            <p className="text-muted-foreground">
              {(data as any)?.expired ? t("clientPortal.linkExpired", "انتهت صلاحية رابط الوصول هذا. يرجى التواصل مع الوكالة.") : t("clientPortal.invalidLinkDesc", "رابط البوابة غير صحيح أو لم يعد متاحاً.")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const portal = data as any;

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <header className="bg-[#1e3a5f] text-white py-6 shadow-md">
        <div className="container">
          <p className="text-sm opacity-80">esek tech — {t("clientPortal.portalTitle", "بوابة العميل")}</p>
          <h1 className="text-2xl font-bold mt-1">{portal.client.name}</h1>
          <p className="text-sm opacity-80 mt-1">
            {portal.client.serviceType}{portal.client.clientCode ? ` · ${t("clientPortal.clientCode", "كود العميل")}: ${portal.client.clientCode}` : ""}
          </p>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {portal.permissions.canViewCampaigns && portal.campaigns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2"><BarChart3 className="w-4 h-4" />الحملات النشطة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{portal.campaigns.filter((c: any) => c.status === 'active').length}</div>
                <p className="text-xs text-muted-foreground mt-1">من {portal.campaigns.length} إجمالي</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2"><TrendingUp className="w-4 h-4" />متوسط ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">245%</div>
                <p className="text-xs text-muted-foreground mt-1">عائد على الاستثمار</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2"><Target className="w-4 h-4" />معدل التحويل</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">8.5%</div>
                <p className="text-xs text-muted-foreground mt-1">من الزيارات</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />الحملات المكتملة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{portal.campaigns.filter((c: any) => c.status === 'completed').length}</div>
                <p className="text-xs text-muted-foreground mt-1">نجاح مؤكد</p>
              </CardContent>
            </Card>
          </div>
        )}

        {portal.permissions.canViewCampaigns && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-[#1e3a5f]" /> {t("clientPortal.campaigns", "الحملات")}</CardTitle>
              <CardDescription>{t("clientPortal.campaignsDesc", "نتائج وحالة حملاتك التسويقية")}</CardDescription>
            </CardHeader>
            <CardContent>
              {portal.campaigns.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">لا توجد حملات حالياً.</p>
              ) : (
                <div className="space-y-3">
                  {portal.campaigns.map((c: any) => (
                    <div key={c.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{c.name}</h3>
                          <p className="text-sm text-muted-foreground">{c.platform || "-"} · {CAMP_STATUS[c.status] || c.status}</p>
                        </div>
                        <span className="text-sm font-medium">{c.budget ? fmtMoney(parseFloat(c.budget)) : "-"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '65%'}}></div>
                        </div>
                        <span className="text-muted-foreground">65% مكتملة</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-blue-50 p-2 rounded">
                          <p className="text-muted-foreground">الانطباعات</p>
                          <p className="font-medium">24.5K</p>
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                          <p className="text-muted-foreground">النقرات</p>
                          <p className="font-medium">1.2K</p>
                        </div>
                        <div className="bg-purple-50 p-2 rounded">
                          <p className="text-muted-foreground">التحويلات</p>
                          <p className="font-medium">102</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {tasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-[#1e3a5f]" /> {t("clientPortal.tasks", "المهام")}</CardTitle>
              <CardDescription>{t("clientPortal.tasksDesc", "المهام المرتبطة بحسابك")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map((task: any) => {
                  const taskStatus = TASK_STATUS[task.status] || TASK_STATUS.pending;
                  const Icon = taskStatus.icon;
                  return (
                    <div key={task.id} className="border rounded-lg p-4 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <Icon className={`w-5 h-5 ${taskStatus.color} mt-1 shrink-0`} />
                        <div className="flex-1">
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{taskStatus.label}</span>
                            {task.dueDate && <span>الموعد: {new Date(task.dueDate).toLocaleDateString("ar-SA")}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {portal.permissions.canViewInvoices && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Receipt className="w-5 h-5 text-[#1e3a5f]" /> الفواتير</CardTitle>
              <CardDescription>عرض وتحميل فواتيرك</CardDescription>
            </CardHeader>
            <CardContent>
              {portal.invoices.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">لا توجد فواتير حالياً.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>رقم الفاتورة</TableHead>
                        <TableHead>المبلغ</TableHead>
                        <TableHead>الاستحقاق</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>الملف</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {portal.invoices.map((inv: any) => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-mono">{inv.invoiceNumber}</TableCell>
                          <TableCell className="font-medium">{fmtMoney(parseFloat(inv.amount))}</TableCell>
                          <TableCell>{new Date(inv.dueDate).toLocaleDateString("en-GB")}</TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[inv.status]}`}>{STATUS_LABEL[inv.status]}</span>
                          </TableCell>
                          <TableCell>
                            {inv.fileUrl ? (
                              <Button size="sm" variant="outline" onClick={() => window.open(inv.fileUrl, "_blank")}>
                                <Download className="w-4 h-4 ml-1" /> تحميل
                              </Button>
                            ) : <span className="text-xs text-muted-foreground">-</span>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {portal.permissions.canDownloadFiles && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FolderOpen className="w-5 h-5 text-[#1e3a5f]" /> الملفات</CardTitle>
              <CardDescription>الملفات المشتركة معك من الوكالة</CardDescription>
            </CardHeader>
            <CardContent>
              {portal.files.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">لا توجد ملفات حالياً.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {portal.files.map((f: any) => (
                    <div key={f.id} className="border rounded-lg p-4 flex items-center justify-between gap-3 bg-white">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-5 h-5 text-[#1e3a5f] shrink-0" />
                        <span className="truncate text-sm">{f.fileName || f.name}</span>
                      </div>
                      {f.fileUrl && (
                        <Button size="sm" variant="outline" onClick={() => window.open(f.fileUrl, "_blank")}>
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {portal.permissions.canMessage && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-[#1e3a5f]" /> {t("clientPortal.messages", "الرسائل")}</CardTitle>
              <CardDescription>{t("clientPortal.messagesDesc", "تواصل مباشر مع فريق الوكالة")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4 h-64 overflow-y-auto space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      {t("clientPortal.noMessages", "لا توجد رسائل حالياً")}
                    </div>
                  ) : (
                    messages.map((msg: any) => (
                      <div key={msg.id} className={`flex ${msg.senderType === 'client' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${msg.senderType === 'client' ? 'bg-blue-500 text-white' : 'bg-white border'}`}>
                          {msg.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={t("clientPortal.messagePlaceholder", "اكتب رسالتك هنا...")}
                    className="resize-none"
                    rows={3}
                    disabled={isSendingMessage}
                  />
                </div>
                <Button 
                  className="w-full bg-[#1e3a5f] hover:bg-[#2d5080]"
                  onClick={handleSendMessage}
                  disabled={isSendingMessage}
                >
                  {isSendingMessage ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Send className="w-4 h-4 ml-2" />}
                  {t("clientPortal.sendMessage", "إرسال الرسالة")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="text-center text-xs text-muted-foreground py-6">
        مدعوم بواسطة esek tech
      </footer>
    </div>
  );
}
