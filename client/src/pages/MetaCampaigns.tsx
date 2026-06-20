import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MetaCampaign {
  id: number;
  campaignId: string;
  campaignName: string;
  objective?: string | null;
  status?: string | null;
  impressions: number;
  clicks: number;
  linkClicks: number;
  spend: string;
  reach: number;
  results: number;
  costPerResult?: string | null;
  videoThreeSecondPlays?: number | null;
  videoPlays?: number | null;
  ctr: string | null;
  cpm: string | null;
  cpc: string | null;
  roas?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  dataFetchedAt: Date;
  updatedAt: Date;
}

export default function MetaCampaigns() {
  const { t } = useTranslation();
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  const { data: campaigns = [], isLoading, refetch } = trpc.metaCampaigns.list.useQuery();
  const deleteMutation = trpc.metaCampaigns.delete.useMutation();

  const handleDelete = async (campaignId: string) => {
    if (!confirm(t("common.confirmDelete", "Are you sure?"))) return;

    try {
      await deleteMutation.mutateAsync({ campaignId });
      toast.success(t("metaCampaigns.deleteSuccess", "Campaign deleted successfully"));
      refetch();
    } catch (error) {
      toast.error(t("common.error", "Error deleting campaign"));
    }
  };

  const formatCurrency = (value: string | number | null | undefined) => {
    if (!value || value === null) return "₪0.00";
    const num = typeof value === "string" ? parseFloat(value) : value;
    return `₪${num.toFixed(2)}`;
  };

  const formatNumber = (value: number | undefined) => {
    if (!value) return "0";
    return value.toLocaleString();
  };

  const formatPercentage = (value: string | number | null | undefined) => {
    if (!value || value === null) return "0.00%";
    const num = typeof value === "string" ? parseFloat(value) : value;
    return `${num.toFixed(2)}%`;
  };

  const formatRoas = (value: string | number | null | undefined) => {
    if (!value || value === null || value === "N/A") return "N/A";
    const num = typeof value === "string" ? parseFloat(value) : value;
    return num.toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("metaCampaigns.title", "Meta Campaigns")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("metaCampaigns.description", "View and manage your Meta advertising campaigns")}
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          {t("common.refresh", "Refresh")}
        </Button>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {t(
            "metaCampaigns.info",
            "This data is automatically synced from your Meta Ads account. Updates occur hourly."
          )}
        </AlertDescription>
      </Alert>

      {/* Campaigns Table */}
      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {t("metaCampaigns.noCampaigns", "No campaigns found")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t("metaCampaigns.campaigns", "Campaigns")}</CardTitle>
            <CardDescription>
              {t("metaCampaigns.campaignCount", "Total: {{count}} campaigns", {
                count: campaigns.length,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">{t("metaCampaigns.name", "Campaign Name")}</TableHead>
                    <TableHead className="text-right">{t("metaCampaigns.objective", "Objective")}</TableHead>
                    <TableHead className="text-right">{t("metaCampaigns.status", "Status")}</TableHead>
                    <TableHead className="text-right">{t("metaCampaigns.impressions", "Impressions")}</TableHead>
                    <TableHead className="text-right">{t("metaCampaigns.clicks", "Clicks (all)")}</TableHead>
                    <TableHead className="text-right">{t("metaCampaigns.linkClicks", "Link clicks")}</TableHead>
                    <TableHead className="text-right">{t("metaCampaigns.spend", "Spend")}</TableHead>
                    <TableHead className="text-right">{t("metaCampaigns.reach", "Reach")}</TableHead>
                    <TableHead className="text-right">{t("metaCampaigns.ctr", "CTR")}</TableHead>
                    <TableHead className="text-right">{t("metaCampaigns.cpm", "CPM")}</TableHead>
                    <TableHead className="text-right">{t("metaCampaigns.cpc", "CPC")}</TableHead>
                    <TableHead className="text-right">{t("metaCampaigns.roas", "ROAS")}</TableHead>
                    <TableHead className="text-right">{t("common.actions", "Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign: MetaCampaign) => (
                    <TableRow
                      key={campaign.campaignId}
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => setSelectedCampaign(campaign.campaignId)}
                    >
                      <TableCell className="text-right font-medium">{campaign.campaignName}</TableCell>
                      <TableCell className="text-right text-sm">{campaign.objective || "-"}</TableCell>
                      <TableCell className="text-right">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          campaign.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : campaign.status === "PAUSED"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {campaign.status || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{formatNumber(campaign.impressions)}</TableCell>
                      <TableCell className="text-right">{formatNumber(campaign.clicks)}</TableCell>
                      <TableCell className="text-right">{formatNumber(campaign.linkClicks)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(campaign.spend)}</TableCell>
                      <TableCell className="text-right">{formatNumber(campaign.reach)}</TableCell>
                      <TableCell className="text-right">{formatPercentage(campaign.ctr)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(campaign.cpm)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(campaign.cpc)}</TableCell>
                      <TableCell className="text-right">{formatRoas(campaign.roas)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(campaign.campaignId);
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaign Details */}
      {selectedCampaign && (
        <Card>
          <CardHeader>
            <CardTitle>{t("metaCampaigns.details", "Campaign Details")}</CardTitle>
          </CardHeader>
          <CardContent>
            {campaigns.find((c: MetaCampaign) => c.campaignId === selectedCampaign) && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("metaCampaigns.campaignId", "Campaign ID")}</p>
                  <p className="font-mono text-sm">{selectedCampaign}</p>
                </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("metaCampaigns.lastUpdated", "Last Updated")}</p>
                      <p className="text-sm">
                        {campaigns.find((c: MetaCampaign) => c.campaignId === selectedCampaign)?.dataFetchedAt
                          ? (campaigns.find((c: MetaCampaign) => c.campaignId === selectedCampaign)?.dataFetchedAt as Date).toLocaleString()
                          : "-"}
                      </p>
                    </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
