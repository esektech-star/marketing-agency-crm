import { useTranslation } from "react-i18next";
import { useAuth } from "@/_core/hooks/useAuth";
import ClientFeedback from "@/components/ClientFeedback";

export default function ClientFeedbackPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">{t("feedback.portal", "بوابة الملاحظات")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("feedback.portalDesc", "شارك ملاحظاتك وطلباتك معنا، وتابع حالة معالجتها")}
        </p>
      </div>

      <ClientFeedback
        clientId={user?.id?.toString()}
        clientName={user?.name || "Client"}
      />
    </div>
  );
}
