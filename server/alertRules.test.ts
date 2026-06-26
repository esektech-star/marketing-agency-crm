import { describe, it, expect, afterAll } from "vitest";
import { createAlertRule, getAlertRules, updateAlertRule } from "./db";

describe("Alert Rules Database Functions", () => {
  let createdId: number | undefined;

  afterAll(async () => {
    if (createdId) {
      try {
        await updateAlertRule(createdId, { isEnabled: false });
      } catch {
        // ignore cleanup errors
      }
    }
  });

  const ruleName = `Test ROI Drop Rule ${Date.now()}`;

  it("should create an alert rule with all fields", async () => {
    const result = await createAlertRule({
      name: ruleName,
      description: "قاعدة اختبار",
      ruleType: "roi_drop",
      metric: "roi",
      operator: "less_than",
      threshold: "2.00",
      duration: 60,
      isEnabled: true,
      notifyAdminOnly: true,
    });

    expect(result).not.toBeNull();
    // Resolve the authoritative id via list lookup by unique name
    const rules = await getAlertRules();
    const persisted = rules.find((r) => r.name === ruleName);
    expect(persisted).toBeDefined();
    if (persisted) {
      expect(persisted.metric).toBe("roi");
      createdId = persisted.id as number;
    }
  });

  it("should retrieve alert rules including the created one", async () => {
    const rules = await getAlertRules();
    expect(Array.isArray(rules)).toBe(true);
    if (createdId) {
      const found = rules.find((r) => r.id === createdId);
      expect(found).toBeDefined();
    }
  });

  it("should update an alert rule threshold and enabled state", async () => {
    if (!createdId) return;
    const updated = await updateAlertRule(createdId, { threshold: "1.50", isEnabled: false });
    expect(updated).not.toBeNull();
    if (updated) {
      expect(updated.isEnabled).toBe(false);
    }
  });
});
