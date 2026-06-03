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

export default function Transactions() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    type: "إيراد",
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    month: new Date().toLocaleString('ar-SA', { month: '2-digit' }),
    year: new Date().getFullYear(),
    notes: "",
    relatedClient: "",
    relatedVendor: "",
  });

  const { data: transactions = [], isLoading, refetch } = trpc.transactions.list.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const { data: vendors = [] } = trpc.vendors.list.useQuery();
  const createMutation = trpc.transactions.create.useMutation();
  const updateMutation = trpc.transactions.update.useMutation();
  const deleteMutation = trpc.transactions.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          type: formData.type as "إيراد" | "مصروف",
          category: formData.category,
          amount: parseFloat(formData.amount),
          description: formData.description,
          date: new Date(formData.date),
          notes: formData.notes,
          relatedClient: formData.relatedClient ? parseInt(formData.relatedClient) : undefined,
          relatedVendor: formData.relatedVendor ? parseInt(formData.relatedVendor) : undefined,
        });
        toast.success("تم تحديث الحركة المالية بنجاح");
      } else {
        await createMutation.mutateAsync({
          type: formData.type as "إيراد" | "مصروف",
          category: formData.category,
          amount: parseFloat(formData.amount),
          description: formData.description,
          date: new Date(formData.date),
          month: formData.month,
          year: formData.year,
          notes: formData.notes,
          relatedClient: formData.relatedClient ? parseInt(formData.relatedClient) : undefined,
          relatedVendor: formData.relatedVendor ? parseInt(formData.relatedVendor) : undefined,
        });
        toast.success("تم إضافة الحركة المالية بنجاح");
      }
      
      setFormData({
        type: "إيراد",
        category: "",
        amount: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
        month: new Date().toLocaleString('ar-SA', { month: '2-digit' }),
        year: new Date().getFullYear(),
        notes: "",
        relatedClient: "",
        relatedVendor: "",
      });
      setEditingId(null);
      setIsOpen(false);
      refetch();
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ البيانات");
    }
  };

  const handleEdit = (transaction: any) => {
    setEditingId(transaction.id);
    const date = new Date(transaction.date);
    setFormData({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount.toString(),
      description: transaction.description || "",
      date: date.toISOString().split('T')[0],
      month: transaction.month,
      year: transaction.year,
      notes: transaction.notes || "",
      relatedClient: transaction.relatedClient?.toString() || "",
      relatedVendor: transaction.relatedVendor?.toString() || "",
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الحركة المالية؟")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("تم حذف الحركة المالية بنجاح");
        refetch();
      } catch (error) {
        toast.error("حدث خطأ أثناء حذف الحركة");
      }
    }
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData({
      type: "إيراد",
      category: "",
      amount: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      month: new Date().toLocaleString('ar-SA', { month: '2-digit' }),
      year: new Date().getFullYear(),
      notes: "",
      relatedClient: "",
      relatedVendor: "",
    });
  };

  const totalRevenue = transactions
    .filter((t: any) => t.type === "إيراد")
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount.toString()), 0);

  const totalExpense = transactions
    .filter((t: any) => t.type === "مصروف")
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount.toString()), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة الإيرادات والمصروفات</h1>
          <p className="text-muted-foreground mt-1">تسجيل وتتبع الحركات المالية الشهرية</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingId(null); setFormData({ type: "إيراد", category: "", amount: "", description: "", date: new Date().toISOString().split('T')[0], month: new Date().toLocaleString('ar-SA', { month: '2-digit' }), year: new Date().getFullYear(), notes: "", relatedClient: "", relatedVendor: "" }); }}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة حركة مالية
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "تعديل الحركة المالية" : "إضافة حركة مالية جديدة"}</DialogTitle>
              <DialogDescription>
                {editingId ? "قم بتحديث بيانات الحركة" : "أدخل بيانات الحركة المالية الجديدة"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="type">النوع</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="إيراد">إيراد</SelectItem>
                    <SelectItem value="مصروف">مصروف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">الفئة</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="مثال: رواتب، إعلانات، استضافة"
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount">المبلغ</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">الوصف</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف الحركة المالية"
                />
              </div>
              <div>
                <Label htmlFor="date">التاريخ</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="relatedClient">العميل ذي الصلة</Label>
                <Select value={formData.relatedClient} onValueChange={(value) => setFormData({ ...formData, relatedClient: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client: any) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="relatedVendor">المورد ذي الصلة</Label>
                <Select value={formData.relatedVendor} onValueChange={(value) => setFormData({ ...formData, relatedVendor: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المورد" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((vendor: any) => (
                      <SelectItem key={vendor.id} value={vendor.id.toString()}>
                        {vendor.name}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalRevenue.toLocaleString('ar-SA')} ريال
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalExpense.toLocaleString('ar-SA')} ريال
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">الربح الصافي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(totalRevenue - totalExpense) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {((totalRevenue - totalExpense) >= 0 ? '+' : '')} {(totalRevenue - totalExpense).toLocaleString('ar-SA')} ريال
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الحركات المالية</CardTitle>
          <CardDescription>عدد الحركات: {transactions.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد حركات مالية حتى الآن. قم بإضافة حركة جديدة للبدء.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>النوع</TableHead>
                    <TableHead>الفئة</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction: any) => (
                    <TableRow key={transaction.id} className="hover:bg-muted/50">
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          transaction.type === "إيراد" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {transaction.type}
                        </span>
                      </TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell className="font-medium">
                        {transaction.amount.toLocaleString('ar-SA')} ريال
                      </TableCell>
                      <TableCell>{new Date(transaction.date).toLocaleDateString('ar-SA')}</TableCell>
                      <TableCell>{transaction.description || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(transaction)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(transaction.id)}
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
