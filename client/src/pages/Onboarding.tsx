import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, FileText, Share2, CheckCircle2, Lightbulb } from "lucide-react";
import { toast } from "sonner";

const DISCOVERY_QUESTIONS = [
  {
    id: 1,
    question: "ما هو نوع عملك الرئيسي؟",
    type: "select",
    options: ["تجارة إلكترونية", "خدمات احترافية", "صناعة", "تعليم", "صحة", "أخرى"],
  },
  {
    id: 2,
    question: "ما هو حجم فريقك الحالي؟",
    type: "select",
    options: ["1-5", "6-20", "21-50", "51-100", "أكثر من 100"],
  },
  {
    id: 3,
    question: "ما هي أهدافك الرئيسية من التسويق الرقمي؟",
    type: "textarea",
  },
  {
    id: 4,
    question: "ما هو ميزانيتك الشهرية المتوقعة للتسويق؟",
    type: "select",
    options: ["أقل من 1000 ريال", "1000-5000 ريال", "5000-10000 ريال", "10000-50000 ريال", "أكثر من 50000 ريال"],
  },
  {
    id: 5,
    question: "ما هي القنوات التسويقية التي تهتم بها؟",
    type: "textarea",
  },
];

const PACKAGES = [
  {
    id: 1,
    name: "الباقة الأساسية",
    description: "مناسبة للشركات الناشئة",
    price: 2000,
    features: ["إدارة وسائل التواصل", "تقارير شهرية", "دعم بريدي"],
  },
  {
    id: 2,
    name: "الباقة المتوسطة",
    description: "مناسبة للشركات المتوسطة",
    price: 5000,
    features: ["إدارة وسائل التواصل", "حملات إعلانية", "تقارير أسبوعية", "دعم هاتفي"],
  },
  {
    id: 3,
    name: "الباقة المتقدمة",
    description: "مناسبة للشركات الكبرى",
    price: 10000,
    features: ["إدارة شاملة", "حملات متقدمة", "تقارير يومية", "مدير حساب مخصص"],
  },
];

export default function Onboarding() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [proposalData, setProposalData] = useState<any>(null);
  const [showProposal, setShowProposal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateProposal = async () => {
    if (Object.keys(answers).length < DISCOVERY_QUESTIONS.length) {
      toast.error(t("onboarding.completeAllQuestions", "يرجى الإجابة على جميع الأسئلة"));
      return;
    }
    if (!selectedPackage) {
      toast.error(t("onboarding.selectPackage", "يرجى اختيار باقة"));
      return;
    }

    setIsGenerating(true);
    try {
      const pkg = PACKAGES.find(p => p.id === selectedPackage);
      // Simulate AI summary generation
      const summary = `بناءً على إجاباتك، نوصي بـ ${pkg?.name} لأنها تتناسب مع احتياجاتك التسويقية.`;
      
      setProposalData({
        clientName: "عميل جديد",
        businessType: answers[1],
        budget: answers[4],
        package: pkg,
        summary,
        createdAt: new Date(),
      });
      setShowProposal(true);
      toast.success(t("onboarding.proposalGenerated", "تم إنشاء الهدية بنجاح"));
    } catch (error) {
      toast.error(t("onboarding.proposalFailed", "فشل إنشاء الهدية"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const currentQuestion = DISCOVERY_QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / DISCOVERY_QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("onboarding.title", "اكتشف حلولك التسويقية")}</h1>
          <p className="text-muted-foreground">{t("onboarding.subtitle", "دعنا نتعرف على احتياجاتك لتقديم أفضل حل")}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">السؤال {currentStep + 1} من {DISCOVERY_QUESTIONS.length}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#1e3a5f] h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion.type === "select" ? (
              <Select value={answers[currentQuestion.id] || ""} onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("common.select", "اختر...")} />
                </SelectTrigger>
                <SelectContent>
                  {currentQuestion.options?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Textarea
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder={t("common.enterText", "أدخل إجابتك...")}
                rows={4}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex-1"
          >
            {t("common.previous", "السابق")}
          </Button>
          {currentStep < DISCOVERY_QUESTIONS.length - 1 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!answers[currentQuestion.id]}
              className="flex-1 bg-[#1e3a5f] hover:bg-[#2d5080]"
            >
              {t("common.next", "التالي")}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex-1 bg-[#1e3a5f] hover:bg-[#2d5080]"
            >
              {t("onboarding.selectPackage", "اختر الباقة")}
            </Button>
          )}
        </div>

        {/* Package Selection */}
        {currentStep >= DISCOVERY_QUESTIONS.length && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{t("onboarding.selectPackage", "اختر الباقة المناسبة")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PACKAGES.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`cursor-pointer transition-all ${selectedPackage === pkg.id ? "ring-2 ring-[#1e3a5f]" : ""}`}
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-3xl font-bold text-[#1e3a5f]">
                      ₪{pkg.price.toLocaleString()}
                      <span className="text-sm text-muted-foreground">/شهري</span>
                    </div>
                    <ul className="space-y-2">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              onClick={generateProposal}
              disabled={isGenerating || !selectedPackage}
              className="w-full bg-[#1e3a5f] hover:bg-[#2d5080] h-12 text-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  {t("onboarding.generating", "جاري الإنشاء...")}
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 ml-2" />
                  {t("onboarding.generateProposal", "إنشاء الهدية")}
                </>
              )}
            </Button>
          </div>
        )}

        {/* Proposal Dialog */}
        <Dialog open={showProposal} onOpenChange={setShowProposal}>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>{t("onboarding.proposal", "الهدية")}</DialogTitle>
              <DialogDescription>{t("onboarding.proposalDesc", "تم إنشاء هديتك بناءً على احتياجاتك")}</DialogDescription>
            </DialogHeader>
            {proposalData && (
              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-lg space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground">ملخص الذكاء الاصطناعي</h3>
                    <p className="mt-2">{proposalData.summary}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">نوع العمل</p>
                      <p className="font-medium">{proposalData.businessType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">الميزانية</p>
                      <p className="font-medium">{proposalData.budget}</p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">{proposalData.package.name}</h4>
                    <div className="text-2xl font-bold text-[#1e3a5f] mb-3">
                      ₪{proposalData.package.price.toLocaleString()}/شهري
                    </div>
                    <ul className="space-y-2">
                      {proposalData.package.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1">
                    <FileText className="w-4 h-4 ml-2" />
                    {t("onboarding.downloadPDF", "تحميل PDF")}
                  </Button>
                  <Button className="flex-1 bg-[#1e3a5f] hover:bg-[#2d5080]">
                    <Share2 className="w-4 h-4 ml-2" />
                    {t("onboarding.shareLink", "شارك الرابط")}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
