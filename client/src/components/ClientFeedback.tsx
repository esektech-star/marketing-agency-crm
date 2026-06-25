import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Send, CheckCircle2, Clock, AlertCircle, User, Reply } from "lucide-react";
import { toast } from "sonner";

interface Feedback {
  id: string;
  clientId: string;
  clientName: string;
  type: "feedback" | "request" | "issue";
  title: string;
  description: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: Date;
  responses: FeedbackResponse[];
}

interface FeedbackResponse {
  id: string;
  author: string;
  role: string;
  message: string;
  timestamp: Date;
}

interface ClientFeedbackProps {
  clientId?: string;
  clientName?: string;
  onSubmit?: (feedback: Feedback) => void;
}

export default function ClientFeedback({
  clientId = "1",
  clientName = "Acme Corp",
  onSubmit,
}: ClientFeedbackProps) {
  const { t } = useTranslation();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([
    {
      id: "1",
      clientId,
      clientName,
      type: "request",
      title: "تغيير لون الشعار",
      description: "نود تغيير لون الشعار من الأزرق إلى الأحمر في الحملة القادمة",
      status: "in-progress",
      priority: "high",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      responses: [
        {
          id: "1",
          author: "أحمد محمد",
          role: "مدير التصميم",
          message: "تم استلام طلبك، سيتم تطبيق التغييرات في غضون يومين",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      id: "2",
      clientId,
      clientName,
      type: "feedback",
      title: "الحملة الأخيرة رائعة",
      description: "شكراً على الحملة الأخيرة، كانت النتائج أفضل من التوقعات",
      status: "resolved",
      priority: "low",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      responses: [
        {
          id: "2",
          author: "فاطمة علي",
          role: "مدير العلاقات",
          message: "شكراً على ملاحظاتك الإيجابية، نتطلع للعمل معك مجدداً",
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
      ],
    },
  ]);

  const [newFeedback, setNewFeedback] = useState({
    title: "",
    description: "",
    type: "feedback" as const,
    priority: "medium" as const,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [responseText, setResponseText] = useState("");

  const handleSubmitFeedback = () => {
    if (!newFeedback.title || !newFeedback.description) {
      toast.error(t("common.fillRequired", "يرجى ملء جميع الحقول"));
      return;
    }

    const feedback: Feedback = {
      id: Date.now().toString(),
      clientId,
      clientName,
      type: newFeedback.type,
      title: newFeedback.title,
      description: newFeedback.description,
      status: "open",
      priority: newFeedback.priority,
      createdAt: new Date(),
      responses: [],
    };

    setFeedbacks([feedback, ...feedbacks]);
    setNewFeedback({ title: "", description: "", type: "feedback", priority: "medium" });
    setIsOpen(false);
    toast.success(t("feedback.submitted", "تم إرسال الملاحظة بنجاح"));
    onSubmit?.(feedback);
  };

  const handleAddResponse = () => {
    if (!responseText || !selectedFeedback) return;

    const updatedFeedbacks = feedbacks.map((f) =>
      f.id === selectedFeedback.id
        ? {
            ...f,
            responses: [
              ...f.responses,
              {
                id: Date.now().toString(),
                author: "فريق Esek Tech",
                role: "مدير المشروع",
                message: responseText,
                timestamp: new Date(),
              },
            ],
          }
        : f
    );

    setFeedbacks(updatedFeedbacks);
    setResponseText("");
    setSelectedFeedback(updatedFeedbacks.find((f) => f.id === selectedFeedback.id) || null);
    toast.success(t("feedback.responseAdded", "تم إضافة الرد"));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "closed":
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <MessageSquare className="w-5 h-5 text-amber-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      open: { label: t("feedback.open", "مفتوح"), color: "bg-amber-100 text-amber-800" },
      "in-progress": { label: t("feedback.inProgress", "قيد المعالجة"), color: "bg-blue-100 text-blue-800" },
      resolved: { label: t("feedback.resolved", "تم الحل"), color: "bg-green-100 text-green-800" },
      closed: { label: t("feedback.closed", "مغلق"), color: "bg-gray-100 text-gray-800" },
    };
    const s = statusMap[status] || statusMap.open;
    return <Badge className={s.color}>{s.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { label: string; color: string }> = {
      low: { label: t("feedback.low", "منخفض"), color: "bg-blue-100 text-blue-800" },
      medium: { label: t("feedback.medium", "متوسط"), color: "bg-yellow-100 text-yellow-800" },
      high: { label: t("feedback.high", "عالي"), color: "bg-red-100 text-red-800" },
    };
    const p = priorityMap[priority] || priorityMap.medium;
    return <Badge className={p.color}>{p.label}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("feedback.title", "الملاحظات والطلبات")}</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4 mr-2" />
              {t("feedback.new", "ملاحظة جديدة")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("feedback.newFeedback", "إضافة ملاحظة جديدة")}</DialogTitle>
              <DialogDescription>
                {t("feedback.newDesc", "شارك ملاحظاتك أو طلباتك معنا")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t("common.type", "النوع")}</label>
                <select
                  value={newFeedback.type}
                  onChange={(e) =>
                    setNewFeedback({ ...newFeedback, type: e.target.value as any })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                >
                  <option value="feedback">{t("feedback.feedback", "ملاحظة")}</option>
                  <option value="request">{t("feedback.request", "طلب تغيير")}</option>
                  <option value="issue">{t("feedback.issue", "مشكلة")}</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">{t("common.priority", "الأولوية")}</label>
                <select
                  value={newFeedback.priority}
                  onChange={(e) =>
                    setNewFeedback({ ...newFeedback, priority: e.target.value as any })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                >
                  <option value="low">{t("feedback.low", "منخفض")}</option>
                  <option value="medium">{t("feedback.medium", "متوسط")}</option>
                  <option value="high">{t("feedback.high", "عالي")}</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">{t("common.title", "العنوان")}</label>
                <Input
                  value={newFeedback.title}
                  onChange={(e) =>
                    setNewFeedback({ ...newFeedback, title: e.target.value })
                  }
                  placeholder={t("feedback.titlePlaceholder", "أدخل عنوان الملاحظة")}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">{t("common.description", "الوصف")}</label>
                <Textarea
                  value={newFeedback.description}
                  onChange={(e) =>
                    setNewFeedback({ ...newFeedback, description: e.target.value })
                  }
                  placeholder={t("feedback.descPlaceholder", "اشرح ملاحظتك بالتفصيل")}
                  className="mt-1 min-h-24"
                />
              </div>

              <Button
                onClick={handleSubmitFeedback}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {t("feedback.submit", "إرسال")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Feedback List */}
      <div className="space-y-3">
        {feedbacks.map((feedback) => (
          <Card key={feedback.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader
              onClick={() => setSelectedFeedback(feedback)}
              className="pb-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(feedback.status)}
                  <div className="flex-1">
                    <CardTitle className="text-lg">{feedback.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {feedback.description}
                    </CardDescription>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {getStatusBadge(feedback.status)}
                {getPriorityBadge(feedback.priority)}
              </div>
            </CardHeader>

            {selectedFeedback?.id === feedback.id && (
              <CardContent className="space-y-4 border-t pt-4">
                {/* Responses */}
                {feedback.responses.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">{t("feedback.responses", "الردود")}</h4>
                    {feedback.responses.map((response) => (
                      <div key={response.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{response.author}</span>
                          <span className="text-xs text-muted-foreground">
                            {response.role}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {response.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {response.timestamp.toLocaleDateString("ar-SA")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Response */}
                {feedback.status !== "closed" && (
                  <div className="space-y-2 border-t pt-4">
                    <label className="text-sm font-medium">{t("feedback.addResponse", "إضافة رد")}</label>
                    <Textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder={t("feedback.responsePlaceholder", "أدخل ردك هنا...")}
                      className="min-h-20"
                    />
                    <Button
                      onClick={handleAddResponse}
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={!responseText}
                    >
                      <Reply className="w-4 h-4 mr-2" />
                      {t("feedback.sendResponse", "إرسال الرد")}
                    </Button>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {feedbacks.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("feedback.noFeedback", "لا توجد ملاحظات حالياً")}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
