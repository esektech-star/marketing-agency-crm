import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, Loader2, KeyRound, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { APP_SECTIONS, DEFAULT_EMPLOYEE_SECTIONS } from "../../../shared/const";

const ROLE_LABELS: Record<string, string> = {
  "manager": "bg-purple-100 text-purple-800",
  "employee": "bg-blue-100 text-blue-800",
  "designer": "bg-pink-100 text-pink-800",
  "editor": "bg-amber-100 text-amber-800",
};

const LANG_LABELS: Record<string, string> = {
  ar: "العربية",
  he: "العبرية",
  en: "الإنجليزية",
};

export default function Users() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resetUserId, setResetUserId] = useState<number | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    role: "employee",
    preferredLanguage: "ar",
    status: "active",
  });
  const [permissions, setPermissions] = useState<string[]>([...DEFAULT_EMPLOYEE_SECTIONS]);

  const togglePermission = (section: string) => {
    setPermissions((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const { data: users = [], isLoading, refetch } = trpc.appUsers.list.useQuery();
  const createMutation = trpc.appUsers.create.useMutation();
  const updateMutation = trpc.appUsers.update.useMutation();
  const deleteMutation = trpc.appUsers.delete.useMutation();
  const resetPasswordMutation = trpc.appUsers.resetPassword.useMutation();

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      fullName: "",
      email: "",
      role: "employee",
      preferredLanguage: "ar",
      status: "active",
    });
    setPermissions([...DEFAULT_EMPLOYEE_SECTIONS]);
    setEditingId(null);
    setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          fullName: formData.fullName,
          email: formData.email,
          role: formData.role as any,
          preferredLanguage: formData.preferredLanguage as any,
          status: formData.status as any,
          permissions: formData.role === "manager" ? [...APP_SECTIONS] : permissions,
        });
        toast.success("تم تحديث بيانات المستخدم بنجاح");
      } else {
        await createMutation.mutateAsync({
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName,
          email: formData.email,
          role: formData.role as any,
          preferredLanguage: formData.preferredLanguage as any,
          status: formData.status as any,
          permissions: formData.role === "manager" ? [...APP_SECTIONS] : permissions,
        });
        toast.success("تم إضافة المستخدم بنجاح");
      }
      resetForm();
      setIsOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.message || "حدث خطأ أثناء حفظ البيانات");
    }
  };

  const handleEdit = (user: any) => {
    setEditingId(user.id);
    setFormData({
      username: user.username,
      password: "",
      fullName: user.fullName,
      email: user.email || "",
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      status: user.status,
    });
    setPermissions(Array.isArray(user.permissions) ? user.permissions : [...DEFAULT_EMPLOYEE_SECTIONS]);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("تم حذف المستخدم بنجاح");
        refetch();
      } catch (error) {
        toast.error("حدث خطأ أثناء حذف المستخدم");
      }
    }
  };

  const handleResetPassword = async () => {
    if (resetUserId === null) return;
    if (resetPassword.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    try {
      await resetPasswordMutation.mutateAsync({ id: resetUserId, newPassword: resetPassword });
      toast.success("تم إعادة تعيين كلمة المرور بنجاح");
      setResetUserId(null);
      setResetPassword("");
    } catch (error) {
      toast.error("حدث خطأ أثناء إعادة تعيين كلمة المرور");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
          <p className="text-muted-foreground mt-1">إدارة حسابات الفريق وصلاحيات الوصول إلى النظام</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة مستخدم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "تعديل المستخدم" : "إضافة مستخدم جديد"}</DialogTitle>
              <DialogDescription>
                {editingId ? "قم بتحديث بيانات المستخدم" : "أدخل بيانات المستخدم الجديد وكلمة المرور"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName">الاسم الكامل</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="الاسم الكامل"
                  required
                />
              </div>
              <div>
                <Label htmlFor="username">اسم المستخدم</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="username"
                  disabled={!!editingId}
                  required
                />
              </div>
              {!editingId && (
                <div>
                  <Label htmlFor="password">كلمة المرور</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="6 أحرف على الأقل"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@esektech.com"
                />
              </div>
              <div>
                <Label htmlFor="role">الدور الوظيفي</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">مدير</SelectItem>
                    <SelectItem value="employee">موظف</SelectItem>
                    <SelectItem value="designer">مصمم</SelectItem>
                    <SelectItem value="editor">محرر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="lang">اللغة المفضلة</Label>
                <Select value={formData.preferredLanguage} onValueChange={(value) => setFormData({ ...formData, preferredLanguage: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="he">العبرية</SelectItem>
                    <SelectItem value="en">الإنجليزية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">الحالة</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="disabled">معطل</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* صلاحيات الوصول للأقسام */}
              <div className="border rounded-lg p-3 bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-[#1e3a5f]" />
                  <Label className="font-semibold">صلاحيات الوصول للأقسام</Label>
                </div>
                {formData.role === "manager" ? (
                  <p className="text-sm text-muted-foreground">المدير لديه صلاحية الوصول لجميع الأقسام تلقائياً.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto">
                    {APP_SECTIONS.map((section) => (
                      <label key={section} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={section === "dashboard" ? true : permissions.includes(section)}
                          disabled={section === "dashboard"}
                          onCheckedChange={() => togglePermission(section)}
                        />
                        <span>{t(`sidebar.${section}`, section)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                  {editingId ? "تحديث" : "إضافة"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المستخدمين</CardTitle>
          <CardDescription>عدد المستخدمين: {users.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا يوجد مستخدمون حتى الآن. قم بإضافة مستخدم جديد للبدء.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم الكامل</TableHead>
                    <TableHead>اسم المستخدم</TableHead>
                    <TableHead>الدور</TableHead>
                    <TableHead>الأقسام المتاحة</TableHead>
                    <TableHead>اللغة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: any) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{user.fullName}</TableCell>
                      <TableCell className="font-mono text-sm">{user.username}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${ROLE_LABELS[user.role] || "bg-gray-100 text-gray-800"}`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.role === "manager" ? (
                          <span className="text-xs text-muted-foreground">كل الأقسام</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {Array.isArray(user.permissions) ? `${user.permissions.length} أقسام` : "-"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{LANG_LABELS[user.preferredLanguage] || user.preferredLanguage}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(user)} title="تعديل">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setResetUserId(user.id); setResetPassword(""); }} title="إعادة تعيين كلمة المرور">
                            <KeyRound className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(user.id)} title="حذف">
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

      {/* نافذة إعادة تعيين كلمة المرور */}
      <Dialog open={resetUserId !== null} onOpenChange={(o) => { if (!o) { setResetUserId(null); setResetPassword(""); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>إعادة تعيين كلمة المرور</DialogTitle>
            <DialogDescription>أدخل كلمة المرور الجديدة للمستخدم</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
              <Input
                id="newPassword"
                type="text"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="6 أحرف على الأقل"
                minLength={6}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleResetPassword} disabled={resetPasswordMutation.isPending}>
                {resetPasswordMutation.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                حفظ
              </Button>
              <Button variant="outline" onClick={() => { setResetUserId(null); setResetPassword(""); }}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
