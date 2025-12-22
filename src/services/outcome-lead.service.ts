import { EncryptionService } from "./encryption.service";
import outcomeLeadSchema from "../models/outcome-lead.schema";

const SENSITIVE_FIELD_PATTERNS = [
  /email/i,
  /phone/i,
  /ssn/i,
  /social/i,
  /address/i,
  /dob/i,
  /date.*birth/i,
  /medical/i,
  /diagnosis/i,
  /insurance/i,
  /card.*number/i,
  /account.*number/i,
  /name/i, // First name, last name, full name
  /patient/i,
  /provider/i,
  /passport/i,
  /license/i,
  /prescription/i,
];

interface EncryptedField {
  encrypted: string;
  iv: string;
  tag: string;
  isEncrypted: true;
}

interface AuditInfo {
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface PaginationOptions {
  page: number;
  limit: number;
}

export class outcomeLeadsService {
  /**
   * Check if a field name matches sensitive patterns
   */
  private static isSensitiveField(fieldName: string): boolean {
    return SENSITIVE_FIELD_PATTERNS.some((pattern) => pattern.test(fieldName));
  }

  /**
   * Recursively encrypt sensitive fields in an object
   */
  private static encryptSensitiveData(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map((item) => this.encryptSensitiveData(item));
    }

    // Handle objects
    if (typeof data === "object") {
      const encryptedData: any = {};

      for (const [key, value] of Object.entries(data)) {
        // Skip metadata fields
        if (
          [
            "_id",
            "createdAt",
            "updatedAt",
            "__v",
            "isDeleted",
            "deletedAt",
            "deletedBy",
          ].includes(key)
        ) {
          encryptedData[key] = value;
          continue;
        }

        // Check if field is sensitive
        if (
          this.isSensitiveField(key) &&
          value !== null &&
          value !== undefined
        ) {
          // Convert value to string for encryption
          const stringValue =
            typeof value === "string" ? value : JSON.stringify(value);

          // Encrypt the field
          const encrypted = EncryptionService.encrypt(stringValue);
          encryptedData[key] = {
            encrypted: encrypted.encrypted,
            iv: encrypted.iv,
            tag: encrypted.tag,
            isEncrypted: true,
          };
        } else if (
          typeof value === "object" &&
          !Buffer.isBuffer(value) &&
          !(value instanceof Date)
        ) {
          // Recursively handle nested objects
          encryptedData[key] = this.encryptSensitiveData(value);
        } else {
          // Non-sensitive fields remain as-is
          encryptedData[key] = value;
        }
      }

      return encryptedData;
    }

    return data;
  }

  /**
   * Recursively decrypt sensitive fields in an object
   */
  private static decryptSensitiveData(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map((item) => this.decryptSensitiveData(item));
    }

    // Handle objects
    if (typeof data === "object") {
      const decryptedData: any = {};

      for (const [key, value] of Object.entries(data)) {
        // Check if field is encrypted
        if (
          value &&
          typeof value === "object" &&
          (value as any).isEncrypted === true
        ) {
          try {
            const encryptedField = value as EncryptedField;
            const decrypted = EncryptionService.decrypt(
              encryptedField.encrypted,
              encryptedField.iv,
              encryptedField.tag
            );

            // Try to parse as JSON if it was an object
            try {
              decryptedData[key] = JSON.parse(decrypted);
            } catch {
              decryptedData[key] = decrypted;
            }
          } catch (error) {
            console.error(`Failed to decrypt field ${key}:`, error);
            decryptedData[key] = "[DECRYPTION_FAILED]";
          }
        } else if (
          typeof value === "object" &&
          !Buffer.isBuffer(value) &&
          !(value instanceof Date)
        ) {
          decryptedData[key] = this.decryptSensitiveData(value);
        } else {
          decryptedData[key] = value;
        }
      }

      return decryptedData;
    }

    return data;
  }

  static async createLead(data: any, auditInfo: AuditInfo) {
    try {
      const encryptedData = this.encryptSensitiveData(data);

      const leadData = {
        ...encryptedData,
        createdBy: auditInfo.userId || "system",
        ipAddress: auditInfo.ipAddress,
        userAgent: auditInfo.userAgent,
        isDeleted: false,
      };

      const doc = await outcomeLeadSchema.create(leadData);

      return {
        id: doc._id,
        createdAt: doc.createdAt,
      };
    } catch (error) {
      console.error("Service: Error creating lead:", error);
      throw new Error("Failed to create lead");
    }
  }

  static async getLeadById(id: string) {
    try {
      const doc = await outcomeLeadSchema
        .findOne({ _id: id, isDeleted: { $ne: true } })
        .lean();
      if (!doc) {
        return null;
      }

      const decryptedData = this.decryptSensitiveData(doc);
      return decryptedData;
    } catch (error) {
      console.error("Service: Error fetching lead:", error);
      throw new Error("Failed to fetch lead");
    }
  }
}
