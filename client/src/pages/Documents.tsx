import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2, Download, FileText } from "lucide-react";
import { toast } from "sonner";

export default function Documents() {
  const { t } = useTranslation();
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [category, setCategory] = useState("");

  const { data: documents = [], isLoading, refetch } = trpc.documents.list.useQuery();
  const uploadMutation = trpc.documents.upload.useMutation();
  const updateMutation = trpc.documents.update.useMutation();
  const deleteMutation = trpc.documents.delete.useMutation();

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileInput) {
      toast.error(t("documents.selectFile"));
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        await uploadMutation.mutateAsync({
          fileName: fileInput.name,
          fileBase64: base64,
          mimeType: fileInput.type,
          category: category || undefined,
        });
        toast.success(t("documents.uploadSuccess"));
        setFileInput(null);
        setCategory("");
        refetch();
      };
      reader.readAsDataURL(fileInput);
    } catch (error) {
      toast.error(t("common.error"));
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm(t("documents.confirmDelete"))) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success(t("documents.deleteSuccess"));
        refetch();
      } catch (error) {
        toast.error(t("common.error"));
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("documents.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("documents.subtitle")}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("documents.uploadDocument")}</CardTitle>
          <CardDescription>{t("documents.uploadDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <Label htmlFor="file">{t("documents.selectFile")}</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setFileInput(e.target.files?.[0] || null)}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">{t("documents.documentType")}</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={t("documents.documentType")}
              />
            </div>
            <Button type="submit" disabled={uploadMutation.isPending} className="bg-[#1e3a5f] hover:bg-[#2d5080]">
              {uploadMutation.isPending && <Loader2 className="w-4 h-4 ms-2 animate-spin" />}
              {t("documents.upload")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("documents.listTitle")}</CardTitle>
          <CardDescription>{t("documents.count")}: {documents.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("documents.empty")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("documents.documentName")}</TableHead>
                    <TableHead>{t("documents.documentType")}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((document: any) => (
                    <TableRow key={document.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          {document.fileName}
                        </div>
                      </TableCell>
                      <TableCell>{document.category || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(document.fileUrl, '_blank')}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(document.id)}
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
