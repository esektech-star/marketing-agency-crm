import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, clients, vendors, teamMembers, tasks, leads, transactions, campaigns, accessDetails, appUsers, documents } from "../drizzle/schema";
import { ENV } from './_core/env';

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
  return await db.select().from(accessDetails).orderBy(desc(accessDetails.createdAt));
}

export async function getAccessDetailById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(accessDetails).where(eq(accessDetails.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAccessDetail(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(accessDetails).values(data);
}

export async function updateAccessDetail(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(accessDetails).set(data).where(eq(accessDetails.id, id));
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

  return {
    activeClientsCount: clientsCount.length,
    pendingTasksCount: tasksCount.length,
    activeLeadsCount: leadsCount.length,
    totalRevenue,
    totalExpense,
    netProfit: totalRevenue - totalExpense,
    monthlyData,
    leadsBySource,
  };
}
