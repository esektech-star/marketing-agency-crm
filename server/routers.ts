import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

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
  }),

  // ==================== Dashboard ====================
  dashboard: router({
    getStats: protectedProcedure.query(async () => {
      return await db.getDashboardStats();
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
        status: z.enum(["نشط", "معلق", "منتهي"]),
        startDate: z.date(),
        phone: z.string().optional(),
        email: z.string().optional(),
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
        status: z.enum(["نشط", "معلق", "منتهي"]).optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
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
        status: z.enum(["نشط", "معلق", "غير نشط"]),
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
        status: z.enum(["نشط", "معلق", "غير نشط"]).optional(),
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
        joinDate: z.date(),
        status: z.enum(["نشط", "معطل", "منتهي"]),
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
        status: z.enum(["نشط", "معطل", "منتهي"]).optional(),
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
        assignedTo: z.number().optional(),
        dueDate: z.date(),
        priority: z.enum(["منخفضة", "متوسطة", "عالية", "حرجة"]),
        status: z.enum(["معلقة", "قيد التنفيذ", "مكتملة", "ملغاة"]),
        relatedClient: z.number().optional(),
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
        assignedTo: z.number().optional(),
        dueDate: z.date().optional(),
        priority: z.enum(["منخفضة", "متوسطة", "عالية", "حرجة"]).optional(),
        status: z.enum(["معلقة", "قيد التنفيذ", "مكتملة", "ملغاة"]).optional(),
        relatedClient: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateTask(id, data);
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
        stage: z.enum(["جديد", "متابعة", "اهتمام", "عرض", "تفاوض", "مغلق"]),
        status: z.enum(["نشط", "معطل", "مفقود"]),
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
        stage: z.enum(["جديد", "متابعة", "اهتمام", "عرض", "تفاوض", "مغلق"]).optional(),
        status: z.enum(["نشط", "معطل", "مفقود"]).optional(),
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
        type: z.enum(["إيراد", "مصروف"]),
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
        type: z.enum(["إيراد", "مصروف"]).optional(),
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
        status: z.enum(["مخطط", "نشط", "معلق", "منتهي"]),
        relatedClient: z.number().optional(),
        description: z.string().optional(),
        notes: z.string().optional(),
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
        status: z.enum(["مخطط", "نشط", "معلق", "منتهي"]).optional(),
        relatedClient: z.number().optional(),
        description: z.string().optional(),
        notes: z.string().optional(),
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
});

export type AppRouter = typeof appRouter;
