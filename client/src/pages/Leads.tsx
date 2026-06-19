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
import { Plus, Pencil, Trash2, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { exportToExcel, exportToCSV, formatLeadsForExport } from "@/lib/exportUtils";

const STAGE_VALUES = ["new", "follow_up", "interest", "proposal", "negotiation", "closed"] as const;
const STATUS_VALUES = ["active", "disabled", "lost"] as const;

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
    stage: "new" as const,
    status: "active" as const,
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

  // تنسيق رقم الهاتف إلى صيغة +972XXXXXXXXX
  const formatPhoneIL = (raw: string): string => {
    if (!raw) return "";
    // استخراج الأرقام فقط
    let digits = raw.replace(/\D/g, "");
    // إزالة بادئة الدولة إن وجدت
    if (digits.startsWith("00972")) digits = digits.slice(5);
    else if (digits.startsWith("972")) digits = digits.slice(3);
    // إزالة الصفر البادئي المحلي
    if (digits.startsWith("0")) digits = digits.slice(1);
    if (!digits) return "";
    return `+972${digits}`;
  };

  const localizedStage = (stage: string) => {
    const map: Record<string, string> = {
      "new": t("leads.stageNew", "new"),
      "follow_up": t("leads.stageContacted", "follow_up"),
      "interest": t("leads.stageQualified", "interest"),
      "proposal": t("leads.stageProposal", "proposal"),
      "negotiation": t("leads.stageWon", "negotiation"),
      "closed": t("leads.stageLost", "closed"),
    };
    return map[stage] || stage;
  };

  const localizedStatus = (status: string) => {
    const map: Record<string, string> = {
      "active": t("leads.statusActive", "active"),
      "disabled": t("leads.statusInactive", "disabled"),
      "lost": t("leads.statusLost", "lost"),
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
          phone: formatPhoneIL(formData.phone),
          company: formData.company,
          source: formData.source,
          stage: formData.stage as "new" | "follow_up" | "interest" | "proposal" | "negotiation" | "closed",
          status: formData.status as "active" | "disabled" | "lost",
          value: formData.value ? parseFloat(formData.value) : undefined,
          notes: formData.notes,
          assignedTo: formData.assignedTo ? parseInt(formData.assignedTo) : undefined,
        });
        toast.success(t("leads.editSuccess"));
      } else {
        await createMutation.mutateAsync({
          name: formData.name,
          email: formData.email,
          phone: formatPhoneIL(formData.phone),
          company: formData.company,
          source: formData.source,
          stage: formData.stage as "new" | "follow_up" | "interest" | "proposal" | "negotiation" | "closed",
          status: formData.status as "active" | "disabled" | "lost",
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
      case "new": return "bg-blue-100 text-blue-800";
      case "follow_up": return "bg-cyan-100 text-cyan-800";
      case "interest": return "bg-yellow-100 text-yellow-800";
      case "proposal": return "bg-orange-100 text-orange-800";
      case "negotiation": return "bg-purple-100 text-purple-800";
      case "closed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "active": return "bg-green-100 text-green-800";
      case "disabled": return "bg-yellow-100 text-yellow-800";
      case "lost": return "bg-red-100 text-red-800";
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
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const formatted = formatLeadsForExport(leads);
              exportToExcel(formatted, `leads-${new Date().toISOString().split('T')[0]}`);
              toast.success(t("common.exportSuccess", "Exported successfully"));
            }}
          >
            <Download className="w-4 h-4 ms-2" />
            {t("common.exportExcel", "Export Excel")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const formatted = formatLeadsForExport(leads);
              exportToCSV(formatted, `leads-${new Date().toISOString().split('T')[0]}`);
              toast.success(t("common.exportSuccess", "Exported successfully"));
            }}
          >
            <Download className="w-4 h-4 ms-2" />
            {t("common.exportCSV", "Export CSV")}
          </Button>
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
                  dir="ltr"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  onBlur={(e) => setFormData({ ...formData, phone: formatPhoneIL(e.target.value) })}
                  placeholder="+972XXXXXXXXX"
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
                      <TableCell dir="ltr" className="text-start">{lead.value ? `${t("common.currency")}${lead.value.toLocaleString('en-US')}` : "-"}</TableCell>
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
