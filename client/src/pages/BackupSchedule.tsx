import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Trash2, Clock, Database, Archive, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface BackupSchedule {
  id: number;
  name: string;
  frequency: "daily" | "weekly" | "monthly";
  time: string;
  formats: string[];
  retentionDays: number;
  includeArchived: boolean;
  lastRun?: string;
  nextRun?: string;
  status: "active" | "inactive";
}

const MOCK_SCHEDULES: BackupSchedule[] = [
  {
    id: 1,
    name: "Daily Backup",
    frequency: "daily",
    time: "02:00",
    formats: ["CSV", "JSON"],
    retentionDays: 30,
    includeArchived: false,
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
    status: "active",
  },
  {
    id: 2,
    name: "Weekly Full Backup",
    frequency: "weekly",
    time: "03:00",
    formats: ["CSV", "JSON", "Excel"],
    retentionDays: 90,
    includeArchived: true,
    lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
  },
];

const MOCK_BACKUPS = [
  {
    id: 1,
    name: "backup_2026_06_25_02_00",
    date: new Date(Date.now() - 2 * 60 * 60 * 1000),
    size: "2.4 MB",
    format: "CSV",
    campaigns: 45,
    tasks: 128,
    status: "completed",
  },
  {
    id: 2,
    name: "backup_2026_06_24_02_00",
    date: new Date(Date.now() - 26 * 60 * 60 * 1000),
    size: "2.3 MB",
    format: "CSV",
    campaigns: 44,
    tasks: 125,
    status: "completed",
  },
  {
    id: 3,
    name: "backup_2026_06_18_03_00",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    size: "5.8 MB",
    format: "Excel",
    campaigns: 42,
    tasks: 120,
    status: "completed",
  },
];

