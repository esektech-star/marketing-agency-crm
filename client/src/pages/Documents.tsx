import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Loader2, Download, FileText, FileImage, File as FileIcon, UploadCloud } from "lucide-react";
import { toast } from "sonner";

function formatSize(bytes?: number | null) {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mimeType?: string | null) {
  if (!mimeType) return FileIcon;
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType.includes("pdf") || mimeType.includes("text") || mimeType.includes("document")) return FileText;
  return FileIcon;
}

export default function Documents() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [relatedClient, setRelatedClient] = useState<string>("none");
  const [relatedCampaign, setRelatedCampaign] = useState<string>("none");
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: items = [], isLoading, refetch } = trpc.documents.list.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const { data: campaigns = [] } = trpc.campaigns.list.useQuery();
  const uploadMutation = trpc.documents.upload.useMutation();
  const deleteMutation = trpc.documents.delete.useMutation();

  const resetForm = () => {
    setSelectedFile(null);
    setCategory("");
    setRelatedClient("none");
    setRelatedCampaign("none");
    setNotes("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("الرجاء اختيار ملف");
      return;
    }
    if (selectedFile.size > 16 * 1024 * 1024) {
      toast.error("حجم الملف يتجاوز 16 ميجابايت");
      return;
    }
    try {
      const fileBase64 = await fileToBase64(selectedFile);
      await uploadMutation.mutateAsync({
        fileName: selectedFile.name,
        fileBase64,
        mimeType: selectedFile.type || undefined,
        category: category || undefined,
        relatedClient: relatedClient !== "none" ? Number(relatedClient) : undefined,
        relatedCampaign: relatedCampaign !== "none" ? Number(relatedCampaign) : undefined,
        notes: notes || undefined,
      });
      toast.success("تم رفع الملف بنجاح");
      resetForm();
      setIsOpen(false);
      refetch();
    } catch (error) {
      toast.error("حدث خطأ أثناء رفع الملف");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الملف؟")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("تم حذف الملف بنجاح");
        refetch();
      } catch (error) {
        toast.error("حدث خطأ أثناء الحذف");
      }
    }
  };

  const clientName = (id?: number | null) => {
    if (!id) return null;
    return clients.find((c: any) => c.id === id)?.name;
  };

  const campaignName = (id?: number | null) => {
    if (!id) return null;
    return campaigns.find((c: any) => c.id === id)?.name;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">مكتبة الملفات</h1>
          <p className="text-muted-foreground mt-1">رفع وإدارة المستندات والصور وربطها بالعملاء</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 ml-2" />
              رفع ملف
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>رفع ملف جديد</DialogTitle>
              <DialogDescription>الحد الأقصى لحجم الملف 16 ميجابايت</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="file">الملف</Label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <UploadCloud className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {selectedFile ? selectedFile.name : "اضغط لاختيار ملف"}
                  </span>
                  {selectedFile && (
                    <span className="text-xs text-muted-foreground">{formatSize(selectedFile.size)}</span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  id="file"
                  type="file"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>
              <div>
                <Label htmlFor="category">التصنيف</Label>
                <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="مثال: عقد، تصميم، فاتورة" />
              </div>
              <div>
                <Label htmlFor="client">العميل المرتبط</Label>
                <Select value={relatedClient} onValueChange={setRelatedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون</SelectItem>
                    {clients.map((c: any) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="campaign">الحملة المرتبطة</Label>
                <Select value={relatedCampaign} onValueChange={setRelatedCampaign}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحملة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون</SelectItem>
                    {campaigns.map((c: any) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="resize-none" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                  رفع
                </Button>
                <Button type="button" variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>إلغاء</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الملفات المرفوعة</CardTitle>
          <CardDescription>عدد الملفات: {items.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UploadCloud className="w-12 h-12 mx-auto mb-3 opacity-40" />
              لا توجد ملفات بعد. ابدأ برفع أول ملف.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item: any) => {
                const Icon = fileIcon(item.mimeType);
                const isImage = item.mimeType?.startsWith("image/");
                return (
                  <div key={item.id} className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-32 bg-muted/40 flex items-center justify-center overflow-hidden">
                      {isImage ? (
                        <img src={item.fileUrl} alt={item.fileName} className="w-full h-full object-cover" />
                      ) : (
                        <Icon className="w-12 h-12 text-muted-foreground" />
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      <p className="font-medium text-sm truncate" title={item.fileName}>{item.fileName}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatSize(item.fileSize)}</span>
                        {item.category && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">{item.category}</span>}
                      </div>
                      {clientName(item.relatedClient) && (
                        <p className="text-xs text-muted-foreground truncate">العميل: {clientName(item.relatedClient)}</p>
                      )}
                      {campaignName(item.relatedCampaign) && (
                        <p className="text-xs text-muted-foreground truncate">الحملة: {campaignName(item.relatedCampaign)}</p>
                      )}
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" variant="outline" className="flex-1" asChild>
                          <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" download={item.fileName}>
                            <Download className="w-3 h-3 ml-1" /> تحميل
                          </a>
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
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
