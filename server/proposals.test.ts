import { describe, it, expect, afterAll } from "vitest";
import {
  createProposal,
  getProposalById,
  getProposalByShareToken,
  updateProposalStatus,
} from "./db";

describe("Proposals Database Functions", () => {
  let createdId: number | undefined;
  const shareToken = `test-token-${Date.now()}`;

  afterAll(async () => {
    // Best-effort cleanup: mark as rejected (no hard delete helper exposed)
    if (createdId) {
      try {
        await updateProposalStatus(createdId, "rejected");
      } catch {
        // ignore cleanup errors
      }
    }
  });

  it("should create a proposal with all fields", async () => {
    const result = await createProposal({
      clientId: 1,
      createdBy: 1,
      businessType: "Tech Startup",
      budget: "5000",
      packageId: 2,
      packageName: "Growth Package",
      packagePrice: "5000.00",
      aiSummary: "ملخص تجريبي للعميل",
      discoveryAnswers: { q1: "answer1", q2: "answer2" },
      shareToken,
      status: "draft",
    });

    expect(result).not.toBeNull();
    // Resolve the authoritative id via the unique share token
    const persisted = await getProposalByShareToken(shareToken);
    expect(persisted).not.toBeNull();
    if (persisted) {
      expect(persisted.packageName).toBe("Growth Package");
      createdId = persisted.id as number;
    }
  });

  it("should retrieve a proposal by id", async () => {
    if (!createdId) return;
    const proposal = await getProposalById(createdId);
    expect(proposal).not.toBeNull();
    if (proposal) {
      expect(proposal.id).toBe(createdId);
      expect(proposal.packageName).toBe("Growth Package");
    }
  });

  it("should retrieve a proposal by share token", async () => {
    const proposal = await getProposalByShareToken(shareToken);
    expect(proposal).not.toBeNull();
    if (proposal) {
      expect(proposal.shareToken).toBe(shareToken);
    }
  });

  it("should update proposal status", async () => {
    if (!createdId) return;
    const updated = await updateProposalStatus(createdId, "sent");
    expect(updated).not.toBeNull();
    const proposal = await getProposalById(createdId);
    if (proposal) {
      expect(proposal.status).toBe("sent");
    }
  });
});
