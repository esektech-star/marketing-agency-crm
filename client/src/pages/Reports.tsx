import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, TrendingUp, Users, BarChart3, Loader2 } from "lucide-react";
import { toast } from "sonner";

function num(v: any): number {
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return isNaN(n) ? 0 : n;
}

function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("financial");

  const { data: stats, isLoading: statsLoading } = trpc.dashboard.getStats.useQuery();
  const { data: clients = [], isLoading: clientsLoading } = trpc.clients.list.useQuery();
  const { data: campaigns = [] } = trpc.metaCampaigns.list.useQuery(undefined, { retry: false });

  const monthlyData: any[] = useMemo(() => (stats as any)?.monthlyData ?? [], [stats]);
  const leadsBySource: any[] = useMemo(() => (stats as any)?.leadsBySource ?? [], [stats]);

  const exportFinancial = () => {
    const rows: (string | number)[][] = [
      [t("reports.metric", "المؤشر"), t("reports.value", "القيمة")],
      [t("reports.totalRevenue", "إجمالي الإيرادات"), num((stats as any)?.totalRevenue)],
      [t("reports.totalExpense", "إجمالي المصروفات"), num((stats as any)?.totalExpense)],
      [t("reports.netProfit", "صافي الربح"), num((stats as any)?.netProfit)],
      [t("reports.profitMargin", "هامش الربح %"), num((stats as any)?.profitMargin)],
    ];
    downloadCSV("financial-report.csv", rows);
    toast.success(t("reports.exported", "تم التصدير"));
  };

  const exportClients = () => {
    const rows: (string | number)[][] = [[t("reports.clientName", "اسم العميل"), t("reports.status", "الحالة"), t("reports.monthlyPayment", "الدفع الشهري")]];
    (clients as any[]).forEach((c) => rows.push([c.name ?? "", c.status ?? "", num(c.monthlyPayment)]));
    downloadCSV("clients-report.csv", rows);
    toast.success(t("reports.exported", "تم التصدير"));
  };

  const exportCampaigns = () => {
    const rows: (string | number)[][] = [[t("meta.campaigns", "الحملة"), t("meta.spent", "الإنفاق"), t("meta.impressions", "انطباعات"), t("meta.clicks", "نقرات"), "ROAS"]];
    (campaigns as any[]).forEach((c) => rows.push([c.campaignName ?? c.campaignId, num(c.spend), num(c.impressions), num(c.clicks), num(c.roas)]));
    downloadCSV("campaigns-report.csv", rows);
    toast.success(t("reports.exported", "تم التصدير"));
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary" />
            {t("reports.title", "التقارير")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("reports.subtitle", "تقارير مبنية على بيانات حقيقية من النظام")}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="financial"><TrendingUp className="w-4 h-4 ml-1" />{t("reports.financial", "مالي")}</TabsTrigger>
          <TabsTrigger value="clients"><Users className="w-4 h-4 ml-1" />{t("reports.clients", "العملاء")}</TabsTrigger>
          <TabsTrigger value="campaigns"><BarChart3 className="w-4 h-4 ml-1" />{t("reports.campaigns", "الحملات")}</TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={exportFinancial} variant="outline" className="bg-background"><Download className="w-4 h-4 ml-2" />{t("reports.exportCsv", "تصدير CSV")}</Button>
          </div>
          {statsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">{t("reports.totalRevenue", "إجمالي الإيرادات")}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{num((stats as any)?.totalRevenue).toLocaleString("en-US")} ₪</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">{t("reports.totalExpense", "إجمالي المصروفات")}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{num((stats as any)?.totalExpense).toLocaleString("en-US")} ₪</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">{t("reports.netProfit", "صافي الربح")}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{num((stats as any)?.netProfit).toLocaleString("en-US")} ₪</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">{t("reports.profitMargin", "هامش الربح")}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{num((stats as any)?.profitMargin).toFixed(1)}%</div></CardContent></Card>
              </div>
              {monthlyData.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>{t("reports.monthlyBreakdown", "التفصيل الشهري")}</CardTitle></CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader><TableRow><TableHead className="text-right">{t("reports.month", "الشهر")}</TableHead><TableHead className="text-right">{t("reports.revenue", "إيرادات")}</TableHead><TableHead className="text-right">{t("reports.expense", "مصروفات")}</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {monthlyData.map((m, i) => (
                          <TableRow key={i}><TableCell>{m.month ?? m.label ?? "—"}</TableCell><TableCell>{num(m.revenue).toLocaleString("en-US")} ₪</TableCell><TableCell>{num(m.expense).toLocaleString("en-US")} ₪</TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={exportClients} variant="outline" className="bg-background"><Download className="w-4 h-4 ml-2" />{t("reports.exportCsv", "تصدير CSV")}</Button>
          </div>
          <Card>
            <CardHeader><CardTitle>{t("reports.clientsReport", "تقرير العملاء")}</CardTitle><CardDescription>{(clients as any[]).length} {t("reports.clientsCount", "عميل")}</CardDescription></CardHeader>
            <CardContent>
              {clientsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
              ) : (clients as any[]).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">{t("reports.noData", "لا توجد بيانات")}</div>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead className="text-right">{t("reports.clientName", "اسم العميل")}</TableHead><TableHead className="text-right">{t("reports.status", "الحالة")}</TableHead><TableHead className="text-right">{t("reports.monthlyPayment", "الدفع الشهري")}</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {(clients as any[]).map((c) => (
                      <TableRow key={c.id}><TableCell className="font-medium">{c.name}</TableCell><TableCell>{c.status ?? "—"}</TableCell><TableCell>{num(c.monthlyPayment).toLocaleString("en-US")} ₪</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={exportCampaigns} variant="outline" className="bg-background"><Download className="w-4 h-4 ml-2" />{t("reports.exportCsv", "تصدير CSV")}</Button>
          </div>
          <Card>
            <CardHeader><CardTitle>{t("reports.campaignsReport", "تقرير الحملات")}</CardTitle><CardDescription>{(campaigns as any[]).length} {t("meta.campaignsCount", "حملة")}</CardDescription></CardHeader>
            <CardContent>
              {(campaigns as any[]).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">{t("reports.noData", "لا توجد بيانات")}</div>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead className="text-right">{t("meta.campaigns", "الحملة")}</TableHead><TableHead className="text-right">{t("meta.spent", "الإنفاق")}</TableHead><TableHead className="text-right">{t("meta.impressions", "انطباعات")}</TableHead><TableHead className="text-right">ROAS</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {(campaigns as any[]).map((c) => (
                      <TableRow key={c.id ?? c.campaignId}><TableCell className="font-medium">{c.campaignName ?? c.campaignId}</TableCell><TableCell>{num(c.spend).toLocaleString("en-US")} ₪</TableCell><TableCell>{num(c.impressions).toLocaleString("en-US")}</TableCell><TableCell>{num(c.roas).toFixed(2)}x</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {leadsBySource.length > 0 && (
        <Card>
          <CardHeader><CardTitle>{t("reports.leadsBySource", "العملاء المحتملون حسب المصدر")}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {leadsBySource.map((s: any, i: number) => (
                <div key={i} className="bg-muted/50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold">{num(s.count).toLocaleString("en-US")}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.source ?? "—"}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
