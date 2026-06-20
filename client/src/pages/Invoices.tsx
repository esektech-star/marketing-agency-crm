import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2, Download, FileText, Receipt, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { openWhatsApp } from "@/lib/whatsapp";
import { useTranslation } from "react-i18next";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
};
const STATUS_LABEL: Record<string, string> = {
  pending: "قيد الانتظار",
  paid: "مدفوعة",
  overdue: "متأخرة",
};

function fmtMoney(n: number) {
  return `₪${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function Invoices() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    invoiceNumber: "",
    relatedClient: "",
    amount: "",
    dueDate: "",
    status: "pending",
    notes: "",
    fileKey: "",
    fileUrl: "",
  });

  const utils = trpc.useUtils();
  const { data: invoices = [], isLoading } = trpc.invoices.list.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const uploadFile = trpc.invoices.uploadFile.useMutation();
  const createMutation = trpc.invoices.create.useMutation();
  const updateMutation = trpc.invoices.update.useMutation();
  const deleteMutation = trpc.invoices.delete.useMutation();

  const clientName = (id: number) => clients.find((c: any) => c.id === id)?.name || "-";

  const resetForm = () => {
    setForm({ invoiceNumber: "", relatedClient: "", amount: "", dueDate: "", status: "pending", notes: "", fileKey: "", fileUrl: "" });
    setEditingId(null);
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onerror = () => { setUploading(false); toast.error("فشل رفع الملف"); };
    reader.onload = async (ev) => {
      try {
        const res = await uploadFile.mutateAsync({
          fileName: file.name,
          fileBase64: ev.target?.result as string,
          mimeType: file.type,
        });
        setForm((f) => ({ ...f, fileKey: res.key, fileUrl: res.url }));
        toast.success(t("invoices.uploadSuccess", "تم رفع ملف الفاتورة"));
      } catch {
        toast.error("فشل رفع الملف");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.relatedClient) { toast.error(t("invoices.selectClient", "اختر العميل")); return; }
    try {
      const payload = {
        invoiceNumber: form.invoiceNumber,
        relatedClient: parseInt(form.relatedClient),
        amount: parseFloat(form.amount || "0"),
        dueDate: new Date(form.dueDate),
        status: form.status as any,
        notes: form.notes || undefined,
        fileKey: form.fileKey || undefined,
        fileUrl: form.fileUrl || undefined,
      };
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...payload });
        toast.success(t("invoices.updateSuccess", "تم تحديث الفاتورة"));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t("invoices.createSuccess", "تم إنشاء الفاتورة"));
      }
      resetForm();
      setIsOpen(false);
      utils.invoices.list.invalidate();
    } catch (err: any) {
      toast.error(err?.message || "حدث خطأ");
    }
  };

  const handleEdit = (inv: any) => {
    setEditingId(inv.id);
    setForm({
      invoiceNumber: inv.invoiceNumber,
      relatedClient: String(inv.relatedClient),
      amount: String(inv.amount),
      dueDate: new Date(inv.dueDate).toISOString().slice(0, 10),
      status: inv.status,
      notes: inv.notes || "",
      fileKey: inv.fileKey || "",
      fileUrl: inv.fileUrl || "",
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("invoices.deleteConfirm", "هل أنت متأكد من حذف هذه الفاتورة؟"))) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success(t("invoices.deleteSuccess", "تم حذف الفاتورة"));
      utils.invoices.list.invalidate();
    } catch {
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Receipt className="w-7 h-7 text-[#1e3a5f]" /> الفواتير</h1>
          <p className="text-muted-foreground mt-1">إنشاء وإدارة فواتير العملاء</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-[#1e3a5f] hover:bg-[#2d5080]">
              <Plus className="w-4 h-4 ml-2" /> {t("invoices.newInvoice", "فاتورة جديدة")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? t("invoices.editInvoice", "تعديل الفاتورة") : t("invoices.newInvoice", "فاتورة جديدة")}</DialogTitle>
              <DialogDescription>{t("invoices.invoiceDetails", "أدخل تفاصيل الفاتورة وأرفق ملفها إن وجد")}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>{t("invoices.invoiceNumber", "رقم الفاتورة")}</Label>
                <Input value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} required />
              </div>
              <div>
                <Label>{t("invoices.client", "العميل")}</Label>
                <Select value={form.relatedClient} onValueChange={(v) => setForm({ ...form, relatedClient: v })}>
                  <SelectTrigger><SelectValue placeholder={t("invoices.selectClient", "اختر العميل")} /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c: any) => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>المبلغ (₪)</Label>
                  <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
                </div>
                <div>
                  <Label>تاريخ الاستحقاق</Label>
                  <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
                </div>
              </div>
              <div>
                <Label>الحالة</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="paid">مدفوعة</SelectItem>
                    <SelectItem value="overdue">متأخرة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("invoices.invoiceFile", "ملف الفاتورة (اختياري)")}</Label>
                <Input type="file" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
                {uploading && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> جارٍ الرفع...</p>}
                {form.fileUrl && !uploading && <p className="text-xs text-green-700 mt-1">تم إرفاق الملف</p>}
              </div>
              <div>
                <Label>ملاحظات</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending || uploading}>
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                  {editingId ? "تحديث" : "إنشاء"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>إلغاء</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الفواتير</CardTitle>
          <CardDescription>عدد الفواتير: {invoices.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">لا توجد فواتير حتى الآن.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الفاتورة</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الاستحقاق</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الملف</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv: any) => (
                    <TableRow key={inv.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono">{inv.invoiceNumber}</TableCell>
                      <TableCell>{clientName(inv.relatedClient)}</TableCell>
                      <TableCell className="font-medium">{fmtMoney(parseFloat(inv.amount))}</TableCell>
                      <TableCell>{new Date(inv.dueDate).toLocaleDateString("en-GB")}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[inv.status]}`}>{STATUS_LABEL[inv.status]}</span>
                      </TableCell>
                      <TableCell>
                        {inv.fileUrl ? (
                          <Button size="sm" variant="outline" onClick={() => window.open(inv.fileUrl, "_blank")}><FileText className="w-4 h-4" /></Button>
                        ) : <span className="text-xs text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(inv)}><Pencil className="w-4 h-4" /></Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            const client = clients.find((c: any) => c.id === parseInt(inv.relatedClient));
                            if (client?.phone) {
                              const msg = `فاتورة رقم ${inv.invoiceNumber}\nالمبلغ: ₪${parseFloat(inv.amount).toLocaleString('en-US')}\nتاريخ الاستحقاق: ${new Date(inv.dueDate).toLocaleDateString('ar-EG')}`;
                              openWhatsApp(client.phone, msg);
                            } else {
                              toast.error("لا يوجد رقم هاتف للعميل");
                            }
                          }}><MessageCircle className="w-4 h-4" /></Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(inv.id)}><Trash2 className="w-4 h-4" /></Button>
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
