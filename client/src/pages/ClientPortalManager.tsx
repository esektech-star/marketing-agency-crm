import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Loader2, Copy, ExternalLink, Globe } from "lucide-react";
import { toast } from "sonner";

export default function ClientPortalManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    relatedClient: "",
    email: "",
    canViewCampaigns: true,
    canViewInvoices: true,
    canDownloadFiles: true,
  });

  const utils = trpc.useUtils();
  const { data: links = [], isLoading } = trpc.clientPortal.list.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const createMutation = trpc.clientPortal.create.useMutation();
  const deleteMutation = trpc.clientPortal.delete.useMutation();

  const clientName = (id: number) => clients.find((c: any) => c.id === id)?.name || "-";
  const portalUrl = (token: string) => `${window.location.origin}/portal/${token}`;

  const resetForm = () => setForm({ relatedClient: "", email: "", canViewCampaigns: true, canViewInvoices: true, canDownloadFiles: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.relatedClient) { toast.error("اختر العميل"); return; }
    try {
      const res = await createMutation.mutateAsync({
        relatedClient: parseInt(form.relatedClient),
        email: form.email,
        canViewCampaigns: form.canViewCampaigns,
        canViewInvoices: form.canViewInvoices,
        canDownloadFiles: form.canDownloadFiles,
      });
      await navigator.clipboard.writeText(portalUrl(res.accessToken)).catch(() => {});
      toast.success("تم إنشاء رابط البوابة ونسخه للحافظة");
      resetForm();
      setIsOpen(false);
      utils.clientPortal.list.invalidate();
    } catch (err: any) {
      toast.error(err?.message || "حدث خطأ");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من إلغاء رابط الوصول هذا؟")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("تم إلغاء الرابط");
      utils.clientPortal.list.invalidate();
    } catch {
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(portalUrl(token));
    toast.success("تم نسخ الرابط");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Globe className="w-7 h-7 text-[#1e3a5f]" /> بوابة العملاء</h1>
          <p className="text-muted-foreground mt-1">إنشاء روابط وصول للعملاء لعرض حملاتهم وفواتيرهم وملفاتهم</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-[#1e3a5f] hover:bg-[#2d5080]">
              <Plus className="w-4 h-4 ml-2" /> رابط وصول جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>رابط وصول جديد</DialogTitle>
              <DialogDescription>اختر العميل والصلاحيات المتاحة له في البوابة</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>العميل</Label>
                <Select value={form.relatedClient} onValueChange={(v) => setForm({ ...form, relatedClient: v })}>
                  <SelectTrigger><SelectValue placeholder="اختر العميل" /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c: any) => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>بريد العميل الإلكتروني</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="space-y-2 border rounded-lg p-3 bg-muted/30">
                <Label className="font-semibold">الصلاحيات</Label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={form.canViewCampaigns} onCheckedChange={(v) => setForm({ ...form, canViewCampaigns: !!v })} />
                  عرض الحملات
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={form.canViewInvoices} onCheckedChange={(v) => setForm({ ...form, canViewInvoices: !!v })} />
                  عرض الفواتير
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={form.canDownloadFiles} onCheckedChange={(v) => setForm({ ...form, canDownloadFiles: !!v })} />
                  تحميل الملفات
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                  إنشاء الرابط
                </Button>
                <Button type="button" variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>إلغاء</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>روابط الوصول</CardTitle>
          <CardDescription>عدد الروابط: {links.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : links.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">لا توجد روابط وصول حتى الآن.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>العميل</TableHead>
                    <TableHead>البريد</TableHead>
                    <TableHead>الصلاحيات</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.map((l: any) => (
                    <TableRow key={l.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{clientName(l.relatedClient)}</TableCell>
                      <TableCell className="text-sm">{l.email}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {[l.canViewCampaigns && "حملات", l.canViewInvoices && "فواتير", l.canDownloadFiles && "ملفات"].filter(Boolean).join(" · ")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => copyLink(l.accessToken)}><Copy className="w-4 h-4" /></Button>
                          <Button size="sm" variant="outline" onClick={() => window.open(portalUrl(l.accessToken), "_blank")}><ExternalLink className="w-4 h-4" /></Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(l.id)}><Trash2 className="w-4 h-4" /></Button>
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
