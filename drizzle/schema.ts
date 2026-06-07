import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

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
  status: mysqlEnum("status", ["نشط", "معلق", "منتهي"]).default("نشط").notNull(),
  startDate: timestamp("startDate").notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
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
  status: mysqlEnum("status", ["نشط", "معلق", "غير نشط"]).default("نشط").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = typeof vendors.$inferInsert;

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
  joinDate: timestamp("joinDate").notNull(),
  status: mysqlEnum("status", ["نشط", "معطل", "منتهي"]).default("نشط").notNull(),
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
  assignedTo: int("assignedTo"),
  dueDate: timestamp("dueDate").notNull(),
  priority: mysqlEnum("priority", ["منخفضة", "متوسطة", "عالية", "حرجة"]).default("متوسطة").notNull(),
  status: mysqlEnum("status", ["معلقة", "قيد التنفيذ", "مكتملة", "ملغاة"]).default("معلقة").notNull(),
  relatedClient: int("relatedClient"),
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
  phone: varchar("phone", { length: 20 }),
  company: varchar("company", { length: 255 }),
  source: varchar("source", { length: 255 }).notNull(),
  stage: mysqlEnum("stage", ["جديد", "متابعة", "اهتمام", "عرض", "تفاوض", "مغلق"]).default("جديد").notNull(),
  status: mysqlEnum("status", ["نشط", "معطل", "مفقود"]).default("نشط").notNull(),
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
  type: mysqlEnum("type", ["إيراد", "مصروف"]).notNull(),
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
  status: mysqlEnum("status", ["مخطط", "نشط", "معلق", "منتهي"]).default("مخطط").notNull(),
  relatedClient: int("relatedClient"),
  description: text("description"),
  notes: text("notes"),
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
  role: mysqlEnum("role", ["مدير", "موظف", "مصمم", "محرر"]).default("موظف").notNull(),
  preferredLanguage: mysqlEnum("preferredLanguage", ["ar", "he", "en"]).default("ar").notNull(),
  status: mysqlEnum("status", ["نشط", "معطل"]).default("نشط").notNull(),
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
  fileName: varchar("fileName", { length: 500 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 500 }).notNull(),
  mimeType: varchar("mimeType", { length: 255 }),
  fileSize: int("fileSize"),
  category: varchar("category", { length: 255 }),
  relatedClient: int("relatedClient"),
  relatedCampaign: int("relatedCampaign"),
  uploadedBy: int("uploadedBy"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;
