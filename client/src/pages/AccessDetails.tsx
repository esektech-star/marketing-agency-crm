import { useAuth } from "@/_core/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AccessDetails() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(t("common.copied"));
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t("accessDetails.notAuthenticated")}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">{t("accessDetails.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("accessDetails.subtitle")}</p>
      </div>

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
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(user.name || "", "name")}
                >
                  {copiedField === "name" ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("common.email")}</label>
              <div className="flex items-center justify-between mt-1 p-3 bg-muted rounded-lg">
                <span className="font-medium text-sm">{user.email || "-"}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(user.email || "", "email")}
                >
                  {copiedField === "email" ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("accessDetails.userId")}</label>
              <div className="flex items-center justify-between mt-1 p-3 bg-muted rounded-lg">
                <span className="font-medium text-sm">{user.id}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(user.id.toString(), "id")}
                >
                  {copiedField === "id" ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("accessDetails.userRole")}</label>
              <div className="flex items-center justify-between mt-1 p-3 bg-muted rounded-lg">
                <span className="font-medium">
                  {user.role === "admin" ? t("accessDetails.admin") : t("accessDetails.user")}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(user.role, "role")}
                >
                  {copiedField === "role" ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
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
              <div className="mt-1 p-3 bg-muted rounded-lg">
                <span className="font-medium text-sm">
                  {new Date(user.createdAt).toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("accessDetails.lastSignedIn")}</label>
              <div className="mt-1 p-3 bg-muted rounded-lg">
                <span className="font-medium text-sm">
                  {new Date(user.lastSignedIn).toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("accessDetails.updatedAt")}</label>
              <div className="mt-1 p-3 bg-muted rounded-lg">
                <span className="font-medium text-sm">
                  {new Date(user.updatedAt).toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("accessDetails.loginMethod")}</label>
              <div className="mt-1 p-3 bg-muted rounded-lg">
                <span className="font-medium text-sm">
                  {user.loginMethod || t("accessDetails.notSpecified")}
                </span>
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
    </div>
  );
}
