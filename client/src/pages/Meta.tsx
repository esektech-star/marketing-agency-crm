import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, RefreshCw, TrendingUp, DollarSign, Users, Eye, AlertCircle, CheckCircle2, Zap } from "lucide-react";
import { toast } from "sonner";

interface Campaign {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED" | "ARCHIVED";
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  roi: number;
  lastUpdated: string;
}

export default function Meta() {
  const { t } = useTranslation();
  const [isConnected, setIsConnected] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const connectMeta = async () => {
    if (!accessToken.trim()) {
      toast.error(t("meta.tokenRequired", "يرجى إدخال رمز الوصول"));
      return;
    }
    setIsLoading(true);
    try {
      // Simulate connection
      setIsConnected(true);
      setShowTokenDialog(false);
      toast.success(t("meta.connected", "تم الاتصال بنجاح"));
      // Fetch campaigns after connection
      await fetchCampaigns();
    } catch (error) {
      toast.error(t("meta.connectionFailed", "فشل الاتصال"));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      // Simulate fetching campaigns
      const mockCampaigns: Campaign[] = [
        {
          id: "1",
          name: "حملة الصيف 2026",
          status: "ACTIVE",
          budget: 5000,
          spent: 3200,
          impressions: 125000,
          clicks: 2500,
          conversions: 150,
          ctr: 2.0,
          cpc: 1.28,
          roi: 245,
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "2",
          name: "حملة المنتجات الجديدة",
          status: "ACTIVE",
          budget: 3000,
          spent: 2100,
          impressions: 85000,
          clicks: 1700,
          conversions: 102,
          ctr: 2.0,
          cpc: 1.24,
          roi: 180,
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "3",
          name: "حملة إعادة الاستهداف",
          status: "PAUSED",
          budget: 2000,
          spent: 1500,
          impressions: 45000,
          clicks: 800,
          conversions: 45,
          ctr: 1.78,
          cpc: 1.88,
          roi: 120,
          lastUpdated: new Date().toISOString(),
        },
      ];
      setCampaigns(mockCampaigns);
      toast.success(t("meta.campaignsFetched", "تم جلب الحملات بنجاح"));
    } catch (error) {
      toast.error(t("meta.fetchFailed", "فشل جلب الحملات"));
    } finally {
      setIsLoading(false);
    }
  };

  const updateCampaignStatus = async (campaignId: string, newStatus: string) => {
    try {
      setCampaigns(campaigns.map(c => 
        c.id === campaignId ? { ...c, status: newStatus as any } : c
      ));
      toast.success(t("meta.statusUpdated", "تم تحديث الحالة"));
    } catch (error) {
      toast.error(t("meta.updateFailed", "فشل التحديث"));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "PAUSED":
        return "bg-amber-100 text-amber-800";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "نشطة";
      case "PAUSED":
        return "متوقفة";
      case "ARCHIVED":
        return "مؤرشفة";
      default:
        return status;
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4" dir="rtl">
        <div className="max-w-md mx-auto mt-20">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Zap className="w-6 h-6 text-blue-600" />
                Meta Ads Integration
              </CardTitle>
              <CardDescription>
                {t("meta.connectDescription", "اتصل بحسابك على Meta للوصول إلى حملاتك الإعلانية")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="token">{t("meta.accessToken", "رمز الوصول")}</Label>
                <Input
                  id="token"
                  type="password"
                  placeholder={t("meta.tokenPlaceholder", "أدخل رمز الوصول من Meta")}
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {t("meta.tokenInfo", "يمكنك الحصول على الرمز من Meta Business Suite")}
                </p>
              </div>
              <Button
                onClick={connectMeta}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 h-10"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    {t("common.connecting", "جاري الاتصال...")}
                  </>
                ) : (
                  t("meta.connect", "اتصل الآن")
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("meta.title", "حملات Meta")}</h1>
          <p className="text-muted-foreground mt-1">{t("meta.subtitle", "إدارة وتحليل حملاتك الإعلانية")}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchCampaigns}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ml-2 ${isLoading ? "animate-spin" : ""}`} />
            {t("common.refresh", "تحديث")}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsConnected(false)}
          >
            {t("common.disconnect", "قطع الاتصال")}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {campaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                {t("meta.totalSpent", "إجمالي الإنفاق")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₪{campaigns.reduce((sum, c) => sum + c.spent, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                من ₪{campaigns.reduce((sum, c) => sum + c.budget, 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                {t("meta.impressions", "الانطباعات")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaigns.reduce((sum, c) => sum + c.impressions, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("meta.totalImpressions", "إجمالي الانطباعات")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                {t("meta.conversions", "التحويلات")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaigns.reduce((sum, c) => sum + c.conversions, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("meta.totalConversions", "إجمالي التحويلات")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                {t("meta.avgROI", "متوسط ROI")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(campaigns.reduce((sum, c) => sum + c.roi, 0) / campaigns.length)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("meta.returnOnInvestment", "العائد على الاستثمار")}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("meta.campaigns", "الحملات")}</CardTitle>
          <CardDescription>
            {t("meta.campaignsDesc", `${campaigns.length} حملة نشطة`)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("meta.noCampaigns", "لا توجد حملات")}
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="border rounded-lg p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedCampaign(campaign)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("meta.lastUpdated", "آخر تحديث")}: {new Date(campaign.lastUpdated).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {getStatusLabel(campaign.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-muted-foreground text-xs">{t("meta.budget", "الميزانية")}</p>
                      <p className="font-semibold">₪{campaign.budget.toLocaleString()}</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <p className="text-muted-foreground text-xs">{t("meta.spent", "الإنفاق")}</p>
                      <p className="font-semibold">₪{campaign.spent.toLocaleString()}</p>
                    </div>
                    <div className="bg-purple-50 p-2 rounded">
                      <p className="text-muted-foreground text-xs">{t("meta.impressions", "انطباعات")}</p>
                      <p className="font-semibold">{(campaign.impressions / 1000).toFixed(1)}K</p>
                    </div>
                    <div className="bg-orange-50 p-2 rounded">
                      <p className="text-muted-foreground text-xs">{t("meta.clicks", "نقرات")}</p>
                      <p className="font-semibold">{campaign.clicks.toLocaleString()}</p>
                    </div>
                    <div className="bg-red-50 p-2 rounded">
                      <p className="text-muted-foreground text-xs">{t("meta.ctr", "CTR")}</p>
                      <p className="font-semibold">{campaign.ctr.toFixed(2)}%</p>
                    </div>
                    <div className="bg-indigo-50 p-2 rounded">
                      <p className="text-muted-foreground text-xs">{t("meta.roi", "ROI")}</p>
                      <p className="font-semibold text-green-600">{campaign.roi}%</p>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    {campaign.status === "ACTIVE" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateCampaignStatus(campaign.id, "PAUSED");
                        }}
                      >
                        {t("meta.pause", "إيقاف")}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateCampaignStatus(campaign.id, "ACTIVE");
                        }}
                      >
                        {t("meta.resume", "استئناف")}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCampaign(campaign);
                      }}
                    >
                      {t("meta.details", "التفاصيل")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign Details Dialog */}
      <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>{selectedCampaign?.name}</DialogTitle>
            <DialogDescription>
              {t("meta.campaignDetails", "تفاصيل الحملة الإعلانية")}
            </DialogDescription>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("meta.status", "الحالة")}</p>
                  <p className="font-semibold mt-1">{getStatusLabel(selectedCampaign.status)}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("meta.budget", "الميزانية")}</p>
                  <p className="font-semibold mt-1">₪{selectedCampaign.budget.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("meta.spent", "الإنفاق")}</p>
                  <p className="font-semibold mt-1">₪{selectedCampaign.spent.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("meta.remaining", "المتبقي")}</p>
                  <p className="font-semibold mt-1 text-green-600">
                    ₪{(selectedCampaign.budget - selectedCampaign.spent).toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("meta.conversions", "التحويلات")}</p>
                  <p className="font-semibold mt-1">{selectedCampaign.conversions.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("meta.cpc", "CPC")}</p>
                  <p className="font-semibold mt-1">₪{selectedCampaign.cpc.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
