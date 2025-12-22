import crypto from "crypto";
import { variables } from "../constants/variables";

export class EncryptionService {
  private static algorithm = "aes-256-gcm";

  /**
   * Derive a proper 32-byte key even if the env variable is not hex or not 32 bytes.
   * This completely eliminates ERR_CRYPTO_INVALID_KEYLEN.
   */
  private static key = crypto.scryptSync(
    variables.ENCRYPTION_KEY,
    "encryption-salt",
    32 // AES-256 requires 32 bytes
  );

  /**
   * Encrypt a string using AES-256-GCM
   */
  static encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(12); // Recommended IV size for GCM is 12 bytes

    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const tag = (cipher as any).getAuthTag();

    return {
      encrypted,
      iv: iv.toString("hex"),
      tag: tag.toString("hex"),
    };
  }

  /**
   * Decrypt AES-256-GCM encrypted text
   */
  static decrypt(encrypted: string, iv: string, tag: string): string {
    try {
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.key,
        Buffer.from(iv, "hex")
      );

      (decipher as any).setAuthTag(Buffer.from(tag, "hex"));

      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      console.error("Decryption failed:", error);
      throw new Error("Decryption failed");
    }
  }

  /**
   * Hashing utility using SHA-256
   */
  static hash(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex");
  }
}
