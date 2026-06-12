import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Loader2, Paperclip, X, AlertTriangle, FileText } from "lucide-react";
import { toast } from "sonner";

const PRIORITY_VALUES = ["low", "medium", "high", "critical"] as const;
const STATUS_VALUES = ["pending", "in_progress", "completed", "cancelled"] as const;

type Attachment = { url: string; key: string; name: string; mimeType?: string };

export default function Tasks() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emptyForm = {
    title: "",
    description: "",
    assignedTo: [] as number[],
    dueDate: new Date().toISOString().split("T")[0],
    priority: "medium" as const,
    status: "pending" as const,
    relatedClient: "",
    attachments: [] as Attachment[],
  };

  const [formData, setFormData] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  const { data: tasks = [], isLoading, refetch } = trpc.tasks.list.useQuery();
  const { data: teamMembers = [] } = trpc.teamMembers.list.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const createMutation = trpc.tasks.create.useMutation();
  const updateMutation = trpc.tasks.update.useMutation();
  const deleteMutation = trpc.tasks.delete.useMutation();
  const uploadMutation = trpc.tasks.uploadAttachment.useMutation();

  const localizedPriority = (priority: string) => {
    const map: Record<string, string> = {
      low: t("tasks.priorityLow", "low"),
      medium: t("tasks.priorityMedium", "medium"),
      high: t("tasks.priorityHigh", "high"),
      critical: t("tasks.priorityCritical", "critical"),
    };
    return map[priority] || priority;
  };

  const localizedStatus = (status: string) => {
    const map: Record<string, string> = {
      pending: t("tasks.statusPending", "pending"),
      in_progress: t("tasks.statusInProgress", "in_progress"),
      completed: t("tasks.statusCompleted", "completed"),
      cancelled: t("tasks.statusCancelled", "cancelled"),
    };
    return map[status] || status;
  };

  // تنسيق التاريخ بالإنجليزية دائماً (en-GB => DD/MM/YYYY HH:mm)
  const formatDate = (date: any) => {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // فحص قرب موعد الانتهاء: تحذير قبل نصف ساعة، ومتأخر بعد الموعد
  const getDueState = (task: any): "overdue" | "soon" | "normal" => {
    if (task.status === "completed" || task.status === "cancelled") return "normal";
    const due = new Date(task.dueDate).getTime();
    const now = Date.now();
    const diffMin = (due - now) / 60000;
    if (diffMin < 0) return "overdue";
    if (diffMin <= 30) return "soon";
    return "normal";
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const newAttachments: Attachment[] = [];
      for (const file of Array.from(files)) {
        if (file.size > 15 * 1024 * 1024) {
          toast.error(t("tasks.fileTooLarge", "الملف كبير جداً (الحد الأقصى 15MB)"));
          continue;
        }
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const result = await uploadMutation.mutateAsync({
          fileName: file.name,
          fileBase64: base64,
          mimeType: file.type || "application/octet-stream",
        });
        newAttachments.push(result);
      }
      setFormData((prev) => ({ ...prev, attachments: [...prev.attachments, ...newAttachments] }));
      if (newAttachments.length > 0) toast.success(t("tasks.fileUploaded", "تم رفع الملف"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (key: string) => {
    setFormData((prev) => ({ ...prev, attachments: prev.attachments.filter((a) => a.key !== key) }));
  };

  const toggleAssignee = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(id)
        ? prev.assignedTo.filter((a) => a !== id)
        : [...prev.assignedTo, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        assignedTo: formData.assignedTo,
        dueDate: new Date(formData.dueDate),
        priority: formData.priority as "low" | "medium" | "high" | "critical",
        status: formData.status as "pending" | "in_progress" | "completed" | "cancelled",
        relatedClient: formData.relatedClient ? parseInt(formData.relatedClient) : undefined,
        attachments: formData.attachments,
      };
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...payload });
        toast.success(t("tasks.editSuccess"));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t("tasks.addSuccess"));
      }
      setFormData(emptyForm);
      setEditingId(null);
      setIsOpen(false);
      refetch();
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleEdit = (task: any) => {
    setEditingId(task.id);
    setFormData({
      title: task.title,
      description: task.description || "",
      assignedTo: Array.isArray(task.assignedTo) ? task.assignedTo : task.assignedTo ? [task.assignedTo] : [],
      dueDate: new Date(task.dueDate).toISOString().split("T")[0],
      priority: task.priority,
      status: task.status,
      relatedClient: task.relatedClient?.toString() || "",
      attachments: Array.isArray(task.attachments) ? task.attachments : [],
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t("tasks.confirmDelete"))) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success(t("tasks.deleteSuccess"));
        refetch();
      } catch {
        toast.error(t("common.error"));
      }
    }
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-blue-100 text-blue-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "critical": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-gray-100 text-gray-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const assigneeNames = (task: any) => {
    const ids: number[] = Array.isArray(task.assignedTo) ? task.assignedTo : task.assignedTo ? [task.assignedTo] : [];
    if (ids.length === 0) return "-";
    return ids
      .map((id) => teamMembers.find((m: any) => m.id === id)?.name)
      .filter(Boolean)
      .join(", ") || "-";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("tasks.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("tasks.subtitle")}</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingId(null); setFormData(emptyForm); }} className="bg-[#1e3a5f] hover:bg-[#2d5080]">
              <Plus className="w-4 h-4 ms-2" />
              {t("tasks.addTask")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? t("tasks.editTask") : t("tasks.addTask")}</DialogTitle>
              <DialogDescription>{editingId ? t("tasks.editDesc") : t("tasks.addDesc")}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">{t("tasks.taskTitle")}</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t("tasks.taskTitlePlaceholder")}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">{t("common.description")}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t("tasks.descriptionPlaceholder")}
                  className="resize-none"
                />
              </div>
              <div>
                <Label>{t("tasks.assignees", "المسؤولون")}</Label>
                <div className="border rounded-md p-2 max-h-36 overflow-y-auto space-y-1 mt-1">
                  {teamMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-1">{t("team.empty", "لا يوجد أعضاء")}</p>
                  ) : (
                    teamMembers.map((member: any) => (
                      <label key={member.id} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-muted/50">
                        <input
                          type="checkbox"
                          checked={formData.assignedTo.includes(member.id)}
                          onChange={() => toggleAssignee(member.id)}
                          className="accent-[#1e3a5f]"
                        />
                        <span className="text-sm">{member.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="relatedClient">{t("tasks.relatedClient")}</Label>
                <Select value={formData.relatedClient} onValueChange={(value) => setFormData({ ...formData, relatedClient: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("tasks.selectClient")} />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client: any) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dueDate">{t("tasks.dueDate")}</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="priority">{t("tasks.priority")}</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITY_VALUES.map((p) => (
                      <SelectItem key={p} value={p}>{localizedPriority(p)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">{t("common.status")}</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_VALUES.map((s) => (
                      <SelectItem key={s} value={s}>{localizedStatus(s)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("tasks.attachments", "المرفقات")}</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full mt-1"
                >
                  {uploading ? <Loader2 className="w-4 h-4 ms-2 animate-spin" /> : <Paperclip className="w-4 h-4 ms-2" />}
                  {t("tasks.attachFile", "إرفاق ملف أو صورة")}
                </Button>
                {formData.attachments.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {formData.attachments.map((att) => (
                      <div key={att.key} className="flex items-center justify-between bg-muted/50 rounded px-2 py-1 text-sm">
                        <span className="flex items-center gap-1 truncate">
                          <FileText className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{att.name}</span>
                        </span>
                        <button type="button" onClick={() => removeAttachment(att.key)} className="text-red-500 hover:text-red-700">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-[#1e3a5f] hover:bg-[#2d5080]">
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 ms-2 animate-spin" />}
                  {editingId ? t("common.update") : t("common.add")}
                </Button>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>{t("common.cancel")}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("tasks.listTitle")}</CardTitle>
          <CardDescription>{t("tasks.count")}: {tasks.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{t("tasks.empty")}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("tasks.taskTitle")}</TableHead>
                    <TableHead>{t("tasks.priority")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead>{t("tasks.dueDate")}</TableHead>
                    <TableHead>{t("tasks.assignees", "المسؤولون")}</TableHead>
                    <TableHead>{t("tasks.attachments", "المرفقات")}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task: any) => {
                    const dueState = getDueState(task);
                    const rowClass =
                      dueState === "overdue"
                        ? "bg-red-50 hover:bg-red-100"
                        : dueState === "soon"
                        ? "bg-amber-50 hover:bg-amber-100"
                        : "hover:bg-muted/50";
                    const attachments: Attachment[] = Array.isArray(task.attachments) ? task.attachments : [];
                    return (
                      <TableRow key={task.id} className={rowClass}>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                            {localizedPriority(task.priority)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                            {localizedStatus(task.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1" dir="ltr">
                            {dueState === "overdue" && <AlertTriangle className="w-4 h-4 text-red-600" />}
                            {dueState === "soon" && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                            <span className={dueState === "overdue" ? "text-red-700 font-semibold" : dueState === "soon" ? "text-amber-700 font-semibold" : ""}>
                              {formatDate(task.dueDate)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{assigneeNames(task)}</TableCell>
                        <TableCell>
                          {attachments.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {attachments.map((att) => (
                                <a key={att.key} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#1e3a5f] hover:underline text-sm">
                                  <Paperclip className="w-3 h-3" />
                                  <span className="truncate max-w-[120px]">{att.name}</span>
                                </a>
                              ))}
                            </div>
                          ) : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(task)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(task.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
