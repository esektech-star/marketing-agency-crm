import { useState } from "react";
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
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const PRIORITY_VALUES = ["منخفضة", "متوسطة", "عالية", "حرجة"] as const;
const STATUS_VALUES = ["معلقة", "قيد التنفيذ", "مكتملة", "ملغاة"] as const;

export default function Tasks() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const emptyForm = {
    title: "",
    description: "",
    assignedTo: "",
    dueDate: new Date().toISOString().split('T')[0],
    priority: "متوسطة" as const,
    status: "معلقة" as const,
    relatedClient: "",
  };
  
  const [formData, setFormData] = useState(emptyForm);

  const { data: tasks = [], isLoading, refetch } = trpc.tasks.list.useQuery();
  const { data: teamMembers = [] } = trpc.teamMembers.list.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const createMutation = trpc.tasks.create.useMutation();
  const updateMutation = trpc.tasks.update.useMutation();
  const deleteMutation = trpc.tasks.delete.useMutation();

  const localizedPriority = (priority: string) => {
    const map: Record<string, string> = {
      "منخفضة": t("tasks.priorityLow", "منخفضة"),
      "متوسطة": t("tasks.priorityMedium", "متوسطة"),
      "عالية": t("tasks.priorityHigh", "عالية"),
      "حرجة": t("tasks.priorityCritical", "حرجة"),
    };
    return map[priority] || priority;
  };

  const localizedStatus = (status: string) => {
    const map: Record<string, string> = {
      "معلقة": t("tasks.statusPending", "معلقة"),
      "قيد التنفيذ": t("tasks.statusInProgress", "قيد التنفيذ"),
      "مكتملة": t("tasks.statusCompleted", "مكتملة"),
      "ملغاة": t("tasks.statusCancelled", "ملغاة"),
    };
    return map[status] || status;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          title: formData.title,
          description: formData.description,
          assignedTo: formData.assignedTo ? parseInt(formData.assignedTo) : undefined,
          dueDate: new Date(formData.dueDate),
          priority: formData.priority as "منخفضة" | "متوسطة" | "عالية" | "حرجة",
          status: formData.status as "معلقة" | "قيد التنفيذ" | "مكتملة" | "ملغاة",
          relatedClient: formData.relatedClient ? parseInt(formData.relatedClient) : undefined,
        });
        toast.success(t("tasks.editSuccess"));
      } else {
        await createMutation.mutateAsync({
          title: formData.title,
          description: formData.description,
          assignedTo: formData.assignedTo ? parseInt(formData.assignedTo) : undefined,
          dueDate: new Date(formData.dueDate),
          priority: formData.priority as "منخفضة" | "متوسطة" | "عالية" | "حرجة",
          status: formData.status as "معلقة" | "قيد التنفيذ" | "مكتملة" | "ملغاة",
          relatedClient: formData.relatedClient ? parseInt(formData.relatedClient) : undefined,
        });
        toast.success(t("tasks.addSuccess"));
      }
      
      setFormData(emptyForm);
      setEditingId(null);
      setIsOpen(false);
      refetch();
    } catch (error) {
      toast.error(t("common.error"));
    }
  };

  const handleEdit = (task: any) => {
    setEditingId(task.id);
    setFormData({
      title: task.title,
      description: task.description || "",
      assignedTo: task.assignedTo?.toString() || "",
      dueDate: new Date(task.dueDate).toISOString().split('T')[0],
      priority: task.priority,
      status: task.status,
      relatedClient: task.relatedClient?.toString() || "",
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t("tasks.confirmDelete"))) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success(t("tasks.deleteSuccess"));
        refetch();
      } catch (error) {
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
    switch(priority) {
      case "منخفضة": return "bg-blue-100 text-blue-800";
      case "متوسطة": return "bg-yellow-100 text-yellow-800";
      case "عالية": return "bg-orange-100 text-orange-800";
      case "حرجة": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "معلقة": return "bg-gray-100 text-gray-800";
      case "قيد التنفيذ": return "bg-blue-100 text-blue-800";
      case "مكتملة": return "bg-green-100 text-green-800";
      case "ملغاة": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
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
                <Label htmlFor="assignedTo">{t("tasks.assignee")}</Label>
                <Select value={formData.assignedTo} onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("tasks.selectAssignee")} />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member: any) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_VALUES.map((s) => (
                      <SelectItem key={s} value={s}>{localizedStatus(s)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <div className="text-center py-8 text-muted-foreground">
              {t("tasks.empty")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("tasks.taskTitle")}</TableHead>
                    <TableHead>{t("tasks.priority")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead>{t("tasks.dueDate")}</TableHead>
                    <TableHead>{t("tasks.assignee")}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task: any) => (
                    <TableRow key={task.id} className="hover:bg-muted/50">
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
                      <TableCell>{new Date(task.dueDate).toLocaleDateString('ar-SA')}</TableCell>
                      <TableCell>{task.assignedTo ? t("tasks.assigned") : "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(task)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(task.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
