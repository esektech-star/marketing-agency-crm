import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Copy, Check, Plus, Pencil, Trash2, Eye, EyeOff, KeyRound, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { shareViaWhatsApp, formatAccessDetailsShareMessage, formatAccessDetailsShareMessageHE, formatAccessDetailsShareMessageEN } from "@/lib/whatsappUtils";

const INTERNAL = "internal";

export default function AccessDetails() {
  const { t, i18n } = useTranslation();
  const { user, loading } = useAuth();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showPw, setShowPw] = useState<Record<number, boolean>>({});

  const emptyForm = {
    platform: "",
    username: "",
    password: "",
    email: "",
    url: "",
    relatedClient: INTERNAL,
    notes: "",
  };
  const [formData, setFormData] = useState(emptyForm);

  const { data: accessList = [], isLoading, refetch } = trpc.accessDetails.list.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const createMutation = trpc.accessDetails.create.useMutation();
  const updateMutation = trpc.accessDetails.update.useMutation();
  const deleteMutation = trpc.accessDetails.delete.useMutation();

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(t("common.copied"));
    setTimeout(() => setCopiedField(null), 2000);
  };

  const clientName = (id: number | null | undefined) => {
    if (!id) return t("accessDetails.internal");
    const c = clients.find((x: any) => x.id === id);
    return c ? c.name : t("accessDetails.internal");
  };

  const clientCode = (id: number | null | undefined) => {
    if (!id) return "-";
    const c = clients.find((x: any) => x.id === id);
    return c?.clientCode || "-";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      platform: formData.platform,
      username: formData.username,
      password: formData.password,
      email: formData.email || undefined,
      url: formData.url || undefined,
      relatedClient: formData.relatedClient === INTERNAL ? undefined : parseInt(formData.relatedClient),
      notes: formData.notes || undefined,
    };
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...payload });
        toast.success(t("accessDetails.editSuccess"));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t("accessDetails.addSuccess"));
      }
      setFormData(emptyForm);
      setEditingId(null);
      setIsOpen(false);
      refetch();
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      platform: item.platform || "",
      username: item.username || "",
      password: item.password || "",
      email: item.email || "",
      url: item.url || "",
      relatedClient: item.relatedClient ? item.relatedClient.toString() : INTERNAL,
      notes: item.notes || "",
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t("accessDetails.confirmDelete"))) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success(t("accessDetails.deleteSuccess"));
        refetch();
      } catch {
        toast.error(t("common.error"));
      }
    }
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  // Group access entries by client (internal grouped under id 0)
  const grouped: Record<string, any[]> = {};
  accessList.forEach((item: any) => {
    const key = item.relatedClient ? `c-${item.relatedClient}` : "internal";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("accessDetails.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("accessDetails.manageSubtitle")}</p>
        </div>
      </div>

      <Tabs defaultValue="access" className="w-full">
        <TabsList>
          <TabsTrigger value="access">{t("accessDetails.manageTitle")}</TabsTrigger>
          <TabsTrigger value="profile">{t("accessDetails.myProfile")}</TabsTrigger>
        </TabsList>

        {/* ============ Client Access Manager ============ */}
        <TabsContent value="access" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingId(null); setFormData(emptyForm); }} className="bg-[#1e3a5f] hover:bg-[#2d5080]">
                  <Plus className="w-4 h-4 ms-2" />
                  {t("accessDetails.addAccess")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingId ? t("accessDetails.editAccess") : t("accessDetails.addAccess")}</DialogTitle>
                  <DialogDescription>{t("accessDetails.manageSubtitle")}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="client">{t("accessDetails.client")}</Label>
                    <Select value={formData.relatedClient} onValueChange={(v) => setFormData({ ...formData, relatedClient: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("accessDetails.selectClient")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={INTERNAL}>{t("accessDetails.internal")}</SelectItem>
                        {clients.map((c: any) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.name}{c.clientCode ? ` (${c.clientCode})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="platform">{t("accessDetails.platform")}</Label>
                    <Input id="platform" value={formData.platform} onChange={(e) => setFormData({ ...formData, platform: e.target.value })} placeholder="Facebook / Google Ads / WordPress" required />
                  </div>
                  <div>
                    <Label htmlFor="username">{t("accessDetails.username")}</Label>
                    <Input id="username" dir="ltr" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="password">{t("accessDetails.password")}</Label>
                    <Input id="password" dir="ltr" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="url">{t("accessDetails.url")}</Label>
                    <Input id="url" dir="ltr" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="https://" />
                  </div>
                  <div>
                    <Label htmlFor="email">{t("common.email")}</Label>
                    <Input id="email" type="email" dir="ltr" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="notes">{t("common.notes")}</Label>
                    <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="resize-none" />
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

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : accessList.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-muted-foreground">
                <KeyRound className="w-10 h-10 mx-auto mb-3 opacity-40" />
                {t("accessDetails.noAccess")}
              </CardContent>
            </Card>
          ) : (
            Object.keys(grouped).map((key) => {
              const items = grouped[key];
              const cid = key === "internal" ? null : items[0].relatedClient;
              return (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {clientName(cid)}
                      {key !== "internal" && (
                        <span className="text-xs font-normal px-2 py-0.5 rounded bg-muted text-muted-foreground" dir="ltr">
                          {t("accessDetails.clientCode")}: {clientCode(cid)}
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>{items.length}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("accessDetails.platform")}</TableHead>
                            <TableHead>{t("accessDetails.username")}</TableHead>
                            <TableHead>{t("accessDetails.password")}</TableHead>
                            <TableHead>{t("common.actions")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item: any) => (
                            <TableRow key={item.id} className="hover:bg-muted/50">
                              <TableCell className="font-medium">{item.platform}</TableCell>
                              <TableCell dir="ltr" className="text-start">
                                <div className="flex items-center gap-1">
                                  <span className="text-sm">{item.username}</span>
                                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(item.username, `u-${item.id}`)}>
                                    {copiedField === `u-${item.id}` ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell dir="ltr" className="text-start">
                                <div className="flex items-center gap-1">
                                  <span className="text-sm font-mono">{showPw[item.id] ? item.password : "••••••••"}</span>
                                  <Button size="sm" variant="ghost" onClick={() => setShowPw((p) => ({ ...p, [item.id]: !p[item.id] }))}>
                                    {showPw[item.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(item.password, `p-${item.id}`)}>
                                    {copiedField === `p-${item.id}` ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" onClick={() => {
                                    const lang = i18n.language;
                                    let msg = '';
                                    if (lang === 'ar') msg = formatAccessDetailsShareMessage(clientName(item), item.platform, item.username);
                                    else if (lang === 'he') msg = formatAccessDetailsShareMessageHE(clientName(item), item.platform, item.username);
                                    else msg = formatAccessDetailsShareMessageEN(clientName(item), item.platform, item.username);
                                    shareViaWhatsApp({ message: msg });
                                  }} title="Share via WhatsApp">
                                    <MessageCircle className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* ============ My Account ============ */}
        <TabsContent value="profile" className="space-y-6">
          {!user ? (
            <div className="text-center py-12 text-muted-foreground">{t("accessDetails.notAuthenticated")}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("accessDetails.userInfo")}</CardTitle>
                    <CardDescription>{t("accessDetails.userInfoDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">{t("common.name")}</label>
                      <div className="flex items-center justify-between mt-1 p-3 bg-muted rounded-lg">
                        <span className="font-medium">{user.name || "-"}</span>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(user.name || "", "name")}>
                          {copiedField === "name" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">{t("common.email")}</label>
                      <div className="flex items-center justify-between mt-1 p-3 bg-muted rounded-lg">
                        <span className="font-medium text-sm" dir="ltr">{user.email || "-"}</span>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(user.email || "", "email")}>
                          {copiedField === "email" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">{t("accessDetails.userRole")}</label>
                      <div className="flex items-center justify-between mt-1 p-3 bg-muted rounded-lg">
                        <span className="font-medium">{user.role === "admin" ? t("accessDetails.admin") : t("accessDetails.user")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t("accessDetails.accountStatus")}</CardTitle>
                    <CardDescription>{t("accessDetails.accountStatusDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">{t("accessDetails.createdAt")}</label>
                      <div className="mt-1 p-3 bg-muted rounded-lg" dir="ltr">
                        <span className="font-medium text-sm">{new Date(user.createdAt).toLocaleString('en-GB')}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">{t("accessDetails.lastSignedIn")}</label>
                      <div className="mt-1 p-3 bg-muted rounded-lg" dir="ltr">
                        <span className="font-medium text-sm">{new Date(user.lastSignedIn).toLocaleString('en-GB')}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">{t("accessDetails.loginMethod")}</label>
                      <div className="mt-1 p-3 bg-muted rounded-lg">
                        <span className="font-medium text-sm">{user.loginMethod || t("accessDetails.notSpecified")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t("accessDetails.securityInfo")}</CardTitle>
                  <CardDescription>{t("accessDetails.securityInfoDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>✓ {t("accessDetails.securityTip1")}</p>
                    <p>✓ {t("accessDetails.securityTip2")}</p>
                    <p>✓ {t("accessDetails.securityTip3")}</p>
                    <p>✓ {t("accessDetails.securityTip4")}</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
