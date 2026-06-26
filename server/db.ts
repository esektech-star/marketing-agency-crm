import { eq, desc, and, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, clients, vendors, subscriptions, teamMembers, tasks, leads, transactions, campaigns, accessDetails, appUsers, documents, invoices, clientPortalAccess, presenceTracking, PresenceTracking, InsertPresenceTracking, auditLogs, AuditLog, InsertAuditLog, proposals, Proposal, InsertProposal, whatsappMessages, WhatsappMessage, InsertWhatsappMessage, whatsappTemplates, WhatsappTemplate, InsertWhatsappTemplate, whatsappSettings, WhatsappSettings, InsertWhatsappSettings } from "../drizzle/schema";
import { ENV } from './_core/env';
import { encryptSecret, decryptSecret } from './crypto';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
      values.isApproved = true; // Owner is auto-approved
      updateSet.isApproved = true;
    }

    // Handle approval status
    if (user.isApproved !== undefined) {
      values.isApproved = user.isApproved;
      updateSet.isApproved = user.isApproved;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPendingUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).where(eq(users.isApproved, false)).orderBy(desc(users.createdAt));
}

export async function approveUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(users).set({ isApproved: true }).where(eq(users.id, userId));
}

export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(users).where(eq(users.id, userId));
}

// ==================== Clients ====================
export async function getClients() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(clients).orderBy(desc(clients.createdAt));
}

export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

function normalizeClient(data: any) {
  const out = { ...data };
  if (out.monthlyAmount !== undefined && out.monthlyAmount !== null) {
    out.monthlyAmount = String(out.monthlyAmount);
  }
  return out;
}

export async function createClient(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(clients).values(normalizeClient(data));
  return result;
}

export async function updateClient(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(clients).set(normalizeClient(data)).where(eq(clients.id, id));
}

export async function deleteClient(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(clients).where(eq(clients.id, id));
}

// ==================== Vendors ====================
export async function getVendors() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(vendors).orderBy(desc(vendors.createdAt));
}

export async function getVendorById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(vendors).where(eq(vendors.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createVendor(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(vendors).values(data);
}

export async function updateVendor(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(vendors).set(data).where(eq(vendors.id, id));
}

export async function deleteVendor(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(vendors).where(eq(vendors.id, id));
}

// ==================== Team Members ====================
export async function getTeamMembers() {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(teamMembers).orderBy(desc(teamMembers.createdAt));
  
  // Convert salary from string to number for all members
  return results.map(member => ({
    ...member,
    salary: member.salary !== null && member.salary !== undefined ? parseFloat(String(member.salary)) : null,
  }));
}

export async function getTeamMemberById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(teamMembers).where(eq(teamMembers.id, id)).limit(1);
  if (result.length === 0) return undefined;
  
  const member = result[0];
  // Convert salary from string to number if present
  const memberData = { ...member };
  if (memberData.salary !== null && memberData.salary !== undefined) {
    memberData.salary = parseFloat(String(memberData.salary)) as any;
  }
  return memberData;
}

function normalizeTeamMember(data: any) {
  const out = { ...data };
  // Ensure salary is a number if provided
  if (out.salary !== undefined && out.salary !== null) {
    const numSalary = typeof out.salary === 'string' ? parseFloat(out.salary) : out.salary;
    if (Number.isFinite(numSalary)) {
      out.salary = numSalary;
    } else {
      out.salary = null;
    }
  }
  // Ensure joinDate is a Date object
  if (out.joinDate && !(out.joinDate instanceof Date)) {
    out.joinDate = new Date(out.joinDate);
  }
  return out;
}

export async function createTeamMember(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Validate required fields
  if (!data.name || !data.name.trim()) {
    throw new Error("Team member name is required");
  }
  if (!data.role || !data.role.trim()) {
    throw new Error("Team member role is required");
  }
  if (!data.joinDate) {
    throw new Error("Join date is required");
  }
  
  const normalized = normalizeTeamMember(data);
  const result = await db.insert(teamMembers).values(normalized);
  
  // Return the created record
  const insertedId = (result as any)[0]?.insertId || (result as any).lastID || 0;
  return await getTeamMemberById(insertedId);
}

export async function updateTeamMember(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Validate that member exists
  const existing = await getTeamMemberById(id);
  if (!existing) {
    throw new Error("Team member not found");
  }
  
  // Validate required fields if provided
  if (data.name !== undefined && (!data.name || !data.name.trim())) {
    throw new Error("Team member name cannot be empty");
  }
  if (data.role !== undefined && (!data.role || !data.role.trim())) {
    throw new Error("Team member role cannot be empty");
  }
  
  const normalized = normalizeTeamMember(data);
  await db.update(teamMembers).set(normalized).where(eq(teamMembers.id, id));
  
  // Return the updated record
  return await getTeamMemberById(id);
}

export async function deleteTeamMember(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(teamMembers).where(eq(teamMembers.id, id));
}

// ==================== Tasks ====================
export async function getTasks() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(tasks).orderBy(desc(tasks.dueDate));
}

