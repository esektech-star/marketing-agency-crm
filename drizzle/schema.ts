import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * جدول المستخدمين الأساسي
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * جدول العملاء النشطين
 */
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  serviceType: varchar("serviceType", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["active", "pending", "completed"]).default("active").notNull(),
  startDate: timestamp("startDate").notNull(),
  clientCode: varchar("clientCode", { length: 50 }), // كود العميل الفريد
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  monthlyAmount: decimal("monthlyAmount", { precision: 12, scale: 2 }),
  paymentDate: int("paymentDate"), // يوم الدفع الشهري (1-31)
  source: varchar("source", { length: 255 }), // مصدر اكتساب العميل
  paymentReminderTaskUid: varchar("paymentReminderTaskUid", { length: 65 }), // معرّف مهمة التذكير المجدولة
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

/**
 * جدول الموردين
 */
export const vendors = mysqlTable("vendors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  serviceType: varchar("serviceType", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 255 }),
  status: mysqlEnum("status", ["active", "pending", "inactive"]).default("active").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = typeof vendors.$inferInsert;

/**
 * جدول المنويات (الاشتراكات في التطبيقات والخدمات)
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  softwareName: varchar("softwareName", { length: 255 }).notNull(),
  monthlyAmount: decimal("monthlyAmount", { precision: 12, scale: 2 }).notNull(),
  purpose: text("purpose"),
  website: varchar("website", { length: 255 }),
  username: varchar("username", { length: 255 }),
  password: text("password"),
  isEncrypted: boolean("isEncrypted").default(false),
  renewalDate: int("renewalDate"),
  status: mysqlEnum("status", ["active", "inactive", "expired"]).default("active").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * جدول أعضاء الفريق
 */
export const teamMembers = mysqlTable("teamMembers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  position: varchar("position", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  department: varchar("department", { length: 255 }),
  salary: decimal("salary", { precision: 12, scale: 2 }),
  joinDate: timestamp("joinDate").notNull(),
  status: mysqlEnum("status", ["active", "disabled", "completed"]).default("active").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

/**
 * جدول المهام
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  assignedTo: json("assignedTo"), // مصفوفة من معرفات المستخدمين
  dueDate: timestamp("dueDate").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "cancelled"]).default("pending").notNull(),
  relatedClient: int("relatedClient"),
  attachments: json("attachments"), // مصفوفة من الملفات المرفقة [{url, key, name, mimeType}]
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * جدول العملاء المحتملين (Leads)
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }), // بصيغة +972123456789
  company: varchar("company", { length: 255 }),
  source: varchar("source", { length: 255 }).notNull(),
  stage: mysqlEnum("stage", ["new", "follow_up", "interest", "proposal", "negotiation", "closed"]).default("new").notNull(),
  status: mysqlEnum("status", ["active", "disabled", "lost"]).default("active").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }),
  notes: text("notes"),
  assignedTo: int("assignedTo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * جدول الحركات المالية (الإيرادات والمصروفات)
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["revenue", "expense"]).notNull(),
  category: varchar("category", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  relatedClient: int("relatedClient"),
  relatedVendor: int("relatedVendor"),
  month: varchar("month", { length: 10 }).notNull(),
  year: int("year").notNull(),
  notes: text("notes"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * جدول الحملات الإعلانية
 */
export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  platform: varchar("platform", { length: 255 }).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  budget: decimal("budget", { precision: 12, scale: 2 }),
  status: mysqlEnum("status", ["planned", "active", "paused", "completed"]).default("planned").notNull(),
  relatedClient: int("relatedClient"),
  description: text("description"),
  notes: text("notes"),
  postLink: text("postLink"),
  mediaUrl: text("mediaUrl"),
  mediaKey: varchar("mediaKey", { length: 512 }),
  mediaType: varchar("mediaType", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

/**
 * جدول تفاصيل الوصول (بيانات الدخول الحساسة)
 */
export const accessDetails = mysqlTable("accessDetails", {
  id: int("id").autoincrement().primaryKey(),
  platform: varchar("platform", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }).notNull(),
  password: text("password").notNull(),
  email: varchar("email", { length: 320 }),
  url: varchar("url", { length: 500 }),
  relatedClient: int("relatedClient"),
  notes: text("notes"),
  isEncrypted: boolean("isEncrypted").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AccessDetail = typeof accessDetails.$inferSelect;
export type InsertAccessDetail = typeof accessDetails.$inferInsert;

/**
 * جدول المستخدمين المخصصين (لإدارة دخول الفريق باسم مستخدم وكلمة مرور)
 */
export const appUsers = mysqlTable("appUsers", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  role: mysqlEnum("role", ["manager", "employee", "designer", "editor"]).default("employee").notNull(),
  permissions: json("permissions"), // صلاحيات مخصصة
  preferredLanguage: mysqlEnum("preferredLanguage", ["ar", "he", "en"]).default("ar").notNull(),
  status: mysqlEnum("status", ["active", "disabled"]).default("active").notNull(),
  lastLogin: timestamp("lastLogin"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AppUser = typeof appUsers.$inferSelect;
export type InsertAppUser = typeof appUsers.$inferInsert;

/**
 * جدول الملفات والمستندات (مخزنة على S3)
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 500 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"),
  category: varchar("category", { length: 100 }),
  relatedClient: int("relatedClient"),
  relatedCampaign: int("relatedCampaign"),
  isInternal: boolean("isInternal").default(false).notNull(), // ملف داخلي للوكالة (غير مرئي للعميل)
  uploadedBy: int("uploadedBy"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * جدول الفواتير
 */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(),
  relatedClient: int("relatedClient").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  dueDate: timestamp("dueDate").notNull(),
  status: mysqlEnum("status", ["pending", "paid", "overdue"]).default("pending").notNull(),
  fileKey: varchar("fileKey", { length: 500 }), // ملف الفاتورة
  fileUrl: varchar("fileUrl", { length: 500 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

/**
 * جدول بوابة العميل (Client Portal Access)
 */
export const clientPortalAccess = mysqlTable("clientPortalAccess", {
  id: int("id").autoincrement().primaryKey(),
  relatedClient: int("relatedClient").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  accessToken: varchar("accessToken", { length: 500 }).notNull(),
  expiresAt: timestamp("expiresAt"),
  canViewCampaigns: boolean("canViewCampaigns").default(true).notNull(),
  canViewInvoices: boolean("canViewInvoices").default(true).notNull(),
  canDownloadFiles: boolean("canDownloadFiles").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClientPortalAccess = typeof clientPortalAccess.$inferSelect;
export type InsertClientPortalAccess = typeof clientPortalAccess.$inferInsert;

/**
 * جدول التنبيهات والتذكيرات
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["task_due", "payment_reminder", "task_assigned", "campaign_update"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  relatedTaskId: int("relatedTaskId"),
  relatedClientId: int("relatedClientId"),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;


/**
 * جدول مؤشرات الأداء الرئيسية (KPI)
 * يتم تحديثه تلقائياً عند إضافة/تعديل العمليات المالية
 */
export const kpis = mysqlTable("kpis", {
  id: int("id").autoincrement().primaryKey(),
  year: int("year").notNull(),
  month: int("month").notNull(), // 1-12
  monthlyRevenue: decimal("monthlyRevenue", { precision: 12, scale: 2 }).default("0").notNull(),
  quarterlyRevenue: decimal("quarterlyRevenue", { precision: 12, scale: 2 }).default("0").notNull(),
  yearlyRevenue: decimal("yearlyRevenue", { precision: 12, scale: 2 }).default("0").notNull(),
  monthlyChangePercent: decimal("monthlyChangePercent", { precision: 8, scale: 4 }).default("0").notNull(), // % שינוי חודשי
  yearOverYearChangePercent: decimal("yearOverYearChangePercent", { precision: 8, scale: 4 }).default("0").notNull(), // % שינוי שנתי
  quarterlyChangePercent: decimal("quarterlyChangePercent", { precision: 8, scale: 4 }).default("0").notNull(), // % שינוי רבעוני
  activeClientsCount: int("activeClientsCount").default(0).notNull(),
  totalExpenses: decimal("totalExpenses", { precision: 12, scale: 2 }).default("0").notNull(),
  netProfit: decimal("netProfit", { precision: 12, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KPI = typeof kpis.$inferSelect;
export type InsertKPI = typeof kpis.$inferInsert;
