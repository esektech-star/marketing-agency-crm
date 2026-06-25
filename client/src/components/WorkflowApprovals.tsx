import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Clock, AlertCircle, User, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface Approver {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  status: "pending" | "approved" | "rejected";
  comment?: string;
  timestamp?: Date;
}

interface WorkflowApproval {
  id: string;
  campaignId: string;
  campaignName: string;
  status: "pending" | "approved" | "rejected";
  approvers: Approver[];
  createdAt: Date;
  deadline?: Date;
}

interface WorkflowApprovalsProps {
  campaignId?: string;
  campaignName?: string;
  onApprove?: () => void;
  onReject?: () => void;
}

export default function WorkflowApprovals({
  campaignId = "1",
  campaignName = "Summer Campaign 2024",
  onApprove,
  onReject,
}: WorkflowApprovalsProps) {
  const { t } = useTranslation();
  const [approvals, setApprovals] = useState<WorkflowApproval[]>([
    {
      id: "1",
      campaignId,
      campaignName,
      status: "pending",
      approvers: [
        {
          id: "1",
          name: "أحمد محمد",
          role: "مدير التسويق",
          status: "approved",
          comment: "تم الموافقة على المحتوى والميزانية",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: "2",
          name: "فاطمة علي",
          role: "مدير المشاريع",
          status: "pending",
          comment: undefined,
        },
        {
          id: "3",
          name: "محمود حسن",
          role: "مدير الميزانية",
          status: "pending",
          comment: undefined,
        },
      ],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [selectedApproval, setSelectedApproval] = useState<WorkflowApproval | null>(approvals[0]);
  const [comment, setComment] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleApprove = () => {
    if (selectedApproval) {
      setApprovals(
        approvals.map((a) =>
          a.id === selectedApproval.id
            ? {
                ...a,
                approvers: a.approvers.map((app) =>
                  app.id === "2"
                    ? {
                        ...app,
                        status: "approved" as const,
                        comment,
                        timestamp: new Date(),
                      }
                    : app
                ),
              }
            : a
        )
      );
      toast.success(t("workflow.approved", "تمت الموافقة"));
      setComment("");
      setIsOpen(false);
      onApprove?.();
    }
  };

  const handleReject = () => {
    if (selectedApproval) {
      setApprovals(
        approvals.map((a) =>
          a.id === selectedApproval.id
            ? {
                ...a,
                status: "rejected" as const,
                approvers: a.approvers.map((app) =>
                  app.id === "2"
                    ? {
                        ...app,
                        status: "rejected" as const,
                        comment,
                        timestamp: new Date(),
                      }
                    : app
                ),
              }
            : a
        )
      );
      toast.error(t("workflow.rejected", "تم الرفض"));
      setComment("");
      setIsOpen(false);
      onReject?.();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-amber-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">{t("workflow.approved", "موافق")}</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">{t("workflow.rejected", "مرفوض")}</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-800">{t("workflow.pending", "قيد الانتظار")}</Badge>;
    }
  };

  const getOverallStatus = (approvers: Approver[]) => {
    const approved = approvers.filter((a) => a.status === "approved").length;
    const rejected = approvers.filter((a) => a.status === "rejected").length;
    const total = approvers.length;

    if (rejected > 0) return "rejected";
    if (approved === total) return "approved";
    return "pending";
  };

  if (!selectedApproval) {
    return null;
  }

  const overallStatus = getOverallStatus(selectedApproval.approvers);
  const approvedCount = selectedApproval.approvers.filter((a) => a.status === "approved").length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(overallStatus)}
            {t("workflow.approvalChain", "سلسلة الموافقة")}
          </CardTitle>
          <CardDescription>
            {campaignName} · {approvedCount} من {selectedApproval.approvers.length} موافقات
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("workflow.progress", "التقدم")}</span>
              <span className="font-medium">{Math.round((approvedCount / selectedApproval.approvers.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 transition-all"
                style={{ width: `${(approvedCount / selectedApproval.approvers.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Approvers Timeline */}
          <div className="space-y-3">
            {selectedApproval.approvers.map((approver, index) => (
              <div key={approver.id} className="flex gap-4">
                {/* Timeline Line */}
                <div className="flex flex-col items-center">
                  <Avatar className="h-10 w-10 border-2 border-gray-200">
                    <AvatarImage src={approver.avatar} />
                    <AvatarFallback>{approver.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {index < selectedApproval.approvers.length - 1 && (
                    <div
                      className={`w-1 h-12 my-2 ${
                        approver.status === "approved" ? "bg-green-600" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>

                {/* Approver Info */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{approver.name}</p>
                      <p className="text-sm text-muted-foreground">{approver.role}</p>
                    </div>
                    {getStatusBadge(approver.status)}
                  </div>

                  {approver.comment && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <p className="text-muted-foreground">{approver.comment}</p>
                      {approver.timestamp && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(approver.timestamp).toLocaleDateString("ar-SA")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Current User Action */}
          {selectedApproval.approvers[1]?.status === "pending" && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => setIsOpen(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {t("workflow.approve", "الموافقة")}
                  </Button>
                  <Button
                    onClick={() => setIsOpen(true)}
                    variant="outline"
                    className="flex-1"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {t("workflow.reject", "الرفض")}
                  </Button>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("workflow.addComment", "إضافة تعليق")}</DialogTitle>
                  <DialogDescription>
                    {t("workflow.commentDesc", "أضف تعليقك قبل الموافقة أو الرفض")}
                  </DialogDescription>
                </DialogHeader>

                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t("workflow.commentPlaceholder", "أدخل تعليقك هنا...")}
                  className="min-h-24"
                />

                <div className="flex gap-2">
                  <Button
                    onClick={handleApprove}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {t("workflow.approve", "الموافقة")}
                  </Button>
                  <Button
                    onClick={handleReject}
                    variant="destructive"
                    className="flex-1"
                  >
                    {t("workflow.reject", "الرفض")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Deadline Warning */}
          {selectedApproval.deadline && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg text-sm text-amber-800">
              <Clock className="w-4 h-4" />
              <span>
                {t("workflow.deadline", "الموعد النهائي")}: {new Date(selectedApproval.deadline).toLocaleDateString("ar-SA")}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
