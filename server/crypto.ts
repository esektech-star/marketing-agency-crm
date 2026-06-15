import crypto from "crypto";

/**
 * تشفير/فك تشفير قابل للعكس لبيانات حساسة (كلمات مرور حسابات العملاء).
 * نستخدم AES-256-GCM مع مفتاح مشتق من JWT_SECRET.
 * الصيغة المخزّنة: enc:v1:<iv_b64>:<tag_b64>:<cipher_b64>
 */

const PREFIX = "enc:v1:";

function getKey(): Buffer {
  const secret = process.env.JWT_SECRET || "fallback-dev-secret-change-me";
  // اشتقاق مفتاح 32 بايت ثابت من السر
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptSecret(plaintext: string): string {
  if (plaintext == null || plaintext === "") return plaintext;
  // لا تُعد التشفير إن كان مشفّراً مسبقاً
  if (plaintext.startsWith(PREFIX)) return plaintext;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

export function decryptSecret(stored: string | null | undefined): string {
  if (stored == null || stored === "") return stored ?? "";
  if (!stored.startsWith(PREFIX)) {
    // قيمة قديمة غير مشفّرة - أعدها كما هي
    return stored;
  }
  try {
    const rest = stored.slice(PREFIX.length);
    const [ivB64, tagB64, dataB64] = rest.split(":");
    const iv = Buffer.from(ivB64, "base64");
    const tag = Buffer.from(tagB64, "base64");
    const data = Buffer.from(dataB64, "base64");
    const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(data), decipher.final()]);
    return dec.toString("utf8");
  } catch {
    // في حال فشل فك التشفير، لا نكشف بيانات خاطئة
    return "";
  }
}
