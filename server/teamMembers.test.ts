import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTeamMember, updateTeamMember, getTeamMembers, getTeamMemberById, deleteTeamMember } from "./db";

describe("Team Members Database Functions", () => {
  let createdId: number;

  beforeAll(async () => {
    // Clean up any test data before running tests
    const existing = await getTeamMembers();
    for (const member of existing) {
      if (member.name === "Test Member") {
        try {
          await deleteTeamMember(member.id);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }
  });

  afterAll(async () => {
    // Clean up test data after running tests
    if (createdId) {
      try {
        await deleteTeamMember(createdId);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  });

  it("should create a team member with all fields", async () => {
    const joinDate = new Date("2024-01-15");
    const result = await createTeamMember({
      name: "Test Member",
      role: "Developer",
      position: "Senior Developer",
      phone: "+1234567890",
      email: "test@example.com",
      department: "Engineering",
      salary: 5000.50,
      joinDate: joinDate,
      status: "active",
      notes: "Test notes",
    });

    expect(result).toBeDefined();
    createdId = result?.id;
    expect(createdId).toBeGreaterThan(0);
  });

  it("should create a team member with minimal fields", async () => {
    const joinDate = new Date("2024-02-01");
    const result = await createTeamMember({
      name: "Minimal Member",
      role: "Tester",
      joinDate: joinDate,
      status: "active",
    });

    expect(result).toBeDefined();
    expect(result?.name).toBe("Minimal Member");
    expect(result?.role).toBe("Tester");

    // Clean up
    if (result?.id) {
      await deleteTeamMember(result.id);
    }
  });

  it("should throw error when name is missing", async () => {
    try {
      await createTeamMember({
        name: "",
        role: "Developer",
        joinDate: new Date(),
        status: "active",
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error instanceof Error).toBe(true);
      expect((error as Error).message).toContain("name");
    }
  });

  it("should throw error when role is missing", async () => {
    try {
      await createTeamMember({
        name: "Test",
        role: "",
        joinDate: new Date(),
        status: "active",
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error instanceof Error).toBe(true);
      expect((error as Error).message).toContain("role");
    }
  });

  it("should throw error when joinDate is missing", async () => {
    try {
      await createTeamMember({
        name: "Test",
        role: "Developer",
        status: "active",
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error instanceof Error).toBe(true);
      const message = (error as Error).message.toLowerCase();
      expect(message).toMatch(/join.*date|date.*required/);
    }
  });

  it("should update a team member", async () => {
    if (!createdId) {
      throw new Error("No test member created");
    }

    const updated = await updateTeamMember(createdId, {
      name: "Updated Member",
      salary: 6000.75,
      status: "disabled",
    });

    expect(updated).toBeDefined();
    expect(updated?.name).toBe("Updated Member");
    expect(updated?.salary).toBe(6000.75);
    expect(updated?.status).toBe("disabled");
  });

  it("should throw error when updating non-existent member", async () => {
    try {
      await updateTeamMember(999999, { name: "Test" });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error instanceof Error).toBe(true);
      expect((error as Error).message).toContain("not found");
    }
  });

  it("should throw error when updating with empty name", async () => {
    if (!createdId) {
      throw new Error("No test member created");
    }

    try {
      await updateTeamMember(createdId, { name: "" });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error instanceof Error).toBe(true);
      expect((error as Error).message).toContain("cannot be empty");
    }
  });

  it("should retrieve team member by ID", async () => {
    if (!createdId) {
      throw new Error("No test member created");
    }

    const member = await getTeamMemberById(createdId);
    expect(member).toBeDefined();
    expect(member?.id).toBe(createdId);
    expect(member?.name).toBe("Updated Member");
  });

  it("should handle salary as number correctly", async () => {
    const joinDate = new Date("2024-03-01");
    const result = await createTeamMember({
      name: "Salary Test",
      role: "Manager",
      salary: 7500.99,
      joinDate: joinDate,
      status: "active",
    });

    // Salary is returned as number after parsing in getTeamMemberById
    expect(result?.salary).toBe(7500.99);
    expect(typeof result?.salary).toBe("number");

    // Clean up
    if (result?.id) {
      await deleteTeamMember(result.id);
    }
  });

  it("should handle null salary correctly", async () => {
    const joinDate = new Date("2024-04-01");
    const result = await createTeamMember({
      name: "No Salary",
      role: "Intern",
      salary: null,
      joinDate: joinDate,
      status: "active",
    });

    expect(result?.salary).toBeNull();

    // Clean up
    if (result?.id) {
      await deleteTeamMember(result.id);
    }
  });

  it("should handle Date objects correctly", async () => {
    const joinDate = new Date("2024-05-15T10:30:00Z");
    const result = await createTeamMember({
      name: "Date Test",
      role: "Analyst",
      joinDate: joinDate,
      status: "active",
    });

    expect(result?.joinDate).toBeDefined();
    const returnedDate = new Date(result?.joinDate || "");
    // Check that date is properly stored and retrieved
    expect(returnedDate.getFullYear()).toBe(2024);
    expect(returnedDate.getMonth()).toBe(4); // May is month 4 (0-indexed)

    // Clean up
    if (result?.id) {
      await deleteTeamMember(result.id);
    }
  });
});
