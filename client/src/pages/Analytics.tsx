import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign, Target, Zap, Calendar, Filter } from "lucide-react";

interface CampaignMetrics {
  name: string;
  budget: number;
  spent: number;
  revenue: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roi: number;
  conversionRate: number;
}

export default function Analytics() {
  const { t } = useTranslation();
  const [dateFrom, setDateFrom] = useState<string>("2026-01-01");
  const [dateTo, setDateTo] = useState<string>("2026-06-25");

  // Mock campaign metrics data
  const campaignMetrics: CampaignMetrics[] = [
    {
      name: "Facebook Summer Sale",
      budget: 5000,
      spent: 4800,
      revenue: 18000,
      impressions: 125000,
      clicks: 3500,
      conversions: 280,
      roi: 275,
      conversionRate: 8.0,
    },
    {
      name: "Google Ads - Search",
      budget: 8000,
      spent: 7600,
      revenue: 22000,
      impressions: 95000,
      clicks: 4200,
      conversions: 350,
      roi: 189,
      conversionRate: 8.3,
    },
    {
      name: "Instagram Influencer",
      budget: 3000,
      spent: 2900,
      revenue: 12000,
      impressions: 85000,
      clicks: 2100,
      conversions: 150,
      roi: 314,
      conversionRate: 7.1,
    },
    {
      name: "LinkedIn B2B Campaign",
      budget: 4000,
      spent: 3800,
      revenue: 16000,
      impressions: 45000,
      clicks: 1800,
      conversions: 120,
      roi: 321,
      conversionRate: 6.7,
    },
    {
      name: "TikTok Viral Challenge",
      budget: 2000,
      spent: 1900,
      revenue: 9000,
      impressions: 200000,
      clicks: 5000,
      conversions: 200,
      roi: 374,
      conversionRate: 4.0,
    },
  ];

  // ROI by campaign
  const roiData = campaignMetrics.map((c) => ({
    name: c.name.substring(0, 12),
    roi: c.roi,
  }));

  // Conversion rate by campaign
  const conversionData = campaignMetrics.map((c) => ({
    name: c.name.substring(0, 12),
    rate: c.conversionRate,
  }));

  // Budget allocation
  const budgetData = campaignMetrics.map((c) => ({
    name: c.name,
    value: c.budget,
  }));

  // Revenue vs Spent
  const revenueData = campaignMetrics.map((c) => ({
    name: c.name.substring(0, 12),
    revenue: c.revenue,
    spent: c.spent,
  }));

  // Overall metrics
  const totalBudget = campaignMetrics.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = campaignMetrics.reduce((sum, c) => sum + c.spent, 0);
  const totalRevenue = campaignMetrics.reduce((sum, c) => sum + c.revenue, 0);
  const totalConversions = campaignMetrics.reduce((sum, c) => sum + c.conversions, 0);
  const overallROI = ((totalRevenue - totalSpent) / totalSpent) * 100;
  const averageConversionRate = (
    campaignMetrics.reduce((sum, c) => sum + c.conversionRate, 0) / campaignMetrics.length
  ).toFixed(2);

  const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("analytics.title", "Analytics Dashboard")}</h1>
        <p className="text-muted-foreground mt-2">{t("analytics.subtitle", "Track campaign performance and ROI")}</p>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {t("common.dateRange", "Date Range")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div>
            <Label htmlFor="from">{t("common.from", "From")}</Label>
            <Input
              id="from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="to">{t("common.to", "To")}</Label>
            <Input
              id="to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="mt-2"
            />
          </div>
          <div className="flex items-end">
            <Button className="bg-blue-600 hover:bg-blue-700">{t("common.apply", "Apply")}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              {t("analytics.totalRevenue", "Total Revenue")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1">+12% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {t("analytics.overallROI", "Overall ROI")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallROI.toFixed(1)}%</div>
            <p className="text-xs text-green-600 mt-1">+8% improvement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              {t("analytics.conversions", "Total Conversions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversions.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1">Avg rate: {averageConversionRate}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              {t("analytics.efficiency", "Efficiency")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((totalRevenue / totalSpent) * 100).toFixed(1)}%</div>
            <p className="text-xs text-green-600 mt-1">Revenue per $1 spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="roi" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="roi">{t("analytics.roi", "ROI")}</TabsTrigger>
          <TabsTrigger value="conversion">{t("analytics.conversion", "Conversion")}</TabsTrigger>
          <TabsTrigger value="budget">{t("analytics.budget", "Budget")}</TabsTrigger>
          <TabsTrigger value="revenue">{t("analytics.revenue", "Revenue")}</TabsTrigger>
        </TabsList>

        {/* ROI Chart */}
        <TabsContent value="roi">
          <Card>
            <CardHeader>
              <CardTitle>{t("analytics.roiByCampaign", "ROI by Campaign")}</CardTitle>
              <CardDescription>{t("analytics.roiDescription", "Return on investment for each campaign")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roiData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="roi" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversion Rate Chart */}
        <TabsContent value="conversion">
          <Card>
            <CardHeader>
              <CardTitle>{t("analytics.conversionRates", "Conversion Rates")}</CardTitle>
              <CardDescription>{t("analytics.conversionDescription", "Conversion rate percentage by campaign")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={conversionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Allocation */}
        <TabsContent value="budget">
          <Card>
            <CardHeader>
              <CardTitle>{t("analytics.budgetAllocation", "Budget Allocation")}</CardTitle>
              <CardDescription>{t("analytics.budgetDescription", "How budget is distributed across campaigns")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={budgetData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name.substring(0, 10)}: ₪${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {budgetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₪${value}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue vs Spent */}
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>{t("analytics.revenueVsSpent", "Revenue vs Spent")}</CardTitle>
              <CardDescription>{t("analytics.revenueDescription", "Revenue generated vs amount spent per campaign")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₪${value}`} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" />
                  <Bar dataKey="spent" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Campaign Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("analytics.campaignDetails", "Campaign Performance Details")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-semibold">{t("common.campaign", "Campaign")}</th>
                  <th className="text-right py-2 px-4 font-semibold">{t("analytics.budget", "Budget")}</th>
                  <th className="text-right py-2 px-4 font-semibold">{t("analytics.spent", "Spent")}</th>
                  <th className="text-right py-2 px-4 font-semibold">{t("analytics.revenue", "Revenue")}</th>
                  <th className="text-right py-2 px-4 font-semibold">{t("analytics.roi", "ROI")}</th>
                  <th className="text-right py-2 px-4 font-semibold">{t("analytics.conversionRate", "Conv. Rate")}</th>
                </tr>
              </thead>
              <tbody>
                {campaignMetrics.map((campaign, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">{campaign.name}</td>
                    <td className="text-right py-3 px-4">₪{campaign.budget.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">₪{campaign.spent.toLocaleString()}</td>
                    <td className="text-right py-3 px-4 font-semibold text-green-600">₪{campaign.revenue.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">
                      <Badge className={campaign.roi > 300 ? "bg-green-600" : campaign.roi > 200 ? "bg-blue-600" : "bg-orange-600"}>
                        {campaign.roi}%
                      </Badge>
                    </td>
                    <td className="text-right py-3 px-4">{campaign.conversionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
