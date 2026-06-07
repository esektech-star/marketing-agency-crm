import { describe, expect, it, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

// نموذج بيانات مستخدم وهمي في الذاكرة لاختبار المنطق
type FakeUser = {
  id: number;
  username: string;
  passwordHash: string;
  fullName: string;
  email: string | null;
  role: string;
  preferredLanguage: string;
  status: string;
};

let store: FakeUser[] = [];
let nextId = 1;

// محاكاة دوال قاعدة البيانات
vi.mock("./db", () => ({
  getAppUsers: async () => store,
  getAppUserById: async (id: number) => store.find((u) => u.id === id),
  getAppUserByUsername: async (username: string) => store.find((u) => u.username === username),
  createAppUser: async (data: any) => {
    const user: FakeUser = { id: nextId++, email: null, ...data };
    store.push(user);
    return { insertId: user.id };
  },
  updateAppUser: async (id: number, data: any) => {
    const idx = store.findIndex((u) => u.id === id);
    if (idx >= 0) store[idx] = { ...store[idx], ...data };
    return { affectedRows: 1 };
  },
  deleteAppUser: async (id: number) => {
    store = store.filter((u) => u.id !== id);
    return { affectedRows: 1 };
  },
  // الدوال الأخرى المستخدمة في الراوتر (غير مطلوبة هنا)
  getDashboardStats: async () => null,
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "owner",
      email: "owner@esektech.com",
      name: "Owner",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("appUsers router", () => {
  beforeEach(() => {
    store = [];
    nextId = 1;
  });

  it("ينشئ مستخدماً جديداً مع تشفير كلمة المرور", async () => {
    const caller = appRouter.createCaller(createCtx());
    await caller.appUsers.create({
      username: "batool",
      password: "secret123",
      fullName: "Batool Designer",
      email: "batool@esektech.com",
      role: "مصمم",
      preferredLanguage: "he",
      status: "نشط",
    });

    expect(store).toHaveLength(1);
    const created = store[0];
    // كلمة المرور يجب ألا تُحفظ كنص صريح
    expect(created.passwordHash).not.toBe("secret123");
    // يجب أن يتطابق الـ hash مع كلمة المرور الأصلية
    const matches = await bcrypt.compare("secret123", created.passwordHash);
    expect(matches).toBe(true);
  });

  it("لا يكشف hash كلمة المرور في قائمة المستخدمين", async () => {
    const caller = appRouter.createCaller(createCtx());
    await caller.appUsers.create({
      username: "ahmad",
      password: "password1",
      fullName: "Ahmad",
      role: "موظف",
      preferredLanguage: "ar",
      status: "نشط",
    });

    const list = await caller.appUsers.list();
    expect(list).toHaveLength(1);
    expect((list[0] as any).passwordHash).toBeUndefined();
    expect(list[0].username).toBe("ahmad");
  });

  it("يرفض إنشاء مستخدم باسم مستخدم مكرر", async () => {
    const caller = appRouter.createCaller(createCtx());
    const payload = {
      username: "dup",
      password: "password1",
      fullName: "First",
      role: "موظف" as const,
      preferredLanguage: "ar" as const,
      status: "نشط" as const,
    };
    await caller.appUsers.create(payload);
    await expect(caller.appUsers.create(payload)).rejects.toThrow();
  });

  it("يعيد تعيين كلمة المرور بشكل صحيح", async () => {
    const caller = appRouter.createCaller(createCtx());
    await caller.appUsers.create({
      username: "reset",
      password: "oldpassword",
      fullName: "Reset User",
      role: "موظف",
      preferredLanguage: "ar",
      status: "نشط",
    });

    await caller.appUsers.resetPassword({ id: 1, newPassword: "newpassword" });
    const updated = store.find((u) => u.id === 1)!;
    const matchesNew = await bcrypt.compare("newpassword", updated.passwordHash);
    expect(matchesNew).toBe(true);
  });

  it("يحذف المستخدم", async () => {
    const caller = appRouter.createCaller(createCtx());
    await caller.appUsers.create({
      username: "todelete",
      password: "password1",
      fullName: "To Delete",
      role: "موظف",
      preferredLanguage: "ar",
      status: "نشط",
    });
    expect(store).toHaveLength(1);
    await caller.appUsers.delete({ id: 1 });
    expect(store).toHaveLength(0);
  });
});
