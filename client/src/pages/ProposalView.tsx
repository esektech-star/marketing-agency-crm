import { useParams } from "wouter";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Printer, FileText } from "lucide-react";

export default function ProposalView() {
  const { t } = useTranslation();
  const params = useParams();
  const token = params.token as string;

  const { data: proposal, isLoading } = trpc.onboarding.getProposalByToken.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4" dir="rtl">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("proposal.notFound", "العرض غير موجود")}</h2>
            <p className="text-muted-foreground">{t("proposal.notFoundDesc", "الرابط غير صحيح أو انتهت صلاحيته")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const p = proposal as any;
  const features: string[] = (() => {
    try {
      const da = typeof p.discoveryAnswers === "string" ? JSON.parse(p.discoveryAnswers) : p.discoveryAnswers;
      return da?.features ?? [];
    } catch {
      return [];
    }
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 print:bg-white" dir="rtl">
      <div className="max-w-3xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("proposal.title", "عرض الخدمات التسويقية")}</h1>
          <p className="text-muted-foreground">{t("proposal.preparedFor", "تم إعداده خصيصاً لك")}</p>
        </div>

        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-lg">{t("proposal.summary", "الملخص التنفيذي")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-muted-foreground">{p.aiSummary}</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-lg">{t("proposal.details", "تفاصيل العرض")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{t("proposal.businessType", "نوع العمل")}</p>
                <p className="font-medium">{p.businessType}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("proposal.budget", "الميزانية")}</p>
                <p className="font-medium">{p.budget}</p>
              </div>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">{p.packageName}</h4>
              <div className="text-3xl font-bold text-[#1e3a5f] mb-3">
                {Number(p.packagePrice).toLocaleString("en-US")} ₪
                <span className="text-sm text-muted-foreground">/شهري</span>
              </div>
              {features.length > 0 && (
                <ul className="space-y-2">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center print:hidden">
          <Button onClick={() => window.print()} variant="outline" className="bg-background">
            <Printer className="w-4 h-4 ml-2" />
            {t("proposal.print", "طباعة / حفظ PDF")}
          </Button>
        </div>
      </div>
    </div>
  );
}
