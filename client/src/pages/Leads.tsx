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

const STAGE_VALUES = ["جديد", "متابعة", "اهتمام", "عرض", "تفاوض", "مغلق"] as const;
const STATUS_VALUES = ["نشط", "معطل", "مفقود"] as const;

export default function Leads() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const emptyForm = {
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "",
    stage: "جديد" as const,
    status: "نشط" as const,
    value: "",
    notes: "",
    assignedTo: "",
  };
  
  const [formData, setFormData] = useState(emptyForm);

  const { data: leads = [], isLoading, refetch } = trpc.leads.list.useQuery();
  const { data: teamMembers = [] } = trpc.teamMembers.list.useQuery();
  const createMutation = trpc.leads.create.useMutation();
  const updateMutation = trpc.leads.update.useMutation();
  const deleteMutation = trpc.leads.delete.useMutation();

  const localizedStage = (stage: string) => {
    const map: Record<string, string> = {
      "جديد": t("leads.stageNew", "جديد"),
      "متابعة": t("leads.stageContacted", "متابعة"),
      "اهتمام": t("leads.stageQualified", "اهتمام"),
      "عرض": t("leads.stageProposal", "عرض"),
      "تفاوض": t("leads.stageWon", "تفاوض"),
      "مغلق": t("leads.stageLost", "مغلق"),
    };
    return map[stage] || stage;
  };

  const localizedStatus = (status: string) => {
    const map: Record<string, string> = {
      "نشط": t("leads.statusActive", "نشط"),
      "معطل": t("leads.statusInactive", "معطل"),
      "مفقود": t("leads.statusLost", "مفقود"),
    };
    return map[status] || status;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          source: formData.source,
          stage: formData.stage as "جديد" | "متابعة" | "اهتمام" | "عرض" | "تفاوض" | "مغلق",
          status: formData.status as "نشط" | "معطل" | "مفقود",
          value: formData.value ? parseFloat(formData.value) : undefined,
          notes: formData.notes,
          assignedTo: formData.assignedTo ? parseInt(formData.assignedTo) : undefined,
        });
        toast.success(t("leads.editSuccess"));
      } else {
        await createMutation.mutateAsync({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          source: formData.source,
          stage: formData.stage as "جديد" | "متابعة" | "اهتمام" | "عرض" | "تفاوض" | "مغلق",
          status: formData.status as "نشط" | "معطل" | "مفقود",
          value: formData.value ? parseFloat(formData.value) : undefined,
          notes: formData.notes,
          assignedTo: formData.assignedTo ? parseInt(formData.assignedTo) : undefined,
        });
        toast.success(t("leads.addSuccess"));
      }
      
      setFormData(emptyForm);
      setEditingId(null);
      setIsOpen(false);
      refetch();
    } catch (error) {
      toast.error(t("common.error"));
    }
  };

  const handleEdit = (lead: any) => {
    setEditingId(lead.id);
    setFormData({
      name: lead.name,
      email: lead.email || "",
      phone: lead.phone || "",
      company: lead.company || "",
      source: lead.source,
      stage: lead.stage,
      status: lead.status,
      value: lead.value?.toString() || "",
      notes: lead.notes || "",
      assignedTo: lead.assignedTo?.toString() || "",
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t("leads.confirmDelete"))) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success(t("leads.deleteSuccess"));
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

  const getStageColor = (stage: string) => {
    switch(stage) {
      case "جديد": return "bg-blue-100 text-blue-800";
      case "متابعة": return "bg-cyan-100 text-cyan-800";
      case "اهتمام": return "bg-yellow-100 text-yellow-800";
      case "عرض": return "bg-orange-100 text-orange-800";
      case "تفاوض": return "bg-purple-100 text-purple-800";
      case "مغلق": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "نشط": return "bg-green-100 text-green-800";
      case "معطل": return "bg-yellow-100 text-yellow-800";
      case "مفقود": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("leads.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("leads.subtitle")}</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingId(null); setFormData(emptyForm); }} className="bg-[#1e3a5f] hover:bg-[#2d5080]">
              <Plus className="w-4 h-4 ms-2" />
              {t("leads.addLead")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? t("leads.editLead") : t("leads.addLead")}</DialogTitle>
              <DialogDescription>{editingId ? t("leads.editDesc") : t("leads.addDesc")}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">{t("common.name")}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t("leads.leadName")}
                  required
                />
              </div>
              <div>
                <Label htmlFor="company">{t("leads.company")}</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder={t("leads.company")}
                />
              </div>
              <div>
                <Label htmlFor="email">{t("common.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">{t("common.phone")}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+966 50 000 0000"
                />
              </div>
              <div>
                <Label htmlFor="source">{t("leads.source")}</Label>
                <Input
                  id="source"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder={t("leads.source")}
                  required
                />
              </div>
              <div>
                <Label htmlFor="stage">{t("leads.stage")}</Label>
                <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGE_VALUES.map((s) => (
                      <SelectItem key={s} value={s}>{localizedStage(s)}</SelectItem>
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
              <div>
                <Label htmlFor="value">{t("leads.value")}</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="assignedTo">{t("leads.assignee")}</Label>
                <Select value={formData.assignedTo} onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("leads.selectAssignee")} />
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
                <Label htmlFor="notes">{t("common.notes")}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t("common.notes")}
                  className="resize-none"
                />
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
          <CardTitle>{t("leads.listTitle")}</CardTitle>
          <CardDescription>{t("leads.count")}: {leads.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("leads.empty")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.name")}</TableHead>
                    <TableHead>{t("leads.company")}</TableHead>
                    <TableHead>{t("leads.stage")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead>{t("leads.value")}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead: any) => (
                    <TableRow key={lead.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.company || "-"}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStageColor(lead.stage)}`}>
                          {localizedStage(lead.stage)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lead.status)}`}>
                          {localizedStatus(lead.status)}
                        </span>
                      </TableCell>
                      <TableCell>{lead.value ? `${lead.value.toLocaleString('ar-SA')} ${t("common.currency")}` : "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(lead)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(lead.id)}
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
