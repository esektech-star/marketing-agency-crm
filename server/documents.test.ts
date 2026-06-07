import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock storage module
vi.mock("./storage", () => ({
  storagePut: vi.fn(async (relKey: string) => ({
    key: relKey + "_abc12345",
    url: "/manus-storage/" + relKey + "_abc12345",
  })),
}));

// Mock db module
const createdDocs: any[] = [];
vi.mock("./db", () => ({
  getDocuments: vi.fn(async () => createdDocs),
  createDocument: vi.fn(async (data: any) => {
    createdDocs.push({ id: createdDocs.length + 1, ...data });
    return { insertId: createdDocs.length };
  }),
  deleteDocument: vi.fn(async () => ({ affectedRows: 1 })),
  updateDocument: vi.fn(async () => ({ affectedRows: 1 })),
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "tester",
      email: "t@e.com",
      name: "Tester",
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

describe("documents router", () => {
  beforeEach(() => {
    createdDocs.length = 0;
  });

  it("uploads a small file and stores metadata", async () => {
    const caller = appRouter.createCaller(createCtx());
    // small base64 (\"hello\")
    const base64 = Buffer.from("hello").toString("base64");
    await caller.documents.upload({
      fileName: "test.txt",
      fileBase64: base64,
      mimeType: "text/plain",
      category: "عقد",
    });
    expect(createdDocs).toHaveLength(1);
    expect(createdDocs[0].fileName).toBe("test.txt");
    expect(createdDocs[0].fileKey).toContain("documents/");
    expect(createdDocs[0].fileSize).toBe(5);
  });

  it("rejects files larger than 16MB", async () => {
    const caller = appRouter.createCaller(createCtx());
    // 17MB buffer
    const bigBuffer = Buffer.alloc(17 * 1024 * 1024, 0);
    const base64 = bigBuffer.toString("base64");
    await expect(
      caller.documents.upload({ fileName: "big.bin", fileBase64: base64 })
    ).rejects.toThrow();
    expect(createdDocs).toHaveLength(0);
  });

  it("strips data URL prefix before decoding", async () => {
    const caller = appRouter.createCaller(createCtx());
    const dataUrl = "data:text/plain;base64," + Buffer.from("abc").toString("base64");
    await caller.documents.upload({ fileName: "a.txt", fileBase64: dataUrl });
    expect(createdDocs[0].fileSize).toBe(3);
  });
});
