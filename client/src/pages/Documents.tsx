import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Download, FileText, Trash2, FolderClosed, Lock } from "lucide-react";
import { toast } from "sonner";

const INTERNAL = "internal";
const NONE = "none";

export default function Documents() {
  const { t } = useTranslation();
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [relatedClient, setRelatedClient] = useState<string>(NONE);
  const [isInternal, setIsInternal] = useState(false);
  const [filterClient, setFilterClient] = useState<string>("all");

  const { data: documents = [], isLoading, refetch } = trpc.documents.list.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const uploadMutation = trpc.documents.upload.useMutation();
  const deleteMutation = trpc.documents.delete.useMutation();

  const clientName = (id: number | null | undefined) => {
    if (!id) return null;
    const c = clients.find((x: any) => x.id === id);
    return c ? c.name : null;
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileInput) {
      toast.error(t("documents.selectFile"));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => toast.error(t("common.error"));
    reader.onload = async (event) => {
      try {
        const base64 = event.target?.result as string;
        await uploadMutation.mutateAsync({
          fileName: fileInput.name,
          fileBase64: base64,
          mimeType: fileInput.type,
          category: category || undefined,
          relatedClient: relatedClient !== NONE && relatedClient !== INTERNAL ? parseInt(relatedClient) : undefined,
          isInternal: relatedClient === INTERNAL ? true : isInternal,
        });
        toast.success(t("documents.uploadSuccess"));
        setFileInput(null);
        setCategory("");
        setRelatedClient(NONE);
        setIsInternal(false);
        const fileEl = document.getElementById("file") as HTMLInputElement | null;
        if (fileEl) fileEl.value = "";
        refetch();
      } catch {
        toast.error(t("common.error"));
      }
    };
    reader.readAsDataURL(fileInput);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t("documents.confirmDelete"))) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success(t("documents.deleteSuccess"));
        refetch();
      } catch {
        toast.error(t("common.error"));
      }
    }
  };

  // Group documents: internal bucket, per-client buckets, and general (no client, not internal)
  const groups = useMemo(() => {
    const filtered = documents.filter((d: any) => {
      if (filterClient === "all") return true;
      if (filterClient === INTERNAL) return d.isInternal;
      return String(d.relatedClient) === filterClient;
    });
    const internal: any[] = [];
    const general: any[] = [];
    const byClient: Record<string, any[]> = {};
    filtered.forEach((d: any) => {
      if (d.isInternal) {
        internal.push(d);
      } else if (d.relatedClient) {
        const k = String(d.relatedClient);
        if (!byClient[k]) byClient[k] = [];
        byClient[k].push(d);
      } else {
        general.push(d);
      }
    });
    return { internal, general, byClient };
  }, [documents, filterClient]);

  const renderTable = (items: any[]) => (
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
          {items.map((document: any) => (
            <TableRow key={document.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  {document.fileName}
                  {document.isInternal && <Lock className="w-3.5 h-3.5 text-amber-600" />}
                </div>
              </TableCell>
              <TableCell>{document.category || "-"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => window.open(document.fileUrl, "_blank")}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(document.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const hasAny =
    groups.internal.length > 0 || groups.general.length > 0 || Object.keys(groups.byClient).length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("documents.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("documents.subtitle")}</p>
        </div>
      </div>

      {/* Upload form */}
      <Card>
        <CardHeader>
          <CardTitle>{t("documents.uploadDocument")}</CardTitle>
          <CardDescription>{t("documents.uploadDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="file">{t("documents.selectFile")}</Label>
                <Input id="file" type="file" onChange={(e) => setFileInput(e.target.files?.[0] || null)} required />
              </div>
              <div>
                <Label htmlFor="category">{t("documents.documentType")}</Label>
                <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder={t("documents.documentType")} />
              </div>
              <div>
                <Label htmlFor="docClient">{t("documents.client")}</Label>
                <Select value={relatedClient} onValueChange={setRelatedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("documents.selectClient")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>{t("documents.generalFiles")}</SelectItem>
                    <SelectItem value={INTERNAL}>{t("documents.internal")}</SelectItem>
                    {clients.map((c: any) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {relatedClient !== INTERNAL && (
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={isInternal} onCheckedChange={(v) => setIsInternal(!!v)} />
                    <span className="text-sm">{t("documents.internalFile")}</span>
                  </label>
                </div>
              )}
            </div>
            <Button type="submit" disabled={uploadMutation.isPending} className="bg-[#1e3a5f] hover:bg-[#2d5080]">
              {uploadMutation.isPending && <Loader2 className="w-4 h-4 ms-2 animate-spin" />}
              {t("documents.upload")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <Label className="text-sm text-muted-foreground">{t("documents.filterByClient")}</Label>
        <Select value={filterClient} onValueChange={setFilterClient}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("documents.allClients")}</SelectItem>
            <SelectItem value={INTERNAL}>{t("documents.internal")}</SelectItem>
            {clients.map((c: any) => (
              <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : !hasAny ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <FolderClosed className="w-10 h-10 mx-auto mb-3 opacity-40" />
            {t("documents.empty")}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Internal files folder */}
          {groups.internal.length > 0 && (
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lock className="w-5 h-5 text-amber-600" />
                  {t("documents.internal")}
                  <span className="text-xs font-normal text-muted-foreground">
                    ({groups.internal.length} {t("documents.filesCount")})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>{renderTable(groups.internal)}</CardContent>
            </Card>
          )}

          {/* Per-client folders */}
          {Object.keys(groups.byClient).map((cid) => (
            <Card key={cid}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FolderClosed className="w-5 h-5 text-[#1e3a5f]" />
                  {clientName(parseInt(cid)) || t("documents.clientFolder")}
                  <span className="text-xs font-normal text-muted-foreground">
                    ({groups.byClient[cid].length} {t("documents.filesCount")})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>{renderTable(groups.byClient[cid])}</CardContent>
            </Card>
          ))}

          {/* General files */}
          {groups.general.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FolderClosed className="w-5 h-5 text-muted-foreground" />
                  {t("documents.generalFiles")}
                  <span className="text-xs font-normal text-muted-foreground">
                    ({groups.general.length} {t("documents.filesCount")})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>{renderTable(groups.general)}</CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
