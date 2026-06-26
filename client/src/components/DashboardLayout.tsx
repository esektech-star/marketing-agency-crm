import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { LayoutDashboard, LogOut, PanelLeft, Users, Building2, CheckCircle2, TrendingUp, Zap, BarChart3, LineChart as LineChartIcon, KeyRound, UserCog, FolderOpen, Receipt, Globe, Package, PieChart, Megaphone, Languages, Activity, Bell, Target, Database, MessageCircle, FileText, Sparkles, FileSignature } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import LanguageSwitcher from './LanguageSwitcher';
import GlobalAIAssistant from './GlobalAIAssistant';
import EsekTechLogo from './EsekTechLogo';
import { SearchBar } from './SearchBar';
import NotificationCenter from './NotificationCenter';

const getMenuItems = (t: any) => [
  { icon: LayoutDashboard, label: t("sidebar.dashboard", "لوحة التحكم"), path: "/dashboard" },
  { icon: Users, label: t("sidebar.clients", "العملاء"), path: "/clients" },
  { icon: Package, label: t("sidebar.subscriptions", "المنويات"), path: "/subscriptions" },
  { icon: Users, label: t("sidebar.team", "الفريق"), path: "/team" },
  { icon: CheckCircle2, label: t("sidebar.tasks", "المهام"), path: "/tasks" },
  { icon: Zap, label: t("sidebar.leads", "الليدز"), path: "/leads" },
  { icon: TrendingUp, label: t("sidebar.transactions", "المالية"), path: "/transactions" },
  { icon: BarChart3, label: t("sidebar.campaigns", "الحملات"), path: "/campaigns" },
  { icon: Megaphone, label: t("sidebar.metaCampaigns", "حملات Meta"), path: "/meta-campaigns" },
  { icon: Target, label: t("sidebar.meta", "Meta Ads"), path: "/meta" },
  { icon: MessageCircle, label: t("sidebar.whatsapp", "واتساب"), path: "/whatsapp" },
  { icon: Receipt, label: t("sidebar.sumit", "SUMIT الفوترة"), path: "/sumit" },
  { icon: FileSignature, label: t("sidebar.onboarding", "استقبال العملاء"), path: "/onboarding" },
  { icon: BarChart3, label: t("sidebar.customReports", "تقارير مخصصة"), path: "/custom-reports" },
  { icon: FileText, label: t("sidebar.reports", "التقارير المتقدمة"), path: "/reports" },
  { icon: Activity, label: t("sidebar.activityFeed", "سجل النشاط"), path: "/activity-feed" },
  { icon: Database, label: t("sidebar.backup", "النسخ الاحتياطي"), path: "/backup-schedule" },
  { icon: Bell, label: t("sidebar.alerts", "التنبيهات"), path: "/alerts" },
  { icon: FolderOpen, label: t("sidebar.documents", "مكتبة الملفات"), path: "/documents" },
  { icon: Receipt, label: t("sidebar.invoices", "الفواتير"), path: "/invoices" },
  { icon: KeyRound, label: t("sidebar.accessDetails", "تفاصيل الوصول"), path: "/access-details" },
  { icon: UserCog, label: t("sidebar.users", "المستخدمون"), path: "/users", adminOnly: true },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'he';
  
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              {t("auth.signInToContinue", "تسجيل الدخول للمتابعة")}
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              {t("auth.dashboardRequiresAuth", "الوصول إلى لوحة التحكم يتطلب تسجيل الدخول. تابع لبدء عملية الدخول.")}
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all"
          >
            {t("auth.signIn", "تسجيل الدخول")}
          </Button>
        </div>
      </div>
    );
  }

  // Check if user is approved
  if (!user.isApproved) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              {t("approval.pending", "Awaiting Approval")}
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              {t("approval.pendingMessage", "Your account is pending approval from the system owner. Please wait or contact the owner.")}
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            variant="outline"
            size="lg"
            className="w-full"
          >
            {t("common.back", "Back")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
          display: 'flex',
          flexDirection: isRTL ? 'row-reverse' : 'row',
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const { t, i18n } = useTranslation();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isAdmin = user?.role === "admin";
  const menuItems = getMenuItems(t).filter((item: any) => !item.adminOnly || isAdmin);
  const activeMenuItem = menuItems.find(item => item.path === location);
  const isMobile = useIsMobile();
  const isRTL = i18n.language === 'ar' || i18n.language === 'he';

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible={isMobile ? "icon" : "none"}
          variant="inset"
          className={`border-r-0 ${isRTL ? 'border-l' : 'border-r'}`}
          disableTransition={isResizing}
          side={isRTL ? "right" : "left"}
        >
          <SidebarHeader className="h-16 justify-center border-b">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              {!isCollapsed && (
                <div className="flex-1">
                  <EsekTechLogo />
                </div>
              )}

            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            <SidebarMenu className="px-2 py-1">
              {menuItems.map(item => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-10 transition-all font-normal`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                      />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none">
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">
                      {user?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("auth.logout", "Sign out")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        <div className="flex border-b h-14 items-center justify-between bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40 gap-4">
          {isMobile && (
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-foreground text-sm">
                    {activeMenuItem?.label ?? "Menu"}
                  </span>
                </div>
              </div>
            </div>
          )}
          {!isMobile && <SearchBar />}
          <div className="flex-1" />
          <NotificationCenter />
          <LanguageSwitcher />
        </div>
        <main className="flex-1 p-4 flex flex-col">
          {children}
        </main>
        <GlobalAIAssistant />
      </SidebarInset>
    </>
  );
}
