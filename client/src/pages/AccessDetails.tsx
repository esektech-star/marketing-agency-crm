import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff, Copy, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function AccessDetails() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [formData, setFormData] = useState({
    platform: "",
    username: "",
    password: "",
    email: "",
    url: "",
    notes: "",
  });

  const { data: items = [], isLoading, refetch } = trpc.accessDetails.list.useQuery();
  const createMutation = trpc.accessDetails.create.useMutation();
  const updateMutation = trpc.accessDetails.update.useMutation();
  const deleteMutation = trpc.accessDetails.delete.useMutation();

  const resetForm = () => {
    setFormData({ platform: "", username: "", password: "", email: "", url: "", notes: "" });
    setEditingId(null);
    setShowFormPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...formData });
        toast.success("تم تحديث بيانات الوصول بنجاح");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("تم إضافة بيانات الوصول بنجاح");
      }
      resetForm();
      setIsOpen(false);
      refetch();
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ البيانات");
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      platform: item.platform,
      username: item.username,
      password: item.password,
      email: item.email || "",
      url: item.url || "",
      notes: item.notes || "",
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف بيانات الوصول هذه؟")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("تم حذف بيانات الوصول بنجاح");
        refetch();
      } catch (error) {
        toast.error("حدث خطأ أثناء الحذف");
      }
    }
  };

  const togglePassword = (id: number) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">تفاصيل الوصول</h1>
          <p className="text-muted-foreground mt-1">إدارة بيانات الدخول لحسابات العملاء والمنصات بشكل آمن</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة بيانات وصول
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "تعديل بيانات الوصول" : "إضافة بيانات وصول"}</DialogTitle>
              <DialogDescription>
                {editingId ? "قم بتحديث بيانات الوصول" : "أدخل بيانات الدخول للمنصة"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="platform">المنصة</Label>
                <Input id="platform" value={formData.platform} onChange={(e) => setFormData({ ...formData, platform: e.target.value })} placeholder="مثال: Facebook Ads, Google Analytics" required />
              </div>
              <div>
                <Label htmlFor="username">اسم المستخدم</Label>
                <Input id="username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="اسم المستخدم" required />
              </div>
              <div>
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Input id="password" type={showFormPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="كلمة المرور" required />
                  <button type="button" onClick={() => setShowFormPassword(!showFormPassword)} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="example@email.com" />
              </div>
              <div>
                <Label htmlFor="url">الرابط</Label>
                <Input id="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="https://example.com" />
              </div>
              <div>
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="أي ملاحظات إضافية" className="resize-none" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                  {editingId ? "تحديث" : "إضافة"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>إلغاء</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <span>تنبيه أمني: بيانات الوصول حساسة. كلمات المرور مخفية افتراضياً، ولا تُعرض إلا عند الطلب.</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة بيانات الوصول</CardTitle>
          <CardDescription>عدد السجلات: {items.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">لا توجد بيانات وصول حتى الآن. قم بإضافة سجل جديد للبدء.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنصة</TableHead>
                    <TableHead>اسم المستخدم</TableHead>
                    <TableHead>كلمة المرور</TableHead>
                    <TableHead>الرابط</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item: any) => (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{item.platform}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-sm">{item.username}</span>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => copyToClipboard(item.username, "اسم المستخدم")}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-sm">{visiblePasswords[item.id] ? item.password : "••••••••"}</span>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => togglePassword(item.id)}>
                            {visiblePasswords[item.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => copyToClipboard(item.password, "كلمة المرور")}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.url ? (
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">فتح</a>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(item)}><Pencil className="w-4 h-4" /></Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
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
