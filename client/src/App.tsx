import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from '@/components/DashboardLayout';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "./_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientProfile from "./pages/ClientProfile";
import CampaignDetail from "./pages/CampaignDetail";

import Subscriptions from "./pages/Subscriptions";
import TeamMembers from "./pages/TeamMembers";
import Tasks from "./pages/Tasks";
import Leads from "./pages/Leads";
import Transactions from "./pages/Transactions";
import Campaigns from "./pages/Campaigns";
import MetaCampaigns from "./pages/MetaCampaigns";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Documents from "@/pages/Documents";
import Invoices from "@/pages/Invoices";
import ActivityFeed from "@/pages/ActivityFeed";
import Analytics from "@/pages/Analytics";
import Benchmarking from "@/pages/Benchmarking";
import BackupSchedule from "@/pages/BackupSchedule";
import Alerts from "@/pages/Alerts";
import ReportScheduling from "@/pages/ReportScheduling";
import CustomReports from "@/pages/CustomReports";
import ClientFeedbackPage from "@/pages/ClientFeedbackPage";
import AccessDetails from "./pages/AccessDetails";
import ClientPortalManager from "./pages/ClientPortalManager";
import ClientPortal from "./pages/ClientPortal";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import KPI from "./pages/KPI";


function Router() {
  return (
    <Switch>
      <Route path={"/landing"} component={Landing} />
      <Route path={"/"} component={Home} />
      <Route path={"/portal/:token"} component={ClientPortal} />
      <Route path={"/kpi"}>
        {() => (
          <DashboardLayout>
            <KPI />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/invoices"}>
        {() => (
          <DashboardLayout>
            <Invoices />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/client-portal"}>
        {() => (
          <DashboardLayout>
            <AdminOnly>
              <ClientPortalManager />
            </AdminOnly>
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/dashboard"}>
        {() => (
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/clients"}>
        {() => (
          <DashboardLayout>
            <Clients />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/clients/:id"}>
        {() => (
          <DashboardLayout>
            <ClientProfile />
          </DashboardLayout>
        )}
      </Route>

      <Route path={"/subscriptions"}>
        {() => (
          <DashboardLayout>
            <Subscriptions />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/team"}>
        {() => (
          <DashboardLayout>
            <TeamMembers />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/tasks"}>
        {() => (
          <DashboardLayout>
            <Tasks />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/leads"}>
        {() => (
          <DashboardLayout>
            <Leads />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/transactions"}>
        {() => (
          <DashboardLayout>
            <Transactions />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/campaigns"}>
        {() => (
          <DashboardLayout>
            <Campaigns />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/campaigns/:id"}>
        {() => (
          <DashboardLayout>
            <CampaignDetail />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/meta-campaigns"}>
        {() => (
          <DashboardLayout>
            <MetaCampaigns />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/reports"}>
        {() => (
          <DashboardLayout>
            <Reports />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/report-scheduling"}>
        {() => (
          <DashboardLayout>
            <ReportScheduling />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/custom-reports"}>
        {() => (
          <DashboardLayout>
            <CustomReports />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/client-feedback"}>
        {() => (
          <DashboardLayout>
            <ClientFeedbackPage />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/activity-feed"}>
        {() => (
          <DashboardLayout>
            <ActivityFeed />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/analytics"}>
        {() => (
          <DashboardLayout>
            <Analytics />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/benchmarking"}>
        {() => (
          <DashboardLayout>
            <Benchmarking />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/backup-schedule"}>
        {() => (
          <DashboardLayout>
            <BackupSchedule />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/alerts"}>
        {() => (
          <DashboardLayout>
            <Alerts />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/access-details"}>
        {() => (
          <DashboardLayout>
            <AccessDetails />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/users"}>
        {() => (
          <DashboardLayout>
            <AdminOnly>
              <Users />
            </AdminOnly>
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/documents"}>
        {() => (
          <DashboardLayout>
            <Documents />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AdminOnly({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && user && user.role !== "admin") {
      setLocation("/dashboard");
    }
  }, [loading, user, setLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user || user.role !== "admin") {
    return null;
  }
  return <>{children}</>;
}

function AppContent() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const isRTL = i18n.language === 'ar' || i18n.language === 'he';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return <Router />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <PWAInstallPrompt />
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
