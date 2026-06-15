export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

/**
 * أقسام التطبيق المتاحة للصلاحيات.
 * المدير (manager) يحصل تلقائياً على جميع الصلاحيات.
 * باقي الأدوار تُمنح صلاحيات محددة عبر مصفوفة permissions.
 */
export const APP_SECTIONS = [
  "dashboard",
  "clients",
  "vendors",
  "team",
  "tasks",
  "leads",
  "transactions",
  "campaigns",
  "reports",
  "documents",
  "accessDetails",
  "users",
] as const;

export type AppSection = (typeof APP_SECTIONS)[number];

/** الأقسام التي يراها أي موظف افتراضياً عند إنشائه */
export const DEFAULT_EMPLOYEE_SECTIONS: AppSection[] = [
  "dashboard",
  "tasks",
  "leads",
];

/**
 * هل يملك المستخدم صلاحية الوصول لقسم معيّن؟
 * المدير يرى كل شيء؛ غيره يعتمد على مصفوفة الصلاحيات.
 */
export function hasSectionAccess(
  role: string | undefined | null,
  permissions: string[] | undefined | null,
  section: string
): boolean {
  if (role === "manager") return true;
  if (section === "dashboard") return true; // لوحة التحكم متاحة للجميع
  return Array.isArray(permissions) && permissions.includes(section);
}