export async function getTaskById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createTask(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(tasks).values(data);
}

export async function updateTask(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(tasks).set(data).where(eq(tasks.id, id));
}

export async function deleteTask(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(tasks).where(eq(tasks.id, id));
}

// ==================== Leads ====================
export async function getLeads() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(leads).orderBy(desc(leads.createdAt));
}

export async function getLeadById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createLead(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(leads).values(data);
}

export async function updateLead(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(leads).set(data).where(eq(leads.id, id));
}

export async function deleteLead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(leads).where(eq(leads.id, id));
}

// ==================== Transactions ====================
export async function getTransactions() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(transactions).orderBy(desc(transactions.date));
}

export async function getTransactionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createTransaction(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(transactions).values(data);
}

export async function updateTransaction(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(transactions).set(data).where(eq(transactions.id, id));
}

export async function deleteTransaction(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(transactions).where(eq(transactions.id, id));
}

// ==================== Campaigns ====================
export async function getCampaigns() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
}

export async function getCampaignById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCampaign(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(campaigns).values(data);
}

export async function updateCampaign(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(campaigns).set(data).where(eq(campaigns.id, id));
}

export async function deleteCampaign(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(campaigns).where(eq(campaigns.id, id));
}

// ==================== Access Details ====================
export async function getAccessDetails() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(accessDetails).orderBy(desc(accessDetails.createdAt));
  return rows.map((r) => ({ ...r, password: decryptSecret(r.password) }));
}

export async function getAccessDetailById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(accessDetails).where(eq(accessDetails.id, id)).limit(1);
  if (result.length === 0) return undefined;
  const r = result[0];
  return { ...r, password: decryptSecret(r.password) };
}

export async function createAccessDetail(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const payload = { ...data, isEncrypted: true };
  if (payload.password !== undefined) payload.password = encryptSecret(payload.password);
  return await db.insert(accessDetails).values(payload);
}

export async function updateAccessDetail(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const payload = { ...data };
  if (payload.password !== undefined) {
    payload.password = encryptSecret(payload.password);
    payload.isEncrypted = true;
  }
  return await db.update(accessDetails).set(payload).where(eq(accessDetails.id, id));
}

export async function deleteAccessDetail(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(accessDetails).where(eq(accessDetails.id, id));
}

// ==================== App Users (إدارة المستخدمين) ====================
export async function getAppUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(appUsers).orderBy(desc(appUsers.createdAt));
}

