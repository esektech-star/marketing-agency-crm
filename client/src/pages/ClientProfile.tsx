import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function ClientProfile() {
  const { t, i18n } = useTranslation();
  const [, params] = useRoute("/clients/:id");
  const [, navigate] = useLocation();
  const clientId = params?.id ? parseInt(params.id) : null;

  const { data: client, isLoading, refetch } = trpc.clients.getById.useQuery(
    { id: clientId! },
    { enabled: !!clientId }
  );

  const { data: campaigns = [] } = trpc.campaigns.list.useQuery();
  const { data: tasks = [] } = trpc.tasks.list.useQuery();
  const { data: invoices = [] } = trpc.invoices.list.useQuery();

  const deleteMutation = trpc.clients.delete.useMutation();

  const handleDelete = async () => {
    if (confirm(t("common.confirmDelete"))) {
      try {
        await deleteMutation.mutateAsync({ id: clientId! });
        toast.success(t("common.deleteSuccess"));
        navigate("/clients");
      } catch (error) {
        toast.error(t("common.error"));
      }
    }
  };

  const clientCampaigns = campaigns.filter((c: any) => c.clientId === clientId);
  const clientTasks = tasks.filter((t: any) => t.clientId === clientId);
  const clientInvoices = invoices.filter((i: any) => i.clientId === clientId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate("/clients")}>
          <ArrowLeft className="w-4 h-4 ms-2" />
          {t("common.back")}
        </Button>
        <div className="text-center py-12 text-muted-foreground">
          {t("common.notFound")}
        </div>
      </div>
    );
  }

  const statusColor = {
    active: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    completed: "bg-red-100 text-red-800",
  };

  const localizedStatus = (status: string) => {
    const map: Record<string, string> = {
      "active": t("clients.statusActive", "active"),
      "pending": t("clients.statusPending", "pending"),
      "completed": t("clients.statusEnded", "completed"),
    };
    return map[status] || status;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => navigate("/clients")}>
          <ArrowLeft className="w-4 h-4 ms-2" />
          {t("common.back")}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit2 className="w-4 h-4 ms-2" />
            {t("common.edit")}
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 ms-2" />
            {t("common.delete")}
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">{client.name}</h1>
          <p className="text-muted-foreground mt-1">{client.serviceType}</p>
        </div>
        <Badge className={statusColor[client.status as keyof typeof statusColor]}>
          {localizedStatus(client.status)}
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">{t("clients.overview", "Overview")}</TabsTrigger>
          <TabsTrigger value="campaigns">{t("clients.campaigns", "Campaigns")}</TabsTrigger>
          <TabsTrigger value="tasks">{t("clients.tasks", "Tasks")}</TabsTrigger>
          <TabsTrigger value="strategy">{t("clients.strategy", "Strategy")}</TabsTrigger>
          <TabsTrigger value="invoices">{t("clients.invoices", "Invoices")}</TabsTrigger>
          <TabsTrigger value="timeline">{t("clients.timeline", "Timeline")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("clients.overview", "Overview")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("clients.clientCode", "Client Code")}</p>
                  <p className="font-medium">{client.clientCode || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("common.email")}</p>
                  <p className="font-medium">{client.email || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("common.phone")}</p>
                  <p className="font-medium">{client.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("clients.startDate")}</p>
                  <p className="font-medium">{new Date(client.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("clients.monthlyAmount", "Monthly Payment")}</p>
                  <p className="font-medium">₪{typeof client.monthlyAmount === 'number' ? (client.monthlyAmount as number).toFixed(2) : client.monthlyAmount || "0.00"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("clients.paymentDate", "Payment Date")}</p>
                  <p className="font-medium">{client.paymentDate || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("clients.source", "Source")}</p>
                  <p className="font-medium">{client.source || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("common.status")}</p>
                  <p className="font-medium">{localizedStatus(client.status)}</p>
                </div>
              </div>
              {client.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">{t("common.notes")}</p>
                  <p className="font-medium">{client.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("clients.campaigns", "Campaigns")}</CardTitle>
              <CardDescription>{t("common.total")}: {clientCampaigns.length}</CardDescription>
            </CardHeader>
            <CardContent>
              {clientCampaigns.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">{t("common.empty")}</p>
              ) : (
                <div className="space-y-2">
                  {clientCampaigns.map((campaign: any) => (
                    <div key={campaign.id} className="p-3 border rounded-lg">
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground">{campaign.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("clients.tasks", "Tasks")}</CardTitle>
              <CardDescription>{t("common.total")}: {clientTasks.length}</CardDescription>
            </CardHeader>
            <CardContent>
              {clientTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">{t("common.empty")}</p>
              ) : (
                <div className="space-y-2">
                  {clientTasks.map((task: any) => (
                    <div key={task.id} className="p-3 border rounded-lg">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("clients.strategy", "Strategy")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">{t("common.comingSoon", "Coming Soon")}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("clients.invoices", "Invoices")}</CardTitle>
              <CardDescription>{t("common.total")}: {clientInvoices.length}</CardDescription>
            </CardHeader>
            <CardContent>
              {clientInvoices.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">{t("common.empty")}</p>
              ) : (
                <div className="space-y-2">
                  {clientInvoices.map((invoice: any) => (
                    <div key={invoice.id} className="p-3 border rounded-lg">
                      <p className="font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">₪{typeof invoice.amount === 'number' ? (invoice.amount as number).toFixed(2) : invoice.amount || "0.00"}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("clients.timeline", "Timeline")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">{t("common.created")}</p>
                    <p className="text-sm text-muted-foreground">{new Date(client.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">{t("common.updated")}</p>
                    <p className="text-sm text-muted-foreground">{new Date(client.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
