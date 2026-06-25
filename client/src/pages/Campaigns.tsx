import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Loader2, Link as LinkIcon, Upload, ExternalLink, Image as ImageIcon, Video, MessageCircle, Search, ChevronDown, ChevronUp, CheckSquare, Archive, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { shareViaWhatsApp, formatCampaignShareMessage, formatCampaignShareMessageHE, formatCampaignShareMessageEN } from "@/lib/whatsappUtils";
import AdvancedFilters, { AdvancedFiltersState } from "@/components/AdvancedFilters";

const STATUS_VALUES = ["planned", "active", "pending", "completed"] as const;
const PLATFORMS = ["Facebook", "Instagram", "Google Ads", "TikTok", "LinkedIn", "Twitter", "YouTube", "Other"] as const;

export default function Campaigns() {
  const { t, i18n } = useTranslation();
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter and sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "budget" | "startDate">("startDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedCampaigns, setSelectedCampaigns] = useState<Set<number>>(new Set());
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersState>({});

  const handleAdvancedFiltersChange = (filters: AdvancedFiltersState) => {
    setAdvancedFilters(filters);
  };

  const emptyForm = {
    name: "",
    platform: "",
    budget: "",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "planned" as const,
    relatedClient: "",
    postLink: "",
    mediaUrl: "",
    mediaKey: "",
    mediaType: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  const { data: campaigns = [], isLoading, refetch } = trpc.campaigns.list.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const createMutation = trpc.campaigns.create.useMutation();
  const updateMutation = trpc.campaigns.update.useMutation();
  const deleteMutation = trpc.campaigns.delete.useMutation();
  const uploadMutation = trpc.campaigns.uploadMedia.useMutation();

  // تنسيق الأرقام بالإنجليزية دائماً مع رمز الشيقل
  const fmt = (n: number) => `₪${(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  const fmtDate = (d: any) => new Date(d).toLocaleDateString("en-GB");

  const localizedStatus = (status: string) => {
    const map: Record<string, string> = {
      planned: t("campaigns.statusPlanned", "planned"),
      active: t("campaigns.statusActive", "active"),
      pending: t("campaigns.statusPaused", "pending"),
      completed: t("campaigns.statusCompleted", "completed"),
    };
    return map[status] || status;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      toast.error(t("campaigns.fileTooLarge", "File too large (max 15MB)"));
      return;
    }
    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await uploadMutation.mutateAsync({
        fileName: file.name,
        fileBase64: base64,
        mimeType: file.type,
      });
      const mediaType = file.type.startsWith("video") ? "video" : "image";
      setFormData((prev) => ({ ...prev, mediaUrl: res.url, mediaKey: res.key, mediaType }));
      toast.success(t("campaigns.uploadSuccess", "Media uploaded"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        platform: formData.platform,
        budget: parseFloat(formData.budget) || 0,
        description: formData.description,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        status: ((formData.status as string) === "pending" ? "paused" : formData.status) as "planned" | "active" | "paused" | "completed",
        relatedClient: formData.relatedClient ? parseInt(formData.relatedClient) : undefined,
        postLink: formData.postLink || undefined,
        mediaUrl: formData.mediaUrl || undefined,
        mediaKey: formData.mediaKey || undefined,
        mediaType: formData.mediaType || undefined,
      };
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...payload });
        toast.success(t("campaigns.editSuccess"));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t("campaigns.addSuccess"));
      }
      setFormData(emptyForm);
      setEditingId(null);
      setIsOpen(false);
      refetch();
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleEdit = (campaign: any) => {
    setEditingId(campaign.id);
    setFormData({
      name: campaign.name,
      platform: campaign.platform || "",
      budget: campaign.budget?.toString() || "",
      description: campaign.description || "",
      startDate: new Date(campaign.startDate).toISOString().split("T")[0],
      endDate: new Date(campaign.endDate).toISOString().split("T")[0],
      status: (campaign.status === "paused" ? "pending" : campaign.status) as any,
      relatedClient: campaign.relatedClient?.toString() || "",
      postLink: campaign.postLink || "",
      mediaUrl: campaign.mediaUrl || "",
      mediaKey: campaign.mediaKey || "",
      mediaType: campaign.mediaType || "",
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t("campaigns.confirmDelete"))) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success(t("campaigns.deleteSuccess"));
        refetch();
      } catch {
        toast.error(t("common.error"));
      }
    }
  };


  const handleToggleSelect = (id: number) => {
    const newSelected = new Set(selectedCampaigns);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCampaigns(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCampaigns.size === filteredCampaigns.length) {
      setSelectedCampaigns(new Set());
    } else {
      setSelectedCampaigns(new Set(filteredCampaigns.map(c => c.id)));
    }
  };

  const handleBulkApprove = async () => {
    try {
      Array.from(selectedCampaigns).forEach(async (id) => {
        await updateMutation.mutateAsync({ id, status: "active" });
      });
      toast.success(t("campaigns.bulkApproveSuccess", "تمت الموافقة على الحملات المختارة"));
      setSelectedCampaigns(new Set());
      refetch();
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleBulkArchive = async () => {
    try {
      Array.from(selectedCampaigns).forEach(async (id) => {
        await updateMutation.mutateAsync({ id, status: "completed" });
      });
      toast.success(t("campaigns.bulkArchiveSuccess", "تم أرشفة الحملات المختارة"));
      setSelectedCampaigns(new Set());
      refetch();
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleBulkDelete = async () => {
    try {
      Array.from(selectedCampaigns).forEach(async (id) => {
        await deleteMutation.mutateAsync({ id });
      });
      toast.success(t("campaigns.bulkDeleteSuccess", "تم حذف الحملات المختارة"));
      setSelectedCampaigns(new Set());
      refetch();
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned": return "bg-blue-100 text-blue-800";
      case "active": return "bg-green-100 text-green-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "paused":
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredCampaigns = campaigns
    .filter((campaign: any) => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
      const matchesPlatform = platformFilter === "all" || campaign.platform === platformFilter;
      return matchesSearch && matchesStatus && matchesPlatform;
    })
    .sort((a: any, b: any) => {
      let aVal: any, bVal: any;
      
      if (sortBy === "name") {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      } else if (sortBy === "budget") {
        aVal = a.budget || 0;
        bVal = b.budget || 0;
      } else {
        aVal = new Date(a.startDate).getTime();
        bVal = new Date(b.startDate).getTime();
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const toggleSort = (field: "name" | "budget" | "startDate") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }: { field: "name" | "budget" | "startDate" }) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? 
      <ChevronUp className="w-4 h-4 inline ms-1" /> : 
      <ChevronDown className="w-4 h-4 inline ms-1" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {selectedCampaigns.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">{selectedCampaigns.size} {t("campaigns.selected", "حملات مختارة")}</span>
          </div>
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Check className="w-4 h-4 me-1" />
                  {t("campaigns.bulkApprove", "الموافقة")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("campaigns.confirmBulkApprove", "تأكيد الموافقة")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("campaigns.bulkApproveDesc", "هل تريد الموافقة على جميع الحملات المختارة؟")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogAction onClick={handleBulkApprove}>{t("common.confirm", "تأكيد")}</AlertDialogAction>
                <AlertDialogCancel>{t("common.cancel", "إلغاء")}</AlertDialogCancel>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                  <Archive className="w-4 h-4 me-1" />
                  {t("campaigns.bulkArchive", "أرشفة")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("campaigns.confirmBulkArchive", "تأكيد الأرشفة")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("campaigns.bulkArchiveDesc", "هل تريد أرشفة جميع الحملات المختارة؟")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogAction onClick={handleBulkArchive}>{t("common.confirm", "تأكيد")}</AlertDialogAction>
                <AlertDialogCancel>{t("common.cancel", "إلغاء")}</AlertDialogCancel>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                  <X className="w-4 h-4 me-1" />
                  {t("campaigns.bulkDelete", "حذف")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("campaigns.confirmBulkDelete", "تأكيد الحذف")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("campaigns.bulkDeleteDesc", "هل تريد حذف جميع الحملات المختارة؟ هذا الإجراء لا يمكن التراجع عنه.")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogAction onClick={handleBulkDelete}>{t("common.confirm", "تأكيد")}</AlertDialogAction>
                <AlertDialogCancel>{t("common.cancel", "إلغاء")}</AlertDialogCancel>
              </AlertDialogContent>
            </AlertDialog>
            <Button size="sm" variant="outline" onClick={() => setSelectedCampaigns(new Set())}>
              {t("common.clear", "مسح")}
            </Button>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("campaigns.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("campaigns.subtitle")}</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingId(null); setFormData(emptyForm); }} className="bg-[#1e3a5f] hover:bg-[#2d5080]">
              <Plus className="w-4 h-4 ms-2" />
              {t("campaigns.addCampaign")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? t("campaigns.editCampaign") : t("campaigns.addCampaign")}</DialogTitle>
              <DialogDescription>{editingId ? t("campaigns.editDesc") : t("campaigns.addDesc")}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">{t("campaigns.campaignName")}</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder={t("campaigns.campaignName")} required />
              </div>
              <div>
                <Label htmlFor="platform">{t("campaigns.platform")}</Label>
                <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value })}>
                  <SelectTrigger><SelectValue placeholder={t("campaigns.selectPlatform", "Select platform")} /></SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="budget">{t("campaigns.budget")}</Label>
                <Input id="budget" type="number" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} placeholder="0.00" step="0.01" required dir="ltr" />
              </div>
              <div>
                <Label htmlFor="startDate">{t("campaigns.startDate")}</Label>
                <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required dir="ltr" />
              </div>
              <div>
                <Label htmlFor="endDate">{t("campaigns.endDate")}</Label>
                <Input id="endDate" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required dir="ltr" />
              </div>
              <div>
                <Label htmlFor="status">{t("campaigns.status")}</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_VALUES.map((s) => (<SelectItem key={s} value={s}>{localizedStatus(s)}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="relatedClient">{t("campaigns.client")}</Label>
                <Select value={formData.relatedClient} onValueChange={(value) => setFormData({ ...formData, relatedClient: value })}>
                  <SelectTrigger><SelectValue placeholder={t("common.selectClient")} /></SelectTrigger>
                  <SelectContent>
                    {clients.map((client: any) => (<SelectItem key={client.id} value={client.id.toString()}>{client.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              {/* رابط منشور المحتوى */}
              <div>
                <Label htmlFor="postLink" className="flex items-center gap-1">
                  <LinkIcon className="w-4 h-4" /> {t("campaigns.postLink", "Post link")}
                </Label>
                <Input id="postLink" type="url" value={formData.postLink} onChange={(e) => setFormData({ ...formData, postLink: e.target.value })} placeholder="https://..." dir="ltr" />
              </div>
              {/* رفع صورة أو فيديو الحملة */}
              <div>
                <Label className="flex items-center gap-1">
                  <Upload className="w-4 h-4" /> {t("campaigns.media", "Campaign media (image/video)")}
                </Label>
                <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
                <div className="flex items-center gap-2 mt-1">
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span className="ms-2">{t("campaigns.chooseFile", "Choose file")}</span>
                  </Button>
                  {formData.mediaUrl && (
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      {formData.mediaType === "video" ? <Video className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                      {t("campaigns.attached", "Attached")}
                    </span>
                  )}
                </div>
                {formData.mediaUrl && formData.mediaType === "image" && (
                  <img src={formData.mediaUrl} alt="preview" className="mt-2 max-h-32 rounded border" />
                )}
                {formData.mediaUrl && formData.mediaType === "video" && (
                  <video src={formData.mediaUrl} controls className="mt-2 max-h-32 rounded border" />
                )}
              </div>
              <div>
                <Label htmlFor="description">{t("common.description")}</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder={t("common.description")} className="resize-none" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-[#1e3a5f] hover:bg-[#2d5080]">
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 ms-2 animate-spin" />}
                  {editingId ? t("common.update") : t("common.add")}
                </Button>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>{t("common.cancel")}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("campaigns.filters", "Filters")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search" className="text-sm">{t("common.search", "Search")}</Label>
              <div className="relative mt-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder={t("campaigns.searchPlaceholder", "Search campaigns...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter" className="text-sm">{t("campaigns.status", "Status")}</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter" className="mt-1">
                  <SelectValue placeholder={t("common.all", "All")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all", "All")}</SelectItem>
                  {STATUS_VALUES.map((s) => (<SelectItem key={s} value={s}>{localizedStatus(s)}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="platform-filter" className="text-sm">{t("campaigns.platform", "Platform")}</Label>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger id="platform-filter" className="mt-1">
                  <SelectValue placeholder={t("common.all", "All")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all", "All")}</SelectItem>
                  {PLATFORMS.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setPlatformFilter("all");
                }}
                className="w-full mt-6"
              >
                {t("common.clearFilters", "Clear Filters")}
              </Button>
            </div>
            <div>
              <AdvancedFilters 
                onFiltersChange={handleAdvancedFiltersChange}
                activeFiltersCount={Object.values(advancedFilters).filter(v => v && (Array.isArray(v) ? v.length > 0 : true)).length}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("campaigns.listTitle")}</CardTitle>
          <CardDescription>
            {t("campaigns.count")}: {filteredCampaigns.length} / {campaigns.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {campaigns.length === 0 ? t("campaigns.empty") : t("campaigns.noResults", "No campaigns match your filters")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedCampaigns.size === filteredCampaigns.length && filteredCampaigns.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => toggleSort("name")}
                    >
                      {t("campaigns.campaignName")} <SortIcon field="name" />
                    </TableHead>
                    <TableHead>{t("campaigns.platform")}</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => toggleSort("budget")}
                    >
                      {t("campaigns.budget")} <SortIcon field="budget" />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => toggleSort("startDate")}
                    >
                      {t("campaigns.startDate")} <SortIcon field="startDate" />
                    </TableHead>
                    <TableHead>{t("campaigns.endDate")}</TableHead>
                    <TableHead>{t("campaigns.status")}</TableHead>
                    <TableHead>{t("campaigns.media", "Media")}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((campaign: any) => (
                    <TableRow key={campaign.id} className={`hover:bg-muted/50 ${selectedCampaigns.has(campaign.id) ? "bg-blue-50" : ""}`}>
                      <TableCell>
                        <Checkbox
                          checked={selectedCampaigns.has(campaign.id)}
                          onCheckedChange={() => handleToggleSelect(campaign.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>{campaign.platform}</TableCell>
                      <TableCell dir="ltr">{fmt(campaign.budget)}</TableCell>
                      <TableCell dir="ltr">{fmtDate(campaign.startDate)}</TableCell>
                      <TableCell dir="ltr">{fmtDate(campaign.endDate)}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                          {localizedStatus(campaign.status)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {campaign.postLink && (
                            <a href={campaign.postLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" title={t("campaigns.postLink", "Post link")}>
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          {campaign.mediaUrl && (
                            <a href={campaign.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline" title={t("campaigns.media", "Media")}>
                              {campaign.mediaType === "video" ? <Video className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                            </a>
                          )}
                          {!campaign.postLink && !campaign.mediaUrl && <span className="text-muted-foreground">-</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => navigate(`/campaigns/${campaign.id}`)} title="View Details">
                            {t("common.view", "View")}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            const lang = i18n.language;
                            const startDate = new Date(campaign.startDate).toLocaleDateString();
                            let msg = '';
                            if (lang === 'ar') msg = formatCampaignShareMessage(campaign.name, campaign.platform, startDate);
                            else if (lang === 'he') msg = formatCampaignShareMessageHE(campaign.name, campaign.platform, startDate);
                            else msg = formatCampaignShareMessageEN(campaign.name, campaign.platform, startDate);
                            shareViaWhatsApp({ message: msg });
                          }} title="Share via WhatsApp">
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(campaign)}><Pencil className="w-4 h-4" /></Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(campaign.id)}><Trash2 className="w-4 h-4" /></Button>
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
