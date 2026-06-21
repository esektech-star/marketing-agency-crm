import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CheckCircle2, Loader2, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function UserApproval() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    } else if (user && user.role !== "admin") {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, user, setLocation]);

  const { data: pendingUsers = [], isLoading, refetch } = trpc.auth.getPendingUsers.useQuery();
  const approveMutation = trpc.auth.approveUser.useMutation();
  const rejectMutation = trpc.auth.rejectUser.useMutation();

  const handleApprove = async (userId: number) => {
    try {
      await approveMutation.mutateAsync({ userId });
      toast.success(t("approval.approvalSuccess", "User approved successfully"));
      refetch();
    } catch (error) {
      toast.error(t("approval.approvalError", "An error occurred during approval"));
    }
  };

  const handleReject = async (userId: number) => {
    try {
      await rejectMutation.mutateAsync({ userId });
      toast.success(t("common.deleteSuccess", "User rejected and removed"));
      refetch();
    } catch (error) {
      toast.error(t("common.error", "An error occurred"));
    }
  };

  if (!isAuthenticated || (user && user.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">{t("common.loading", "Loading...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-amber-500" />
              {t("approval.title", "User Approvals")}
            </CardTitle>
            <CardDescription>
              {t("approval.subtitle", "Manage pending user approvals")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {pendingUsers.length === 0 ? (
              <Alert>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  {t("approval.noUsers", "No pending users to approve")}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.name", "Name")}</TableHead>
                      <TableHead>{t("common.email", "Email")}</TableHead>
                      <TableHead>{t("common.date", "Created")}</TableHead>
                      <TableHead className="text-right">{t("common.actions", "Actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingUsers.map((pendingUser: any) => (
                      <TableRow key={pendingUser.id}>
                        <TableCell className="font-medium">{pendingUser.name || "N/A"}</TableCell>
                        <TableCell>{pendingUser.email || "N/A"}</TableCell>
                        <TableCell>
                          {new Date(pendingUser.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(pendingUser.id)}
                            disabled={approveMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {approveMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            {t("common.approve", "Approve")}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(pendingUser.id)}
                            disabled={rejectMutation.isPending}
                          >
                            {rejectMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                            {t("common.reject", "Reject")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="pt-4">
              <Button
                onClick={() => setLocation("/dashboard")}
                variant="outline"
                className="w-full"
              >
                {t("common.back", "Back to Dashboard")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
