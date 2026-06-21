import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { Eye, EyeOff, Copy, Trash2, Edit2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function Subscriptions() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState<Record<number, boolean>>({});
  const [formData, setFormData] = useState({
    softwareName: "",
    monthlyAmount: "",
    purpose: "",
    website: "",
    username: "",
    password: "",
    renewalDate: "",
    status: "active" as const,
    notes: "",
  });

  const { data: subscriptions, isLoading, refetch } = trpc.subscriptions.list.useQuery();
  const { data: totalCost } = trpc.subscriptions.getTotalMonthlyCost.useQuery();
  const createMutation = trpc.subscriptions.create.useMutation();
  const updateMutation = trpc.subscriptions.update.useMutation();
  const deleteMutation = trpc.subscriptions.delete.useMutation();

  const handleSubmit = async () => {
    if (!formData.softwareName || !formData.softwareName.trim()) {
      toast.error(t("subscriptions.softwareNameRequired", "اسم البرنامج مطلوب"));
      return;
    }
    if (!formData.monthlyAmount || parseFloat(formData.monthlyAmount) <= 0) {
      toast.error(t("subscriptions.amountRequired", "المبلغ الشهري مطلوب وأكبر من صفر"));
      return;
    }

    try {
      const monthlyAmount = parseFloat(formData.monthlyAmount);
      if (!Number.isFinite(monthlyAmount) || monthlyAmount <= 0) {
        toast.error(t("subscriptions.invalidAmount", "مبلغ غير صحيح"));
        return;
      }
      
      const renewalDate = formData.renewalDate ? parseInt(formData.renewalDate) : undefined;
      if (renewalDate && (!Number.isFinite(renewalDate) || renewalDate < 1 || renewalDate > 31)) {
        toast.error(t("subscriptions.invalidRenewalDate", "يوم التجديد يجب أن يكون بين 1 و 31"));
        return;
      }
      
      const data = {
        ...formData,
        softwareName: formData.softwareName.trim(),
        monthlyAmount: monthlyAmount,
        renewalDate: renewalDate,
      };

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...data });
        toast.success(t("common.updated"));
      } else {
        await createMutation.mutateAsync(data);
        toast.success(t("common.created"));
      }

      setIsOpen(false);
      setEditingId(null);
      setFormData({
        softwareName: "",
        monthlyAmount: "",
        purpose: "",
        website: "",
        username: "",
        password: "",
        renewalDate: "",
        status: "active",
        notes: "",
      });
      refetch();
    } catch (error) {
      toast.error(t("common.error"));
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm(t("common.confirmDelete"))) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success(t("common.deleted"));
        refetch();
      } catch (error) {
        toast.error(t("common.error"));
      }
    }
  };

  const handleEdit = (subscription: any) => {
    setFormData({
      softwareName: subscription.softwareName,
      monthlyAmount: subscription.monthlyAmount.toString(),
      purpose: subscription.purpose || "",
      website: subscription.website || "",
      username: subscription.username || "",
      password: "",
      renewalDate: subscription.renewalDate?.toString() || "",
      status: subscription.status,
      notes: subscription.notes || "",
    });
    setEditingId(subscription.id);
    setIsOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("common.copied"));
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("sidebar.subscriptions") || "المنويات"}</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingId(null); setFormData({ softwareName: "", monthlyAmount: "", purpose: "", website: "", username: "", password: "", renewalDate: "", status: "active", notes: "" }); }}>
              <Plus className="w-4 h-4 ml-2" />
              {t("common.add")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? t("common.edit") : t("common.add")} {t("sidebar.subscriptions") || "منوي"}</DialogTitle>
              <DialogDescription>{t("common.fillForm")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t("subscriptions.softwareName")}</Label>
                <Input value={formData.softwareName} onChange={(e) => setFormData({ ...formData, softwareName: e.target.value })} placeholder="Adobe Creative Cloud" />
              </div>
              <div>
                <Label>{t("subscriptions.monthlyAmount")}</Label>
                <Input type="number" value={formData.monthlyAmount} onChange={(e) => setFormData({ ...formData, monthlyAmount: e.target.value })} placeholder="99.99" />
              </div>
              <div>
                <Label>{t("subscriptions.purpose")}</Label>
                <Textarea value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} placeholder={t("subscriptions.purposePlaceholder")} />
              </div>
              <div>
                <Label>{t("subscriptions.website")}</Label>
                <Input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://adobe.com" />
              </div>
              <div>
                <Label>{t("subscriptions.username")}</Label>
                <Input value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="user@example.com" />
              </div>
              <div>
                <Label>{t("subscriptions.password")}</Label>
                <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder={editingId ? t("subscriptions.leaveBlankToKeep") : ""} />
              </div>
              <div>
                <Label>{t("subscriptions.renewalDate")}</Label>
                <Input type="number" min="1" max="31" value={formData.renewalDate} onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })} placeholder="1-31" />
              </div>
              <div>
                <Label>{t("common.status")}</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t("common.active")}</SelectItem>
                    <SelectItem value="inactive">{t("common.inactive")}</SelectItem>
                    <SelectItem value="expired">{t("common.expired")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("common.notes")}</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
              </div>
              <Button onClick={handleSubmit} className="w-full">{editingId ? t("common.update") : t("common.create")}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {totalCost && (
        <Card>
          <CardHeader>
            <CardTitle>{t("subscriptions.totalMonthlyCost")}</CardTitle>
            <CardDescription>{t("subscriptions.totalMonthlyCostDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₪{totalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("subscriptions.list")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("subscriptions.softwareName")}</TableHead>
                  <TableHead>{t("subscriptions.monthlyAmount")}</TableHead>
                  <TableHead>{t("subscriptions.purpose")}</TableHead>
                  <TableHead>{t("subscriptions.username")}</TableHead>
                  <TableHead>{t("subscriptions.password")}</TableHead>
                  <TableHead>{t("subscriptions.renewalDate")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions?.map((sub: any) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.softwareName}</TableCell>
                    <TableCell>₪{parseFloat(sub.monthlyAmount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell>{sub.purpose}</TableCell>
                    <TableCell>{sub.username}</TableCell>
                    <TableCell>
                      {sub.password && (
                        <div className="flex items-center gap-2">
                          {showPassword[sub.id] ? (
                            <>
                              <span className="text-sm">••••••••</span>
                              <button onClick={() => setShowPassword({ ...showPassword, [sub.id]: false })} className="text-gray-500 hover:text-gray-700">
                                <EyeOff className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button onClick={() => setShowPassword({ ...showPassword, [sub.id]: true })} className="text-gray-500 hover:text-gray-700">
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => copyToClipboard(sub.password)} className="text-gray-500 hover:text-gray-700">
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{sub.renewalDate}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-sm ${sub.status === "active" ? "bg-green-100 text-green-800" : sub.status === "inactive" ? "bg-gray-100 text-gray-800" : "bg-red-100 text-red-800"}`}>
                        {t(`common.${sub.status}`)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(sub)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(sub.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
