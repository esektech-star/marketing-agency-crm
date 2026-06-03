import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { BarChart3, Users, CheckCircle2, TrendingUp, Shield, Zap } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">سوكنة الشيويق</span>
          </div>
          <Button onClick={() => window.location.href = getLoginUrl()}>
            تسجيل الدخول
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            نظام إدارة متكامل لسوكنة الشيويق
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            إدارة شاملة للعملاء، الموردين، الفريق، المهام، والمالية من لوحة تحكم واحدة احترافية
          </p>
          <Button size="lg" onClick={() => window.location.href = getLoginUrl()} className="bg-blue-600 hover:bg-blue-700">
            ابدأ الآن
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow">
            <Users className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">إدارة العملاء</h3>
            <p className="text-gray-600">إدارة شاملة لبيانات العملاء والخدمات المقدمة لهم</p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow">
            <CheckCircle2 className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">متابعة المهام</h3>
            <p className="text-gray-600">تنظيم وتتبع المهام مع تحديد الأولويات والمسؤولين</p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow">
            <TrendingUp className="w-12 h-12 text-emerald-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">الإحصائيات المالية</h3>
            <p className="text-gray-600">تتبع الإيرادات والمصروفات مع رسوم بيانية مفصلة</p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow">
            <Zap className="w-12 h-12 text-amber-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">إدارة الليدز</h3>
            <p className="text-gray-600">تتبع العملاء المحتملين عبر مراحل القمع التسويقي</p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow">
            <BarChart3 className="w-12 h-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">التقارير والتحليلات</h3>
            <p className="text-gray-600">تقارير شاملة وتحليلات عميقة لأداء الأعمال</p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow">
            <Shield className="w-12 h-12 text-red-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">الأمان والخصوصية</h3>
            <p className="text-gray-600">حماية عالية للبيانات الحساسة وتشفير متقدم</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">جاهز للبدء؟</h2>
          <p className="text-lg mb-8 opacity-90">انضم إلينا اليوم وأدر عملك بكفاءة أعلى</p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = getLoginUrl()}
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            تسجيل الدخول الآن
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 سوكنة الشيويق. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