export default function BackupSchedule() {
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState<BackupSchedule[]>(MOCK_SCHEDULES);
  const [backups, setBackups] = useState(MOCK_BACKUPS);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    frequency: "daily" as const,
    time: "02:00",
    formats: [] as string[],
    retentionDays: 30,
    includeArchived: false,
  });

  const handleAddSchedule = () => {
    if (!formData.name || formData.formats.length === 0) {
      toast.error(t("common.fillRequired", "Please fill all required fields"));
      return;
    }

    if (editingId) {
      setSchedules(schedules.map(s => s.id === editingId ? { ...s, ...formData } : s));
      toast.success(t("common.updateSuccess", "Schedule updated"));
    } else {
      const newSchedule: BackupSchedule = {
        id: Math.max(...schedules.map(s => s.id), 0) + 1,
        ...formData,
        status: "active",
      };
      setSchedules([...schedules, newSchedule]);
      toast.success(t("common.addSuccess", "Schedule created"));
    }

    setFormData({ name: "", frequency: "daily", time: "02:00", formats: [], retentionDays: 30, includeArchived: false });
    setEditingId(null);
    setIsOpen(false);
  };

  const handleDeleteSchedule = (id: number) => {
    if (confirm(t("common.confirmDelete", "Are you sure?"))) {
      setSchedules(schedules.filter(s => s.id !== id));
      toast.success(t("common.deleteSuccess", "Schedule deleted"));
    }
  };

  const handleToggleFormat = (format: string) => {
    setFormData(prev => ({
      ...prev,
      formats: prev.formats.includes(format)
        ? prev.formats.filter(f => f !== format)
        : [...prev.formats, format],
    }));
  };

  const handleDownloadBackup = (backup: any) => {
    toast.success(`${t("common.downloading", "Downloading")} ${backup.name}...`);
  };

  const handleRestoreBackup = (backup: any) => {
    if (confirm(`${t("common.confirmRestore", "Restore from")} ${backup.name}?`)) {
      toast.success(`${t("common.restoring", "Restoring")} ${backup.name}...`);
    }
  };

  const handleArchiveOldCampaigns = () => {
    if (confirm(t("backup.confirmArchiveOld", "Archive campaigns older than 90 days?"))) {
      toast.success(t("backup.archiveStarted", "Archive process started"));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">{t("backup.title", "Backup & Archive")}</h1>
        <p className="text-muted-foreground mt-1">{t("backup.subtitle", "Manage automated backups and data retention")}</p>
      </div>

      {/* Backup Schedules */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{t("backup.schedules", "Backup Schedules")}</CardTitle>
              <CardDescription>{t("backup.schedulesDesc", "Configure automatic backup exports")}</CardDescription>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#1e3a5f] hover:bg-[#2d5080]">
                  <Plus className="w-4 h-4 ms-2" />
                  {t("backup.addSchedule", "Add Schedule")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingId ? t("common.edit", "Edit") : t("common.add", "Add")} {t("backup.schedule", "Schedule")}</DialogTitle>
                  <DialogDescription>{t("backup.scheduleDesc", "Configure backup schedule and retention")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">{t("common.name", "Name")}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Daily Backup"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency">{t("backup.frequency", "Frequency")}</Label>
                    <Select value={formData.frequency} onValueChange={(value: any) => setFormData({ ...formData, frequency: value })}>
                      <SelectTrigger id="frequency" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">{t("backup.daily", "Daily")}</SelectItem>
                        <SelectItem value="weekly">{t("backup.weekly", "Weekly")}</SelectItem>
                        <SelectItem value="monthly">{t("backup.monthly", "Monthly")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="time">{t("backup.time", "Time")}</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="mt-1"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <Label>{t("backup.formats", "Export Formats")}</Label>
                    <div className="space-y-2 mt-2">
                      {["CSV", "JSON", "Excel"].map(format => (
                        <div key={format} className="flex items-center space-x-2">
                          <Checkbox
                            id={`format-${format}`}
                            checked={formData.formats.includes(format)}
                            onCheckedChange={() => handleToggleFormat(format)}
                          />
                          <Label htmlFor={`format-${format}`} className="font-normal cursor-pointer">{format}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="retention">{t("backup.retentionDays", "Retention (days)")}</Label>
                    <Input
                      id="retention"
                      type="number"
                      value={formData.retentionDays}
                      onChange={(e) => setFormData({ ...formData, retentionDays: parseInt(e.target.value) })}
                      min="1"
                      max="365"
                      className="mt-1"
                      dir="ltr"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="archived"
                      checked={formData.includeArchived}
                      onCheckedChange={(checked) => setFormData({ ...formData, includeArchived: checked as boolean })}
                    />
                    <Label htmlFor="archived" className="font-normal cursor-pointer">{t("backup.includeArchived", "Include archived campaigns")}</Label>
                  </div>
                  <Button onClick={handleAddSchedule} className="w-full bg-[#1e3a5f] hover:bg-[#2d5080]">
                    {editingId ? t("common.update", "Update") : t("common.create", "Create")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.name", "Name")}</TableHead>
                <TableHead>{t("backup.frequency", "Frequency")}</TableHead>
                <TableHead>{t("backup.time", "Time")}</TableHead>
                <TableHead>{t("backup.formats", "Formats")}</TableHead>
                <TableHead>{t("backup.nextRun", "Next Run")}</TableHead>
                <TableHead>{t("common.status", "Status")}</TableHead>
                <TableHead>{t("common.actions", "Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map(schedule => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">{schedule.name}</TableCell>
                  <TableCell>{schedule.frequency}</TableCell>
                  <TableCell>{schedule.time}</TableCell>
                  <TableCell>{schedule.formats.join(", ")}</TableCell>
                  <TableCell>{schedule.nextRun ? format(new Date(schedule.nextRun), "MMM dd, HH:mm") : "-"}</TableCell>
                  <TableCell>
                    <Badge variant={schedule.status === "active" ? "default" : "secondary"}>
                      {schedule.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteSchedule(schedule.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle>{t("backup.history", "Backup History")}</CardTitle>
          <CardDescription>{t("backup.historyDesc", "Download or restore from previous backups")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.name", "Name")}</TableHead>
                <TableHead>{t("common.date", "Date")}</TableHead>
                <TableHead>{t("backup.size", "Size")}</TableHead>
                <TableHead>{t("backup.campaigns", "Campaigns")}</TableHead>
                <TableHead>{t("backup.tasks", "Tasks")}</TableHead>
                <TableHead>{t("common.status", "Status")}</TableHead>
                <TableHead>{t("common.actions", "Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map(backup => (
                <TableRow key={backup.id}>
                  <TableCell className="font-medium">{backup.name}</TableCell>
                  <TableCell>{format(backup.date, "MMM dd, yyyy HH:mm")}</TableCell>
                  <TableCell>{backup.size}</TableCell>
                  <TableCell>{backup.campaigns}</TableCell>
                  <TableCell>{backup.tasks}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {backup.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleDownloadBackup(backup)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleRestoreBackup(backup)}>
                        <Database className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Archive Old Campaigns */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <CardTitle>{t("backup.archiveOldCampaigns", "Archive Old Campaigns")}</CardTitle>
              <CardDescription>{t("backup.archiveDesc", "Automatically archive campaigns that are older than 90 days")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t("backup.campaignsToArchive", "Campaigns to archive")}</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("backup.spaceToFree", "Space to free")}</p>
                <p className="text-2xl font-bold">1.2 GB</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("backup.lastArchive", "Last archive")}</p>
                <p className="text-2xl font-bold">30 days ago</p>
              </div>
            </div>
            <Button onClick={handleArchiveOldCampaigns} className="w-full bg-yellow-600 hover:bg-yellow-700">
              <Archive className="w-4 h-4 ms-2" />
              {t("backup.archiveNow", "Archive Now")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
