import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useTranslation } from "react-i18next";
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

const STATUS_VALUES = ["مخطط", "نشط", "معلق", "منتهي"] as const;

export default function Campaigns() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const emptyForm = {
    name: "",
    platform: "",
    budget: "",
    description: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "مخطط" as const,
    relatedClient: "",
  };
  
  const [formData, setFormData] = useState(emptyForm);

  const { data: campaigns = [], isLoading, refetch } = trpc.campaigns.list.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const createMutation = trpc.campaigns.create.useMutation();
  const updateMutation = trpc.campaigns.update.useMutation();
  const deleteMutation = trpc.campaigns.delete.useMutation();

  const localizedStatus = (status: string) => {
    const map: Record<string, string> = {
      "مخطط": t("campaigns.statusPlanned", "مخطط"),
      "نشط": t("campaigns.statusActive", "نشط"),
      "معلق": t("campaigns.statusPaused", "معلق"),
      "منتهي": t("campaigns.statusCompleted", "منتهي"),
    };
    return map[status] || status;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          name: formData.name,
          platform: formData.platform,
          budget: parseFloat(formData.budget),
          description: formData.description,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          status: formData.status as "مخطط" | "نشط" | "معلق" | "منتهي",
          relatedClient: formData.relatedClient ? parseInt(formData.relatedClient) : undefined,
        });
        toast.success(t("campaigns.editSuccess"));
      } else {
        await createMutation.mutateAsync({
          name: formData.name,
          platform: formData.platform,
          budget: parseFloat(formData.budget),
          description: formData.description,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          status: formData.status as "مخطط" | "نشط" | "معلق" | "منتهي",
          relatedClient: formData.relatedClient ? parseInt(formData.relatedClient) : undefined,
        });
        toast.success(t("campaigns.addSuccess"));
      }
      
      setFormData(emptyForm);
      setEditingId(null);
      setIsOpen(false);
      refetch();
    } catch (error) {
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
      startDate: new Date(campaign.startDate).toISOString().split('T')[0],
      endDate: new Date(campaign.endDate).toISOString().split('T')[0],
      status: campaign.status,
      relatedClient: campaign.relatedClient?.toString() || "",
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t("campaigns.confirmDelete"))) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success(t("campaigns.deleteSuccess"));
        refetch();
      } catch (error) {
        toast.error(t("common.error"));
      }
    }
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "مخطط": return "bg-blue-100 text-blue-800";
      case "نشط": return "bg-green-100 text-green-800";
      case "منتهي": return "bg-gray-100 text-gray-800";
      case "معلق": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
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
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t("campaigns.campaignName")}
                  required
                />
              </div>
              <div>
                <Label htmlFor="platform">{t("campaigns.platform")}</Label>
                <Input
                  id="platform"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  placeholder={t("campaigns.platform")}
                  required
                />
              </div>
              <div>
                <Label htmlFor="budget">{t("campaigns.budget")}</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <Label htmlFor="startDate">{t("campaigns.startDate")}</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">{t("campaigns.endDate")}</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">{t("campaigns.status")}</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_VALUES.map((s) => (
                      <SelectItem key={s} value={s}>{localizedStatus(s)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="relatedClient">{t("campaigns.client")}</Label>
                <Select value={formData.relatedClient} onValueChange={(value) => setFormData({ ...formData, relatedClient: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("common.selectClient")} />
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
                <Label htmlFor="description">{t("common.description")}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t("common.description")}
                  className="resize-none"
                />
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

      <Card>
        <CardHeader>
          <CardTitle>{t("campaigns.listTitle")}</CardTitle>
          <CardDescription>{t("campaigns.count")}: {campaigns.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("campaigns.empty")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("campaigns.campaignName")}</TableHead>
                    <TableHead>{t("campaigns.platform")}</TableHead>
                    <TableHead>{t("campaigns.budget")}</TableHead>
                    <TableHead>{t("campaigns.startDate")}</TableHead>
                    <TableHead>{t("campaigns.endDate")}</TableHead>
                    <TableHead>{t("campaigns.status")}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign: any) => (
                    <TableRow key={campaign.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>{campaign.platform}</TableCell>
                      <TableCell>{campaign.budget.toLocaleString('ar-SA')} {t("common.currency")}</TableCell>
                      <TableCell>{new Date(campaign.startDate).toLocaleDateString('ar-SA')}</TableCell>
                      <TableCell>{new Date(campaign.endDate).toLocaleDateString('ar-SA')}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                          {localizedStatus(campaign.status)}
                        </span>
                      </TableCell>
                      <TableCell>
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