export async function getAppUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(appUsers).where(eq(appUsers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAppUserByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(appUsers).where(eq(appUsers.username, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAppUser(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(appUsers).values(data);
}

export async function updateAppUser(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(appUsers).set(data).where(eq(appUsers.id, id));
}

export async function deleteAppUser(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(appUsers).where(eq(appUsers.id, id));
}

// ==================== Documents (الملفات والمستندات) ====================
export async function getDocuments() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(documents).orderBy(desc(documents.createdAt));
}

export async function getDocumentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createDocument(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(documents).values(data);
}

export async function updateDocument(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(documents).set(data).where(eq(documents.id, id));
}

export async function deleteDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(documents).where(eq(documents.id, id));
}

// ==================== Invoices (الفواتير) ====================
export async function getInvoices() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
}

export async function getInvoicesByClient(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(invoices).where(eq(invoices.relatedClient, clientId)).orderBy(desc(invoices.createdAt));
}

export async function createInvoice(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const payload = { ...data };
  if (typeof payload.amount === "number") payload.amount = payload.amount.toString();
  return await db.insert(invoices).values(payload);
}

export async function updateInvoice(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const payload = { ...data };
  if (typeof payload.amount === "number") payload.amount = payload.amount.toString();
  return await db.update(invoices).set(payload).where(eq(invoices.id, id));
}

export async function deleteInvoice(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(invoices).where(eq(invoices.id, id));
}

// ==================== Client Portal Access (بوابة العميل) ====================
export async function getPortalAccessList() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(clientPortalAccess).orderBy(desc(clientPortalAccess.createdAt));
}

export async function createPortalAccess(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(clientPortalAccess).values(data);
}

export async function deletePortalAccess(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(clientPortalAccess).where(eq(clientPortalAccess.id, id));
}

export async function getPortalAccessByToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(clientPortalAccess).where(eq(clientPortalAccess.accessToken, token)).limit(1);
  return rows[0];
}

/**
 * بيانات بوابة العميل: معلومات العميل، حملاته، فواتيره، وملفاته (غير الداخلية فقط)
 * مع احترام أعلام الصلاحيات على رابط الوصول.
 */
export async function getClientPortalData(token: string) {
  const db = await getDb();
  if (!db) return null;
  const access = await getPortalAccessByToken(token);
  if (!access) return null;
  if (access.expiresAt && new Date(access.expiresAt).getTime() < Date.now()) {
    return { expired: true } as const;
  }
  const clientRows = await db.select().from(clients).where(eq(clients.id, access.relatedClient)).limit(1);
  const client = clientRows[0];
  if (!client) return null;

  const clientCampaigns = access.canViewCampaigns
    ? await db.select().from(campaigns).where(eq(campaigns.relatedClient, access.relatedClient)).orderBy(desc(campaigns.createdAt))
    : [];
  const clientInvoices = access.canViewInvoices
    ? await db.select().from(invoices).where(eq(invoices.relatedClient, access.relatedClient)).orderBy(desc(invoices.createdAt))
    : [];
  // الملفات غير الداخلية فقط (لا تُعرض الملفات الداخلية للعميل)
  const clientFiles = access.canDownloadFiles
    ? (await db.select().from(documents).where(eq(documents.relatedClient, access.relatedClient)).orderBy(desc(documents.createdAt))).filter((d: any) => !d.isInternal)
    : [];

  return {
    expired: false,
    client: { id: client.id, name: client.name, serviceType: client.serviceType, clientCode: (client as any).clientCode ?? null },
    permissions: {
      canViewCampaigns: access.canViewCampaigns,
      canViewInvoices: access.canViewInvoices,
      canDownloadFiles: access.canDownloadFiles,
    },
    campaigns: clientCampaigns,
    invoices: clientInvoices,
    files: clientFiles,
  };
}

