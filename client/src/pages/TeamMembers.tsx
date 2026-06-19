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
import { parseRTLNumber, isValidNumber } from "@/lib/numberUtils";

const STATUS_VALUES = ["active", "disabled", "completed"] as const;

export default function TeamMembers() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const emptyForm = {
    name: "",
    role: "",
    position: "",
    phone: "",
    email: "",
    department: "",
    salary: "",
    joinDate: new Date().toISOString().split('T')[0],
    status: "active",
    notes: "",
  };
  const [formData, setFormData] = useState(emptyForm);

  const { data: teamMembers = [], isLoading, refetch } = trpc.teamMembers.list.useQuery();
  const createMutation = trpc.teamMembers.create.useMutation();
  const updateMutation = trpc.teamMembers.update.useMutation();
  const deleteMutation = trpc.teamMembers.delete.useMutation();

  const localizedStatus = (status: string) => {
    const map: Record<string, string> = {
      "active": t("clients.statusActive", "active"),
      "disabled": t("team.statusDisabled", "disabled"),
      "completed": t("team.statusEnded", "completed"),
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
          role: formData.role,
          position: formData.position,
          phone: formData.phone,
          email: formData.email,
          department: formData.department,
          salary: formData.salary ? parseRTLNumber(formData.salary) : undefined,
          status: formData.status as "active" | "disabled" | "completed",
          notes: formData.notes,
        });
        toast.success(t("common.editSuccess"));
      } else {
        await createMutation.mutateAsync({
          name: formData.name,
          role: formData.role,
          position: formData.position,
          phone: formData.phone,
          email: formData.email,
          department: formData.department,
          salary: formData.salary ? parseRTLNumber(formData.salary) : undefined,
          joinDate: new Date(formData.joinDate),
          status: formData.status as "active" | "disabled" | "completed",
          notes: formData.notes,
        });
        toast.success(t("common.addSuccess"));
      }
      setFormData(emptyForm);
      setEditingId(null);
      setIsOpen(false);
      refetch();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : t("common.error");
      toast.error(errorMsg);
    }
  };

  const handleEdit = (member: any) => {
    setEditingId(member.id);
    setFormData({
      name: member.name,
      role: member.role,
      position: member.position || "",
      phone: member.phone || "",
      email: member.email || "",
      department: member.department || "",
      salary: member.salary?.toString() || "",
      joinDate: new Date(member.joinDate).toISOString().split('T')[0],
      status: member.status,
      notes: member.notes || "",
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t("common.confirmDelete"))) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success(t("common.deleteSuccess"));
        refetch();
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : t("common.error");
        toast.error(errorMsg);
      }
    }
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("team.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("team.subtitle")}</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingId(null); setFormData(emptyForm); }} className="bg-[#1e3a5f] hover:bg-[#2d5080]">
              <Plus className="w-4 h-4 ms-2" />
              {t("team.addMember")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? t("team.editMember") : t("team.addMember")}</DialogTitle>
              <DialogDescription>{editingId ? t("team.editMember") : t("team.addMember")}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">{t("team.memberName")}</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="role">{t("team.role")}</Label>
                <Input id="role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="position">{t("team.position")}</Label>
                <Input id="position" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="department">{t("team.department")}</Label>
                <Input id="department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="email">{t("common.email")}</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="phone">{t("common.phone")}</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="salary">{t("team.salary", "Salary")}</Label>
                <Input id="salary" type="number" step="0.01" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} placeholder="0.00" />
              </div>
              <div>
                <Label htmlFor="joinDate">{t("team.joinDate")}</Label>
                <Input id="joinDate" type="date" value={formData.joinDate} onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="status">{t("common.status")}</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_VALUES.map((s) => (
                      <SelectItem key={s} value={s}>{localizedStatus(s)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">{t("common.notes")}</Label>
                <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="resize-none" />
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
          <CardTitle>{t("team.title")}</CardTitle>
          <CardDescription>{t("common.total")}: {teamMembers.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{t("team.empty")}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("team.memberName")}</TableHead>
                    <TableHead>{t("team.role")}</TableHead>
                    <TableHead>{t("team.department")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead>{t("common.email")}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member: any) => (
                    <TableRow key={member.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell>{member.department || "-"}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          member.status === "active" ? "bg-green-100 text-green-800" :
                          member.status === "disabled" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {localizedStatus(member.status)}
                        </span>
                      </TableCell>
                      <TableCell>{member.email || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(member)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(member.id)}>
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
