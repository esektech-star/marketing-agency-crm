import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function UserApproval() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">{t("common.loading", "Loading...")}</p>
        </div>
      </div>
    );
  }

  const handleApprove = async () => {
    try {
      setIsLoading(true);
      // TODO: Call approval API when available
      toast.success(t("approval.approvalSuccess", "تم الموافقة على حسابك بنجاح"));
      setLocation("/dashboard");
    } catch (error) {
      toast.error(t("approval.approvalError", "حدث خطأ أثناء الموافقة"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-amber-500" />
          </div>
          <CardTitle className="text-2xl">{t("approval.title", "تحتاج إلى موافقة")}</CardTitle>
          <CardDescription>{t("approval.subtitle", "يجب أن يوافق المالك على حسابك قبل الوصول إلى النظام")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              {t("approval.message", "حسابك جاهز، لكن يحتاج إلى موافقة من مالك النظام. يرجى الانتظار أو التواصل مع المالك.")}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>{t("approval.step1", "تم إنشاء حسابك بنجاح")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>{t("approval.step2", "في انتظار موافقة المالك")}</span>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <Button
              onClick={handleApprove}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t("common.loading", "جاري المعالجة...")}
                </>
              ) : (
                t("approval.requestApproval", "طلب الموافقة")
              )}
            </Button>
            <Button
              onClick={() => setLocation("/")}
              variant="outline"
              className="w-full"
            >
              {t("common.back", "العودة")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