// ==================== Dashboard Statistics ====================
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;

  const clientsCount = await db.select().from(clients).where(eq(clients.status, "active"));
  const tasksCount = await db.select().from(tasks).where(eq(tasks.status, "pending"));
  const leadsCount = await db.select().from(leads).where(eq(leads.status, "active"));
  
  const revenueTransactions = await db.select().from(transactions).where(eq(transactions.type, "revenue"));
  const expenseTransactions = await db.select().from(transactions).where(eq(transactions.type, "expense"));

  const totalRevenue = revenueTransactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  // بيانات شهرية للرسوم البيانية
  const allTransactions = await db.select().from(transactions);
  const monthlyMap: Record<string, { revenue: number; expense: number }> = {};
  for (const tr of allTransactions) {
    const d = tr.date ? new Date(tr.date) : new Date();
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthlyMap[key]) monthlyMap[key] = { revenue: 0, expense: 0 };
    const amt = parseFloat(tr.amount.toString());
    if (tr.type === "revenue") monthlyMap[key].revenue += amt;
    else monthlyMap[key].expense += amt;
  }
  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, vals]) => ({ month, revenue: vals.revenue, expense: vals.expense }));

  // توزيع الليدز حسب المصدر
  const allLeads = await db.select().from(leads);
  const sourceMap: Record<string, number> = {};
  for (const ld of allLeads) {
    const src = ld.source || "-";
    sourceMap[src] = (sourceMap[src] || 0) + 1;
  }
  const leadsBySource = Object.entries(sourceMap).map(([name, value]) => ({ name, value }));

  // حساب نقطة التعادل (Break-even point)
  // نقطة التعادل = إجمالي المصروفات الثابتة / (سعر البيع - التكلفة المتغيرة)
  // تقدير بسيط: نقطة التعادل = إجمالي المصروفات
  const breakEvenPoint = totalExpense;
  
  // حساب هامش الربح
  const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalExpense) / totalRevenue) * 100 : 0;

  return {
    activeClientsCount: clientsCount.length,
    pendingTasksCount: tasksCount.length,
    activeLeadsCount: leadsCount.length,
    totalRevenue,
    totalExpense,
    netProfit: totalRevenue - totalExpense,
    breakEvenPoint,
    profitMargin,
    monthlyData,
    leadsBySource,
  };
}


// ==================== Payment Reminders ====================
export async function updateClientPaymentTaskUid(clientId: number, taskUid: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(clients)
    .set({ paymentReminderTaskUid: taskUid })
    .where(eq(clients.id, clientId));
}

export async function getClientsWithPaymentToday() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const today = new Date().getDate();
  return await db.select()
    .from(clients)
    .where(and(
      eq(clients.status, "active"),
      eq(clients.paymentDate, today)
    ));
}


// ==================== Subscriptions (المنويات) ====================
export async function getSubscriptions() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt));
}

export async function getSubscriptionById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(subscriptions).where(eq(subscriptions.id, id)).then(r => r[0]);
}

export async function createSubscription(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Encrypt password if provided
  if (data.password) {
    data.password = encryptSecret(data.password);
    data.isEncrypted = true;
  }
  return await db.insert(subscriptions).values(data);
}

export async function updateSubscription(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Encrypt password if provided
  if (data.password) {
    data.password = encryptSecret(data.password);
    data.isEncrypted = true;
  }
  return await db.update(subscriptions).set(data).where(eq(subscriptions.id, id));
}

export async function deleteSubscription(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(subscriptions).where(eq(subscriptions.id, id));
}

export async function getSubscriptionsByStatus(status: 'active' | 'inactive' | 'expired') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(subscriptions).where(eq(subscriptions.status, status));
}

export async function getTotalMonthlySubscriptionCost() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select()
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"));
  return result.reduce((sum, sub) => sum + (parseFloat(sub.monthlyAmount as any) || 0), 0);
}

