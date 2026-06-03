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

export default function Campaigns() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    platform: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: "",
    status: "مخطط",
    description: "",
    relatedClient: "",
  });

  const { data: campaigns = [], isLoading, refetch } = trpc.campaigns.list.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const createMutation = trpc.campaigns.create.useMutation();
  const updateMutation = trpc.campaigns.update.useMutation();
  const deleteMutation = trpc.campaigns.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          name: formData.name,
          platform: formData.platform,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          budget: formData.budget ? parseFloat(formData.budget) : undefined,
          status: formData.status as "مخطط" | "نشط" | "معلق" | "منتهي",
          description: formData.description,
          relatedClient: formData.relatedClient ? parseInt(formData.relatedClient) : undefined,
        });
        toast.success("تم تحديث الحملة بنجاح");
      } else {
        await createMutation.mutateAsync({
          name: formData.name,
          platform: formData.platform,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          budget: formData.budget ? parseFloat(formData.budget) : undefined,
          status: formData.status as "مخطط" | "نشط" | "معلق" | "منتهي",
          description: formData.description,
          relatedClient: formData.relatedClient ? parseInt(formData.relatedClient) : undefined,
        });
        toast.success("تم إضافة الحملة بنجاح");
      }
      
      setFormData({
        name: "",
        platform: "",
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        budget: "",
        status: "مخطط",
        description: "",
        relatedClient: "",
      });
      setEditingId(null);
      setIsOpen(false);
      refetch();
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ البيانات");
    }
  };

  const handleEdit = (campaign: any) => {
    setEditingId(campaign.id);
    setFormData({
      name: campaign.name,
      platform: campaign.platform,
      startDate: new Date(campaign.startDate).toISOString().split('T')[0],
      endDate: new Date(campaign.endDate).toISOString().split('T')[0],
      budget: campaign.budget?.toString() || "",
      status: campaign.status,
      description: campaign.description || "",
      relatedClient: campaign.relatedClient?.toString() || "",
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الحملة؟")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("تم حذف الحملة بنجاح");
        refetch();
      } catch (error) {
        toast.error("حدث خطأ أثناء حذف الحملة");
      }
    }
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      platform: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      budget: "",
      status: "مخطط",
      description: "",
      relatedClient: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "مخطط": return "bg-blue-100 text-blue-800";
      case "نشط": return "bg-green-100 text-green-800";
      case "منتهي": return "bg-gray-100 text-gray-800";
      case "ملغي": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const calculateProgress = (startDate: Date, endDate: Date) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.round((elapsed / total) * 100);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة الحملات الإعلانية</h1>
          <p className="text-muted-foreground mt-1">إدارة وتتبع الحملات الإعلانية مع جدول زمني بصري</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingId(null); setFormData({ name: "", platform: "", startDate: new Date().toISOString().split('T')[0], endDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], budget: "", status: "مخطط", description: "", relatedClient: "" }); }}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة حملة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "تعديل الحملة" : "إضافة حملة جديدة"}</DialogTitle>
              <DialogDescription>
                {editingId ? "قم بتحديث بيانات الحملة" : "أدخل بيانات الحملة الجديدة"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">اسم الحملة</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="اسم الحملة"
                  required
                />
              </div>
              <div>
                <Label htmlFor="platform">المنصة</Label>
                <Input
                  id="platform"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  placeholder="مثال: فيسبوك، جوجل، إنستجرام"
                  required
                />
              </div>
              <div>
                <Label htmlFor="startDate">تاريخ البداية</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">تاريخ النهاية</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="budget">الميزانية</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="status">الحالة</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="مخطط">مخطط</SelectItem>
                    <SelectItem value="نشط">نشط</SelectItem>
                    <SelectItem value="منتهي">منتهي</SelectItem>
                    <SelectItem value="معلق">معلق</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف الحملة"
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
          <CardTitle>مخطط جانت للحملات</CardTitle>
          <CardDescription>عدد الحملات: {campaigns.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد حملات حتى الآن. قم بإضافة حملة جديدة للبدء.
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign: any) => {
                const progress = calculateProgress(new Date(campaign.startDate), new Date(campaign.endDate));
                return (
                  <div key={campaign.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{campaign.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {campaign.platform} • {new Date(campaign.startDate).toLocaleDateString('ar-SA')} إلى {new Date(campaign.endDate).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">التقدم</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {campaign.budget && (
                      <p className="text-sm text-muted-foreground mb-3">
                        الميزانية: {campaign.budget.toLocaleString('ar-SA')} ريال
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(campaign)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(campaign.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
