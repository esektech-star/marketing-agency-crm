import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Filter, User, Activity, MessageSquare, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface ActivityEvent {
  id: number;
  type: "task_created" | "task_completed" | "campaign_launched" | "client_added" | "payment_received" | "comment_added" | "status_changed";
  title: string;
  description: string;
  user: {
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  relatedEntity?: {
    type: "task" | "campaign" | "client" | "invoice";
    id: number;
    name: string;
  };
  metadata?: Record<string, any>;
}

export default function ActivityFeed() {
  const { t } = useTranslation();
  const [filterType, setFilterType] = useState<string>("all");
  const [filterUser, setFilterUser] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Mock activity data
  const activities: ActivityEvent[] = [
    {
      id: 1,
      type: "task_completed",
      title: "Task Completed",
      description: "Website Redesign project has been marked as complete",
      user: { name: "Sarah Johnson" },
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      relatedEntity: { type: "task", id: 1, name: "Website Redesign" },
    },
    {
      id: 2,
      type: "campaign_launched",
      title: "Campaign Launched",
      description: "Summer Sale campaign went live on Facebook and Instagram",
      user: { name: "Mike Chen" },
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      relatedEntity: { type: "campaign", id: 1, name: "Summer Sale" },
    },
    {
      id: 3,
      type: "payment_received",
      title: "Payment Received",
      description: "Payment of ₪5,000 received from Acme Corp",
      user: { name: "Admin" },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      relatedEntity: { type: "client", id: 1, name: "Acme Corp" },
    },
    {
      id: 4,
      type: "comment_added",
      title: "Comment Added",
      description: "New comment on Facebook Campaign: Great results so far!",
      user: { name: "Lisa Park" },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      relatedEntity: { type: "campaign", id: 1, name: "Facebook Campaign" },
    },
    {
      id: 5,
      type: "task_created",
      title: "Task Created",
      description: "New task: Email Marketing Campaign created",
      user: { name: "Sarah Johnson" },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      relatedEntity: { type: "task", id: 2, name: "Email Marketing Campaign" },
    },
    {
      id: 6,
      type: "client_added",
      title: "Client Added",
      description: "New client Tech Innovations Ltd has been added",
      user: { name: "Admin" },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
      relatedEntity: { type: "client", id: 2, name: "Tech Innovations Ltd" },
    },
  ];

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    if (filterType !== "all" && activity.type !== filterType) return false;
    if (filterUser !== "all" && activity.user.name !== filterUser) return false;
    if (searchQuery && !activity.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task_completed":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "campaign_launched":
        return <Activity className="w-5 h-5 text-blue-600" />;
      case "payment_received":
        return <AlertCircle className="w-5 h-5 text-green-600" />;
      case "comment_added":
        return <MessageSquare className="w-5 h-5 text-purple-600" />;
      case "task_created":
        return <Clock className="w-5 h-5 text-orange-600" />;
      case "client_added":
        return <User className="w-5 h-5 text-blue-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      task_completed: "Task Completed",
      campaign_launched: "Campaign Launched",
      payment_received: "Payment Received",
      comment_added: "Comment Added",
      task_created: "Task Created",
      client_added: "Client Added",
      status_changed: "Status Changed",
    };
    return labels[type] || type;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const uniqueUsers = Array.from(new Set(activities.map((a) => a.user.name)));
  const activityTypes = Array.from(new Set(activities.map((a) => a.type)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("activityFeed.title", "Activity Feed")}</h1>
        <p className="text-muted-foreground mt-2">{t("activityFeed.subtitle", "Track all team activities and updates")}</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            {t("common.filters", "Filters")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <Label htmlFor="search">{t("common.search", "Search")}</Label>
              <Input
                id="search"
                placeholder={t("common.searchPlaceholder", "Search activities...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Activity Type Filter */}
            <div>
              <Label htmlFor="type">{t("activityFeed.type", "Activity Type")}</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger id="type" className="mt-2">
                  <SelectValue placeholder={t("common.selectAll", "All Types")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all", "All Types")}</SelectItem>
                  {activityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getActivityTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* User Filter */}
            <div>
              <Label htmlFor="user">{t("common.user", "User")}</Label>
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger id="user" className="mt-2">
                  <SelectValue placeholder={t("common.selectAll", "All Users")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all", "All Users")}</SelectItem>
                  {uniqueUsers.map((user) => (
                    <SelectItem key={user} value={user}>
                      {user}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFilterType("all");
                  setFilterUser("all");
                  setSearchQuery("");
                  toast.success(t("common.filtersCleared", "Filters cleared"));
                }}
                className="w-full"
              >
                {t("common.clearFilters", "Clear Filters")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>{t("activityFeed.timeline", "Activity Timeline")}</CardTitle>
          <CardDescription>{filteredActivities.length} activities found</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t("common.noResults", "No activities found matching your filters")}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity, index) => (
                <div key={activity.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center">
                    <div className="p-2 bg-muted rounded-full">{getActivityIcon(activity.type)}</div>
                    {index < filteredActivities.length - 1 && (
                      <div className="w-0.5 h-16 bg-border mt-2" />
                    )}
                  </div>

                  {/* Activity content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{activity.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                        {activity.relatedEntity && (
                          <div className="mt-2">
                            <Badge variant="secondary">
                              {activity.relatedEntity.type}: {activity.relatedEntity.name}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</p>
                        <p className="text-xs font-medium mt-1">{activity.user.name}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("activityFeed.totalActivities", "Total Activities")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("activityFeed.tasksCompleted", "Tasks Completed")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.filter((a) => a.type === "task_completed").length}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("activityFeed.campaignsLaunched", "Campaigns Launched")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.filter((a) => a.type === "campaign_launched").length}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("activityFeed.activeUsers", "Active Users")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueUsers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Team members</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
