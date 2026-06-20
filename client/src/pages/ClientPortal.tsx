import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Download, FileText, BarChart3, Receipt, FolderOpen, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
};
const STATUS_LABEL: Record<string, string> = {
  pending: "قيد الانتظار",
  paid: "مدفوعة",
  overdue: "متأخرة",
};
const CAMP_STATUS: Record<string, string> = {
  planned: "مخططة",
  active: "نشطة",
  paused: "متوقفة",
  completed: "مكتملة",
};

function fmtMoney(n: number) {
  return `₪${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function ClientPortal() {
  const { t } = useTranslation();
  const [, params] = useRoute("/portal/:token");
  const token = params?.token || "";
  const { data, isLoading } = trpc.clientPortal.getData.useQuery({ token }, { enabled: !!token });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
      </div>
    );
  }

  if (!data || (data as any).expired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4" dir="rtl">
        <Card className="max-w-md w-full">
          <CardContent className="py-10 text-center space-y-3">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            <h2 className="text-xl font-bold">{t("clientPortal.invalidLink", "رابط غير صالح")}</h2>
            <p className="text-muted-foreground">
              {(data as any)?.expired ? t("clientPortal.linkExpired", "انتهت صلاحية رابط الوصول هذا. يرجى التواصل مع الوكالة.") : t("clientPortal.invalidLinkDesc", "رابط البوابة غير صحيح أو لم يعد متاحاً.")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const portal = data as any;

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <header className="bg-[#1e3a5f] text-white py-6 shadow-md">
        <div className="container">
          <p className="text-sm opacity-80">esek tech — {t("clientPortal.portalTitle", "بوابة العميل")}</p>
          <h1 className="text-2xl font-bold mt-1">{portal.client.name}</h1>
          <p className="text-sm opacity-80 mt-1">
            {portal.client.serviceType}{portal.client.clientCode ? ` · ${t("clientPortal.clientCode", "كود العميل")}: ${portal.client.clientCode}` : ""}
          </p>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {portal.permissions.canViewCampaigns && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-[#1e3a5f]" /> {t("clientPortal.campaigns", "الحملات")}</CardTitle>
              <CardDescription>{t("clientPortal.campaignsDesc", "نتائج وحالة حملاتك التسويقية")}</CardDescription>
            </CardHeader>
            <CardContent>
              {portal.campaigns.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">لا توجد حملات حالياً.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>اسم الحملة</TableHead>
                        <TableHead>المنصة</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>الميزانية</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {portal.campaigns.map((c: any) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell>{c.platform || "-"}</TableCell>
                          <TableCell>{CAMP_STATUS[c.status] || c.status}</TableCell>
                          <TableCell>{c.budget ? fmtMoney(parseFloat(c.budget)) : "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {portal.permissions.canViewInvoices && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Receipt className="w-5 h-5 text-[#1e3a5f]" /> الفواتير</CardTitle>
              <CardDescription>عرض وتحميل فواتيرك</CardDescription>
            </CardHeader>
            <CardContent>
              {portal.invoices.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">لا توجد فواتير حالياً.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>رقم الفاتورة</TableHead>
                        <TableHead>المبلغ</TableHead>
                        <TableHead>الاستحقاق</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>الملف</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {portal.invoices.map((inv: any) => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-mono">{inv.invoiceNumber}</TableCell>
                          <TableCell className="font-medium">{fmtMoney(parseFloat(inv.amount))}</TableCell>
                          <TableCell>{new Date(inv.dueDate).toLocaleDateString("en-GB")}</TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[inv.status]}`}>{STATUS_LABEL[inv.status]}</span>
                          </TableCell>
                          <TableCell>
                            {inv.fileUrl ? (
                              <Button size="sm" variant="outline" onClick={() => window.open(inv.fileUrl, "_blank")}>
                                <Download className="w-4 h-4 ml-1" /> تحميل
                              </Button>
                            ) : <span className="text-xs text-muted-foreground">-</span>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {portal.permissions.canDownloadFiles && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FolderOpen className="w-5 h-5 text-[#1e3a5f]" /> الملفات</CardTitle>
              <CardDescription>الملفات المشتركة معك من الوكالة</CardDescription>
            </CardHeader>
            <CardContent>
              {portal.files.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">لا توجد ملفات حالياً.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {portal.files.map((f: any) => (
                    <div key={f.id} className="border rounded-lg p-4 flex items-center justify-between gap-3 bg-white">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-5 h-5 text-[#1e3a5f] shrink-0" />
                        <span className="truncate text-sm">{f.fileName || f.name}</span>
                      </div>
                      {f.fileUrl && (
                        <Button size="sm" variant="outline" onClick={() => window.open(f.fileUrl, "_blank")}>
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="text-center text-xs text-muted-foreground py-6">
        مدعوم بواسطة esek tech
      </footer>
    </div>
  );
}
