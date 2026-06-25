import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Filter, X } from "lucide-react";
import { format, subDays } from "date-fns";

export interface AdvancedFiltersState {
  dateFrom?: string;
  dateTo?: string;
  budgetMin?: number;
  budgetMax?: number;
  roiMin?: number;
  roiMax?: number;
  platforms?: string[];
  status?: string[];
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: AdvancedFiltersState) => void;
  activeFiltersCount?: number;
}

const PLATFORMS = ["Facebook", "Instagram", "Google Ads", "TikTok", "LinkedIn", "Twitter", "YouTube"];
const STATUSES = ["Planned", "Active", "Paused", "Completed", "Archived"];

export default function AdvancedFilters({ onFiltersChange, activeFiltersCount = 0 }: AdvancedFiltersProps) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<AdvancedFiltersState>({
    dateFrom: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    dateTo: format(new Date(), "yyyy-MM-dd"),
    budgetMin: 0,
    budgetMax: 10000,
    roiMin: 0,
    roiMax: 1000,
    platforms: [],
    status: [],
  });

  const [open, setOpen] = useState(false);

  const handleDateFromChange = (value: string) => {
    const updated = { ...filters, dateFrom: value };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const handleDateToChange = (value: string) => {
    const updated = { ...filters, dateTo: value };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const handleBudgetChange = (value: number[]) => {
    const updated = { ...filters, budgetMin: value[0], budgetMax: value[1] };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const handleROIChange = (value: number[]) => {
    const updated = { ...filters, roiMin: value[0], roiMax: value[1] };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const handlePlatformToggle = (platform: string) => {
    const updated = {
      ...filters,
      platforms: filters.platforms?.includes(platform)
        ? filters.platforms.filter((p) => p !== platform)
        : [...(filters.platforms || []), platform],
    };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const handleStatusToggle = (status: string) => {
    const updated = {
      ...filters,
      status: filters.status?.includes(status)
        ? filters.status.filter((s) => s !== status)
        : [...(filters.status || []), status],
    };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const handleReset = () => {
    const defaultFilters: AdvancedFiltersState = {
      dateFrom: format(subDays(new Date(), 30), "yyyy-MM-dd"),
      dateTo: format(new Date(), "yyyy-MM-dd"),
      budgetMin: 0,
      budgetMax: 10000,
      roiMin: 0,
      roiMax: 1000,
      platforms: [],
      status: [],
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          {t("filters.advanced", "سينونات متقدمة")}
          {activeFiltersCount > 0 && (
            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("filters.advancedFilters", "السينونات المتقدمة")}</DialogTitle>
          <DialogDescription>
            {t("filters.customizeFilters", "خصص السينونات للبحث المتقدم عن الحملات")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Range */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t("filters.dateRange", "نطاق التاريخ")}</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateFrom" className="text-sm">{t("filters.from", "من")}</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom || ""}
                  onChange={(e) => handleDateFromChange(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="dateTo" className="text-sm">{t("filters.to", "إلى")}</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo || ""}
                  onChange={(e) => handleDateToChange(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Budget Range */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t("filters.budgetRange", "نطاق الميزانية")}</Label>
            <div className="space-y-2">
              <Slider
                value={[filters.budgetMin || 0, filters.budgetMax || 10000]}
                onValueChange={handleBudgetChange}
                min={0}
                max={50000}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>${filters.budgetMin || 0}</span>
                <span>${filters.budgetMax || 10000}</span>
              </div>
            </div>
          </div>

          {/* ROI Range */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t("filters.roiRange", "نطاق العائد على الاستثمار")}</Label>
            <div className="space-y-2">
              <Slider
                value={[filters.roiMin || 0, filters.roiMax || 1000]}
                onValueChange={handleROIChange}
                min={0}
                max={2000}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{filters.roiMin || 0}%</span>
                <span>{filters.roiMax || 1000}%</span>
              </div>
            </div>
          </div>

          {/* Platforms */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t("filters.platforms", "المنصات")}</Label>
            <div className="grid grid-cols-2 gap-3">
              {PLATFORMS.map((platform) => (
                <div key={platform} className="flex items-center space-x-2">
                  <Checkbox
                    id={`platform-${platform}`}
                    checked={filters.platforms?.includes(platform) || false}
                    onCheckedChange={() => handlePlatformToggle(platform)}
                  />
                  <Label htmlFor={`platform-${platform}`} className="font-normal cursor-pointer">
                    {platform}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t("filters.status", "الحالة")}</Label>
            <div className="grid grid-cols-2 gap-3">
              {STATUSES.map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={filters.status?.includes(status) || false}
                    onCheckedChange={() => handleStatusToggle(status)}
                  />
                  <Label htmlFor={`status-${status}`} className="font-normal cursor-pointer">
                    {status}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            <X className="w-4 h-4 ms-2" />
            {t("filters.reset", "إعادة تعيين")}
          </Button>
          <Button onClick={() => setOpen(false)} className="bg-[#1e3a5f] hover:bg-[#2d5080]">
            {t("filters.apply", "تطبيق")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
