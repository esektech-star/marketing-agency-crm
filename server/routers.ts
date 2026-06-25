import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { storagePut } from "./storage";
import { generateClientInsights, generateCampaignRecommendations } from "./aiInsights";
import { chatWithAI } from "./aiChat";
import { generatePerformanceReport, generateClientReport } from "./aiReport";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    getPendingUsers: adminProcedure.query(async () => {
      return await db.getPendingUsers();
    }),
    approveUser: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        return await db.approveUser(input.userId);
      }),
    rejectUser: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteUser(input.userId);
      }),
  }),

  // ==================== Dashboard ====================
  dashboard: router({
    getStats: protectedProcedure.query(async () => {
      return await db.getDashboardStats();
    }),
    search: protectedProcedure
      .input(z.object({ query: z.string().min(1).max(100) }))
      .query(async ({ input }) => {
        return await db.globalSearch(input.query);
      }),
  }),

  // ==================== Clients ====================
  clients: router({
    list: protectedProcedure.query(async () => {
      return await db.getClients();
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getClientById(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        serviceType: z.string(),
        status: z.enum(["active", "pending", "completed"]),
        startDate: z.date(),
        clientCode: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        monthlyAmount: z.number().optional(),
        paymentDate: z.string().optional(),
        source: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createClient(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        serviceType: z.string().optional(),
        status: z.enum(["active", "pending", "completed"]).optional(),
        clientCode: z.string().optional().nullable(),
        phone: z.string().optional(),
        email: z.string().optional(),
        monthlyAmount: z.number().optional().nullable(),
        paymentDate: z.string().optional().nullable(),
        source: z.string().optional().nullable(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateClient(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteClient(input.id);
      }),
  }),

  // ==================== Vendors ====================
  vendors: router({
    list: protectedProcedure.query(async () => {
      return await db.getVendors();
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getVendorById(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        serviceType: z.string(),
        phone: z.string().optional(),
        email: z.string().optional(),
        website: z.string().optional(),
        status: z.enum(["active", "pending", "inactive"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createVendor(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        serviceType: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        website: z.string().optional(),
        status: z.enum(["active", "pending", "inactive"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateVendor(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteVendor(input.id);
      }),
  }),

  // ==================== Team Members ====================
  teamMembers: router({
    list: protectedProcedure.query(async () => {
      return await db.getTeamMembers();
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getTeamMemberById(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        role: z.string(),
        position: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        department: z.string().optional(),
        salary: z.number().optional(),
        joinDate: z.date(),
        status: z.enum(["active", "disabled", "completed"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createTeamMember(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        role: z.string().optional(),
        position: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        department: z.string().optional(),
        salary: z.number().optional(),
        status: z.enum(["active", "disabled", "completed"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateTeamMember(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteTeamMember(input.id);
      }),
  }),

  // ==================== Tasks ====================
  tasks: router({
    list: protectedProcedure.query(async () => {
      return await db.getTasks();
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getTaskById(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        assignedTo: z.array(z.number()).optional(),
        dueDate: z.date(),
        priority: z.enum(["low", "medium", "high", "critical"]),
        status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
        relatedClient: z.number().optional(),
        attachments: z.array(z.object({
          url: z.string(),
          key: z.string(),
          name: z.string(),
          mimeType: z.string().optional(),
        })).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createTask({
          ...input,
          createdBy: ctx.user?.id,
        });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        assignedTo: z.array(z.number()).optional(),
        dueDate: z.date().optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
        relatedClient: z.number().optional(),
        attachments: z.array(z.object({
          url: z.string(),
          key: z.string(),
          name: z.string(),
          mimeType: z.string().optional(),
        })).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateTask(id, data);
      }),
    uploadAttachment: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileBase64: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const base64Data = input.fileBase64.includes(",")
          ? input.fileBase64.split(",")[1]
          : input.fileBase64;
        const buffer = Buffer.from(base64Data, "base64");
        const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
        const fileKey = `${ctx.user?.id ?? "anon"}-tasks/${Date.now()}-${safeName}`;
        const { key, url } = await storagePut(fileKey, buffer, input.mimeType);
        return { key, url, name: input.fileName, mimeType: input.mimeType };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteTask(input.id);
      }),
  }),

  // ==================== Leads ====================
  leads: router({
    list: protectedProcedure.query(async () => {
      return await db.getLeads();
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getLeadById(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        email: z.string().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        source: z.string(),
        stage: z.enum(["new", "follow_up", "interest", "proposal", "negotiation", "closed"]),
        status: z.enum(["active", "disabled", "lost"]),
        value: z.number().optional(),
        notes: z.string().optional(),
        assignedTo: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createLead(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        source: z.string().optional(),
        stage: z.enum(["new", "follow_up", "interest", "proposal", "negotiation", "closed"]).optional(),
        status: z.enum(["active", "disabled", "lost"]).optional(),
        value: z.number().optional(),
        notes: z.string().optional(),
        assignedTo: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateLead(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteLead(input.id);
      }),
  }),

  // ==================== Transactions ====================
  transactions: router({
    list: protectedProcedure.query(async () => {
      return await db.getTransactions();
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getTransactionById(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        type: z.enum(["revenue", "expense"]),
        category: z.string(),
        amount: z.number(),
        description: z.string().optional(),
        date: z.date(),
        relatedClient: z.number().optional(),
        relatedVendor: z.number().optional(),
        month: z.string(),
        year: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createTransaction({
          ...input,
          createdBy: ctx.user?.id,
        });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        type: z.enum(["revenue", "expense"]).optional(),
        category: z.string().optional(),
        amount: z.number().optional(),
        description: z.string().optional(),
        date: z.date().optional(),
        relatedClient: z.number().optional(),
        relatedVendor: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateTransaction(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteTransaction(input.id);
      }),
  }),

  // ==================== Campaigns ====================
  campaigns: router({
    list: protectedProcedure.query(async () => {
      return await db.getCampaigns();
    }),
    uploadMedia: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileBase64: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const base64Data = input.fileBase64.includes(",")
          ? input.fileBase64.split(",")[1]
          : input.fileBase64;
        const buffer = Buffer.from(base64Data, "base64");
        const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
        const fileKey = `${ctx.user?.id ?? "anon"}-campaigns/${Date.now()}-${safeName}`;
        const { key, url } = await storagePut(fileKey, buffer, input.mimeType);
        return { key, url, name: input.fileName, mimeType: input.mimeType };
      }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCampaignById(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        platform: z.string(),
        startDate: z.date(),
        endDate: z.date(),
        budget: z.number().optional(),
        status: z.enum(["planned", "active", "paused", "completed"]),
        relatedClient: z.number().optional(),
        description: z.string().optional(),
        notes: z.string().optional(),
        postLink: z.string().optional(),
        mediaUrl: z.string().optional(),
        mediaKey: z.string().optional(),
        mediaType: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createCampaign(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        platform: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        budget: z.number().optional(),
        status: z.enum(["planned", "active", "paused", "completed"]).optional(),
        relatedClient: z.number().optional(),
        description: z.string().optional(),
        notes: z.string().optional(),
        postLink: z.string().optional(),
        mediaUrl: z.string().optional(),
        mediaKey: z.string().optional(),
        mediaType: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateCampaign(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteCampaign(input.id);
      }),
  }),

  // ==================== Meta Ads Campaigns ====================
  metaCampaigns: router({
    list: protectedProcedure.query(async () => {
      const metaAds = await import('./metaAds');
      return await metaAds.getMetaCampaigns();
    }),
    getById: protectedProcedure
      .input(z.object({ campaignId: z.string() }))
      .query(async ({ input }) => {
        const metaAds = await import('./metaAds');
        return await metaAds.getMetaCampaignById(input.campaignId);
      }),
    delete: adminProcedure
      .input(z.object({ campaignId: z.string() }))
      .mutation(async ({ input }) => {
        const metaAds = await import('./metaAds');
        return await metaAds.deleteMetaCampaign(input.campaignId);
      }),
  }),

  // ==================== App Users (إدارة المستخدمين) — محصورة بالمدير (admin) ====================
  appUsers: router({
    list: adminProcedure.query(async () => {
      const users = await db.getAppUsers();
      // إخفاء hash كلمة المرور عن الواجهة
      return users.map(({ passwordHash, ...rest }) => rest);
    }),
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const user = await db.getAppUserById(input.id);
        if (!user) return undefined;
        const { passwordHash, ...rest } = user;
        return rest;
      }),
    create: adminProcedure
      .input(z.object({
        username: z.string().min(3),
        password: z.string().min(6),
        fullName: z.string(),
        email: z.string().optional(),
        role: z.enum(["manager", "employee", "designer", "editor"]),
        preferredLanguage: z.enum(["ar", "he", "en"]),
        status: z.enum(["active", "disabled"]),
        permissions: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        const existing = await db.getAppUserByUsername(input.username);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "اسم المستخدم موجود مسبقاً" });
        }
        const passwordHash = await bcrypt.hash(input.password, 10);
        const { password, permissions, ...rest } = input;
        return await db.createAppUser({ ...rest, permissions: permissions ?? [], passwordHash });
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        fullName: z.string().optional(),
        email: z.string().optional(),
        role: z.enum(["manager", "employee", "designer", "editor"]).optional(),
        preferredLanguage: z.enum(["ar", "he", "en"]).optional(),
        status: z.enum(["active", "disabled"]).optional(),
        permissions: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateAppUser(id, data);
      }),
    resetPassword: adminProcedure
      .input(z.object({ id: z.number(), newPassword: z.string().min(6) }))
      .mutation(async ({ input }) => {
        const passwordHash = await bcrypt.hash(input.newPassword, 10);
        return await db.updateAppUser(input.id, { passwordHash });
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteAppUser(input.id);
      }),
  }),

  // ==================== Access Details ====================
  accessDetails: router({
    list: protectedProcedure.query(async () => {
      return await db.getAccessDetails();
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getAccessDetailById(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        platform: z.string(),
        username: z.string(),
        password: z.string(),
        email: z.string().optional(),
        url: z.string().optional(),
        relatedClient: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createAccessDetail(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        platform: z.string().optional(),
        username: z.string().optional(),
        password: z.string().optional(),
        email: z.string().optional(),
        url: z.string().optional(),
        relatedClient: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateAccessDetail(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteAccessDetail(input.id);
      }),
  }),

  // ==================== Documents (الملفات والمستندات) ====================
  documents: router({
    list: protectedProcedure.query(async () => {
      return await db.getDocuments();
    }),
    upload: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileBase64: z.string(),
        mimeType: z.string().optional(),
        category: z.string().optional(),
        relatedClient: z.number().optional(),
        relatedCampaign: z.number().optional(),
        isInternal: z.boolean().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // تحويل base64 إلى buffer
        const base64Data = input.fileBase64.includes(",")
          ? input.fileBase64.split(",")[1]
          : input.fileBase64;
        const buffer = Buffer.from(base64Data, "base64");
        const fileSize = buffer.length;
        // حد أقصى 16ميجابايت
        if (fileSize > 16 * 1024 * 1024) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "حجم الملف يتجاوز 16 ميجابايت" });
        }
        const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
        const relKey = `documents/${Date.now()}_${safeName}`;
        const { key, url } = await storagePut(relKey, buffer, input.mimeType || "application/octet-stream");
        return await db.createDocument({
          fileName: input.fileName,
          fileKey: key,
          fileUrl: url,
          mimeType: input.mimeType,
          fileSize,
          category: input.category,
          relatedClient: input.relatedClient,
          relatedCampaign: input.relatedCampaign,
          isInternal: input.isInternal ?? false,
          notes: input.notes,
          uploadedBy: ctx.user?.id,
        });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        fileName: z.string().optional(),
        category: z.string().optional(),
        relatedClient: z.number().optional().nullable(),
        relatedCampaign: z.number().optional(),
        isInternal: z.boolean().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateDocument(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteDocument(input.id);
      }),
  }),

  // ==================== Invoices (الفواتير) ====================
  invoices: router({
    list: protectedProcedure.query(async () => {
      return await db.getInvoices();
    }),
    uploadFile: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileBase64: z.string(),
        mimeType: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const base64Data = input.fileBase64.includes(",")
          ? input.fileBase64.split(",")[1]
          : input.fileBase64;
        const buffer = Buffer.from(base64Data, "base64");
        const key = `invoices/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        return { key, url };
      }),
    create: protectedProcedure
      .input(z.object({
        invoiceNumber: z.string(),
        relatedClient: z.number(),
        amount: z.number(),
        dueDate: z.date(),
        status: z.enum(["pending", "paid", "overdue"]),
        fileKey: z.string().optional(),
        fileUrl: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createInvoice(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        invoiceNumber: z.string().optional(),
        relatedClient: z.number().optional(),
        amount: z.number().optional(),
        dueDate: z.date().optional(),
        status: z.enum(["pending", "paid", "overdue"]).optional(),
        fileKey: z.string().optional(),
        fileUrl: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateInvoice(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteInvoice(input.id);
      }),
  }),

  // ==================== Client Portal (بوابة العميل) ====================
  clientPortal: router({
    list: adminProcedure.query(async () => {
      return await db.getPortalAccessList();
    }),
    create: adminProcedure
      .input(z.object({
        relatedClient: z.number(),
        email: z.string(),
        canViewCampaigns: z.boolean().optional(),
        canViewInvoices: z.boolean().optional(),
        canDownloadFiles: z.boolean().optional(),
        expiresAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const accessToken = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
        await db.createPortalAccess({
          relatedClient: input.relatedClient,
          email: input.email,
          accessToken,
          canViewCampaigns: input.canViewCampaigns ?? true,
          canViewInvoices: input.canViewInvoices ?? true,
          canDownloadFiles: input.canDownloadFiles ?? true,
          expiresAt: input.expiresAt,
        });
        return { accessToken };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deletePortalAccess(input.id);
      }),
    // إجراء عام — لا يتطلب تسجيل دخول Manus؛ الوصول برابط التوكن فقط
    getData: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        return await db.getClientPortalData(input.token);
      }),
  }),

  // ==================== Payment Reminders (تذكيرات الدفع) ====================
  paymentReminders: router({
    setup: adminProcedure
      .input(z.object({
        clientId: z.number(),
        paymentDayOfMonth: z.number().min(1).max(31),
        enable: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { parse: parseCookie } = await import("cookie");
        const { COOKIE_NAME } = await import("@shared/const");
        const { createHeartbeatJob, deleteHeartbeatJob } = await import("../server/_core/heartbeat");
        
        const sessionToken = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
        const client = await db.getClientById(input.clientId);
        if (!client) throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });
        
        if (input.enable === false) {
          if (client.paymentReminderTaskUid) {
            await deleteHeartbeatJob(client.paymentReminderTaskUid, sessionToken);
            await db.updateClientPaymentTaskUid(input.clientId, null);
          }
          return { ok: true, message: "تم إلغاء التذكير" };
        }
        
        const dayOfMonth = input.paymentDayOfMonth;
        const cronExpr = `0 9 ${dayOfMonth} * * *`; // 9 AM UTC on that day
        const jobName = `payment-reminder-${input.clientId}`;
        
        if (client.paymentReminderTaskUid) {
          await deleteHeartbeatJob(client.paymentReminderTaskUid, sessionToken);
        }
        
        const job = await createHeartbeatJob({
          name: jobName,
          cron: cronExpr,
          path: "/api/scheduled/paymentReminder",
          payload: { clientId: input.clientId },
          description: `تذكير دفع للعميل ${client.name}`,
        }, sessionToken);
        
        await db.updateClientPaymentTaskUid(input.clientId, job.taskUid);
        return { ok: true, message: "تم إعداد التذكير" };
      }),
  }),
  // ==================== Subscriptions (المنويات) ====================
  subscriptions: router({
    list: protectedProcedure.query(async () => {
      return await db.getSubscriptions();
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getSubscriptionById(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        softwareName: z.string().min(1),
        monthlyAmount: z.number().positive(),
        purpose: z.string().optional(),
        website: z.string().optional(),
        username: z.string().optional(),
        password: z.string().optional(),
        renewalDate: z.number().min(1).max(31).optional(),
        status: z.enum(["active", "inactive", "expired"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createSubscription(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        softwareName: z.string().optional(),
        monthlyAmount: z.number().positive().optional(),
        purpose: z.string().optional(),
        website: z.string().optional(),
        username: z.string().optional(),
        password: z.string().optional(),
        renewalDate: z.number().min(1).max(31).optional(),
        status: z.enum(["active", "inactive", "expired"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateSubscription(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteSubscription(input.id);
      }),
        getTotalMonthlyCost: protectedProcedure.query(async () => {
      return await db.getTotalMonthlySubscriptionCost();
    }),
  }),

  // ==================== KPI (مؤشرات الأداء) ====================
  kpi: router({
    getYearlyData: protectedProcedure
      .input(z.object({ year: z.number() }))
      .query(async ({ input }) => {
        const { getYearlyKPIData } = await import("./kpi");
        return await getYearlyKPIData(input.year);
      }),
    getComparison: protectedProcedure
      .input(z.object({ year1: z.number(), year2: z.number() }))
      .query(async ({ input }) => {
        const { getYearComparisonKPI } = await import("./kpi");
        return await getYearComparisonKPI(input.year1, input.year2);
      }),
    updateMonthly: adminProcedure
      .input(z.object({ year: z.number(), month: z.number() }))
      .mutation(async ({ input }) => {
        const { updateMonthlyKPI } = await import("./kpi");
        await updateMonthlyKPI(input.year, input.month);
        return { success: true };
      }),
  }),

  // ==================== AI Insights ====================
  ai: router({
    clientInsights: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        return await generateClientInsights(input.clientId);
      }),
    campaignRecommendations: protectedProcedure
      .input(z.object({ campaignId: z.number() }))
      .query(async ({ input }) => {
        return await generateCampaignRecommendations(input.campaignId);
      }),
    chat: protectedProcedure
      .input(z.object({
        messages: z.array(z.object({
          role: z.enum(["system", "user", "assistant"]),
          content: z.string(),
        })),
        clientId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await chatWithAI(input.messages, input.clientId);
      }),
    performanceReport: protectedProcedure
      .query(async () => {
        return await generatePerformanceReport();
      }),
    clientReport: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        return await generateClientReport(input.clientId);
      }),
  }),

  // ==================== Presence Tracking ====================
  presence: router({
    updateStatus: protectedProcedure
      .input(z.object({
        status: z.enum(["online", "away", "offline"]),
        sessionId: z.string().optional(),
        deviceInfo: z.object({
          browser: z.string().optional(),
          os: z.string().optional(),
          userAgent: z.string().optional(),
        }).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        return await db.updateUserPresence(
          ctx.user.id,
          input.status,
          input.sessionId,
          input.deviceInfo
        );
      }),
    getStatus: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getUserPresence(input.userId);
      }),
    getAllStatus: protectedProcedure.query(async () => {
      return await db.getAllPresence();
    }),
    logout: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
      await db.setUserOffline(ctx.user.id);
      return { success: true };
    }),
  }),
});
export type AppRouter = typeof appRouter;
