import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Loader2, Download, MessageCircle, Search, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { exportToExcel, exportToCSV, formatClientsForExport } from "@/lib/exportUtils";
import { shareViaWhatsApp, formatClientShareMessage, formatClientShareMessageHE, formatClientShareMessageEN } from "@/lib/whatsappUtils";

const STATUS_VALUES = ["active", "pending", "completed"] as const;
type SortField = "name" | "startDate" | "monthlyAmount" | "status";
type SortOrder = "asc" | "desc";

export default function Clients() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const emptyForm = {
    name: "",
    serviceType: "",
    status: "active",
    startDate: new Date().toISOString().split("T")[0],
    clientCode: "",
    phone: "",
    email: "",
    monthlyAmount: "",
    paymentDate: "",
    source: "",
    notes: "",
  };
  const [formData, setFormData] = useState(emptyForm);

  const { data: allClients = [], isLoading, refetch } = trpc.clients.list.useQuery();
  
  // Filter and sort clients
  const clients = allClients
    .filter(client => {
      const matchesSearch = searchTerm === "" || 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.clientCode?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === null || client.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];
      
      if (sortField === "startDate") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (sortField === "monthlyAmount") {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      } else if (sortField === "name") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  const createMutation = trpc.clients.create.useMutation();
  const updateMutation = trpc.clients.update.useMutation();
  const deleteMutation = trpc.clients.delete.useMutation();

  const localizedStatus = (status: string) => {
    const map: Record<string, string> = {
      "active": t("clients.statusActive", "active"),
      "pending": t("clients.statusPending", "pending"),
      "completed": t("clients.statusEnded", "completed"),
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
          serviceType: formData.serviceType,
          status: formData.status as "active" | "pending" | "completed",
          clientCode: formData.clientCode || undefined,
          phone: formData.phone,
          email: formData.email,
          monthlyAmount: formData.monthlyAmount ? parseFloat(formData.monthlyAmount) : undefined,
          paymentDate: formData.paymentDate || undefined,
          source: formData.source || undefined,
          notes: formData.notes,
        });
        toast.success(t("common.editSuccess"));
      } else {
        await createMutation.mutateAsync({
          name: formData.name,
          serviceType: formData.serviceType,
          status: formData.status as "active" | "pending" | "completed",
          startDate: new Date(formData.startDate),
          clientCode: formData.clientCode || undefined,
          phone: formData.phone,
          email: formData.email,
          monthlyAmount: formData.monthlyAmount ? parseFloat(formData.monthlyAmount) : undefined,
          paymentDate: formData.paymentDate || undefined,
          source: formData.source || undefined,
          notes: formData.notes,
        });
        toast.success(t("common.addSuccess"));
      }
      setFormData(emptyForm);
      setEditingId(null);
      setIsOpen(false);
      refetch();
    } catch (error) {
      toast.error(t("common.error"));
    }
  };

  const handleEdit = (client: any) => {
    setEditingId(client.id);
    setFormData({
      name: client.name,
      serviceType: client.serviceType,
      status: client.status,
      startDate: new Date(client.startDate).toISOString().split("T")[0],
      clientCode: client.clientCode || "",
      phone: client.phone || "",
      email: client.email || "",
      monthlyAmount: client.monthlyAmount?.toString() || "",
      paymentDate: client.paymentDate || "",
      source: client.source || "",
      notes: client.notes || "",
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t("common.confirmDelete"))) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success(t("common.deleteSuccess"));
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">{t("clients.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("clients.subtitle")}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Input
          placeholder={t("common.search", "Search...")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-64"
        />
        <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.allStatuses", "All Status")}</SelectItem>
            {STATUS_VALUES.map((s) => (
              <SelectItem key={s} value={s}>{localizedStatus(s)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex gap-2">
          <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">{t("clients.clientName")}</SelectItem>
              <SelectItem value="startDate">{t("clients.startDate")}</SelectItem>
              <SelectItem value="monthlyAmount">{t("clients.monthlyAmount", "Monthly Payment")}</SelectItem>
              <SelectItem value="status">{t("common.status")}</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const formatted = formatClientsForExport(clients);
              exportToExcel(formatted, `clients-${new Date().toISOString().split('T')[0]}`);
              toast.success(t("common.exportSuccess", "Exported successfully"));
            }}
          >
            <Download className="w-4 h-4 ms-2" />
            {t("common.exportExcel", "Export Excel")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const formatted = formatClientsForExport(clients);
              exportToCSV(formatted, `clients-${new Date().toISOString().split('T')[0]}`);
              toast.success(t("common.exportSuccess", "Exported successfully"));
            }}
          >
            <Download className="w-4 h-4 ms-2" />
            {t("common.exportCSV", "Export CSV")}
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingId(null); setFormData(emptyForm); }} className="bg-[#1e3a5f] hover:bg-[#2d5080]">
                <Plus className="w-4 h-4 ms-2" />
                {t("clients.addClient")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? t("clients.editClient") : t("clients.addClient")}</DialogTitle>
              <DialogDescription>
                {editingId ? t("clients.editClient") : t("clients.addClient")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">{t("clients.clientName")}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="serviceType">{t("clients.serviceType")}</Label>
                <Input
                  id="serviceType"
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientCode">{t("clients.clientCode", "Client Code")}</Label>
                <Input
                  id="clientCode"
                  dir="ltr"
                  value={formData.clientCode}
                  onChange={(e) => setFormData({ ...formData, clientCode: e.target.value })}
                  placeholder="e.g., CL-001"
                />
              </div>
              <div>
                <Label htmlFor="status">{t("common.status")}</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
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
                <Label htmlFor="startDate">{t("clients.startDate")}</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">{t("common.phone")}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">{t("common.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="monthlyAmount">{t("clients.monthlyAmount", "Monthly Payment")}</Label>
                <Input
                  id="monthlyAmount"
                  type="number"
                  step="0.01"
                  value={formData.monthlyAmount}
                  onChange={(e) => setFormData({ ...formData, monthlyAmount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="paymentDate">{t("clients.paymentDate", "Payment Date")}</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="source">{t("clients.source", "Source")}</Label>
                <Input
                  id="source"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="e.g., Referral, Website, Social Media"
                />
              </div>
              <div>
                <Label htmlFor="notes">{t("common.notes")}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="resize-none"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-[#1e3a5f] hover:bg-[#2d5080]">
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 ms-2 animate-spin" />}
                  {editingId ? t("common.update") : t("common.add")}
                </Button>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  {t("common.cancel")}
                </Button>
              </div>
            </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("clients.title")}</CardTitle>
          <CardDescription>{t("common.total")}: {clients.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("clients.empty")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("clients.clientName")}</TableHead>
                    <TableHead>{t("clients.clientCode", "Client Code")}</TableHead>
                    <TableHead>{t("clients.serviceType")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead>{t("clients.startDate")}</TableHead>
                    <TableHead>{t("common.phone")}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client: any) => (
                    <TableRow key={client.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell dir="ltr" className="text-start">{client.clientCode || "-"}</TableCell>
                      <TableCell>{client.serviceType}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          client.status === "active" ? "bg-green-100 text-green-800" :
                          client.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {localizedStatus(client.status)}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(client.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{client.phone || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => {
                            const lang = i18n.language;
                            let message = '';
                            if (lang === 'ar') {
                              message = formatClientShareMessage(client.name, client.serviceType, client.monthlyAmount || 0);
                            } else if (lang === 'he') {
                              message = formatClientShareMessageHE(client.name, client.serviceType, client.monthlyAmount || 0);
                            } else {
                              message = formatClientShareMessageEN(client.name, client.serviceType, client.monthlyAmount || 0);
                            }
                            shareViaWhatsApp({ message, phoneNumber: client.phone });
                          }} title="Share via WhatsApp">
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(client)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(client.id)}>
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