// ==================== SEARCH ====================
export async function globalSearch(query: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const searchTerm = `%${query}%`;
  
  // Search clients
  const clientResults = await db.select()
    .from(clients)
    .where(sql`${clients.name} LIKE ${searchTerm} OR ${clients.email} LIKE ${searchTerm} OR ${clients.phone} LIKE ${searchTerm}`)
    .limit(5);
  
  // Search tasks
  const taskResults = await db.select()
    .from(tasks)
    .where(sql`${tasks.title} LIKE ${searchTerm} OR ${tasks.description} LIKE ${searchTerm}`)
    .limit(5);
  
  // Search leads
  const leadResults = await db.select()
    .from(leads)
    .where(sql`${leads.name} LIKE ${searchTerm} OR ${leads.email} LIKE ${searchTerm} OR ${leads.phone} LIKE ${searchTerm}`)
    .limit(5);
  
  // Search transactions
  const transactionResults = await db.select()
    .from(transactions)
    .where(sql`${transactions.type} LIKE ${searchTerm} OR ${transactions.description} LIKE ${searchTerm}`)
    .limit(5);
  
  // Search campaigns
  const campaignResults = await db.select()
    .from(campaigns)
    .where(sql`${campaigns.name} LIKE ${searchTerm} OR ${campaigns.description} LIKE ${searchTerm}`)
    .limit(5);
  
  // Search invoices
  const invoiceResults = await db.select()
    .from(invoices)
    .where(sql`${invoices.invoiceNumber} LIKE ${searchTerm}`)
    .limit(5);
  
  return {
    clients: clientResults.map(c => ({
      id: c.id,
      type: 'client',
      title: c.name,
      subtitle: c.email,
      path: `/clients`,
    })),
    tasks: taskResults.map(t => ({
      id: t.id,
      type: 'task',
      title: t.title,
      subtitle: t.description,
      path: `/tasks`,
    })),
    leads: leadResults.map(l => ({
      id: l.id,
      type: 'lead',
      title: l.name,
      subtitle: l.email,
      path: `/leads`,
    })),
    transactions: transactionResults.map(t => ({
      id: t.id,
      type: 'transaction',
      title: `${t.type}: ${t.description}`,
      subtitle: `₪${t.amount}`,
      path: `/transactions`,
    })),
    campaigns: campaignResults.map(c => ({
      id: c.id,
      type: 'campaign',
      title: c.name,
      subtitle: c.description,
      path: `/campaigns`,
    })),
    invoices: invoiceResults.map(i => ({
      id: i.id,
      type: 'invoice',
      title: `Invoice #${i.invoiceNumber}`,
      subtitle: `₪${i.amount}`,
      path: `/invoices`,
    })),
  };
}



/**
 * تحديث حالة الوجود للمستخدم
 */
export async function updateUserPresence(userId: number, status: "online" | "away" | "offline", sessionId?: string, deviceInfo?: any): Promise<PresenceTracking | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update presence: database not available");
    return null;
  }

  try {
    // البحث عن وجود سابق
    const existing = await db
      .select()
      .from(presenceTracking)
      .where(eq(presenceTracking.userId, userId))
      .limit(1)
      .then(rows => rows[0] || null);

    if (existing) {
      // تحديث السجل الموجود
      const updated = await db
        .update(presenceTracking)
        .set({
          status,
          lastActivityAt: new Date(),
          lastSeenAt: status === "offline" ? new Date() : existing.lastSeenAt,
          sessionId: sessionId || existing.sessionId,
          deviceInfo: deviceInfo || existing.deviceInfo,
        })
        .where(eq(presenceTracking.userId, userId));
      
      return existing;
    } else {
      // إنشاء سجل جديد
      await db.insert(presenceTracking).values({
        userId,
        status,
        sessionId: sessionId || "",
        deviceInfo: deviceInfo || null,
      });

      return {
        id: 0,
        userId,
        status,
        lastActivityAt: new Date(),
        lastSeenAt: new Date(),
        sessionId: sessionId || "",
        deviceInfo: deviceInfo || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  } catch (error) {
    console.error("[Database] Error updating presence:", error);
    return null;
  }
}

/**
 * الحصول على حالة الوجود للمستخدم
 */
export async function getUserPresence(userId: number): Promise<PresenceTracking | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get presence: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(presenceTracking)
      .where(eq(presenceTracking.userId, userId))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Error getting presence:", error);
    return null;
  }
}

/**
 * الحصول على حالات الوجود لجميع أعضاء الفريق
 */
export async function getAllPresence(): Promise<PresenceTracking[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get all presence: database not available");
    return [];
  }

  try {
    return await db.select().from(presenceTracking);
  } catch (error) {
    console.error("[Database] Error getting all presence:", error);
    return [];
  }
}

/**
 * تعيين المستخدم كـ offline عند تسجيل الخروج
 */
export async function setUserOffline(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot set offline: database not available");
    return;
  }

  try {
    await db
      .update(presenceTracking)
      .set({
        status: "offline",
        lastSeenAt: new Date(),
      })
      .where(eq(presenceTracking.userId, userId));
  } catch (error) {
    console.error("[Database] Error setting offline:", error);
  }
}

/**
 * تنظيف جلسات المستخدمين القدماء (أكثر من ساعة بدون نشاط)
 */
