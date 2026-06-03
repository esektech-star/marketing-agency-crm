import { useState } from "react";
import { trpc } from "@/lib/trpc";
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

export default function Leads() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "",
    stage: "جديد",
    status: "نشط",
    value: "",
    notes: "",
    assignedTo: "",
  });

  const { data: leads = [], isLoading, refetch } = trpc.leads.list.useQuery();
  const { data: teamMembers = [] } = trpc.teamMembers.list.useQuery();
  const createMutation = trpc.leads.create.useMutation();
  const updateMutation = trpc.leads.update.useMutation();
  const deleteMutation = trpc.leads.delete.useMutation();

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
        toast.success("تم تحديث الليد بنجاح");
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
        toast.success("تم إضافة الليد بنجاح");
      }
      
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        source: "",
        stage: "جديد",
        status: "نشط",
        value: "",
        notes: "",
        assignedTo: "",
      });
      setEditingId(null);
      setIsOpen(false);
      refetch();
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ البيانات");
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
    if (confirm("هل أنت متأكد من حذف هذا الليد؟")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("تم حذف الليد بنجاح");
        refetch();
      } catch (error) {
        toast.error("حدث خطأ أثناء حذف الليد");
      }
    }
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      source: "",
      stage: "جديد",
      status: "نشط",
      value: "",
      notes: "",
      assignedTo: "",
    });
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">متابعة العملاء المحتملين</h1>
          <p className="text-muted-foreground mt-1">إدارة الليدز عبر مراحل القمع التسويقي</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingId(null); setFormData({ name: "", email: "", phone: "", company: "", source: "", stage: "جديد", status: "نشط", value: "", notes: "", assignedTo: "" }); }}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة ليد جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "تعديل الليد" : "إضافة ليد جديد"}</DialogTitle>
              <DialogDescription>
                {editingId ? "قم بتحديث بيانات الليد" : "أدخل بيانات الليد الجديد"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">الاسم</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="اسم العميل المحتمل"
                  required
                />
              </div>
              <div>
                <Label htmlFor="company">الشركة</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="اسم الشركة"
                />
              </div>
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+966 50 000 0000"
                />
              </div>
              <div>
                <Label htmlFor="source">المصدر</Label>
                <Input
                  id="source"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="مثال: إعلان، إحالة، موقع ويب"
                  required
                />
              </div>
              <div>
                <Label htmlFor="stage">المرحلة</Label>
                <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="جديد">جديد</SelectItem>
                    <SelectItem value="متابعة">متابعة</SelectItem>
                    <SelectItem value="اهتمام">اهتمام</SelectItem>
                    <SelectItem value="عرض">عرض</SelectItem>
                    <SelectItem value="تفاوض">تفاوض</SelectItem>
                    <SelectItem value="مغلق">مغلق</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">الحالة</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="نشط">نشط</SelectItem>
                    <SelectItem value="معطل">معطل</SelectItem>
                    <SelectItem value="مفقود">مفقود</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="value">القيمة المتوقعة</Label>
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
                <Label htmlFor="assignedTo">المسؤول</Label>
                <Select value={formData.assignedTo} onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المسؤول" />
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
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="أي ملاحظات إضافية"
                  className="resize-none"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                  {editingId ? "تحديث" : "إضافة"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الليدز</CardTitle>
          <CardDescription>عدد الليدز: {leads.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد ليدز حتى الآن. قم بإضافة ليد جديد للبدء.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الشركة</TableHead>
                    <TableHead>المرحلة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>القيمة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead: any) => (
                    <TableRow key={lead.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.company || "-"}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStageColor(lead.stage)}`}>
                          {lead.stage}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          lead.status === "نشط" ? "bg-green-100 text-green-800" :
                          lead.status === "معطل" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {lead.status}
                        </span>
                      </TableCell>
                      <TableCell>{lead.value ? `${lead.value.toLocaleString('ar-SA')} ريال` : "-"}</TableCell>
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
