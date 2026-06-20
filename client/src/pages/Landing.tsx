import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, CheckCircle, Users } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Landing() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he" || i18n.language === "ar";

  const features = [
    {
      icon: TrendingUp,
      title: t("landing.feature1Title", "סטטיסטיקה פיננסית"),
      description: t("landing.feature1Desc", "מעקב אחר כנסויות והוצאות עם הצגה ספקטקולרית"),
    },
    {
      icon: CheckCircle,
      title: t("landing.feature2Title", "תעקוב משימות"),
      description: t("landing.feature2Desc", "ארגון ומעקוב אחר משימות עם הודעות אוטומטיות"),
    },
    {
      icon: Users,
      title: t("landing.feature3Title", "ניהול לקוחות"),
      description: t("landing.feature3Desc", "ניהול שלם של הלקוחות והשיתוף הימיים לכלם"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">ET</span>
            </div>
            <span className="text-xl font-bold text-[#1e3a5f]">Esek Tech</span>
          </div>
          <div className="flex gap-3">
            <a href={getLoginUrl()}>
              <Button variant="outline">{t("common.login", "התחברות")}</Button>
            </a>
            <a href={getLoginUrl()}>
              <Button className="bg-[#1e3a5f] hover:bg-[#2d5080]">
                {t("landing.startNow", "התחל עכשיו")}
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="mb-6 inline-block bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium">
          {t("landing.badge", "🌟 פתרון הניהול המושלם לסוכנויות שיווק")}
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-[#1e3a5f] mb-6 leading-tight">
          {t("landing.heroTitle", "נהל את הסוכנויות שלך מחקום אחד")}
        </h1>
        
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          {t("landing.heroDesc", "פלטפורמה חקיפה לניהול לקוחות, צוות, קמפיינים, משימות, מעקוב כספים וביצוע אלקטרוני.")}
        </p>

        <a href={getLoginUrl()}>
          <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white text-lg px-8 py-6">
            {t("landing.startNow", "התחל עכשיו")} →
          </Button>
        </a>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center text-[#1e3a5f] mb-16">
          {t("landing.featuresTitle", "תכונות עיקריות")}
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card key={idx} className="p-8 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-[#1e3a5f] mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-[#1e3a5f] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">
            {t("landing.benefitsTitle", "למה לבחור בנו?")}
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold mb-2">{t("landing.benefit1Title", "ממשק ידידותי")}</h3>
                  <p className="text-slate-300">{t("landing.benefit1Desc", "קל לשימוש גם למשתמשים חדשים")}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold mb-2">{t("landing.benefit2Title", "אבטחה מלאה")}</h3>
                  <p className="text-slate-300">{t("landing.benefit2Desc", "הצפנה של כל הנתונים הרגישים")}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold mb-2">{t("landing.benefit3Title", "תמיכה 24/7")}</h3>
                  <p className="text-slate-300">{t("landing.benefit3Desc", "צוות תמיכה תמיד זמין לעזרה")}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold mb-2">{t("landing.benefit4Title", "דוחות מפורטים")}</h3>
                  <p className="text-slate-300">{t("landing.benefit4Desc", "ניתוח נתונים מעמיק ודוחות מותאמים")}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold mb-2">{t("landing.benefit5Title", "עדכונים קבועים")}</h3>
                  <p className="text-slate-300">{t("landing.benefit5Desc", "תכונות חדשות ושיפורים כל חודש")}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold mb-2">{t("landing.benefit6Title", "ייצוא נתונים")}</h3>
                  <p className="text-slate-300">{t("landing.benefit6Desc", "ייצא את כל הנתונים ל-Excel או CSV")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-bold text-[#1e3a5f] mb-6">
          {t("landing.ctaTitle", "מוכנים להתחיל?")}
        </h2>
        <p className="text-xl text-slate-600 mb-8">
          {t("landing.ctaDesc", "הצטרפו לעשרות סוכנויות שיווק שכבר משתמשות ב-Esek Tech")}
        </p>
        <a href={getLoginUrl()}>
          <Button size="lg" className="bg-[#1e3a5f] hover:bg-[#2d5080] text-white text-lg px-8 py-6">
            {t("landing.startNow", "התחל עכשיו")} →
          </Button>
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">Esek Tech</h3>
              <p className="text-sm">{t("landing.footerDesc", "פתרון ניהול סוכנויות שיווק מקיף")}</p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">{t("landing.footerProduct", "מוצר")}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">{t("landing.features", "תכונות")}</a></li>
                <li><a href="#" className="hover:text-white">{t("landing.pricing", "תמחור")}</a></li>
                <li><a href="#" className="hover:text-white">{t("landing.security", "אבטחה")}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">{t("landing.footerCompany", "חברה")}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">{t("landing.about", "אודות")}</a></li>
                <li><a href="#" className="hover:text-white">{t("landing.blog", "בלוג")}</a></li>
                <li><a href="#" className="hover:text-white">{t("landing.contact", "צור קשר")}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">{t("landing.footerLegal", "משפטי")}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">{t("landing.privacy", "פרטיות")}</a></li>
                <li><a href="#" className="hover:text-white">{t("landing.terms", "תנאים")}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-sm">
            <p>&copy; 2026 Esek Tech. {t("landing.allRightsReserved", "כל הזכויות שמורות")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