export async function cleanupInactivePresence(inactiveMinutes: number = 60): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot cleanup presence: database not available");
    return 0;
  }

  try {
    const cutoffTime = new Date(Date.now() - inactiveMinutes * 60 * 1000);
    
    const result = await db
      .update(presenceTracking)
      .set({ status: "offline" })
      .where(
        and(
          eq(presenceTracking.status, "online"),
          sql`${presenceTracking.lastActivityAt} < ${cutoffTime}`
        )
      );

    return 0; // Drizzle doesn't return affected rows count, so we return 0
  } catch (error) {
    console.error("[Database] Error cleaning up presence:", error);
    return 0;
  }
}


/**
 * تسجيل إجراء تدقيق
 */
export async function logAuditAction(
  userId: number,
  action: "create" | "update" | "delete" | "view" | "export" | "login" | "logout",
  entityType: string,
  entityId?: number,
  entityName?: string,
  changes?: any,
  ipAddress?: string,
  userAgent?: string,
  status: "success" | "failed" = "success",
  errorMessage?: string
): Promise<AuditLog | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot log audit action: database not available");
    return null;
  }

  try {
    await db.insert(auditLogs).values({
      userId,
      action,
      entityType,
      entityId: entityId || null,
      entityName: entityName || null,
      changes: changes ? JSON.stringify(changes) : null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      status,
      errorMessage: errorMessage || null,
    });

    return {
      id: 0,
      userId,
      action,
      entityType,
      entityId: entityId || null,
      entityName: entityName || null,
      changes: changes ? JSON.stringify(changes) : null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      status,
      errorMessage: errorMessage || null,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error("[Database] Error logging audit action:", error);
    return null;
  }
}

/**
 * الحصول على سجلات التدقيق
 */
export async function getAuditLogs(
  limit: number = 100,
  offset: number = 0,
  filters?: {
    userId?: number;
    action?: string;
    entityType?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<AuditLog[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get audit logs: database not available");
    return [];
  }

  try {
    const conditions: any[] = [];
    
    if (filters?.userId) {
      conditions.push(eq(auditLogs.userId, filters.userId));
    }
    if (filters?.action) {
      conditions.push(eq(auditLogs.action, filters.action as any));
    }
    if (filters?.entityType) {
      conditions.push(eq(auditLogs.entityType, filters.entityType));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const query = db.select().from(auditLogs);
    const result = whereClause 
      ? await query.where(whereClause).orderBy(desc(auditLogs.createdAt)).limit(limit).offset(offset)
      : await query.orderBy(desc(auditLogs.createdAt)).limit(limit).offset(offset);
    
    return result;
  } catch (error) {
    console.error("[Database] Error getting audit logs:", error);
    return [];
  }
}

/**
 * الحصول على سجلات التدقيق لكيان معين
 */
export async function getEntityAuditLogs(
  entityType: string,
  entityId: number,
  limit: number = 50
): Promise<AuditLog[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get entity audit logs: database not available");
    return [];
  }

  try {
    return await db
      .select()
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.entityType, entityType),
          eq(auditLogs.entityId, entityId)
        )
      )
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("[Database] Error getting entity audit logs:", error);
    return [];
  }
}

/**
 * الحصول على سجلات التدقيق لمستخدم معين
 */
export async function getUserAuditLogs(
  userId: number,
  limit: number = 100,
  offset: number = 0
): Promise<AuditLog[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user audit logs: database not available");
    return [];
  }

  try {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);
  } catch (error) {
    console.error("[Database] Error getting user audit logs:", error);
    return [];
  }
}

/**
 * عد سجلات التدقيق
 */
export async function countAuditLogs(filters?: {
  userId?: number;
  action?: string;
  entityType?: string;
}): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot count audit logs: database not available");
    return 0;
  }

  try {
    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(auditLogs);
    
    return result[0]?.count || 0;
  } catch (error) {
    console.error("[Database] Error counting audit logs:", error);
    return 0;
  }
}

/**
 * حذف سجلات التدقيق القديمة (أكثر من عدد أيام معين)
 */
