import { describe, it, expect } from "vitest";
import { encryptSecret, decryptSecret } from "./crypto";

describe("crypto secret encryption", () => {
  it("encrypts to a non-plaintext enc:v1 format", () => {
    const plain = "MySuperSecret123";
    const enc = encryptSecret(plain);
    expect(enc).not.toBe(plain);
    expect(enc.startsWith("enc:v1:")).toBe(true);
  });

  it("decrypts back to the original plaintext", () => {
    const plain = "p@ssw0rd!_שלום_مرحبا";
    const enc = encryptSecret(plain);
    expect(decryptSecret(enc)).toBe(plain);
  });

  it("does not double-encrypt already encrypted values", () => {
    const plain = "abc123";
    const enc = encryptSecret(plain);
    const encAgain = encryptSecret(enc);
    expect(encAgain).toBe(enc);
    expect(decryptSecret(encAgain)).toBe(plain);
  });

  it("returns legacy plaintext as-is when not encrypted", () => {
    expect(decryptSecret("legacy-plain")).toBe("legacy-plain");
  });

  it("handles empty values gracefully", () => {
    expect(encryptSecret("")).toBe("");
    expect(decryptSecret("")).toBe("");
  });
});
