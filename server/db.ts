import { eq, desc, and, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, clients, vendors, subscriptions, teamMembers, tasks, leads, transactions, campaigns, accessDetails, appUsers, documents, invoices, clientPortalAccess } from "../drizzle/schema";
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
  return await db.select().from(teamMembers).orderBy(desc(teamMembers.createdAt));
}

export async function getTeamMemberById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(teamMembers).where(eq(teamMembers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

function normalizeTeamMember(data: any) {
  const out = { ...data };
  if (out.salary !== undefined && out.salary !== null) {
    out.salary = String(out.salary);
  }
  return out;
}

export async function createTeamMember(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(teamMembers).values(normalizeTeamMember(data));
}

export async function updateTeamMember(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(teamMembers).set(normalizeTeamMember(data)).where(eq(teamMembers.id, id));
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
  const allSubscriptions = await db.select().from(subscriptions);

  const totalRevenue = revenueTransactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
  const totalSubscriptionsCost = allSubscriptions.reduce((sum, s) => sum + parseFloat(s.monthlyAmount.toString()), 0);

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
  // نقطة التعادل = (المصروفات الثابتة الشهرية) / (هامش الربح)
  // المصروفات الثابتة = المنويات + متوسط الرواتب
  const team = await db.select().from(teamMembers);
  const totalSalaries = team.reduce((sum, m) => sum + parseFloat((m.salary || 0).toString()), 0);
  const monthlyFixedCosts = totalSubscriptionsCost + totalSalaries;
  
  // متوسط الهامش = (الإيرادات - المصروفات المتغيرة) / عدد العملاء
  // نستخدم نسبة بسيطة: إذا كان لدينا عملاء، نحسب متوسط الإيرادات لكل عميل
  const avgRevenuePerClient = clientsCount.length > 0 ? totalRevenue / clientsCount.length : 0;
  const breakEvenClients = avgRevenuePerClient > 0 ? Math.ceil(monthlyFixedCosts / avgRevenuePerClient) : 0;

  return {
    activeClientsCount: clientsCount.length,
    pendingTasksCount: tasksCount.length,
    activeLeadsCount: leadsCount.length,
    totalRevenue,
    totalExpense,
    totalSubscriptionsCost,
    totalSalaries,
    monthlyFixedCosts,
    breakEvenClients,
    netProfit: totalRevenue - totalExpense,
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
