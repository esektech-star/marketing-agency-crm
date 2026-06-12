import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { BarChart3, Users, CheckCircle2, TrendingUp, Shield, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const LOGO_URL = "/manus-storage/esek-tech-logo_88d01e05.jpg";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    if (isAuthenticated && user && !loading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f] mx-auto mb-4"></div>
          <p className="text-slate-600">{t("common.loading", "جاري التحميل...")}</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return null;
  }

  const features = [
    { icon: Users, color: "text-[#1e3a5f]", bg: "bg-[#1e3a5f]/10", title: t("home.featureClients", "إدارة العملاء"), desc: t("home.featureClientsDesc", "إدارة شاملة لبيانات العملاء والخدمات المقدمة لهم") },
    { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", title: t("home.featureTasks", "متابعة المهام"), desc: t("home.featureTasksDesc", "تنظيم وتتبع المهام مع تحديد الأولويات والمسؤولين") },
    { icon: TrendingUp, color: "text-[#f59e0b]", bg: "bg-amber-50", title: t("home.featureFinance", "الإحصائيات المالية"), desc: t("home.featureFinanceDesc", "تتبع الإيرادات والمصروفات مع رسوم بيانية مفصلة") },
    { icon: Zap, color: "text-[#4a90d9]", bg: "bg-blue-50", title: t("home.featureLeads", "إدارة العملاء المحتملين"), desc: t("home.featureLeadsDesc", "تتبع العملاء المحتملين عبر مراحل القمع التسويقي") },
    { icon: BarChart3, color: "text-violet-600", bg: "bg-violet-50", title: t("home.featureReports", "التقارير والتحليلات"), desc: t("home.featureReportsDesc", "تقارير شاملة وتحليلات عميقة لأداء الأعمال") },
    { icon: Shield, color: "text-rose-600", bg: "bg-rose-50", title: t("home.featureSecurity", "الأمان والخصوصية"), desc: t("home.featureSecurityDesc", "حماية عالية للبيانات الحساسة وتشفير متقدم") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Esek Tech" className="h-11 w-11 rounded-full object-cover ring-1 ring-slate-200" />
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold text-[#1e3a5f]">{t("app.name", "Esek Tech")}</span>
              <span className="text-[11px] text-[#f59e0b] font-medium">{t("app.tagline", "Driving Businesses Forward")}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button onClick={() => window.location.href = getLoginUrl()} className="bg-[#1e3a5f] hover:bg-[#16293f]">
              {t("auth.login", "تسجيل الدخول")}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="text-center mb-8 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e3a5f]/5 text-[#1e3a5f] text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
            {t("home.badge", "نظام إدارة سوكنة التسويق الرقمي")}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#1e3a5f] mb-6 leading-tight">
            {t("home.heroTitle", "أدر سوكنتك من مكان واحد")}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
            {t("home.heroSubtitle", "منصة متكاملة لإدارة العملاء، الموردين، الفريق، المهام، الحملات والمالية — بتصميم أنيق وبسيط وداعم للغات المتعددة.")}
          </p>
          <Button size="lg" onClick={() => window.location.href = getLoginUrl()} className="bg-[#f59e0b] hover:bg-[#d97f06] text-white text-base px-8 h-12 shadow-lg shadow-amber-500/20">
            {t("home.cta", "ابدأ الآن")}
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:-translate-y-1">
              <div className={`w-14 h-14 rounded-xl ${f.bg} flex items-center justify-center mb-5`}>
                <f.icon className={`w-7 h-7 ${f.color}`} />
              </div>
              <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">{f.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#1e3a5f] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t("home.ctaTitle", "جاهز للبدء؟")}</h2>
          <p className="text-lg mb-8 opacity-90">{t("home.ctaSubtitle", "انضم إلى Esek Tech اليوم وأدر عملك بكفاءة أعلى")}</p>
          <Button
            size="lg"
            onClick={() => window.location.href = getLoginUrl()}
            className="bg-[#f59e0b] hover:bg-[#d97f06] text-white px-8"
          >
            {t("auth.login", "تسجيل الدخول الآن")}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 Esek Tech. {t("home.rights", "جميع الحقوق محفوظة.")}</p>
        </div>
      </footer>
    </div>
  );
}
