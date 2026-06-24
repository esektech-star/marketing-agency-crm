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
import { Plus, Pencil, Trash2, Loader2, Paperclip, X, AlertTriangle, FileText, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";
import TasksKanban from "@/components/TasksKanban";

const PRIORITY_VALUES = ["low", "medium", "high", "critical"] as const;
const STATUS_VALUES = ["pending", "in_progress", "completed", "cancelled"] as const;

type Attachment = { url: string; key: string; name: string; mimeType?: string };

export default function TasksWithKanban() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
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

  const formatDate = (date: any) => {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
          toast.error(t("tasks.fileTooLarge", "File too large (max 15MB)"));
          continue;
        }
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const res = await uploadMutation.mutateAsync({
          fileName: file.name,
          fileBase64: base64,
          mimeType: file.type,
        });
        newAttachments.push({ url: res.url, key: res.key, name: file.name, mimeType: file.type });
      }
      setFormData((prev) => ({ ...prev, attachments: [...prev.attachments, ...newAttachments] }));
      toast.success(t("tasks.uploadSuccess", "Files uploaded"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (key: string) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((a) => a.key !== key),
    }));
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
      assignedTo: task.assignedTo || [],
      dueDate: new Date(task.dueDate).toISOString().split("T")[0],
      priority: task.priority as any,
      status: task.status as any,
      relatedClient: task.relatedClient?.toString() || "",
      attachments: task.attachments || [],
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

  const handleStatusChange = async (id: number, status: string | number) => {
    try {
      const task = tasks.find((t: any) => t.id === id);
      if (task) {
        await updateMutation.mutateAsync({
          id,
          title: task.title,
          description: task.description || undefined,
          assignedTo: (Array.isArray(task.assignedTo) ? task.assignedTo : []) as number[],
          dueDate: new Date(task.dueDate),
          priority: task.priority,
          status: status as "pending" | "in_progress" | "completed" | "cancelled",
          relatedClient: task.relatedClient || undefined,
          attachments: (Array.isArray(task.attachments) ? task.attachments : []) as any[],
        });
        toast.success(t("tasks.statusUpdated", "Task status updated"));
        refetch();
      }
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const getAssigneeNames = (assignedTo: any) => {
    return assignedTo
      ?.map((id: number) => teamMembers.find((m: any) => m.id === id)?.name)
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
        <div className="flex gap-2 items-center">
          <div className="flex gap-1 border rounded-lg p-1 bg-muted">
            <Button
              size="sm"
              variant={viewMode === "table" ? "default" : "ghost"}
              onClick={() => setViewMode("table")}
              className="gap-2"
            >
              <List className="w-4 h-4" />
              {t("tasks.tableView", "Table")}
            </Button>
            <Button
              size="sm"
              variant={viewMode === "kanban" ? "default" : "ghost"}
              onClick={() => setViewMode("kanban")}
              className="gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              {t("tasks.kanbanView", "Kanban")}
            </Button>
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
                  <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder={t("tasks.taskTitle")} required />
                </div>
                <div>
                  <Label htmlFor="description">{t("common.description")}</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder={t("common.description")} className="resize-none" />
                </div>
                <div>
                  <Label htmlFor="priority">{t("tasks.priority")}</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PRIORITY_VALUES.map((p) => (<SelectItem key={p} value={p}>{localizedPriority(p)}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">{t("tasks.status")}</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_VALUES.map((s) => (<SelectItem key={s} value={s}>{localizedStatus(s)}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dueDate">{t("tasks.dueDate")}</Label>
                  <Input id="dueDate" type="datetime-local" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} required dir="ltr" />
                </div>
                <div>
                  <Label>{t("tasks.assignedTo")}</Label>
                  <div className="space-y-2 mt-2">
                    {teamMembers.map((member: any) => (
                      <label key={member.id} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.assignedTo.includes(member.id)} onChange={() => toggleAssignee(member.id)} className="rounded" />
                        <span>{member.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="relatedClient">{t("tasks.relatedClient")}</Label>
                  <Select value={formData.relatedClient} onValueChange={(value) => setFormData({ ...formData, relatedClient: value })}>
                    <SelectTrigger><SelectValue placeholder={t("common.selectClient")} /></SelectTrigger>
                    <SelectContent>
                      {clients.map((client: any) => (<SelectItem key={client.id} value={client.id.toString()}>{client.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="flex items-center gap-1">
                    <Paperclip className="w-4 h-4" /> {t("tasks.attachments")}
                  </Label>
                  <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full mt-2">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : <Plus className="w-4 h-4 me-2" />}
                    {t("tasks.addAttachment", "Add attachment")}
                  </Button>
                  {formData.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {formData.attachments.map((att) => (
                        <div key={att.key} className="flex items-center justify-between bg-muted p-2 rounded text-sm">
                          <span className="truncate">{att.name}</span>
                          <Button size="sm" variant="ghost" onClick={() => handleRemoveAttachment(att.key)} className="h-6 w-6 p-0">
                            <X className="w-3 h-3" />
                          </Button>
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
      </div>

      {viewMode === "kanban" ? (
        <TasksKanban
          tasks={tasks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          teamMembers={teamMembers}
          clients={clients}
          isLoading={isLoading}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t("tasks.listTitle")}</CardTitle>
            <CardDescription>{t("tasks.count")}: {tasks.length}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">{t("tasks.empty")}</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("tasks.taskTitle")}</TableHead>
                      <TableHead>{t("tasks.priority")}</TableHead>
                      <TableHead>{t("tasks.status")}</TableHead>
                      <TableHead>{t("tasks.dueDate")}</TableHead>
                      <TableHead>{t("tasks.assignedTo")}</TableHead>
                      <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task: any) => {
                      const dueState = getDueState(task);
                      return (
                        <TableRow key={task.id} className={dueState === "overdue" ? "bg-red-50" : dueState === "soon" ? "bg-yellow-50" : ""}>
                          <TableCell className="font-medium">{task.title}</TableCell>
                          <TableCell><span className={`px-2 py-1 rounded text-xs font-medium ${localizedPriority(task.priority) === "critical" ? "bg-red-100 text-red-800" : localizedPriority(task.priority) === "high" ? "bg-orange-100 text-orange-800" : localizedPriority(task.priority) === "medium" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}>{localizedPriority(task.priority)}</span></TableCell>
                          <TableCell>{localizedStatus(task.status)}</TableCell>
                          <TableCell dir="ltr">{formatDate(task.dueDate)}</TableCell>
                          <TableCell>{getAssigneeNames(task.assignedTo)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleEdit(task)}><Pencil className="w-4 h-4" /></Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDelete(task.id)}><Trash2 className="w-4 h-4" /></Button>
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
      )}
    </div>
  );
}
