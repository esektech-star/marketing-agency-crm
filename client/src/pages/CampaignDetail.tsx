import { useTranslation } from "react-i18next";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit2, Trash2, Loader2, Calendar, DollarSign, Target } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function CampaignDetail() {
  const { t, i18n } = useTranslation();
  const [, params] = useRoute("/campaigns/:id");
  const [, navigate] = useLocation();
  const campaignId = params?.id ? parseInt(params.id) : null;

  const { data: campaign, isLoading, refetch } = trpc.campaigns.getById.useQuery(
    { id: campaignId! },
    { enabled: !!campaignId }
  );

  const { data: relatedClient } = trpc.clients.getById.useQuery(
    { id: campaign?.relatedClient! },
    { enabled: !!campaign?.relatedClient }
  );

  const deleteMutation = trpc.campaigns.delete.useMutation();

  const handleDelete = async () => {
    if (confirm(t("common.confirmDelete"))) {
      try {
        await deleteMutation.mutateAsync({ id: campaignId! });
        toast.success(t("common.deleteSuccess"));
        navigate("/campaigns");
      } catch (error) {
        toast.error(t("common.error"));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate("/campaigns")}>
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
    planned: "bg-blue-100 text-blue-800",
    active: "bg-green-100 text-green-800",
    paused: "bg-yellow-100 text-yellow-800",
    completed: "bg-gray-100 text-gray-800",
  };

  const localizedStatus = (status: string) => {
    const map: Record<string, string> = {
      "planned": t("campaigns.statusPlanned", "Planned"),
      "active": t("campaigns.statusActive", "Active"),
      "paused": t("campaigns.statusPaused", "Paused"),
      "completed": t("campaigns.statusCompleted", "Completed"),
    };
    return map[status] || status;
  };

  const daysRemaining = campaign.endDate 
    ? Math.ceil((new Date(campaign.endDate as any).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const roi = campaign.budget && (typeof campaign.budget === 'number' ? campaign.budget : parseFloat(campaign.budget as any)) > 0 
    ? ((100 / (typeof campaign.budget === 'number' ? campaign.budget : parseFloat(campaign.budget as any))) * 100).toFixed(2)
    : "0";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => navigate("/campaigns")}>
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
          <h1 className="text-3xl font-bold">{campaign.name}</h1>
          <p className="text-muted-foreground mt-1">{campaign.platform}</p>
        </div>
        <Badge className={statusColor[campaign.status as keyof typeof statusColor]}>
          {localizedStatus(campaign.status)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("campaigns.campaignDetails", "Campaign Details")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("campaigns.platform")}</p>
              <p className="font-medium">{campaign.platform}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("campaigns.status")}</p>
              <p className="font-medium">{localizedStatus(campaign.status)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("campaigns.startDate")}</p>
              <p className="font-medium">{new Date(campaign.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("campaigns.endDate")}</p>
              <p className="font-medium">{new Date(campaign.endDate).toLocaleDateString()}</p>
            </div>
            {daysRemaining !== null && (
              <div>
                <p className="text-sm text-muted-foreground">{t("campaigns.daysRemaining", "Days Remaining")}</p>
                <p className={`font-medium ${daysRemaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {daysRemaining > 0 ? daysRemaining : t("campaigns.ended", "Ended")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("campaigns.budget", "Budget & Performance")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("campaigns.budget")}</p>
              <p className="font-medium text-lg">₪{typeof campaign.budget === 'number' ? (campaign.budget as number).toFixed(0) : campaign.budget || "0"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("campaigns.estimatedROI", "Estimated ROI")}</p>
              <p className="font-medium text-lg">{roi}%</p>
            </div>
            {relatedClient && (
              <div>
                <p className="text-sm text-muted-foreground">{t("campaigns.relatedClient", "Related Client")}</p>
                <p className="font-medium">{relatedClient.name}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {campaign.description && (
        <Card>
          <CardHeader>
            <CardTitle>{t("common.description")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{campaign.description}</p>
          </CardContent>
        </Card>
      )}

      {campaign.mediaUrl && (
        <Card>
          <CardHeader>
            <CardTitle>{t("campaigns.media", "Campaign Media")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg overflow-hidden border">
              <img src={campaign.mediaUrl} alt={campaign.name} className="w-full h-auto max-h-96 object-cover" />
            </div>
          </CardContent>
        </Card>
      )}

      {campaign.postLink && (
        <Card>
          <CardHeader>
            <CardTitle>{t("campaigns.postLink", "Post Link")}</CardTitle>
          </CardHeader>
          <CardContent>
            <a href={campaign.postLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
              {campaign.postLink}
            </a>
          </CardContent>
        </Card>
      )}

      {campaign.notes && (
        <Card>
          <CardHeader>
            <CardTitle>{t("common.notes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{campaign.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