export async function deleteOldAuditLogs(daysToKeep: number = 90): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete old audit logs: database not available");
    return;
  }

  try {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    
    await db
      .delete(auditLogs)
      .where(sql`${auditLogs.createdAt} < ${cutoffDate}`);
  } catch (error) {
    console.error("[Database] Error deleting old audit logs:", error);
  }
}


// ==================== Client Portal Messages ====================
/**
 * Create a portal message between client and agency
 */
export async function createPortalMessage(data: {
  clientId: number;
  message: string;
  senderType: "client" | "agency";
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create portal message: database not available");
    return null;
  }
  try {
    // For now, we'll store in a simple way - in production, you'd have a portalMessages table
    console.log("[Portal] New message from", data.senderType, "for client", data.clientId, ":", data.message);
    return { id: Date.now(), ...data, createdAt: new Date() };
  } catch (error) {
    console.error("[Database] Error creating portal message:", error);
    return null;
  }
}

/**
 * Get portal messages for a client
 */
export async function getPortalMessages(clientId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get portal messages: database not available");
    return [];
  }
  try {
    // For now, return empty - in production, query from portalMessages table
    return [];
  } catch (error) {
    console.error("[Database] Error getting portal messages:", error);
    return [];
  }
}

/**
 * Get tasks associated with a client
 */
export async function getTasksByClient(clientId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get client tasks: database not available");
    return [];
  }
  try {
    const result = await db
      .select()
      .from(tasks)
      .where(eq(tasks.relatedClient, clientId))
      .limit(50);
    return result;
  } catch (error) {
    console.error("[Database] Error getting client tasks:", error);
    return [];
  }
}

/**
 * Create a portal file upload record
 */
export async function createPortalFileUpload(data: {
  clientId: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create portal file upload: database not available");
    return null;
  }
  try {
    console.log("[Portal] File upload from client", data.clientId, ":", data.fileName);
    return { id: Date.now(), ...data, uploadedAt: new Date() };
  } catch (error) {
    console.error("[Database] Error creating portal file upload:", error);
    return null;
  }
}


// ==================== Proposals ====================
/**
 * Create a new proposal
 */
export async function createProposal(data: InsertProposal) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create proposal: database not available");
    return null;
  }
  try {
    const result = await db.insert(proposals).values(data);
    return { id: result[0], ...data };
  } catch (error) {
    console.error("[Database] Error creating proposal:", error);
    return null;
  }
}

/**
 * Get proposal by ID
 */
export async function getProposalById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get proposal: database not available");
    return null;
  }
  try {
    const result = await db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Error getting proposal:", error);
    return null;
  }
}

/**
 * Get proposal by share token
 */
export async function getProposalByShareToken(token: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get proposal: database not available");
    return null;
  }
  try {
    const result = await db.select().from(proposals).where(eq(proposals.shareToken, token)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Error getting proposal by token:", error);
    return null;
  }
}

/**
 * Get proposals for a client
 */
export async function getProposalsByClient(clientId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get proposals: database not available");
    return [];
  }
  try {
    const result = await db
      .select()
      .from(proposals)
      .where(eq(proposals.clientId, clientId))
      .orderBy(desc(proposals.createdAt))
      .limit(50);
    return result;
  } catch (error) {
    console.error("[Database] Error getting proposals:", error);
    return [];
  }
}

/**
 * Update proposal status
 */
export async function updateProposalStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update proposal: database not available");
    return null;
  }
  try {
    const updateData: any = { status };
    if (status === "viewed") updateData.viewedAt = new Date();
    if (status === "accepted") updateData.acceptedAt = new Date();
    
    await db.update(proposals).set(updateData).where(eq(proposals.id, id));
    return await getProposalById(id);
  } catch (error) {
    console.error("[Database] Error updating proposal:", error);
    return null;
  }
}

/**
 * Update proposal PDF URL
 */
export async function updateProposalPdfUrl(id: number, pdfUrl: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update proposal: database not available");
    return null;
  }
  try {
    await db.update(proposals).set({ pdfUrl }).where(eq(proposals.id, id));
    return await getProposalById(id);
  } catch (error) {
    console.error("[Database] Error updating proposal PDF URL:", error);
    return null;
  }
}


