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
        toast.success(t("users.updateSuccess", "تم تحديث بيانات المستخدم بنجاح"));
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
        toast.success(t("users.createSuccess", "تم إضافة المستخدم بنجاح"));
      }
      resetForm();
      setIsOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.message || t("common.error", "حدث خطأ أثناء حفظ البيانات"));
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
    if (confirm(t("users.confirmDelete", "هل أنت متأكد من حذف هذا المستخدم؟"))) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success(t("users.deleteSuccess", "تم حذف المستخدم بنجاح"));
        refetch();
      } catch (error) {
        toast.error(t("users.deleteError", "حدث خطأ أثناء حذف المستخدم"));
      }
    }
  };

  const handleResetPassword = async () => {
    if (resetUserId === null) return;
    if (resetPassword.length < 6) {
      toast.error(t("users.passwordMinLength", "كلمة المرور يجب أن تكون 6 أحرف على الأقل"));
      return;
    }
    try {
      await resetPasswordMutation.mutateAsync({ id: resetUserId, newPassword: resetPassword });
      toast.success(t("users.resetPasswordSuccess", "تم إعادة تعيين كلمة المرور بنجاح"));
      setResetUserId(null);
      setResetPassword("");
    } catch (error) {
      toast.error(t("users.resetPasswordError", "حدث خطأ أثناء إعادة تعيين كلمة المرور"));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t("users.title", "إدارة المستخدمين")}</h1>
          <p className="text-muted-foreground mt-1">{t("users.subtitle", "إدارة حسابات الفريق وصلاحيات الوصول إلى النظام")}</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 ml-2" />
              {t("users.addNew", "إضافة مستخدم جديد")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? t("users.editTitle", "تعديل المستخدم") : t("users.addTitle", "إضافة مستخدم جديد")}</DialogTitle>
              <DialogDescription>
                {editingId ? t("users.editDesc", "قم بتحديث بيانات المستخدم") : t("users.addDesc", "أدخل بيانات المستخدم الجديد وكلمة المرور")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName">{t("users.fullName", "الاسم الكامل")}</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder={t("users.fullNamePlaceholder", "الاسم الكامل")}
                  required
                />
              </div>
              <div>
                <Label htmlFor="username">{t("users.username", "اسم المستخدم")}</Label>
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
                  <Label htmlFor="password">{t("users.password", "كلمة المرور")}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={t("users.passwordPlaceholder", "6 أحرف على الأقل")}
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
                <Label htmlFor="email">{t("users.email", "البريد الإلكتروني")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@esektech.com"
                />
              </div>
              <div>
                <Label htmlFor="role">{t("users.role", "الدور الوظيفي")}</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">{t("users.roleManager", "مدير")}</SelectItem>
                    <SelectItem value="employee">{t("users.roleEmployee", "موظف")}</SelectItem>
                    <SelectItem value="designer">{t("users.roleDesigner", "مصمم")}</SelectItem>
                    <SelectItem value="editor">{t("users.roleEditor", "محرر")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="lang">{t("users.language", "اللغة المفضلة")}</Label>
                <Select value={formData.preferredLanguage} onValueChange={(value) => setFormData({ ...formData, preferredLanguage: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">{t("users.langArabic", "العربية")}</SelectItem>
                    <SelectItem value="he">{t("users.langHebrew", "العبرية")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">{t("users.status", "الحالة")}</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t("users.statusActive", "نشط")}</SelectItem>
                    <SelectItem value="disabled">{t("users.statusDisabled", "معطل")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* صلاحيات الوصول للأقسام */}
              <div className="border rounded-lg p-3 bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-[#1e3a5f]" />
                  <Label className="font-semibold">{t("users.permissions", "صلاحيات الوصول للأقسام")}</Label>
                </div>
                {formData.role === "manager" ? (
                  <p className="text-sm text-muted-foreground">{t("users.managerAllAccess", "المدير لديه صلاحية الوصول لجميع الأقسام تلقائياً.")}</p>
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
                  {editingId ? t("users.update", "تحديث") : t("users.add", "إضافة")}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>
                  {t("users.cancel", "إلغاء")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("users.listTitle", "قائمة المستخدمين")}</CardTitle>
          <CardDescription>{t("users.userCount", "عدد المستخدمين")}: {users.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("users.noUsers", "لا يوجد مستخدمون حتى الآن. قم بإضافة مستخدم جديد للبدء.")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("users.fullName", "الاسم الكامل")}</TableHead>
                    <TableHead>{t("users.username", "اسم المستخدم")}</TableHead>
                    <TableHead>{t("users.role", "الدور")}</TableHead>
                    <TableHead>{t("users.sections", "الأقسام المتاحة")}</TableHead>
                    <TableHead>{t("users.language", "اللغة")}</TableHead>
                    <TableHead>{t("users.status", "الحالة")}</TableHead>
                    <TableHead>{t("users.actions", "الإجراءات")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: any) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{user.fullName}</TableCell>
                      <TableCell className="font-mono text-sm">{user.username}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${ROLE_LABELS[user.role] || "bg-gray-100 text-gray-800"}`}>
                          {user.role === "manager" ? t("users.roleManager", "مدير") : user.role === "employee" ? t("users.roleEmployee", "موظف") : user.role === "designer" ? t("users.roleDesigner", "مصمم") : t("users.roleEditor", "محرر")}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.role === "manager" ? (
                          <span className="text-xs text-muted-foreground">{t("users.allSections", "كل الأقسام")}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {Array.isArray(user.permissions) ? `${user.permissions.length} ${t("users.sections", "أقسام")}` : "-"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{user.preferredLanguage === "ar" ? t("users.langAr", "العربية") : t("users.langHe", "العبرية")}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {user.status === "active" ? t("users.statusActive", "نشط") : t("users.statusDisabled", "معطل")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            title={t("users.edit", "تعديل")}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            title={t("users.delete", "حذف")}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
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