// ==================== WhatsApp Messages ====================
/**
 * Send a WhatsApp message
 */
export async function sendWhatsappMessage(data: InsertWhatsappMessage) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot send WhatsApp message: database not available");
    return null;
  }
  try {
    const result = await db.insert(whatsappMessages).values(data);
    return { id: result[0], ...data };
  } catch (error) {
    console.error("[Database] Error sending WhatsApp message:", error);
    return null;
  }
}

/**
 * Get WhatsApp messages for a client
 */
export async function getClientWhatsappMessages(clientId: number, limit = 50) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get WhatsApp messages: database not available");
    return [];
  }
  try {
    const result = await db
      .select()
      .from(whatsappMessages)
      .where(eq(whatsappMessages.clientId, clientId))
      .orderBy(desc(whatsappMessages.createdAt))
      .limit(limit);
    return result;
  } catch (error) {
    console.error("[Database] Error getting WhatsApp messages:", error);
    return [];
  }
}

/**
 * Update WhatsApp message status
 */
export async function updateWhatsappMessageStatus(id: number, status: string, deliveredAt?: Date, readAt?: Date) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update WhatsApp message: database not available");
    return null;
  }
  try {
    const updateData: any = { status };
    if (deliveredAt) updateData.deliveredAt = deliveredAt;
    if (readAt) updateData.readAt = readAt;
    
    await db.update(whatsappMessages).set(updateData).where(eq(whatsappMessages.id, id));
    return await db.select().from(whatsappMessages).where(eq(whatsappMessages.id, id)).limit(1).then(r => r[0]);
  } catch (error) {
    console.error("[Database] Error updating WhatsApp message:", error);
    return null;
  }
}

// ==================== WhatsApp Templates ====================
/**
 * Create a WhatsApp template
 */
export async function createWhatsappTemplate(data: InsertWhatsappTemplate) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create WhatsApp template: database not available");
    return null;
  }
  try {
    const result = await db.insert(whatsappTemplates).values(data);
    return { id: result[0], ...data };
  } catch (error) {
    console.error("[Database] Error creating WhatsApp template:", error);
    return null;
  }
}

/**
 * Get all WhatsApp templates
 */
export async function getWhatsappTemplates(category?: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get WhatsApp templates: database not available");
    return [];
  }
  try {
    let query = db.select().from(whatsappTemplates).where(eq(whatsappTemplates.isActive, true));
    if (category) {
      query = db.select().from(whatsappTemplates).where(and(eq(whatsappTemplates.isActive, true), eq(whatsappTemplates.category, category as any)));
    }
    const result = await query;
    return result;
  } catch (error) {
    console.error("[Database] Error getting WhatsApp templates:", error);
    return [];
  }
}

/**
 * Get WhatsApp template by name
 */
export async function getWhatsappTemplateByName(name: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get WhatsApp template: database not available");
    return null;
  }
  try {
    const result = await db.select().from(whatsappTemplates).where(eq(whatsappTemplates.name, name)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Error getting WhatsApp template:", error);
    return null;
  }
}

// ==================== WhatsApp Settings ====================
/**
 * Get WhatsApp settings
 */
export async function getWhatsappSettings() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get WhatsApp settings: database not available");
    return null;
  }
  try {
    const result = await db.select().from(whatsappSettings).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Error getting WhatsApp settings:", error);
    return null;
  }
}

/**
 * Update WhatsApp settings
 */
export async function updateWhatsappSettings(data: Partial<WhatsappSettings>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update WhatsApp settings: database not available");
    return null;
  }
  try {
    const existing = await getWhatsappSettings();
    if (existing) {
      await db.update(whatsappSettings).set(data).where(eq(whatsappSettings.id, existing.id));
      return await getWhatsappSettings();
    } else {
      const result = await db.insert(whatsappSettings).values(data as any);
      return { id: result[0], ...data };
    }
  } catch (error) {
    console.error("[Database] Error updating WhatsApp settings:", error);
    return null;
  }
}
